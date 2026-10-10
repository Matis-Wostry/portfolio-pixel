# Portfolio Stardew Valley

Portfolio interactif réalisé avec Phaser et Vite.

## Démarrage

```sh
npm ci
npm run dev
```

Pour générer la version de production :

```sh
npm run build
```

## Arborescence

```text
├── docs/                   # Documents locaux, exclus de Git
│   ├── brief_claude_code.md
│   └── superpowers/        # Plans et documents du plugin
├── public/
│   └── assets/
│       ├── sprites/
│       ├── tilemaps/
│       └── tilesets/
├── src/
│   ├── main.js             # Initialisation du jeu
│   ├── objects/            # Objets du jeu (Player…)
│   └── scenes/             # Scènes Phaser
├── .gitignore
├── index.html
├── package.json
└── package-lock.json
```

Les briefs, notes et documents Superpowers doivent être placés dans `docs/`.
Ce dossier, les dépendances et les fichiers générés sont exclus de Git.
