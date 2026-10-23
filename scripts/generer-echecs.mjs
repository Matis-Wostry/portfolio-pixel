// Génère les pièces d'échecs en pixel art, dans la palette du designer.
// Usage : npm run assets:echecs
// Sorties : public/assets/interface/echecs/{w,b}{p,n,b,r,q,k}.png (pièces de la fenêtre, 16 × 16),
// public/assets/interface/icones/echecs.png (bulle), public/assets/chambre/effets/echecs-plateau.png (cases de la table)
// et public/assets/chambre/effets/echecs-table.png (pièces miniatures : 12 images de 2 × 2, blancs puis noirs, p n b r q k).
import { mkdirSync, writeFileSync } from 'node:fs';
import { encodePNG } from './png.mjs';

const OUTLINE = [29, 23, 27];
// '#' : corps de la pièce ; 'x' : détail gravé (œil du cavalier, fente du fou).
const SILHOUETTES = {
  p: [
    '..............',
    '..............',
    '.....####.....',
    '....######....',
    '....######....',
    '.....####.....',
    '....######....',
    '.....####.....',
    '.....####.....',
    '....######....',
    '...########...',
    '..##########..',
    '..##########..',
    '..............',
  ],
  r: [
    '..............',
    '..##..##..##..',
    '..##########..',
    '..##########..',
    '...########...',
    '....######....',
    '....######....',
    '....######....',
    '....######....',
    '....######....',
    '...########...',
    '..##########..',
    '..##########..',
    '..............',
  ],
  n: [
    '..............',
    '.....##.......',
    '....#####.....',
    '...#######....',
    '..###x#####...',
    '.##########...',
    '.#####.####...',
    '.###...####...',
    '......#####...',
    '.....######...',
    '....#######...',
    '...#########..',
    '..##########..',
    '..............',
  ],
  b: [
    '..............',
    '......##......',
    '.....####.....',
    '....###x##....',
    '....##x###....',
    '....######....',
    '.....####.....',
    '......##......',
    '.....####.....',
    '.....####.....',
    '....######....',
    '...########...',
    '..##########..',
    '..............',
  ],
  q: [
    '..............',
    '.#..#.##.#..#.',
    '.##.#.##.#.##.',
    '.############.',
    '..##########..',
    '...########...',
    '....######....',
    '.....####.....',
    '.....####.....',
    '....######....',
    '...########...',
    '..##########..',
    '..##########..',
    '..............',
  ],
  k: [
    '......##......',
    '....######....',
    '......##......',
    '...########...',
    '..##########..',
    '..##########..',
    '...########...',
    '....######....',
    '.....####.....',
    '....######....',
    '...########...',
    '..##########..',
    '..##########..',
    '..............',
  ],
};

// Blancs : crème du designer ; noirs : gris violacé sombre. light = reflet, body, shade = côté droit, detail = gravure.
const COLORS = {
  w: { light: [255, 248, 244], body: [255, 236, 231], shade: [227, 197, 195], base: [175, 167, 173], detail: OUTLINE },
  b: { light: [98, 86, 95], body: [74, 62, 71], shade: [52, 42, 49], base: [41, 32, 34], detail: [142, 131, 139] },
};

function piece(rows, colors) {
  const size = 16;
  const data = Buffer.alloc(size * size * 4);
  const body = (x, y) => rows[y]?.[x] === '#' || rows[y]?.[x] === 'x';
  const set = (x, y, [r, g, b]) => data.set([r, g, b, 255], (y * size + x) * 4);
  for (let y = 0; y < 14; y += 1) {
    for (let x = 0; x < 14; x += 1) {
      if (rows[y][x] === 'x') set(x + 1, y + 1, colors.detail);
      else if (body(x, y)) {
        let color = colors.body;
        if (y >= 11) color = colors.base;
        else if (!body(x + 1, y)) color = colors.shade;
        else if (!body(x - 1, y) || !body(x, y - 1)) color = colors.light;
        set(x + 1, y + 1, color);
      }
    }
  }
  // Contour sombre autour de la silhouette, comme le mobilier de la chambre.
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const inside = (dx, dy) => body(x - 1 + dx, y - 1 + dy);
      if (!inside(0, 0) && (inside(-1, 0) || inside(1, 0) || inside(0, -1) || inside(0, 1))) set(x, y, OUTLINE);
    }
  }
  return { width: size, height: size, data };
}

const root = new URL('../public/assets/', import.meta.url);
mkdirSync(new URL('interface/echecs/', root), { recursive: true });
Object.entries(COLORS).forEach(([color, colors]) => Object.entries(SILHOUETTES).forEach(([type, rows]) => {
  writeFileSync(new URL(`interface/echecs/${color}${type}.png`, root), encodePNG(piece(rows, colors)));
}));
writeFileSync(new URL('interface/icones/echecs.png', root), encodePNG(piece(SILHOUETTES.n, COLORS.w)));

// Échiquier de la table (cases de 2 × 2 pixels) : les cases sont repeintes dans deux gris doux du designer
// pour que les pièces ressortent : crème pour les blancs, bordeaux de la chambre pour les noirs.
// Pion : deux pixels en bas de la case ; pièces : un bloc 2 × 2 éclairé en haut ; dame et roi : couronne dorée.
const BOARD = { light: [175, 167, 173], dark: [98, 86, 95] };
const plateau = { width: 16, height: 16, data: Buffer.alloc(16 * 16 * 4) };
for (let y = 0; y < 16; y += 1) {
  for (let x = 0; x < 16; x += 1) {
    const [r, g, b] = (Math.floor(x / 2) + Math.floor(y / 2)) % 2 ? BOARD.dark : BOARD.light;
    plateau.data.set([r, g, b, 255], (y * 16 + x) * 4);
  }
}
writeFileSync(new URL('chambre/effets/echecs-plateau.png', root), encodePNG(plateau));

const TABLE = { w: { top: [255, 236, 231], base: [227, 197, 195] }, b: { top: [196, 82, 92], base: [148, 57, 69] } };
const CROWN = [242, 182, 109];
const order = ['p', 'n', 'b', 'r', 'q', 'k'];
const sheet = { width: 2 * 12, height: 2, data: Buffer.alloc(24 * 2 * 4) };
['w', 'b'].forEach((color, side) => order.forEach((type, index) => {
  const x0 = (side * 6 + index) * 2;
  const { top, base } = TABLE[color];
  const pixels = type === 'p' ? [[0, 1, top], [1, 1, base]]
    : [[0, 0, 'qk'.includes(type) ? CROWN : top], [1, 0, top], [0, 1, base], [1, 1, base]];
  pixels.forEach(([x, y, [r, g, b]]) => sheet.data.set([r, g, b, 255], (y * sheet.width + x0 + x) * 4));
}));
writeFileSync(new URL('chambre/effets/echecs-table.png', root), encodePNG(sheet));
console.log('Pièces d’échecs écrites dans public/assets/interface/echecs/, icône et pièces de la table générées.');
