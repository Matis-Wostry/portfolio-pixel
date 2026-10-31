// Chambre construite avec les fichiers du designer (public/assets/chambre/).
// Positions en pixels (coin haut-gauche de l'image) ; `solid` liste les empreintes bloquantes
// et `zone` rend le meuble interactif, relatives à l'image : [x, y, largeur, hauteur].
export const ROOM_DIR = 'assets/chambre';
export const TILE = 32;
export const ROOM = { columns: 16, rows: 12, wallRows: 3, spawn: { x: 256, y: 240 } };

export const TILES = {
  floor: [1, 2, 3, 4].map((n) => `sol/sol-${n}.png`),
  // Du haut vers le bas du mur, une image par rangée.
  wall: ['mur/mur-haut.png', 'mur/mur-milieu.png', 'mur/mur-bas.png'],
  border: {
    topLeft: 'cadre/haut-gauche.png',
    top: 'cadre/haut.png',
    topRight: 'cadre/haut-droit.png',
    left: 'cadre/gauche.png',
    right: 'cadre/droit.png',
    bottomLeft: 'cadre/bas-gauche.png',
    bottom: 'cadre/bas.png',
    bottomRight: 'cadre/bas-droit.png',
  },
};

export const FURNITURE = [
  // Mur du fond, de gauche à droite : bibliothèque, bureau au centre, panier et serveur ; tableau posé devant, à gauche du bureau.
  { key: 'bibliotheque', file: 'meubles/bibliotheque.png', x: 12, y: 32, solid: [[0, 56, 64, 40]],
    zone: { id: 'bibliotheque', label: 'Présentation', action: 'about', rect: [0, 0, 64, 96] } },
  { key: 'tableau', file: 'meubles/tableau-blanc.png', x: 100, y: 78, solid: [[0, 14, 82, 82]],
    zone: { id: 'tableau', label: 'Compétences', action: 'skills', rect: [0, 0, 82, 96] } },
  { key: 'bureau', file: 'meubles/bureau.png', x: 208, y: 52, solid: [[0, 40, 98, 56]],
    zone: { id: 'bureau', label: 'Projets', action: 'projets', rect: [0, 0, 98, 96] },
    overlays: [
      // Planche générée par `npm run assets:ecrans` : 32 images de 128 × 96 côte à côte.
      { key: 'bureau-ecrans', file: 'effets/bureau-ecrans-anim.png', effect: 'animation', frameWidth: 128, frameHeight: 96, frameRate: 8 },
      { key: 'bureau-lumiere', file: 'effets/bureau-lumiere.png', effect: 'glow' },
      // Ventilateurs rouges de la tour : une ligne de 4 intensités par ventilateur (7 × 6 px chacune),
      // chacun s'allume plus ou moins fort au hasard. `spots` : position dans l'image du bureau et première image.
      { key: 'bureau-ventilateurs', file: 'effets/bureau-ventilateurs.png', effect: 'random', frameWidth: 7, frameHeight: 6, levels: 4,
        spots: [{ x: 4, y: 35, first: 0 }, { x: 4, y: 41, first: 4 }] },
    ] },
  { key: 'chaise', file: 'meubles/chaise.png', x: 246, y: 124, solid: [[11, 24, 42, 40]] },
  { key: 'panier', file: 'meubles/panier-basket.png', x: 334, y: 6, wall: true },
  // Poubelle sous le panier, qui reçoit les boules de papier ; la zone est à sa gauche pour que la bulle ne cache pas le filet.
  { key: 'poubelle', file: 'meubles/poubelle.png', x: 356, y: 85, solid: [[0, 7, 20, 20]],
    zone: { id: 'panier', label: 'Panier', action: 'shoot', rect: [-46, 5, 40, 30] } },
  { key: 'serveur', file: 'meubles/serveur.png', x: 470, y: 72, solid: [[0, 20, 32, 44]],
    leds: [1, 2, 3].map((n) => `effets/serveur-led-${n}.png`) },
  // Coin jeu en bas à gauche, coin télé contre le mur de droite.
  { key: 'coin-jeu', file: 'meubles/coin-jeu.png', x: 63, y: 264, solid: [[0, 18, 26, 39], [35, 11, 64, 53], [105, 20, 23, 39]],
    zone: { id: 'echecs', label: 'Échecs', action: 'chess', rect: [30, 4, 68, 60] }, chess: true },
  // Le fauteuil est une image à part pour se décaler de 8 px vers la gauche sans bouger la table ni la télé.
  { key: 'fauteuil', file: 'meubles/fauteuil.png', x: 342, y: 216, solid: [[0, 24, 48, 104]] },
  { key: 'coin-gaming', file: 'meubles/coin-gaming.png', x: 350, y: 216,
    solid: [[64, 60, 38, 58], [121, 24, 30, 102]],
    zone: { id: 'coin-gaming', label: 'Contact', action: 'contact', rect: [112, 24, 40, 104] },
    overlays: [{ key: 'coin-gaming-lumiere', file: 'effets/tele-lumiere.png', effect: 'glow' }] },
];

// Places assises : position du joueur assis (bas des pieds, en coordonnées de la chambre), pose
// (`personnage/assis-<pose>.png`), meuble de référence pour la profondeur et zone d'approche [x, y, largeur, hauteur].
// `behind: true` place le joueur derrière le meuble (le dossier de la chaise de bureau cache le bas du corps).
export const SEATS = [
  { id: 'chaise-bureau', label: 'Chaise de bureau', pose: 'dos', x: 278, y: 156, furniture: 'chaise', behind: true, rect: [257, 148, 42, 40] },
];

// Échiquier dessiné sur la table du coin jeu : coin haut-gauche dans l'image, cases de 2 pixels.
// Une partie s'y joue toute seule : `echecs-plateau.png` repeint les cases, `echecs-table.png` contient
// les pièces miniatures (blancs puis noirs, p n b r q k).
export const CHESS_TABLE = {
  key: 'echecs-table', file: 'effets/echecs-table.png', boardKey: 'echecs-plateau', boardFile: 'effets/echecs-plateau.png',
  board: { x: 56, y: 25 }, square: 2,
  minDelay: 1800, maxDelay: 3800, restartDelay: 5000, maxMoves: 80,
  // Positions de départ allégées (10 à 15 pièces, en notation FEN), tirées au hasard à chaque partie :
  // l'échiquier reste aéré et lisible à cette taille, sans viser une partie réaliste.
  positions: [
    '4k3/pp3p2/2n1b3/3q4/3P4/2N1B3/PP3P2/3QK3 w - - 0 1',
    '2r1k3/p4p2/1n2b3/8/3P4/2B2N2/P4P2/2R1K3 w - - 0 1',
    '3qk3/1p3pb1/2n5/8/4P3/2N5/1P3PB1/3QK3 w - - 0 1',
    'r3k3/5pp1/2b5/1p6/3NP3/6P1/5P2/R3K3 w - - 0 1',
    '4k3/2r2p2/3np3/8/8/3BP3/2R2P2/4K3 w - - 0 1',
    '1r2k3/p1q2p2/4bn2/8/8/2NB4/P1Q2P2/1R2K3 w - - 0 1',
  ],
};

// Lancer de boule de papier au panier, en coordonnées de la chambre : centre de l'arceau, bas du filet
// et ouverture de la poubelle. `success` : chance de marquer ; durées en millisecondes.
export const PAPER_SHOT = {
  key: 'boule-papier', file: 'effets/boule-papier.png', frameWidth: 5, frameHeight: 5,
  rim: { x: 366, y: 52, halfWidth: 13 }, netBottom: 82, bin: { x: 366, y: 90 }, floor: 118,
  success: 0.7, flight: 650, fall: 320,
};

export const ledKey = (index) => `serveur-led-${index}`;

// Tous les fichiers de la chambre, avec la clé de texture correspondante.
export const ROOM_FILES = [
  { key: CHESS_TABLE.key, file: CHESS_TABLE.file, frameWidth: CHESS_TABLE.square, frameHeight: CHESS_TABLE.square },
  { key: CHESS_TABLE.boardKey, file: CHESS_TABLE.boardFile },
  { key: PAPER_SHOT.key, file: PAPER_SHOT.file, frameWidth: PAPER_SHOT.frameWidth, frameHeight: PAPER_SHOT.frameHeight },
  ...TILES.floor.map((file, index) => ({ key: `sol-${index}`, file })),
  ...TILES.wall.map((file, index) => ({ key: `mur-${index}`, file })),
  ...Object.entries(TILES.border).map(([name, file]) => ({ key: `bord-${name}`, file })),
  ...FURNITURE.flatMap((item) => [
    { key: item.key, file: item.file },
    ...(item.overlays ?? []).map(({ key, file, frameWidth, frameHeight }) => ({ key, file, frameWidth, frameHeight })),
    ...(item.leds ?? []).map((file, index) => ({ key: ledKey(index), file })),
  ]),
];

// Zones au format attendu par normalizeZones, en coordonnées de la chambre.
export const ROOM_ZONES = [
  ...FURNITURE.filter((item) => item.zone).map(({ x, y, zone }) => ({
    id: zone.id, label: zone.label, action: zone.action,
    x: x + zone.rect[0], y: y + zone.rect[1], width: zone.rect[2], height: zone.rect[3],
  })),
  ...SEATS.map(({ id, label, rect: [x, y, width, height] }) => ({ id, label, action: 'sit', x, y, width, height })),
];
