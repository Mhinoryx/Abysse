import json
import random
import socket
import threading
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from questions import get_questions

HOST = "0.0.0.0"
PORT = 5050
BUFFER_SIZE = 4096


@dataclass
class Player:
    name: str
    client_id: str
    conn: Optional[socket.socket] = None
    score: int = 0


@dataclass
class Room:
    code: str
    players: Dict[str, Player] = field(default_factory=dict)
    questions: List[dict] = field(default_factory=list)
    current_index: int = 0
    difficulty: str = "facile"
    started: bool = False
    host_id: Optional[str] = None

    def add_player(self, player: Player):
        self.players[player.client_id] = player
        if self.host_id is None:
            self.host_id = player.client_id

    def remove_player(self, client_id: str):
        self.players.pop(client_id, None)
        if self.host_id == client_id:
            self.host_id = next(iter(self.players), None)


rooms: Dict[str, Room] = {}
lock = threading.Lock()


def generate_room_code():
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(random.choice(alphabet) for _ in range(5))


def room_state(room: Room):
    return {
        "type": "lobby",
        "code": room.code,
        "players": [{"id": p.client_id, "name": p.name, "score": p.score} for p in room.players.values()],
        "difficulty": room.difficulty,
        "started": room.started,
    }


def broadcast_room(room: Room):
    payload = room_state(room)
    for player in room.players.values():
        if player.conn is not None:
            try:
                player.conn.sendall((json.dumps(payload) + "\n").encode("utf-8"))
            except Exception:
                pass


def send_json(conn, payload):
    if conn is None:
        return
    try:
        conn.sendall((json.dumps(payload) + "\n").encode("utf-8"))
    except Exception:
        pass


def run_game_loop(room_code: str):
    with lock:
        room = rooms.get(room_code)
        if room is None:
            return

    while room.started and room.current_index < len(room.questions):
        q = room.questions[room.current_index]
        payload = {
            "type": "question",
            "question_index": room.current_index + 1,
            "total_questions": len(room.questions),
            "question": q["question"],
            "options": q["options"],
            "points": q["points"],
        }

        with lock:
            room = rooms.get(room_code)
            if room is None:
                return
            for player in room.players.values():
                send_json(player.conn, payload)

        time.sleep(15)

        with lock:
            room = rooms.get(room_code)
            if room is None:
                return
            room.current_index += 1

    with lock:
        room = rooms.get(room_code)
        if room is None:
            return
        room.started = False
        results = [{"name": p.name, "score": p.score} for p in room.players.values()]
        ranking = sorted(results, key=lambda x: x["score"], reverse=True)
        for player in room.players.values():
            send_json(player.conn, {"type": "results", "results": ranking})


def handle_client(conn, addr):
    client_id = None
    room_code = None

    try:
        while True:
            raw = conn.recv(BUFFER_SIZE)
            if not raw:
                break

            decoded = raw.decode("utf-8", errors="replace").strip()
            if not decoded:
                continue

            try:
                message = json.loads(decoded)
            except json.JSONDecodeError:
                continue

            action = message.get("action")

            if action == "create_room":
                room_code = (message.get("room_code") or generate_room_code()).upper()
                client_id = message.get("client_id") or f"player-{random.randint(1000, 9999)}"
                player_name = message.get("player_name", "Joueur")

                with lock:
                    room = rooms.get(room_code)
                    if room is None:
                        room = Room(code=room_code)
                        rooms[room_code] = room
                    room.difficulty = message.get("difficulty", "facile")
                    room.add_player(Player(name=player_name, client_id=client_id, conn=conn))

                send_json(conn, {"type": "room_created", "room_code": room_code, "client_id": client_id})
                broadcast_room(room)

            elif action == "join_room":
                room_code = (message.get("room_code") or "").upper()
                client_id = message.get("client_id") or f"player-{random.randint(1000, 9999)}"
                player_name = message.get("player_name", "Joueur")

                with lock:
                    room = rooms.get(room_code)
                    if room is None:
                        send_json(conn, {"type": "error", "message": "Salon introuvable."})
                        continue
                    room.add_player(Player(name=player_name, client_id=client_id, conn=conn))

                send_json(conn, {"type": "room_joined", "room_code": room_code, "client_id": client_id})
                broadcast_room(room)

            elif action == "start_game":
                room_code = message.get("room_code")
                with lock:
                    room = rooms.get(room_code)
                    if room is None:
                        continue
                    room.difficulty = message.get("difficulty", "facile")
                    room.questions = get_questions(room.difficulty, 8)
                    room.current_index = 0
                    room.started = True
                    for player in room.players.values():
                        player.score = 0
                broadcast_room(room)
                threading.Thread(target=run_game_loop, args=(room_code,), daemon=True).start()

            elif action == "answer":
                room_code = message.get("room_code")
                client_id = message.get("client_id")
                option_index = int(message.get("option_index", -1))

                with lock:
                    room = rooms.get(room_code)
                    if room is None:
                        continue
                    player = room.players.get(client_id)
                    if player is None or not room.started or room.current_index >= len(room.questions):
                        continue

                    expected = room.questions[room.current_index]["answer"]
                    if option_index == expected:
                        player.score += room.questions[room.current_index]["points"]
                    send_json(conn, {"type": "answer_ack", "correct": option_index == expected})
                    broadcast_room(room)

            elif action == "leave":
                room_code = message.get("room_code")
                client_id = message.get("client_id")
                with lock:
                    room = rooms.get(room_code)
                    if room is not None:
                        room.remove_player(client_id)
                        if not room.players:
                            rooms.pop(room_code, None)
                        else:
                            broadcast_room(room)
                break

    finally:
        if client_id and room_code:
            with lock:
                room = rooms.get(room_code)
                if room is not None:
                    room.remove_player(client_id)
                    if not room.players:
                        rooms.pop(room_code, None)
                    else:
                        broadcast_room(room)
        try:
            conn.close()
        except Exception:
            pass


def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((HOST, PORT))
    server.listen(50)
    print(f"Serveur Abysse actif sur {HOST}:{PORT}")

    while True:
        conn, addr = server.accept()
        threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()


if __name__ == "__main__":
    main()
