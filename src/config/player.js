export const PLAYER = {
  texture: 'joueur',
  // Une image par pas dans public/assets/personnage/ : face-1.png … face-4.png, etc.
  // Une ligne par direction, dans l'ordre de `directions`.
  dir: 'assets/personnage',
  names: ['face', 'dos', 'gauche', 'droite'],
  // Poses assises : assis-dos.png.
  seated: ['dos'],
  // Ombre posée au sol sous les pieds (même couleur que les ombres des meubles), décalée de offsetY.
  shadow: { texture: 'joueur-ombre', path: 'assets/personnage/ombre.png', offsetY: 0 },
  frameWidth: 32,
  frameHeight: 64,
  columns: 4,
  rows: 4,
  origin: { x: 0.5, y: 1 },
  hitbox: { width: 16, height: 8, x: 8, y: 56 },
  // Les bras (colonnes de part et d'autre de la hitbox, des épaules aux mains) sont redessinés par-dessus les meubles
  // (dont la profondeur ne dépasse pas 400), sous le cadre et la boule en l'air : le corps, les jambes et les pieds
  // passent derrière un meuble, pas les bras. `armsRows` : lignes du sprite, jambes et bottes exclues.
  armsDepth: 8000,
  armsRows: { top: 22, bottom: 47 },
  speed: 120,
  frameRate: 8,
  directions: ['down', 'up', 'left', 'right'],
};
