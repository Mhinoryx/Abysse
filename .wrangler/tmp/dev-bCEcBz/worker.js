var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-Ek8KOw/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// worker.js
var rooms = /* @__PURE__ */ new Map();
function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
__name(generateRoomCode, "generateRoomCode");
function roomPayload(room) {
  return {
    type: "lobby",
    code: room.code,
    players: [...room.players.values()].map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score
    })),
    difficulty: room.difficulty,
    started: room.started
  };
}
__name(roomPayload, "roomPayload");
function sendJson(ws, payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN)
    return;
  ws.send(JSON.stringify(payload));
}
__name(sendJson, "sendJson");
function broadcast(room, payload) {
  for (const player of room.players.values()) {
    sendJson(player.ws, payload);
  }
}
__name(broadcast, "broadcast");
function getCurrentQuestion(room) {
  return room.questions[room.currentIndex] || null;
}
__name(getCurrentQuestion, "getCurrentQuestion");
function nextQuestion(room) {
  room.currentIndex += 1;
  if (room.currentIndex >= room.questions.length) {
    const ranking = [...room.players.values()].map((player) => ({ name: player.name, score: player.score })).sort((a, b) => b.score - a.score);
    broadcast(room, { type: "results", results: ranking });
    room.started = false;
    return;
  }
  const question = getCurrentQuestion(room);
  if (!question)
    return;
  broadcast(room, {
    type: "question",
    questionIndex: room.currentIndex + 1,
    totalQuestions: room.questions.length,
    question: question.question,
    options: question.options,
    points: question.points
  });
  clearTimeout(room.timerHandle);
  room.timerHandle = setTimeout(() => {
    nextQuestion(room);
  }, 15e3);
}
__name(nextQuestion, "nextQuestion");
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
__name(startGame, "startGame");
function buildQuestions(level) {
  const bank = {
    facile: [
      {
        question: "Quel symbole \xE9voque le mieux les profondeurs abyssales ?",
        options: ["Un phare", "Une ancre", "Un soleil", "Une prairie"],
        answer: 1,
        points: 1
      },
      {
        question: "Quelle couleur repr\xE9sente le plus souvent la zone abyssale ?",
        options: ["Jaune", "Bleu profond", "Vert clair", "Rouge vif"],
        answer: 1,
        points: 1
      },
      {
        question: "Que cherche souvent un explorateur dans les profondeurs ?",
        options: ["Un secret perdu", "Une route de montagne", "Une ville en plein air", "Un jardin"],
        answer: 0,
        points: 1
      },
      {
        question: "Quel mot correspond au voyage vers le fond ?",
        options: ["Plong\xE9e", "Escalade", "Course", "Vol"],
        answer: 0,
        points: 1
      },
      {
        question: "Quelle ambiance correspond le mieux \xE0 l'Abysse ?",
        options: ["Joyeuse et claire", "Sombre et myst\xE9rieuse", "Tropicale et lumineuse", "Urbane et calme"],
        answer: 1,
        points: 1
      },
      {
        question: "Quelle sensation domine une exploration abyssale ?",
        options: ["La s\xE9r\xE9nit\xE9", "Le myst\xE8re et le danger", "L'ennui total", "La fureur du soleil"],
        answer: 1,
        points: 1
      },
      {
        question: "Une lueur profonde est souvent associ\xE9e \xE0 :",
        options: ["Un signal \xE9trange", "Un feu de camp", "Une route de campagne", "Un retour \xE0 la maison"],
        answer: 0,
        points: 1
      },
      {
        question: "Quel type de cr\xE9ature est typique de l'univers abyssal ?",
        options: ["Un poisson aveugle", "Un lion des neiges", "Un cheval du d\xE9sert", "Un panda de jungle"],
        answer: 0,
        points: 1
      }
    ],
    moyen: [
      {
        question: "Pourquoi l'abysse est-elle souvent oppressante ?",
        options: ["Parce qu'il manque de rep\xE8res", "Parce qu'il n'a plus d'eau", "Parce que le ciel est trop noir", "Parce qu'il y a trop de villages"],
        answer: 0,
        points: 2
      },
      {
        question: 'Le mot "vortex" fait surtout penser \xE0 :',
        options: ["Un tourbillon", "Une prairie", "Une maison", "Un lac ensoleill\xE9"],
        answer: 0,
        points: 2
      },
      {
        question: "Quel est le meilleur comportement dans une zone abyssale ?",
        options: ["Avancer sans plan", "Observer et pr\xE9parer", "Courir sans r\xE9fl\xE9chir", "Ignorer les cartes"],
        answer: 1,
        points: 2
      },
      {
        question: "Quel son \xE9voque le mieux les profondeurs ?",
        options: ["Un grondement lointain", "Un rire de f\xEAte", "Un claquement de porte", "Un chant de piaf"],
        answer: 0,
        points: 2
      },
      {
        question: "Quelle destination correspond le mieux \xE0 une exploration abyssale ?",
        options: ["Un gouffre profond et myst\xE9rieux", "Une ville lumineuse", "Une montagne ouverte", "Une for\xEAt en \xE9t\xE9"],
        answer: 0,
        points: 2
      },
      {
        question: "Quel sentiment domine le plus dans une exp\xE9rience abyssale ?",
        options: ["Le myst\xE8re et l'angoisse", "La joie pure", "Le confort absolu", "L'ennui sans fin"],
        answer: 0,
        points: 2
      },
      {
        question: "Quelle relation entre lumi\xE8re et danger est la plus logique ?",
        options: ["L'ombre cache souvent des menaces", "La lumi\xE8re assure toujours la s\xE9curit\xE9", "Le danger d\xE9pend des couleurs", "Le danger n'existe pas"],
        answer: 0,
        points: 2
      },
      {
        question: "Quel mot d\xE9crit le mieux une cr\xE9ature des grands fonds ?",
        options: ["Abyssale", "Centrale", "Ensoleill\xE9e", "Lumineuse"],
        answer: 0,
        points: 2
      }
    ],
    difficile: [
      {
        question: "Quel \xE9l\xE9ment cr\xE9e le plus de tension dans une zone abyssale ?",
        options: ["La pression et l'absence de rep\xE8res", "La pr\xE9sence d'une plage", "L'absence de bruit", "La m\xE9t\xE9o trop douce"],
        answer: 0,
        points: 3
      },
      {
        question: "Quelle logique est la plus coh\xE9rente face \xE0 l'inconnu ?",
        options: ["Fuir sans r\xE9fl\xE9chir", "Pr\xE9parer et observer", "Ignorer les sons", "Avancer sans carte"],
        answer: 1,
        points: 3
      },
      {
        question: 'Que repr\xE9sente le mot "abyssal" dans un contexte narratif ?',
        options: ["Une profondeur insondable", "Une tr\xE8s grande plaine", "Un village cach\xE9", "Un ciel de fin d'\xE9t\xE9"],
        answer: 0,
        points: 3
      },
      {
        question: "Une fosse abyssale est g\xE9n\xE9ralement associ\xE9e \xE0 :",
        options: ["Une zone tr\xE8s profonde et myst\xE9rieuse", "Un paysage tropical", "Une route en altitude", "Une prairie timide"],
        answer: 0,
        points: 3
      },
      {
        question: "Quel comportement est le plus risqu\xE9 dans une exploration profonde ?",
        options: ["Se rep\xE9rer avec un plan", "Avancer sans carte ni strat\xE9gie", "Suivre une balise fiable", "Observer la profondeur"],
        answer: 1,
        points: 3
      },
      {
        question: "Quel sentiment domine le plus dans une exp\xE9rience abyssale ?",
        options: ["Le myst\xE8re et l'angoisse", "La joie pure", "Le confort absolu", "L'ennui sans fin"],
        answer: 0,
        points: 3
      },
      {
        question: "Quelle d\xE9couverte est la plus coh\xE9rente dans un univers abyssal ?",
        options: ["Un artefact oubli\xE9 au fond", "Une rue de ville", "Un jardin lumineux", "Un pont en plein ciel"],
        answer: 0,
        points: 3
      },
      {
        question: `Que signifie l'atmosph\xE8re "sombre et oppressante" ?`,
        options: ["Un environnement charg\xE9 de myst\xE8re et de danger", "Une sc\xE8ne joyeuse", "Une lumi\xE8re parfaite", "Un paysage banal"],
        answer: 0,
        points: 3
      }
    ]
  };
  const pool = bank[level] || bank.facile;
  const questions = [...pool];
  for (let i = questions.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions.slice(0, 8);
}
__name(buildQuestions, "buildQuestions");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.headers.get("Upgrade") === "websocket" || url.pathname === "/ws") {
      if (!globalThis.WebSocketPair) {
        return new Response("WebSockets are not supported in this runtime.", { status: 400 });
      }
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);
      server.accept();
      server.addEventListener("message", (event) => {
        try {
          const message = JSON.parse(event.data);
          const { action, roomCode, playerName, difficulty, clientId, optionIndex } = message;
          let room = rooms.get(roomCode || "");
          if (action === "create_room") {
            const code = roomCode || generateRoomCode();
            const roomEntry = {
              code,
              difficulty: difficulty || "facile",
              started: false,
              questions: [],
              currentIndex: 0,
              players: /* @__PURE__ */ new Map(),
              timerHandle: null
            };
            rooms.set(code, roomEntry);
            room = roomEntry;
          }
          if (!room && action !== "create_room") {
            sendJson(server, { type: "error", message: "Salon introuvable." });
            return;
          }
          if (action === "join_room") {
            const existing = room.players.get(clientId || playerName);
            if (!existing) {
              room.players.set(clientId || `${playerName}-${Math.random().toString(16).slice(2, 8)}`, {
                id: clientId || `${playerName}-${Math.random().toString(16).slice(2, 8)}`,
                name: playerName || "Joueur",
                score: 0,
                ws: server
              });
            }
            broadcast(room, roomPayload(room));
            sendJson(server, { type: "room_joined", roomCode: room.code, clientId: clientId || [...room.players.keys()][0] });
            return;
          }
          if (action === "start_game") {
            room.difficulty = difficulty || room.difficulty;
            startGame(room);
            return;
          }
          if (action === "answer") {
            const currentQuestion = getCurrentQuestion(room);
            if (!currentQuestion || !room.started)
              return;
            const player = [...room.players.values()].find((item) => item.id === clientId);
            if (!player)
              return;
            const expected = currentQuestion.answer;
            const isCorrect = Number(optionIndex) === expected;
            if (isCorrect) {
              player.score += currentQuestion.points;
            }
            sendJson(server, { type: "answer_ack", correct: isCorrect, score: player.score });
            broadcast(room, roomPayload(room));
            clearTimeout(room.timerHandle);
            nextQuestion(room);
            return;
          }
          if (action === "leave") {
            room.players.delete(clientId || playerName);
            if (room.players.size === 0) {
              rooms.delete(room.code);
            } else {
              broadcast(room, roomPayload(room));
            }
            return;
          }
          if (action === "create_room" || action === "join_room") {
            const playerCollection = room.players;
            if (!playerCollection.has(clientId || `${playerName}-${Math.random().toString(16).slice(2, 8)}`)) {
              playerCollection.set(clientId || `${playerName}-${Math.random().toString(16).slice(2, 8)}`, {
                id: clientId || `${playerName}-${Math.random().toString(16).slice(2, 8)}`,
                name: playerName || "Joueur",
                score: 0,
                ws: server
              });
            }
            sendJson(server, { type: "room_created", roomCode: room.code, clientId: [...room.players.keys()][0] });
            broadcast(room, roomPayload(room));
          }
        } catch (error) {
          console.error("WebSocket message error", error);
        }
      });
      server.addEventListener("close", () => {
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
        webSocket: client
      });
    }
    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, service: "abysse-quiz" });
    }
    return env.ASSETS.fetch(request);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-Ek8KOw/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-Ek8KOw/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
