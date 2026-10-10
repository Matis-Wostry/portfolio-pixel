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

Les tests des déplacements, commandes, interactions et calculs de caméra s'exécutent avec `npm test` (Node.js 20 ou supérieur recommandé).

## Commandes

- Ordinateur : flèches, ZQSD ou WASD pour bouger ; E ou Espace pour interagir.
- Mobile : joystick à gauche et bouton Interagir à droite, utilisables avec deux doigts.
- Une fenêtre se ferme avec Échap ou son bouton Fermer. Le personnage s'arrête pendant la consultation.

L'affichage s'adapte au portrait et au paysage. Une rotation ou une perte de focus remet les commandes à zéro.

La chambre actuelle contient quatre repères temporaires : projets, compétences, présentation et contact. Leurs contenus sont provisoires.

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
│   ├── config/             # Sprite, hitbox et calculs de caméra
│   ├── data/               # Contenus et zones provisoires
│   ├── input/              # Commandes clavier et tactiles
│   ├── objects/            # Objets du jeu (Player…)
│   ├── scenes/             # Scènes Phaser
│   ├── systems/            # Sélection et actions des objets
│   └── ui/                 # Contrôles et fenêtres HTML
├── tests/                  # Tests des règles du jeu
├── .gitignore
├── index.html
├── package.json
└── package-lock.json
```

Les briefs, notes et documents Superpowers doivent être placés dans `docs/`.
Ce dossier, les dépendances et les fichiers générés sont exclus de Git.

## Intégrer les assets définitifs

Le sprite se configure dans `src/config/player.js` : fichier, dimensions des frames, grille, ordre des directions, point d'ancrage et hitbox. Le sprite actuel utilise des frames de 19 × 32 pixels, quatre colonnes et quatre lignes. Si son fichier est absent, un personnage de secours animé est généré.

La carte reste dans `public/assets/tilemaps/chambre.json`. Les noms et fichiers des tilesets chargés se trouvent dans `BootScene.js` ; leur association à Tiled est dans `GameScene.js`. Adapter ces listes si les tilesets changent.

Dans Tiled, ajouter un calque d'objets `objets_interaction`. Chaque objet est un rectangle non tourné, placé du côté accessible du meuble, avec ces propriétés personnalisées :

| Propriété | Type | Exemple |
|---|---|---|
| `id` | Texte, unique | `bureau` |
| `label` | Texte | `Projets` |
| `action` | Texte | `projets`, `skills`, `about` ou `contact` |
| `radius` | Nombre, facultatif | `32` |

Les repères temporaires de `src/data/interactables.js` disparaissent dès que ce calque existe, même s'il est vide. Les zones invalides sont ignorées avec un avertissement. La distance est mesurée entre les pieds du joueur et le bord du rectangle ; seul l'objet à portée le plus proche est actif.

Les textes et liens se configurent dans `src/data/portfolio.js`. Les liens acceptent HTTP, HTTPS ou mailto. Aucun formulaire ni serveur de contact n'est inclus.

Les calques `sol`, `murs` et `decorations` restent derrière les entités. Toutes les cases non vides de `murs` sont bloquantes. Le calque facultatif `premier_plan` passe au-dessus. Les meubles qui doivent alterner devant/derrière le personnage devront devenir des objets avec une profondeur fondée sur leur position aux pieds, ou être découpés entre décoration et premier plan. La nouvelle chambre doit être exportée depuis Tiled et ses zones repositionnées.

## Vérification manuelle

Après `npm run dev`, vérifier le parcours déplacement → objet à portée → fenêtre → fermeture, puis le joystick et l'action à deux doigts, la rotation, la perte de focus et le défilement d'un contenu long. Les tests Node ne remplacent pas ces vérifications dans un navigateur et sur un téléphone.
