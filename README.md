# Abysse Quiz

Un petit quiz multijoueur en Python, inspiré du style Kahoot, dans une ambiance sombre et abyssale.

## Fonctionnalités

- 3 niveaux de difficulté : facile, moyen, difficile
- Mode solo et multijoueur
- Salon de jeu avec code de room
- Questions en thème Abysse
- Classement final
- Interface graphique avec Tkinter
- Effets sonores simples

## Prérequis

- Python 3.10+
- Windows recommandé pour les effets sonores

## Lancer le serveur

```bash
python server.py
```

## Lancer le client

```bash
python main.py
```

## Structure du projet

```text
abysse_quiz_py/
├── app.py
├── main.py
├── questions.py
├── server.py
├── README.md
├── .gitignore
└── tests/
    ├── __init__.py
    └── test_quiz.py
```

## Exemple d'utilisation

1. Démarrer le serveur.
2. Ouvrir le client.
3. Créer ou rejoindre un salon.
4. Choisir un niveau de difficulté.
5. Démarrer la partie.
6. Répondre aux questions et regarder le classement final.

## Développement

Le projet est conçu comme un MVP simple et facilement extensible.

## Licence

MIT
