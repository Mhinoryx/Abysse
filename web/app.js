const QUESTION_BANK = {
  facile: [
    { question: 'Quel symbole évoque le mieux les profondeurs abyssales ?', options: ['Un phare', 'Une ancre', 'Un soleil', 'Une prairie'], answer: 1, points: 1 },
    { question: 'Quelle couleur représente le plus souvent la zone abyssale ?', options: ['Jaune', 'Bleu profond', 'Vert clair', 'Rouge vif'], answer: 1, points: 1 },
    { question: 'Que cherche souvent un explorateur dans les profondeurs ?', options: ['Un secret perdu', 'Une route de montagne', 'Une ville en plein air', 'Un jardin'], answer: 0, points: 1 },
    { question: 'Quel mot correspond au voyage vers le fond ?', options: ['Plongée', 'Escalade', 'Course', 'Vol'], answer: 0, points: 1 },
    { question: 'Quelle ambiance correspond le mieux à l\'Abysse ?', options: ['Joyeuse et claire', 'Sombre et mystérieuse', 'Tropicale et lumineuse', 'Urbane et calme'], answer: 1, points: 1 },
    { question: 'Quelle sensation domine une exploration abyssale ?', options: ['La sérénité', 'Le mystère et le danger', 'L\'ennui total', 'La fureur du soleil'], answer: 1, points: 1 },
    { question: 'Une lueur profonde est souvent associée à :', options: ['Un signal étrange', 'Un feu de camp', 'Une route de campagne', 'Un retour à la maison'], answer: 0, points: 1 },
    { question: 'Quel type de créature est typique de l\'univers abyssal ?', options: ['Un poisson aveugle', 'Un lion des neiges', 'Un cheval du désert', 'Un panda de jungle'], answer: 0, points: 1 },
  ],
  moyen: [
    { question: 'Pourquoi l\'abysse est-elle souvent oppressante ?', options: ['Parce qu\'il manque de repères', 'Parce qu\'il n\'a plus d\'eau', 'Parce que le ciel est trop noir', 'Parce qu\'il y a trop de villages'], answer: 0, points: 2 },
    { question: 'Le mot "vortex" fait surtout penser à :', options: ['Un tourbillon', 'Une prairie', 'Une maison', 'Un lac ensoleillé'], answer: 0, points: 2 },
    { question: 'Quel est le meilleur comportement dans une zone abyssale ?', options: ['Avancer sans plan', 'Observer et préparer', 'Courir sans réfléchir', 'Ignorer les cartes'], answer: 1, points: 2 },
    { question: 'Quel son évoque le mieux les profondeurs ?', options: ['Un grondement lointain', 'Un rire de fête', 'Un claquement de porte', 'Un chant de piaf'], answer: 0, points: 2 },
    { question: 'Quelle destination correspond le mieux à une exploration abyssale ?', options: ['Un gouffre profond et mystérieux', 'Une ville lumineuse', 'Une montagne ouverte', 'Une forêt en été'], answer: 0, points: 2 },
    { question: 'Quel sentiment domine le plus dans une expérience abyssale ?', options: ['Le mystère et l\'angoisse', 'La joie pure', 'Le confort absolu', 'L\'ennui sans fin'], answer: 0, points: 2 },
    { question: 'Quelle relation entre lumière et danger est la plus logique ?', options: ['L\'ombre cache souvent des menaces', 'La lumière assure toujours la sécurité', 'Le danger dépend des couleurs', 'Le danger n\'existe pas'], answer: 0, points: 2 },
    { question: 'Quel mot décrit le mieux une créature des grands fonds ?', options: ['Abyssale', 'Centrale', 'Ensoleillée', 'Lumineuse'], answer: 0, points: 2 },
  ],
  difficile: [
    { question: 'Quel élément crée le plus de tension dans une zone abyssale ?', options: ['La pression et l\'absence de repères', 'La présence d\'une plage', 'L\'absence de bruit', 'La météo trop douce'], answer: 0, points: 3 },
    { question: 'Quelle logique est la plus cohérente face à l\'inconnu ?', options: ['Fuir sans réfléchir', 'Préparer et observer', 'Ignorer les sons', 'Avancer sans carte'], answer: 1, points: 3 },
    { question: 'Que représente le mot "abyssal" dans un contexte narratif ?', options: ['Une profondeur insondable', 'Une très grande plaine', 'Un village caché', 'Un ciel de fin d\'été'], answer: 0, points: 3 },
    { question: 'Une fosse abyssale est généralement associée à :', options: ['Une zone très profonde et mystérieuse', 'Un paysage tropical', 'Une route en altitude', 'Une prairie timide'], answer: 0, points: 3 },
    { question: 'Quel comportement est le plus risqué dans une exploration profonde ?', options: ['Se repérer avec un plan', 'Avancer sans carte ni stratégie', 'Suivre une balise fiable', 'Observer la profondeur'], answer: 1, points: 3 },
    { question: 'Quel sentiment domine le plus dans une expérience abyssale ?', options: ['Le mystère et l\'angoisse', 'La joie pure', 'Le confort absolu', 'L\'ennui sans fin'], answer: 0, points: 3 },
    { question: 'Quelle découverte est la plus cohérente dans un univers abyssal ?', options: ['Un artefact oublié au fond', 'Une rue de ville', 'Un jardin lumineux', 'Un pont en plein ciel'], answer: 0, points: 3 },
    { question: 'Que signifie l\'atmosphère "sombre et oppressante" ?', options: ['Un environnement chargé de mystère et de danger', 'Une scène joyeuse', 'Une lumière parfaite', 'Un paysage banal'], answer: 0, points: 3 },
  ],
};

const state = {
  mode: 'solo',
  difficulty: 'facile',
  roomCode: '',
  score: 0,
  currentQuestionIndex: 0,
  currentQuestions: [],
  timerId: null,
  timerValue: 15,
  answersLocked: false,
  socket: null,
  clientId: '',
  players: [],
};

const menuScreen = document.getElementById('menuScreen');
const lobbyScreen = document.getElementById('lobbyScreen');
const gameScreen = document.getElementById('gameScreen');
const resultsScreen = document.getElementById('resultsScreen');

const playerNameInput = document.getElementById('playerName');
const roomInput = document.getElementById('roomInput');
const difficultySelect = document.getElementById('difficultySelect');
const roomCodeLabel = document.getElementById('roomCodeLabel');
const playerList = document.getElementById('playerList');
const questionText = document.getElementById('questionText');
const answersContainer = document.getElementById('answers');
const questionBadge = document.getElementById('questionBadge');
const timerBadge = document.getElementById('timerBadge');
const resultsList = document.getElementById('resultsList');
const winnerText = document.getElementById('winnerText');
const statusPill = document.getElementById('statusPill');

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function setScreen(name) {
  menuScreen.classList.toggle('hidden', name !== 'menu');
  lobbyScreen.classList.toggle('hidden', name !== 'lobby');
  gameScreen.classList.toggle('hidden', name !== 'game');
  resultsScreen.classList.toggle('hidden', name !== 'results');
}

function updateStatus(text) {
  statusPill.textContent = text;
}

function getSocketUrl() {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${location.host}/ws`;
}

function connectSocket() {
  if (state.socket && state.socket.readyState === WebSocket.OPEN) return;

  const socket = new WebSocket(getSocketUrl());
  socket.addEventListener('open', () => {
    updateStatus('Salon connecté');
  });

  socket.addEventListener('close', () => {
    updateStatus('Hors ligne');
  });

  socket.addEventListener('message', (event) => {
    try {
      const message = JSON.parse(event.data);
      handleSocketMessage(message);
    } catch (error) {
      console.error('Message invalide', error);
    }
  });

  state.socket = socket;
}

function sendSocketMessage(payload) {
  if (!state.socket || state.socket.readyState !== WebSocket.OPEN) {
    return;
  }
  state.socket.send(JSON.stringify(payload));
}

function handleSocketMessage(message) {
  if (message.type === 'room_created' || message.type === 'room_joined') {
    state.roomCode = message.roomCode || state.roomCode;
    state.clientId = message.clientId || state.clientId;
    state.players = [];
    setScreen('lobby');
    roomCodeLabel.textContent = `Code: ${state.roomCode}`;
    updateStatus(`Salon ${state.roomCode}`);
    return;
  }

  if (message.type === 'lobby') {
    state.players = message.players || [];
    renderPlayers();
    roomCodeLabel.textContent = `Code: ${message.code}`;
    state.roomCode = message.code;
    setScreen('lobby');
    return;
  }

  if (message.type === 'question') {
    state.answersLocked = false;
    state.currentQuestionIndex = message.questionIndex || 1;
    questionBadge.textContent = `Question ${message.questionIndex}`;
    questionText.textContent = message.question;
    renderAnswers(message.options, message.answer);
    startTimer(15);
    setScreen('game');
    return;
  }

  if (message.type === 'answer_ack') {
    if (message.correct) {
      state.score += 1;
    }
    return;
  }

  if (message.type === 'results') {
    renderResults(message.results || []);
    setScreen('results');
    clearInterval(state.timerId);
  }
}

function renderPlayers() {
  playerList.innerHTML = '';
  state.players.forEach((player) => {
    const item = document.createElement('li');
    item.innerHTML = `<span>${player.name}</span><span class="score">${player.score} pts</span>`;
    playerList.appendChild(item);
  });
}

function renderResults(results) {
  resultsList.innerHTML = '';
  const sorted = [...results].sort((a, b) => b.score - a.score);
  let winnerName = 'Abyssal winner';

  sorted.forEach((entry, index) => {
    const item = document.createElement('li');
    item.innerHTML = `<span>#${index + 1} ${entry.name}</span><span class="score">${entry.score} pts</span>`;
    resultsList.appendChild(item);
    winnerName = index === 0 ? entry.name : winnerName;
  });

  winnerText.textContent = `${winnerName} a survécu jusqu’au fond !`;
}

function startTimer(seconds) {
  clearInterval(state.timerId);
  state.timerValue = seconds;
  renderTimer();

  state.timerId = setInterval(() => {
    state.timerValue -= 1;
    if (state.timerValue <= 0) {
      clearInterval(state.timerId);
      state.timerValue = 0;
      renderTimer();
      if (state.mode === 'solo') {
        advanceSoloQuestion();
      }
      return;
    }
    renderTimer();
  }, 1000);
}

function renderTimer() {
  timerBadge.textContent = `${state.timerValue}s`;
}

function renderAnswers(options, correctIndex) {
  answersContainer.innerHTML = '';
  options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-btn';
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.addEventListener('click', () => {
      if (state.answersLocked) return;
      state.answersLocked = true;
      const isCorrect = index === correctIndex;
      button.classList.add(isCorrect ? 'correct' : 'wrong');
      if (state.mode === 'solo') {
        if (isCorrect) {
          state.score += 1;
        }
        setTimeout(() => {
          advanceSoloQuestion();
        }, 600);
      } else {
        sendSocketMessage({
          action: 'answer',
          roomCode: state.roomCode,
          clientId: state.clientId,
          optionIndex: index,
        });
      }
    });
    answersContainer.appendChild(button);
  });
}

function buildSoloQuestions() {
  const pool = QUESTION_BANK[state.difficulty] || QUESTION_BANK.facile;
  return shuffle(pool).slice(0, 8);
}

function startSoloGame() {
  state.mode = 'solo';
  state.score = 0;
  state.currentQuestionIndex = 0;
  state.currentQuestions = buildSoloQuestions();
  setScreen('game');
  showQuestion(state.currentQuestionIndex);
}

function showQuestion(index) {
  const question = state.currentQuestions[index];
  if (!question) {
    renderSoloResults();
    return;
  }

  questionBadge.textContent = `Question ${index + 1}`;
  questionText.textContent = question.question;
  renderAnswers(question.options, question.answer);
  startTimer(15);
}

function advanceSoloQuestion() {
  const nextIndex = state.currentQuestionIndex + 1;
  state.currentQuestionIndex = nextIndex;
  if (nextIndex >= state.currentQuestions.length) {
    renderSoloResults();
    return;
  }
  showQuestion(nextIndex);
}

function renderSoloResults() {
  setScreen('results');
  resultsList.innerHTML = '';
  const item = document.createElement('li');
  item.innerHTML = `<span>Votre score</span><span class="score">${state.score} pts</span>`;
  resultsList.appendChild(item);
  winnerText.textContent = state.score >= 5 ? 'Vous avez trouvé la bonne voie.' : 'Le fond reste encore mystérieux...';
}

function createRoom() {
  state.mode = 'multi';
  state.difficulty = difficultySelect.value;
  const playerName = playerNameInput.value.trim() || 'Explorateur';
  state.clientId = `player-${Math.random().toString(16).slice(2, 8)}`;
  connectSocket();
  sendSocketMessage({
    action: 'create_room',
    playerName,
    difficulty: state.difficulty,
    clientId: state.clientId,
  });
}

function joinRoom() {
  state.mode = 'multi';
  state.difficulty = difficultySelect.value;
  const roomCode = (roomInput.value || '').trim().toUpperCase();
  if (!roomCode) {
    alert('Indique un code de salon.');
    return;
  }

  connectSocket();
  state.clientId = `player-${Math.random().toString(16).slice(2, 8)}`;
  sendSocketMessage({
    action: 'join_room',
    roomCode,
    playerName: playerNameInput.value.trim() || 'Explorateur',
    difficulty: state.difficulty,
    clientId: state.clientId,
  });
}

function startMultiplayerGame() {
  if (!state.roomCode) {
    return;
  }
  sendSocketMessage({
    action: 'start_game',
    roomCode: state.roomCode,
    difficulty: state.difficulty,
  });
}

function resetToMenu() {
  clearInterval(state.timerId);
  state.score = 0;
  setScreen('menu');
  updateStatus('En ligne');
}

const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const soloBtn = document.getElementById('soloBtn');
const startGameBtn = document.getElementById('startGameBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const backMenuBtn = document.getElementById('backMenuBtn');

createRoomBtn.addEventListener('click', createRoom);
joinRoomBtn.addEventListener('click', joinRoom);
soloBtn.addEventListener('click', startSoloGame);
startGameBtn.addEventListener('click', startMultiplayerGame);
playAgainBtn.addEventListener('click', () => {
  if (state.mode === 'multi') {
    startMultiplayerGame();
    return;
  }
  startSoloGame();
});
backMenuBtn.addEventListener('click', resetToMenu);

setScreen('menu');
updateStatus('En ligne');
