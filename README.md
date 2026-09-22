# Abysse Quiz

Un quiz abyssal inspiré du style Kahoot, avec ambiance sombre et exploration marine. Le projet contient désormais une version desktop Python et une version web prête à être déployée sur Cloudflare.

## Fonctionnalités

- 3 niveaux de difficulté : facile, moyen, difficile
- Mode solo et multijoueur
- Salon de jeu avec code de room
- Questions en thème Abysse
- Classement final
- Version desktop Tkinter
- Version web Cloudflare avec interface navigateur

## Prérequis

- Python 3.10+ pour la version desktop
- Node.js 18+ pour la version web Cloudflare
- Un compte Cloudflare pour le déploiement

## Version desktop

### Lancer le serveur

```bash
python server.py
```

### Lancer le client

```bash
python main.py
```

## Version web Cloudflare

### Lancer localement

```bash
cd abysse_quiz_py
npm install
npx wrangler dev --assets ./web --local --port 8787
```

Puis ouvrir :

```text
http://127.0.0.1:8787
```

### Déployer sur Cloudflare

1. Installer Wrangler :

```bash
npm install
```

2. Se connecter à Cloudflare :

```bash
npx wrangler login
```

3. Déployer :

```bash
npx wrangler deploy
```

4. Le site est alors accessible via l’URL fournie par Cloudflare.

## Structure du projet

```text
abysse_quiz_py/
├── app.py
├── main.py
├── questions.py
├── server.py
├── worker.js
├── package.json
├── wrangler.toml
├── README.md
├── .gitignore
├── web/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── tests/
│   └── test_quiz.py
└── __pycache__/
```

## Exemple d'utilisation

1. Ouvrir la version web ou desktop.
2. Choisir le niveau de difficulté.
3. Créer un salon ou rejoindre un salon.
4. Lancer la partie.
5. Répondre aux questions et consulter le classement final.

## Développement

Le jeu a été préparé pour fonctionner en ligne via Cloudflare Workers + Pages/Assets, tout en conservant la base Python desktop.

## Licence

MIT
