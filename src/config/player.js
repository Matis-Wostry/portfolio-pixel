export const PLAYER = {
  texture: 'joueur',
  // Une image par pas dans public/assets/personnage/ : face-1.png … face-4.png, etc.
  // Une ligne par direction, dans l'ordre de `directions`.
  dir: 'assets/personnage',
  names: ['face', 'dos', 'gauche', 'droite'],
  frameWidth: 32,
  frameHeight: 64,
  columns: 4,
  rows: 4,
  origin: { x: 0.5, y: 1 },
  hitbox: { width: 16, height: 8, x: 8, y: 56 },
  speed: 120,
  frameRate: 8,
  directions: ['down', 'up', 'left', 'right'],
};
