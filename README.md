# Portfolio Stardew Valley

Portfolio interactif réalisé avec Phaser et Vite.

## Démarrage

```sh
npm ci
npm run dev
```

Pour tester sur un téléphone connecté au même Wi-Fi que l'ordinateur :

```sh
npm run dev:mobile
```

Vite affiche alors une adresse `Network` (par exemple `http://192.168.1.20:5173/`) à ouvrir dans le navigateur du téléphone. Si la page ne charge pas, autoriser Node.js sur les réseaux privés dans le pare-feu Windows.

Pour générer la version de production :

```sh
npm run build
```

Les tests des déplacements, commandes, interactions et calculs de caméra s'exécutent avec `npm test` (Node.js 20 ou supérieur recommandé).

## Commandes

- Ordinateur : flèches, ZQSD ou WASD pour bouger ; E ou Espace pour interagir.
- Mobile : joystick à gauche et bouton Ouvrir à droite, utilisables avec deux doigts.
- Une fenêtre se ferme avec Échap ou son bouton Fermer. Le personnage s'arrête pendant la consultation.

L'affichage s'adapte au portrait et au paysage. En portrait mobile, une invitation à tourner le téléphone met le jeu en pause ; elle se ferme après rotation ou avec Continuer en portrait. Une invitation fermée ne revient pas pendant les redimensionnements en portrait, mais peut revenir après un passage en paysage. Une rotation ou une perte de focus remet les commandes à zéro.

Dans la chambre, quatre meubles sont interactifs : le bureau (projets), le tableau blanc (compétences), la bibliothèque (présentation) et le coin gaming (contact). Des bulles animées signalent les objets interactifs : le symbole de fenêtre annonce leur contenu, puis E (ou ! sur tactile) apparaît à portée. La bulle active est cliquable ; le bouton Ouvrir et E/Espace déclenchent la même action. L'animation respecte la préférence de réduction des mouvements.

Les premiers contenus sont adaptés de [matis-wostry.com](https://matis-wostry.com/) et de son [CV public](https://matis-wostry.com/assets/cv/CV_Matis_Wostry.pdf), consultés le 11 octobre 2026 : six projets, compétences, présentation, formation et contact. Ces données sont une copie locale modifiable dans `src/data/portfolio.js` ; elles ne se synchronisent pas automatiquement.

## Écran titre et son

Le jeu s'ouvre sur un écran titre en pixel art dessiné par le code (`src/title/`).
Les bruitages sont synthétisés dans le navigateur ; aucune musique n'est jouée sans fichier.
Le bouton son, en haut à droite, est mémorisé dans le navigateur.

Les fichiers du designer remplacent ces versions générées : déposer le fichier dans `public/`
et renseigner son chemin dans `src/config/assets.js` (décor en 720 × 300 pixels, sons en MP3).
Un fichier absent ou invalide est ignoré avec un avertissement.

## Arborescence

```text
├── docs/                   # Documents locaux, exclus de Git
│   ├── brief_claude_code.md
│   └── superpowers/        # Plans et documents du plugin
├── public/
│   └── assets/
│       ├── chambre/        # Images du designer : sol, mur, cadre, meubles, effets
│       └── personnage/     # Un fichier par pas : face-1.png … droite-4.png
├── scripts/                # Génération d'assets (planche des écrans) et leurs sources
├── src/
│   ├── main.js             # Initialisation du jeu
│   ├── config/             # Sprite, hitbox et calculs de caméra
│   ├── data/               # Contenus et disposition de la chambre
│   ├── input/              # Commandes clavier et tactiles
│   ├── objects/            # Objets du jeu (Player, Room)
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

## Chambre et personnage

La chambre est construite par le code à partir des images du designer, rangées dans `public/assets/chambre/` (`sol/`, `mur/`, `cadre/`, `meubles/`, `effets/`) ; aucune carte Tiled n'est utilisée. Sa disposition se règle dans `src/data/room.js` :

- `ROOM` : taille en tuiles de 32 pixels, nombre de rangées de mur et point d'apparition ;
- `TILES` : images du sol (variantes mélangées), du mur et du cadre ;
- `FURNITURE` : chaque meuble avec son image, sa position (coin haut-gauche, en pixels), ses empreintes bloquantes `solid`, ses calques animés (`overlays`, `leds`) et sa `zone` interactive facultative.

Les écrans du bureau jouent la planche `effets/bureau-ecrans-anim.png` (32 images de 128 × 96 côte à côte, superposées au bureau) : éditeur de code qui défile à gauche, terminal à droite. Elle est générée à partir de la forme des écrans livrée par le designer (`scripts/sources/bureau-ecrans.png`) avec `npm run assets:ecrans` ; le contenu et les couleurs se modifient dans `scripts/screens.mjs`. Un calque `overlays` avec `effect: 'animation'` accepte n'importe quelle planche de ce type. Les lumières pulsent et les LEDs du serveur clignotent ; ces animations s'arrêtent si la réduction des mouvements est demandée.

Une `zone` indique `id`, `label`, `action` (`projets`, `skills`, `about` ou `contact`) et un rectangle relatif à l'image. La distance est mesurée entre les pieds du joueur et le bord du rectangle ; seul l'objet à portée le plus proche est actif. Les meubles passent devant ou derrière le personnage selon la position de leur base. Si une image de la chambre manque, un message d'erreur remplace le jeu.

Le personnage se configure dans `src/config/player.js` : dossier des images (`public/assets/personnage/`, une image de 32 × 64 pixels par pas nommée `face-1.png`, `dos-1.png`, `gauche-1.png`, `droite-1.png`…), ordre des directions, point d'ancrage et hitbox. Si une image manque, un personnage de secours animé est généré.

Les textes et liens se configurent dans `src/data/portfolio.js`. Chaque rubrique accepte `paragraphs`, `links` et des `cards` facultatives (titre, description, tags et liens). Les liens acceptent HTTP, HTTPS ou mailto. Aucun formulaire ni serveur de contact n'est inclus.

## Vérification manuelle

Après `npm run dev`, vérifier le parcours déplacement → objet à portée → fenêtre → fermeture, puis le joystick et l'action à deux doigts, la rotation, la perte de focus et le défilement d'un contenu long. Les tests Node ne remplacent pas ces vérifications dans un navigateur et sur un téléphone.
