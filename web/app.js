const QUESTION_BANK = {
  facile: [
    { question: 'Quel océan est le plus vaste du monde ?', options: ['Océan Atlantique', 'Océan Pacifique', 'Océan Indien', 'Océan Arctique'], answer: 1, points: 1 },
    { question: 'Quelle planète est surnommée la planète rouge ?', options: ['Vénus', 'Mars', 'Jupiter', 'Mercure'], answer: 1, points: 1 },
    { question: 'Qui a peint La Joconde ?', options: ['Raphaël', 'Léonard de Vinci', 'Michel-Ange', 'Titien'], answer: 1, points: 1 },
    { question: 'Combien de côtés a un hexagone ?', options: ['5', '6', '7', '8'], answer: 1, points: 1 },
    { question: 'Quelle est la capitale du Japon ?', options: ['Kyoto', 'Osaka', 'Tokyo', 'Sapporo'], answer: 2, points: 1 },
    { question: 'Quel animal est le plus grand mammifère du monde ?', options: ['Éléphant', 'Baleine bleue', 'Rorqual', 'Dauphin'], answer: 1, points: 1 },
    { question: 'Quelle langue est parlée majoritairement au Brésil ?', options: ['Espagnol', 'Portugais', 'Français', 'Italien'], answer: 1, points: 1 },
    { question: 'Quel est le symbole chimique de l\'or ?', options: ['Ag', 'Au', 'Go', 'Gd'], answer: 1, points: 1 },
  ],
  moyen: [
    { question: 'Quel scientifique a formulé la théorie de la relativité restreinte ?', options: ['Isaac Newton', 'Albert Einstein', 'Galilée', 'Nikola Tesla'], answer: 1, points: 2 },
    { question: 'Quel pays a pour capitale Berlin ?', options: ['Autriche', 'Allemagne', 'Belgique', 'Pays-Bas'], answer: 1, points: 2 },
    { question: 'Quelle est la plus haute montagne du monde ?', options: ['K2', 'Mont Blanc', 'Everest', 'Kilimandjaro'], answer: 2, points: 2 },
    { question: 'Quel élément est essentiel à la photosynthèse ?', options: ['L\'azote', 'Le dioxyde de carbone', 'Le fer', 'Le sodium'], answer: 1, points: 2 },
    { question: 'Qui a écrit Les Misérables ?', options: ['Victor Hugo', 'Émile Zola', 'Alexandre Dumas', 'Gustave Flaubert'], answer: 0, points: 2 },
    { question: 'Combien de joueurs composent une équipe de football classique sur le terrain ?', options: ['9', '10', '11', '12'], answer: 2, points: 2 },
    { question: 'Dans quel pays se trouve Machu Picchu ?', options: ['Chili', 'Pérou', 'Bolivie', 'Argentine'], answer: 1, points: 2 },
    { question: 'Quel est le nom du satellite naturel de la Terre ?', options: ['Titan', 'Phobos', 'Lune', 'Europa'], answer: 2, points: 2 },
  ],
  difficile: [
    { question: 'Quel est le plus long fleuve du monde ?', options: ['Nil', 'Amazone', 'Yangtsé', 'Mississippi'], answer: 1, points: 3 },
    { question: 'En informatique, que signifie le sigle CPU ?', options: ['Central Processing Unit', 'Computer Power Utility', 'Control Program Update', 'Central Program Unit'], answer: 0, points: 3 },
    { question: 'Quelle loi décrit les orbites elliptiques des planètes autour du Soleil ?', options: ['Loi de la gravitation', 'Loi de Kepler', 'Loi de Newton', 'Loi de Galilée'], answer: 1, points: 3 },
    { question: 'Dans la mythologie grecque, qui est le dieu du tonnerre ?', options: ['Hadès', 'Apollon', 'Zeus', 'Hermès'], answer: 2, points: 3 },
    { question: 'Quel est le nom du premier ordinateur électronique programmable ?', options: ['Apple II', 'ENIAC', 'IBM 360', 'Commodore 64'], answer: 1, points: 3 },
    { question: 'Quel pays a aboli l\'esclavage en 1848 ?', options: ['Royaume-Uni', 'France', 'États-Unis', 'Brésil'], answer: 1, points: 3 },
    { question: 'Quelle est la capitale du Canada ?', options: ['Toronto', 'Montréal', 'Ottawa', 'Vancouver'], answer: 2, points: 3 },
    { question: 'Qui a composé la Symphonie n° 5 en do mineur ?', options: ['Mozart', 'Beethoven', 'Brahms', 'Chopin'], answer: 1, points: 3 },
  ],
};

const MAX_QUESTIONS_PER_GAME = 10;

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
const setupLockedContent = document.getElementById('setupLockedContent');
const pseudoHint = document.getElementById('pseudoHint');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const roomCodeLabel = document.getElementById('roomCodeLabel');
const playerList = document.getElementById('playerList');
const questionText = document.getElementById('questionText');
const answersContainer = document.getElementById('answers');
const questionBadge = document.getElementById('questionBadge');
const timerBadge = document.getElementById('timerBadge');
const resultsList = document.getElementById('resultsList');
const winnerText = document.getElementById('winnerText');
const statusPill = document.getElementById('statusPill');
const joinCode = document.getElementById('joinCode');
const joinLink = document.getElementById('joinLink');
const qrCode = document.getElementById('qrCode');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const soloBtn = document.getElementById('soloBtn');

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
  if (statusPill) {
    statusPill.textContent = text;
  }
}

function updatePlayerGate() {
  const hasName = playerNameInput.value.trim().length > 0;
  setupLockedContent.classList.toggle('hidden', !hasName);
  pseudoHint.classList.toggle('hidden', hasName);

  createRoomBtn.disabled = !hasName;
  joinRoomBtn.disabled = !hasName;
  soloBtn.disabled = !hasName;

  if (!hasName) {
    roomInput.value = '';
  }
}

function validatePlayerName() {
  const cleanName = playerNameInput.value.trim();
  if (!cleanName) {
    playerNameInput.focus();
    playerNameInput.setAttribute('placeholder', 'Choisis un pseudo');
    playerNameInput.value = '';
    alert('Tu dois choisir un pseudo avant de continuer.');
    return false;
  }
  playerNameInput.value = cleanName;
  return true;
}

function updateShareBox() {
  const roomCode = (state.roomCode || '').trim();
  if (!roomCode) {
    joinCode.textContent = '—';
    joinLink.textContent = '—';
    qrCode.src = '';
    return;
  }

  const joinUrl = `${location.origin}?room=${encodeURIComponent(roomCode)}`;
  joinCode.textContent = roomCode;
  joinLink.textContent = joinUrl;
  qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinUrl)}`;
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
    roomCodeLabel.textContent = `Code: ${state.roomCode}`;
    updateShareBox();
    setScreen('lobby');
    updateStatus(`Salon ${state.roomCode}`);
    return;
  }

  if (message.type === 'lobby') {
    state.players = message.players || [];
    renderPlayers();
    roomCodeLabel.textContent = `Code: ${message.code}`;
    state.roomCode = message.code;
    updateShareBox();
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

function triggerBubbleBurst(x, y) {
  const layer = document.getElementById('bubbleLayer');
  if (!layer) return;

  const count = 18;
  for (let i = 0; i < count; i += 1) {
    const bubble = document.createElement('span');
    bubble.className = 'bubble';

    const size = 4 + Math.random() * 12;
    const left = x + (Math.random() * 70 - 35);
    const drift = (Math.random() * 100 - 50);

    bubble.style.left = `${left}px`;
    bubble.style.top = `${y + Math.random() * 18}px`;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.setProperty('--drift-x', `${drift}px`);
    bubble.style.animationDelay = `${(Math.random() * 0.2).toFixed(2)}s`;
    bubble.style.filter = `blur(${(Math.random() * 1.2).toFixed(2)}px)`;

    layer.appendChild(bubble);
    setTimeout(() => bubble.remove(), 2400);
  }
}

function attachBubbleTrigger() {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      triggerBubbleBurst(event.clientX, event.clientY);
    }
  });
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
        const currentQuestion = state.currentQuestions[state.currentQuestionIndex];
        if (isCorrect && currentQuestion) {
          state.score += currentQuestion.points || 1;
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
  return shuffle(pool).slice(0, MAX_QUESTIONS_PER_GAME);
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

  state.currentQuestionIndex = index;
  state.answersLocked = false;
  questionBadge.textContent = `Question ${index + 1}`;
  questionText.textContent = question.question;
  renderAnswers(question.options, question.answer);
  startTimer(15);
}

function advanceSoloQuestion() {
  const nextIndex = state.currentQuestionIndex + 1;
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
  if (!validatePlayerName()) return;

  state.mode = 'multi';
  const playerName = playerNameInput.value.trim();
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
  if (!validatePlayerName()) return;

  state.mode = 'multi';
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
    playerName: playerNameInput.value.trim(),
    difficulty: state.difficulty,
    clientId: state.clientId,
  });
}

function startMultiplayerGame() {
  if (!validatePlayerName()) return;
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
  state.roomCode = '';
  updateShareBox();
  setScreen('menu');
  updateStatus('');
}

const startGameBtn = document.getElementById('startGameBtn');
const lobbyHomeBtn = document.getElementById('lobbyHomeBtn');
const gameHomeBtn = document.getElementById('gameHomeBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const backMenuBtn = document.getElementById('backMenuBtn');

playerNameInput.addEventListener('input', updatePlayerGate);

difficultyButtons.forEach((button) => {
  button.addEventListener('click', () => {
    state.difficulty = button.dataset.difficulty;
    difficultyButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
  });
});

createRoomBtn.addEventListener('click', createRoom);
joinRoomBtn.addEventListener('click', joinRoom);
soloBtn.addEventListener('click', () => {
  if (!validatePlayerName()) return;
  startSoloGame();
});
startGameBtn.addEventListener('click', startMultiplayerGame);
lobbyHomeBtn.addEventListener('click', resetToMenu);
gameHomeBtn.addEventListener('click', resetToMenu);
playAgainBtn.addEventListener('click', () => {
  if (!validatePlayerName()) return;
  if (state.mode === 'multi') {
    startMultiplayerGame();
    return;
  }
  startSoloGame();
});
backMenuBtn.addEventListener('click', resetToMenu);

const params = new URLSearchParams(window.location.search);
const roomFromUrl = params.get('room');
if (roomFromUrl) {
  roomInput.value = roomFromUrl.trim().toUpperCase();
}

attachBubbleTrigger();
setScreen('menu');
updatePlayerGate();
updateShareBox();
updateStatus('');
