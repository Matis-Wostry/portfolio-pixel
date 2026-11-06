# La Chambre du Dev

Portfolio interactif en pixel art, réalisé avec Phaser et Vite.

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

## Écran-titre

`matis-wostry.com` s'ouvre sur un menu de jeu écrit dans `index.html` (`src/ui/titleScreen.js`, `src/ui/title.css`) : « Entrer dans le jeu » ou « Portfolio classique », vers `portfolio.matis-wostry.com`. Phaser n'est téléchargé qu'en entrant dans le jeu (`src/game.js`).

## Commandes

- Ordinateur : flèches, ZQSD ou WASD pour bouger ; E ou Espace pour interagir.
- Mobile : joystick à gauche et bouton Ouvrir à droite, utilisables avec deux doigts.
- Une fenêtre se ferme avec Échap ou son bouton Fermer. Le personnage s'arrête pendant la consultation.

L'affichage s'adapte au portrait et au paysage. En portrait mobile, une invitation à tourner le téléphone met le jeu en pause ; elle se ferme après rotation ou avec Continuer en portrait. Une invitation fermée ne revient pas pendant les redimensionnements en portrait, mais peut revenir après un passage en paysage. Une rotation ou une perte de focus remet les commandes à zéro.

Dans la chambre, quatre meubles sont interactifs : le bureau (projets), le tableau blanc (compétences), la bibliothèque (présentation) et la télé du coin gaming (contact). On peut aussi s'asseoir sur la chaise de bureau avec E ; un déplacement fait se relever du côté demandé. Assis, les projets restent accessibles. Sous le panier de basket, E lance une boule de papier vers la poubelle. Sur la table du coin jeu, une partie d'échecs se joue toute seule ; avec E, une fenêtre permet de jouer les blancs contre l'ordinateur (roque, prise en passant, mat, pat, règle des 50 coups et matériel insuffisant, mais pas la nulle par répétition ; promotion automatique en dame). Le moteur est dans `src/chess/engine.mjs`, les pièces sont générées par `npm run assets:echecs`. Des bulles animées en pixel art signalent les objets interactifs : leur icône annonce le contenu (écran, étoile, portrait, enveloppe, chaise, échiquier, boule de papier), puis la bulle s'allume et une touche E (ou ! sur tactile) apparaît à portée. La bulle active est cliquable ; le bouton Ouvrir et E/Espace déclenchent la même action. L'animation respecte la préférence de réduction des mouvements.

Les premiers contenus sont adaptés de [matis-wostry.com](https://matis-wostry.com/) et de son [CV public](https://matis-wostry.com/assets/cv/CV_Matis_Wostry.pdf), consultés le 11 octobre 2026 : projets, compétences, présentation, formation et contact. Ces données sont une copie locale modifiable dans `src/data/portfolio.js` ; elles ne se synchronisent pas automatiquement.

Les logos des post-it de compétences (`public/assets/interface/logos/`) viennent de [Simple Icons](https://simpleicons.org/) 16.36.0 (CC0, sauf le CSS3 en bouclier et VS Code, retirés des versions récentes et pris dans la 9.21.0, et OpenAI, pris dans la 15.0.0), recolorés dans la couleur de chaque marque, sauf quelques licences propres : JavaScript (MIT), PHP (CC BY-SA 4.0), OpenJDK utilisé pour Java (BSD-3-Clause) et Git (CC BY 3.0, Jason Long). Photoshop, Illustrator, Claude Code, Claude Design, SE Ranking, Canva, Phaser, SQL, JDBC, API REST, Docker Compose, WSL et SSH / VPS, absents de Simple Icons, sont redessinés à la main. Les marques restent la propriété de leurs détenteurs. La correspondance compétence → logo est dans `src/config/interface.js`.

## Son

Les bruitages sont synthétisés dans le navigateur ; aucune musique n'est jouée sans fichier.
Le bouton son, en haut à droite, est mémorisé dans le navigateur.

Les fichiers du designer remplacent ces sons : déposer le fichier MP3 dans `public/`
et renseigner son chemin dans `src/config/assets.js`.
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
├── scripts/                # Génération d'assets (écrans du bureau, icônes, échecs) et leurs sources
├── src/
│   ├── main.js             # Écran-titre, puis chargement du jeu à la demande
│   ├── game.js             # Initialisation de Phaser
│   ├── audio/              # Sons synthétisés et préférence de sourdine
│   ├── chess/              # Moteur d'échecs sans dépendance
│   ├── config/             # Sprite, hitbox et calculs de caméra
│   ├── data/               # Contenus et disposition de la chambre
│   ├── debug/              # Boîtes de collision (F2 en développement, ?debug en production)
│   ├── input/              # Commandes clavier et tactiles
│   ├── objects/            # Objets du jeu (Player, Room, échecs de la table, boule de papier)
│   ├── scenes/             # Scènes Phaser
│   ├── systems/            # Sélection et actions des objets
│   └── ui/                 # Contrôles et fenêtres HTML (terminal, tableau, fiche, échecs)
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

`SEATS` liste les places assises : position du joueur assis, pose (`assis-dos`), meuble de référence (le joueur passe devant, ou derrière avec `behind: true`), zone d'approche et `exits`, les positions où se relever selon la direction demandée.

Les bulles, touches et icônes sont dans `public/assets/interface/` ; l'icône de chaque action se règle dans `src/config/interface.js`.

Une `zone` indique `id`, `label`, `action` (`projets`, `skills`, `about`, `contact`, `chess` ou `shoot` ; les places assises utilisent `sit`), un rectangle relatif à l'image et, si besoin, `cueY` pour placer sa bulle à une autre hauteur. La distance est mesurée entre les pieds du joueur et le bord du rectangle ; seul l'objet à portée le plus proche est actif. Les meubles passent devant ou derrière le personnage selon la position de leur base. Si une image de la chambre manque, un message d'erreur remplace le jeu.

Le personnage se configure dans `src/config/player.js` : dossier des images (`public/assets/personnage/`, une image de 32 × 64 pixels par pas nommée `face-1.png`, `dos-1.png`, `gauche-1.png`, `droite-1.png`…), ordre des directions, point d'ancrage, hitbox et ombre (`personnage/ombre.png`, posée au sol sous les pieds, de la même couleur que les ombres des meubles). Si une image manque, un personnage de secours animé est généré.

Les textes et liens se configurent dans `src/data/portfolio.js`. Selon la rubrique : `categories` et `cards` (projets, ouverts dans le terminal), `board` (compétences, sur le tableau blanc), `persona` (présentation), ou simplement `paragraphs` et `links` (contact). Les liens acceptent HTTP, HTTPS, mailto ou tel. Aucun formulaire ni serveur de contact n'est inclus.

L'aperçu des liens partagés (Open Graph) se règle dans `index.html` et utilise `public/og-image.png`.

## Vérification manuelle

Après `npm run dev`, vérifier le parcours déplacement → objet à portée → fenêtre → fermeture, puis le joystick et l'action à deux doigts, la rotation, la perte de focus et le défilement d'un contenu long. Les tests Node ne remplacent pas ces vérifications dans un navigateur et sur un téléphone.
