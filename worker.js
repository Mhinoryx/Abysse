const rooms = new Map();

function generateRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function roomPayload(room) {
  return {
    type: 'lobby',
    code: room.code,
    players: [...room.players.values()].map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
    })),
    difficulty: room.difficulty,
    started: room.started,
  };
}

function sendJson(ws, payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(payload));
}

function broadcast(room, payload) {
  for (const player of room.players.values()) {
    sendJson(player.ws, payload);
  }
}

function getCurrentQuestion(room) {
  return room.questions[room.currentIndex] || null;
}

function nextQuestion(room) {
  room.currentIndex += 1;
  if (room.currentIndex >= room.questions.length) {
    const ranking = [...room.players.values()]
      .map((player) => ({ name: player.name, score: player.score }))
      .sort((a, b) => b.score - a.score);

    broadcast(room, { type: 'results', results: ranking });
    room.started = false;
    return;
  }

  const question = getCurrentQuestion(room);
  if (!question) return;

  broadcast(room, {
    type: 'question',
    questionIndex: room.currentIndex + 1,
    totalQuestions: room.questions.length,
    question: question.question,
    options: question.options,
    points: question.points,
  });

  clearTimeout(room.timerHandle);
  room.timerHandle = setTimeout(() => {
    nextQuestion(room);
  }, 15000);
}

function startGame(room) {
  room.started = true;
  room.currentIndex = -1;
  room.questions = buildQuestions(room.difficulty);
  for (const player of room.players.values()) {
    player.score = 0;
  }
  broadcast(room, roomPayload(room));
  nextQuestion(room);
}

function buildQuestions(level) {
  const bank = {
    facile: [
      {
        question: 'Quel symbole évoque le mieux les profondeurs abyssales ?',
        options: ['Un phare', 'Une ancre', 'Un soleil', 'Une prairie'],
        answer: 1,
        points: 1,
      },
      {
        question: 'Quelle couleur représente le plus souvent la zone abyssale ?',
        options: ['Jaune', 'Bleu profond', 'Vert clair', 'Rouge vif'],
        answer: 1,
        points: 1,
      },
      {
        question: 'Que cherche souvent un explorateur dans les profondeurs ?',
        options: ['Un secret perdu', 'Une route de montagne', 'Une ville en plein air', 'Un jardin'],
        answer: 0,
        points: 1,
      },
      {
        question: 'Quel mot correspond au voyage vers le fond ?',
        options: ['Plongée', 'Escalade', 'Course', 'Vol'],
        answer: 0,
        points: 1,
      },
      {
        question: 'Quelle ambiance correspond le mieux à l\'Abysse ?',
        options: ['Joyeuse et claire', 'Sombre et mystérieuse', 'Tropicale et lumineuse', 'Urbane et calme'],
        answer: 1,
        points: 1,
      },
      {
        question: 'Quelle sensation domine une exploration abyssale ?',
        options: ['La sérénité', 'Le mystère et le danger', 'L\'ennui total', 'La fureur du soleil'],
        answer: 1,
        points: 1,
      },
      {
        question: 'Une lueur profonde est souvent associée à :',
        options: ['Un signal étrange', 'Un feu de camp', 'Une route de campagne', 'Un retour à la maison'],
        answer: 0,
        points: 1,
      },
      {
        question: 'Quel type de créature est typique de l\'univers abyssal ?',
        options: ['Un poisson aveugle', 'Un lion des neiges', 'Un cheval du désert', 'Un panda de jungle'],
        answer: 0,
        points: 1,
      },
    ],
    moyen: [
      {
        question: 'Pourquoi l\'abysse est-elle souvent oppressante ?',
        options: ['Parce qu\'il manque de repères', 'Parce qu\'il n\'a plus d\'eau', 'Parce que le ciel est trop noir', 'Parce qu\'il y a trop de villages'],
        answer: 0,
        points: 2,
      },
      {
        question: 'Le mot "vortex" fait surtout penser à :',
        options: ['Un tourbillon', 'Une prairie', 'Une maison', 'Un lac ensoleillé'],
        answer: 0,
        points: 2,
      },
      {
        question: 'Quel est le meilleur comportement dans une zone abyssale ?',
        options: ['Avancer sans plan', 'Observer et préparer', 'Courir sans réfléchir', 'Ignorer les cartes'],
        answer: 1,
        points: 2,
      },
      {
        question: 'Quel son évoque le mieux les profondeurs ?',
        options: ['Un grondement lointain', 'Un rire de fête', 'Un claquement de porte', 'Un chant de piaf'],
        answer: 0,
        points: 2,
      },
      {
        question: 'Quelle destination correspond le mieux à une exploration abyssale ?',
        options: ['Un gouffre profond et mystérieux', 'Une ville lumineuse', 'Une montagne ouverte', 'Une forêt en été'],
        answer: 0,
        points: 2,
      },
      {
        question: 'Quel sentiment domine le plus dans une expérience abyssale ?',
        options: ['Le mystère et l\'angoisse', 'La joie pure', 'Le confort absolu', 'L\'ennui sans fin'],
        answer: 0,
        points: 2,
      },
      {
        question: 'Quelle relation entre lumière et danger est la plus logique ?',
        options: ['L\'ombre cache souvent des menaces', 'La lumière assure toujours la sécurité', 'Le danger dépend des couleurs', 'Le danger n\'existe pas'],
        answer: 0,
        points: 2,
      },
      {
        question: 'Quel mot décrit le mieux une créature des grands fonds ?',
        options: ['Abyssale', 'Centrale', 'Ensoleillée', 'Lumineuse'],
        answer: 0,
        points: 2,
      },
    ],
    difficile: [
      {
        question: 'Quel élément crée le plus de tension dans une zone abyssale ?',
        options: ['La pression et l\'absence de repères', 'La présence d\'une plage', 'L\'absence de bruit', 'La météo trop douce'],
        answer: 0,
        points: 3,
      },
      {
        question: 'Quelle logique est la plus cohérente face à l\'inconnu ?',
        options: ['Fuir sans réfléchir', 'Préparer et observer', 'Ignorer les sons', 'Avancer sans carte'],
        answer: 1,
        points: 3,
      },
      {
        question: 'Que représente le mot "abyssal" dans un contexte narratif ?',
        options: ['Une profondeur insondable', 'Une très grande plaine', 'Un village caché', 'Un ciel de fin d\'été'],
        answer: 0,
        points: 3,
      },
      {
        question: 'Une fosse abyssale est généralement associée à :',
        options: ['Une zone très profonde et mystérieuse', 'Un paysage tropical', 'Une route en altitude', 'Une prairie timide'],
        answer: 0,
        points: 3,
      },
      {
        question: 'Quel comportement est le plus risqué dans une exploration profonde ?',
        options: ['Se repérer avec un plan', 'Avancer sans carte ni stratégie', 'Suivre une balise fiable', 'Observer la profondeur'],
        answer: 1,
        points: 3,
      },
      {
        question: 'Quel sentiment domine le plus dans une expérience abyssale ?',
        options: ['Le mystère et l\'angoisse', 'La joie pure', 'Le confort absolu', 'L\'ennui sans fin'],
        answer: 0,
        points: 3,
      },
      {
        question: 'Quelle découverte est la plus cohérente dans un univers abyssal ?',
        options: ['Un artefact oublié au fond', 'Une rue de ville', 'Un jardin lumineux', 'Un pont en plein ciel'],
        answer: 0,
        points: 3,
      },
      {
        question: 'Que signifie l\'atmosphère "sombre et oppressante" ?',
        options: ['Un environnement chargé de mystère et de danger', 'Une scène joyeuse', 'Une lumière parfaite', 'Un paysage banal'],
        answer: 0,
        points: 3,
      },
    ],
  };

  const pool = bank[level] || bank.facile;
  const questions = [...pool];
  for (let i = questions.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions.slice(0, 8);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.headers.get('Upgrade') === 'websocket' || url.pathname === '/ws') {
      if (!globalThis.WebSocketPair) {
        return new Response('WebSockets are not supported in this runtime.', { status: 400 });
      }

      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      server.accept();

      server.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data);
          const { action, roomCode, playerName, difficulty, clientId, optionIndex } = message;

          let room = rooms.get(roomCode || '');

          if (action === 'create_room') {
            const code = roomCode || generateRoomCode();
            const roomEntry = {
              code,
              difficulty: difficulty || 'facile',
              started: false,
              questions: [],
              currentIndex: 0,
              players: new Map(),
              timerHandle: null,
            };

            rooms.set(code, roomEntry);
            room = roomEntry;
          }

          if (!room && action !== 'create_room') {
            sendJson(server, { type: 'error', message: 'Salon introuvable.' });
            return;
          }

          if (action === 'join_room') {
            const existing = room.players.get(clientId || playerName);
            if (!existing) {
              room.players.set(clientId || `${playerName}-${Math.random().toString(16).slice(2, 8)}`, {
                id: clientId || `${playerName}-${Math.random().toString(16).slice(2, 8)}`,
                name: playerName || 'Joueur',
                score: 0,
                ws: server,
              });
            }
            broadcast(room, roomPayload(room));
            sendJson(server, { type: 'room_joined', roomCode: room.code, clientId: clientId || [...room.players.keys()][0] });
            return;
          }

          if (action === 'start_game') {
            room.difficulty = difficulty || room.difficulty;
            startGame(room);
            return;
          }

          if (action === 'answer') {
            const currentQuestion = getCurrentQuestion(room);
            if (!currentQuestion || !room.started) return;

            const player = [...room.players.values()].find((item) => item.id === clientId);
            if (!player) return;

            const expected = currentQuestion.answer;
            const isCorrect = Number(optionIndex) === expected;
            if (isCorrect) {
              player.score += currentQuestion.points;
            }

            sendJson(server, { type: 'answer_ack', correct: isCorrect, score: player.score });
            broadcast(room, roomPayload(room));
            clearTimeout(room.timerHandle);
            nextQuestion(room);
            return;
          }

          if (action === 'leave') {
            room.players.delete(clientId || playerName);
            if (room.players.size === 0) {
              rooms.delete(room.code);
            } else {
              broadcast(room, roomPayload(room));
            }
            return;
          }

          if (action === 'create_room' || action === 'join_room') {
            const playerCollection = room.players;
            if (!playerCollection.has(clientId || `${playerName}-${Math.random().toString(16).slice(2, 8)}`)) {
              playerCollection.set(clientId || `${playerName}-${Math.random().toString(16).slice(2, 8)}`, {
                id: clientId || `${playerName}-${Math.random().toString(16).slice(2, 8)}`,
                name: playerName || 'Joueur',
                score: 0,
                ws: server,
              });
            }
            sendJson(server, { type: 'room_created', roomCode: room.code, clientId: [...room.players.keys()][0] });
            broadcast(room, roomPayload(room));
          }
        } catch (error) {
          console.error('WebSocket message error', error);
        }
      });

      server.addEventListener('close', () => {
        for (const [roomCode, room] of rooms.entries()) {
          for (const [playerId, player] of room.players.entries()) {
            if (player.ws === server) {
              room.players.delete(playerId);
            }
          }
          if (room.players.size === 0) {
            rooms.delete(roomCode);
          }
        }
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    if (url.pathname === '/api/health') {
      return Response.json({ ok: true, service: 'abysse-quiz' });
    }

    return env.ASSETS.fetch(request);
  },
};
