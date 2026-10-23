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
  { key: 'bibliotheque', file: 'meubles/bibliotheque.png', x: 40, y: 32, solid: [[0, 72, 64, 24]],
    zone: { id: 'bibliotheque', label: 'Présentation', action: 'about', rect: [0, 0, 64, 96] } },
  { key: 'panier', file: 'meubles/panier-basket.png', x: 152, y: 6, wall: true },
  { key: 'bureau', file: 'meubles/bureau.png', x: 224, y: 64, solid: [[0, 60, 123, 36]],
    zone: { id: 'bureau', label: 'Projets', action: 'projets', rect: [0, 0, 123, 96] },
    overlays: [
      // Planche générée par `npm run assets:ecrans` : 32 images de 128 × 96 côte à côte.
      { key: 'bureau-ecrans', file: 'effets/bureau-ecrans-anim.png', effect: 'animation', frameWidth: 128, frameHeight: 96, frameRate: 8 },
      { key: 'bureau-lumiere', file: 'effets/bureau-lumiere.png', effect: 'glow' },
    ] },
  { key: 'chaise', file: 'meubles/chaise.png', x: 262, y: 136, solid: [[18, 50, 28, 14]] },
  { key: 'serveur', file: 'meubles/serveur.png', x: 360, y: 72, solid: [[0, 44, 32, 20]],
    leds: [1, 2, 3].map((n) => `effets/serveur-led-${n}.png`) },
  { key: 'tableau', file: 'meubles/tableau-blanc.png', x: 408, y: 48, solid: [[0, 76, 82, 20]],
    zone: { id: 'tableau', label: 'Compétences', action: 'skills', rect: [0, 0, 82, 96] } },
  { key: 'coin-gaming', file: 'meubles/coin-gaming.png', x: 40, y: 216,
    solid: [[0, 70, 46, 54], [64, 90, 38, 24], [121, 80, 30, 39]],
    zone: { id: 'coin-gaming', label: 'Contact', action: 'contact', rect: [0, 24, 152, 104] },
    overlays: [{ key: 'coin-gaming-lumiere', file: 'effets/tele-lumiere.png', effect: 'glow' }] },
  { key: 'coin-jeu', file: 'meubles/coin-jeu.png', x: 328, y: 264, solid: [[0, 36, 128, 28]] },
];

export const ledKey = (index) => `serveur-led-${index}`;

// Tous les fichiers de la chambre, avec la clé de texture correspondante.
export const ROOM_FILES = [
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
export const ROOM_ZONES = FURNITURE.filter((item) => item.zone).map(({ x, y, zone }) => ({
  id: zone.id, label: zone.label, action: zone.action,
  x: x + zone.rect[0], y: y + zone.rect[1], width: zone.rect[2], height: zone.rect[3],
}));
