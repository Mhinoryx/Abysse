import json
import socket
import threading
import tkinter as tk
from tkinter import messagebox
from uuid import uuid4
import winsound

SERVER_HOST_DEFAULT = "127.0.0.1"
SERVER_PORT = 5050


class AbyssQuizClient:
    def __init__(self, root):
        self.root = root
        self.root.title("Abysse Quiz")
        self.root.geometry("1120x820")
        self.root.minsize(940, 700)
        self.root.configure(bg="#061a22")

        self.server_host = SERVER_HOST_DEFAULT
        self.server_port = SERVER_PORT
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.settimeout(0.5)
        self.connected = False
        self.client_id = uuid4().hex[:8]
        self.room_code = ""
        self.mode = "solo"
        self.difficulty = "facile"
        self.players = []
        self.answer_lock = False
        self.bg_phase = 0

        self.build_ui()
        self.start_listener()
        self.animate_background()

    def build_ui(self):
        self.bg_canvas = tk.Canvas(self.root, bg="#061a22", highlightthickness=0)
        self.bg_canvas.pack(fill="both", expand=True)

        self.shell = tk.Frame(self.root, bg="#0b1f2a", bd=0, padx=18, pady=18)
        self.shell.place(relx=0.5, rely=0.5, anchor="center", relwidth=0.9, relheight=0.9)

        self.header = tk.Frame(self.shell, bg="#0d2a34", padx=22, pady=18, bd=1, relief="solid")
        self.header.pack(fill="x")

        title = tk.Label(self.header, text="ABYSSE", fg="#74d9ff", bg="#0d2a34",
                         font=("Segoe UI", 26, "bold"), pady=4)
        title.pack(anchor="w")
        subtitle = tk.Label(self.header, text="Quiz des profondeurs", fg="#b8dfe6", bg="#0d2a34",
                            font=("Segoe UI", 10, "bold"))
        subtitle.pack(anchor="w")

        self.main_card = tk.Frame(self.shell, bg="#0e2730", bd=1, relief="solid", padx=20, pady=20)
        self.main_card.pack(fill="both", expand=True, pady=(18, 0))

        self.menu_screen = tk.Frame(self.main_card, bg="#0e2730")
        self.menu_screen.pack(fill="both", expand=True)

        left = tk.Frame(self.menu_screen, bg="#0e2730", padx=10, pady=10)
        left.pack(side="left", fill="both", expand=True)

        tk.Label(left, text="L’expérience abyssale", bg="#0e2730", fg="#7ad9ff",
                 font=("Segoe UI", 11, "bold")).pack(anchor="w")
        tk.Label(left, text="Le plus grand quiz des profondeurs.", bg="#0e2730", fg="#edfaff",
                 font=("Segoe UI", 28, "bold"), justify="left", wraplength=480).pack(anchor="w", pady=(8, 10))
        tk.Label(left, text="Mode solo ou multijoueur, niveau progressif, animations et écran final.",
                 bg="#0e2730", fg="#9ec8d8", font=("Segoe UI", 12), justify="left", wraplength=500).pack(anchor="w")

        pills = tk.Frame(left, bg="#0e2730")
        pills.pack(fill="x", pady=(18, 0))
        for tag in ["3 niveaux", "Effets sonores", "Multijoueur", "Écran final"]:
            pill = tk.Label(pills, text=tag, bg="#143746", fg="#d9f2ff", padx=10, pady=8,
                            font=("Segoe UI", 10, "bold"), bd=1, relief="solid")
            pill.pack(side="left", padx=5)

        right = tk.Frame(self.menu_screen, bg="#112e3a", padx=16, pady=16, bd=1, relief="solid")
        right.pack(side="right", fill="y")

        tk.Label(right, text="Options", bg="#112e3a", fg="#ecf8ff", font=("Segoe UI", 14, "bold")).pack(anchor="w")

        self.mode_buttons = {}
        mode_frame = tk.Frame(right, bg="#112e3a")
        mode_frame.pack(fill="x", pady=(10, 14))
        for mode, label in [("solo", "Solo"), ("multi", "Multijoueur")]:
            btn = tk.Button(mode_frame, text=label, command=lambda m=mode: self.set_mode(m),
                            width=12, height=2, bg="#163d49", fg="white", font=("Segoe UI", 10, "bold"),
                            activebackground="#1d5065")
            btn.pack(side="left", padx=4)
            self.mode_buttons[mode] = btn

        difficulty_frame = tk.Frame(right, bg="#112e3a")
        difficulty_frame.pack(fill="x", pady=(0, 14))
        self.difficulty_buttons = {}
        for diff in ["facile", "moyen", "difficile"]:
            btn = tk.Button(difficulty_frame, text=diff.capitalize(), command=lambda d=diff: self.set_difficulty(d),
                            width=8, height=2, bg="#163d49", fg="white", font=("Segoe UI", 10, "bold"),
                            activebackground="#1d5065")
            btn.pack(side="left", padx=4)
            self.difficulty_buttons[diff] = btn

        tk.Label(right, text="Pseudo", bg="#112e3a", fg="#bfe3ee", font=("Segoe UI", 10, "bold")).pack(anchor="w", pady=(10, 4))
        self.name_entry = tk.Entry(right, width=22, bg="#0a1d26", fg="#f3fbff", insertbackground="#f3fbff",
                                   font=("Segoe UI", 12), bd=1)
        self.name_entry.insert(0, "Explorateur")
        self.name_entry.pack(fill="x")

        tk.Label(right, text="Serveur", bg="#112e3a", fg="#bfe3ee", font=("Segoe UI", 10, "bold")).pack(anchor="w", pady=(12, 4))
        self.server_entry = tk.Entry(right, width=22, bg="#0a1d26", fg="#f3fbff", insertbackground="#f3fbff",
                                    font=("Segoe UI", 12), bd=1)
        self.server_entry.insert(0, self.server_host)
        self.server_entry.pack(fill="x")

        tk.Label(right, text="Code du salon", bg="#112e3a", fg="#bfe3ee", font=("Segoe UI", 10, "bold")).pack(anchor="w", pady=(12, 4))
        self.room_entry = tk.Entry(right, width=22, bg="#0a1d26", fg="#f3fbff", insertbackground="#f3fbff",
                                   font=("Segoe UI", 12), bd=1)
        self.room_entry.pack(fill="x")

        button_row = tk.Frame(right, bg="#112e3a")
        button_row.pack(fill="x", pady=(18, 0))
        tk.Button(button_row, text="Créer salon", command=self.create_room, bg="#74d9ff", fg="#041b23",
                  font=("Segoe UI", 10, "bold"), width=12, height=2).pack(side="left", padx=4)
        tk.Button(button_row, text="Rejoindre", command=self.join_room, bg="#7ff0c0", fg="#041b23",
                  font=("Segoe UI", 10, "bold"), width=12, height=2).pack(side="left", padx=4)

        tk.Button(right, text="Lancer la partie", command=self.start_game, bg="#ffbf69", fg="#1b1200",
                  font=("Segoe UI", 11, "bold"), width=20, height=2).pack(fill="x", pady=(18, 0))

        self.status_var = tk.StringVar(value="Serveur hors ligne")
        status = tk.Label(self.header, textvariable=self.status_var, bg="#0d2a34", fg="#b5dfe8",
                          font=("Segoe UI", 10, "bold"), anchor="e")
        status.pack(anchor="e")

        self.lobby_screen = tk.Frame(self.main_card, bg="#0e2730", padx=20, pady=18)
        self.lobby_screen.pack_forget()

        self.lobby_title = tk.Label(self.lobby_screen, text="Lobby", bg="#0e2730", fg="#ecf8ff",
                                   font=("Segoe UI", 24, "bold"), anchor="w")
        self.lobby_title.pack(anchor="w")

        self.lobby_room = tk.Label(self.lobby_screen, text="Code: -", bg="#0e2730", fg="#7ad9ff",
                                   font=("Segoe UI", 12, "bold"), anchor="w")
        self.lobby_room.pack(anchor="w", pady=(6, 12))

        self.lobby_list = tk.Listbox(self.lobby_screen, bg="#0b1f2a", fg="#edfaff", height=12, width=80,
                                    font=("Segoe UI", 11), bd=0, highlightthickness=0)
        self.lobby_list.pack(fill="both", expand=True)

        lobby_actions = tk.Frame(self.lobby_screen, bg="#0e2730")
        lobby_actions.pack(fill="x", pady=(16, 0))
        tk.Button(lobby_actions, text="Démarrer", command=self.start_game, bg="#74d9ff", fg="#041b23",
                  font=("Segoe UI", 10, "bold"), width=14, height=2).pack(side="left", padx=4)
        tk.Button(lobby_actions, text="Retour", command=self.show_menu, bg="#153947", fg="#ecf8ff",
                  font=("Segoe UI", 10, "bold"), width=14, height=2).pack(side="left", padx=4)

        self.game_screen = tk.Frame(self.main_card, bg="#0e2730", padx=20, pady=18)
        self.game_screen.pack_forget()

        top_bar = tk.Frame(self.game_screen, bg="#0e2730")
        top_bar.pack(fill="x")

        self.player_turn = tk.Label(top_bar, text="Joueur", bg="#0e2730", fg="#ecf8ff",
                                   font=("Segoe UI", 18, "bold"))
        self.player_turn.pack(side="left")

        self.timer_label = tk.Label(top_bar, text="15s", bg="#0e2730", fg="#ffd77a",
                                   font=("Segoe UI", 12, "bold"))
        self.timer_label.pack(side="right")

        self.timer_bar = tk.Canvas(self.game_screen, height=12, bg="#0b1f2a", highlightthickness=0)
        self.timer_bar.pack(fill="x", pady=(12, 0))
        self.timer_bar_rect = self.timer_bar.create_rectangle(0, 0, 800, 12, fill="#5ec8ff")

        self.question_label = tk.Label(self.game_screen, text="Question", bg="#0e2730", fg="#edfaff",
                                      font=("Segoe UI", 24, "bold"), justify="left", wraplength=820)
        self.question_label.pack(anchor="w", pady=(18, 16))

        self.answers_frame = tk.Frame(self.game_screen, bg="#0e2730")
        self.answers_frame.pack(fill="both", expand=True)

        self.scoreboard_frame = tk.Frame(self.game_screen, bg="#0e2730")
        self.scoreboard_frame.pack(fill="x", pady=(18, 0))

        self.results_screen = tk.Frame(self.main_card, bg="#0e2730", padx=20, pady=18)
        self.results_screen.pack_forget()

        self.results_title = tk.Label(self.results_screen, text="Classement final", bg="#0e2730", fg="#ecf8ff",
                                     font=("Segoe UI", 24, "bold"))
        self.results_title.pack(anchor="w")

        self.results_list = tk.Listbox(self.results_screen, bg="#0b1f2a", fg="#edfaff", height=12, width=80,
                                      font=("Segoe UI", 11), bd=0, highlightthickness=0)
        self.results_list.pack(fill="both", expand=True, pady=(12, 0))

        self.winner_label = tk.Label(self.results_screen, text="", bg="#0e2730", fg="#7ff0c0",
                                    font=("Segoe UI", 18, "bold"))
        self.winner_label.pack(anchor="w", pady=(14, 0))

        actions = tk.Frame(self.results_screen, bg="#0e2730")
        actions.pack(fill="x", pady=(18, 0))
        tk.Button(actions, text="Rejouer", command=self.start_game, bg="#74d9ff", fg="#041b23",
                  font=("Segoe UI", 10, "bold"), width=14, height=2).pack(side="left", padx=4)
        tk.Button(actions, text="Menu", command=self.show_menu, bg="#153947", fg="#ecf8ff",
                  font=("Segoe UI", 10, "bold"), width=14, height=2).pack(side="left", padx=4)

        self.set_mode("solo")
        self.set_difficulty("facile")
        self.show_menu()

    def set_mode(self, mode):
        self.mode = mode
        for key, btn in self.mode_buttons.items():
            btn.configure(bg="#163d49" if key == mode else "#0f2933")
        if mode == "solo":
            self.room_entry.delete(0, tk.END)
            self.room_entry.insert(0, "")

    def set_difficulty(self, difficulty):
        self.difficulty = difficulty
        for key, btn in self.difficulty_buttons.items():
            btn.configure(bg="#163d49" if key == difficulty else "#0f2933")

    def animate_background(self):
        self.bg_canvas.delete("all")
        w = self.root.winfo_width()
        h = self.root.winfo_height()
        for i in range(5):
            offset = (self.bg_phase + i * 90) % (w + 200)
            x = offset - 100
            self.bg_canvas.create_oval(x, -50, x + 400, 250 + i * 40, outline="", fill="#0d2a34", stipple="gray25")
        for i in range(10):
            x1 = (i * 120 + self.bg_phase) % (w + 200) - 100
            x2 = (i * 120 + self.bg_phase + 70) % (w + 200) - 100
            self.bg_canvas.create_line(x1, h * 0.7, x2, h * 0.5, fill="#74d9ff", width=2, dash=(8, 12))
        self.bg_phase += 3
        self.root.after(45, self.animate_background)

    def show_menu(self):
        self.menu_screen.pack(fill="both", expand=True)
        self.lobby_screen.pack_forget()
        self.game_screen.pack_forget()
        self.results_screen.pack_forget()
        self.server_host = self.server_entry.get().strip() or SERVER_HOST_DEFAULT

    def show_lobby(self):
        self.menu_screen.pack_forget()
        self.lobby_screen.pack(fill="both", expand=True)
        self.game_screen.pack_forget()
        self.results_screen.pack_forget()

    def show_game(self):
        self.menu_screen.pack_forget()
        self.lobby_screen.pack_forget()
        self.game_screen.pack(fill="both", expand=True)
        self.results_screen.pack_forget()

    def show_results(self):
        self.menu_screen.pack_forget()
        self.lobby_screen.pack_forget()
        self.game_screen.pack_forget()
        self.results_screen.pack(fill="both", expand=True)

    def connect_server(self):
        try:
            self.server_host = self.server_entry.get().strip() or SERVER_HOST_DEFAULT
            if self.sock:
                try:
                    self.sock.close()
                except Exception:
                    pass
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.sock.settimeout(0.5)
            self.sock.connect((self.server_host, self.server_port))
            self.connected = True
            self.status_var.set(f"Connecté à {self.server_host}:{self.server_port}")
            return True
        except Exception as exc:
            self.status_var.set(f"Serveur indisponible : {self.server_host}:{self.server_port}")
            self.root.after(0, lambda: messagebox.showerror("Serveur", f"Connexion impossible à {self.server_host}:{self.server_port}\n{exc}"))
            return False

    def send_message(self, payload):
        if not self.connected:
            if not self.connect_server():
                return
        try:
            self.sock.sendall((json.dumps(payload) + "\n").encode("utf-8"))
        except Exception as exc:
            self.status_var.set("Connexion perdue")
            self.root.after(0, lambda: messagebox.showerror("Erreur", f"Envoi impossible : {exc}"))

    def create_room(self):
        self.server_host = self.server_entry.get().strip() or SERVER_HOST_DEFAULT
        if not self.connected and not self.connect_server():
            return
        payload = {
            "action": "create_room",
            "player_name": self.name_entry.get().strip() or "Explorateur",
            "room_code": self.room_entry.get().strip().upper() or "",
            "difficulty": self.difficulty,
            "client_id": self.client_id,
        }
        self.send_message(payload)
        self.show_lobby()

    def join_room(self):
        code = self.room_entry.get().strip().upper()
        if not code:
            self.root.after(0, lambda: messagebox.showerror("Erreur", "Entrez un code de salon."))
            return
        if not self.connected and not self.connect_server():
            return
        self.send_message({
            "action": "join_room",
            "player_name": self.name_entry.get().strip() or "Joueur",
            "room_code": code,
            "difficulty": self.difficulty,
            "client_id": self.client_id,
        })
        self.show_lobby()

    def start_game(self):
        room_code = self.room_entry.get().strip().upper() or self.room_code
        if not room_code:
            self.root.after(0, lambda: messagebox.showerror("Erreur", "Créez ou rejoignez un salon avant de démarrer."))
            return
        self.send_message({
            "action": "start_game",
            "room_code": room_code,
            "difficulty": self.difficulty,
            "client_id": self.client_id,
        })

    def render_lobby(self, players):
        self.lobby_list.delete(0, tk.END)
        for player in players:
            self.lobby_list.insert(tk.END, f"{player['name']} — {player['score']} pts")

    def handle_question(self, payload):
        self.answer_lock = False
        self.show_game()
        self.question_label.configure(text=f"{payload['question_index']}. {payload['question']}")
        for widget in self.answers_frame.winfo_children():
            widget.destroy()

        for index, option in enumerate(payload["options"]):
            btn = tk.Button(self.answers_frame, text=option, width=28, height=3, justify="left",
                            bg="#163d49", fg="#edfaff", font=("Segoe UI", 11, "bold"),
                            activebackground="#1d5065", command=lambda i=index: self.answer_question(i))
            btn.grid(row=index // 2, column=index % 2, padx=10, pady=10, sticky="nsew")
            self.answers_frame.grid_columnconfigure(0, weight=1)
            self.answers_frame.grid_columnconfigure(1, weight=1)

        self.timer_label.configure(text="15s")
        self.timer_bar.coords(self.timer_bar_rect, 0, 0, 800, 12)

    def answer_question(self, index):
        if self.answer_lock:
            return
        self.answer_lock = True
        self.send_message({
            "action": "answer",
            "room_code": self.room_code,
            "client_id": self.client_id,
            "option_index": index,
        })

    def handle_results(self, payload):
        self.results_list.delete(0, tk.END)
        ranking = sorted(payload.get("results", []), key=lambda item: item["score"], reverse=True)
        for index, item in enumerate(ranking, start=1):
            self.results_list.insert(tk.END, f"#{index} {item['name']} — {item['score']} pts")
        winner_name = ranking[0]["name"] if ranking else "Explorateur"
        self.winner_label.configure(text=f"Victoire : {winner_name}")
        self.show_results()
        self.play_sound("win")

    def play_sound(self, kind):
        try:
            if kind == "correct":
                winsound.Beep(660, 120)
                winsound.Beep(820, 120)
            elif kind == "wrong":
                winsound.Beep(220, 200)
            elif kind == "win":
                winsound.Beep(440, 140)
                winsound.Beep(660, 140)
                winsound.Beep(880, 180)
            elif kind == "start":
                winsound.Beep(510, 120)
        except Exception:
            pass

    def process_message(self, payload):
        msg_type = payload.get("type")
        if msg_type == "room_created":
            self.room_code = payload.get("room_code", "")
            self.room_entry.delete(0, tk.END)
            self.room_entry.insert(0, self.room_code)
            self.client_id = payload.get("client_id", self.client_id)
            self.status_var.set(f"Salon créé : {self.room_code}")
            self.play_sound("start")
        elif msg_type == "room_joined":
            self.room_code = payload.get("room_code", "")
            self.room_entry.delete(0, tk.END)
            self.room_entry.insert(0, self.room_code)
            self.client_id = payload.get("client_id", self.client_id)
            self.status_var.set(f"Salon rejoint : {self.room_code}")
            self.play_sound("start")
        elif msg_type == "lobby":
            self.room_code = payload.get("code", self.room_code)
            self.room_entry.delete(0, tk.END)
            self.room_entry.insert(0, self.room_code)
            self.lobby_room.configure(text=f"Code : {self.room_code}")
            self.render_lobby(payload.get("players", []))
            self.show_lobby()
        elif msg_type == "question":
            self.handle_question(payload)
        elif msg_type == "results":
            self.handle_results(payload)
        elif msg_type == "error":
            self.root.after(0, lambda: messagebox.showerror("Serveur", payload.get("message", "Erreur inconnue.")))
        elif msg_type == "answer_ack":
            if payload.get("correct"):
                self.play_sound("correct")
            else:
                self.play_sound("wrong")

    def start_listener(self):
        def listener():
            while True:
                try:
                    data = self.sock.recv(4096)
                    if not data:
                        break
                    text = data.decode("utf-8", errors="replace")
                    for line in text.splitlines():
                        if not line:
                            continue
                        try:
                            payload = json.loads(line)
                            self.root.after(0, lambda p=payload: self.process_message(p))
                        except json.JSONDecodeError:
                            continue
                except socket.timeout:
                    continue
                except Exception:
                    break

        threading.Thread(target=listener, daemon=True).start()

    def run(self):
        self.root.mainloop()


def main():
    root = tk.Tk()
    app = AbyssQuizClient(root)
    app.run()


if __name__ == "__main__":
    main()
