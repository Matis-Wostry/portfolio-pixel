// Génère les icônes des hobbies de la fiche Présentation, dans la palette du designer (16 × 16).
// Usage : npm run assets:hobbies
// Sorties : public/assets/interface/hobbies/{basket,jeux-video,mangas}.png (les échecs reprennent icones/echecs.png).
import { mkdirSync, writeFileSync } from 'node:fs';
import { encodePNG } from './png.mjs';

const SIZE = 16;
const OUTLINE = [29, 23, 27];

function image(pixel) {
  const data = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const color = pixel(x, y);
      if (color) data.set([...color, 255], (y * SIZE + x) * 4);
    }
  }
  return { width: SIZE, height: SIZE, data };
}

// Grille de caractères centrée dans l'icône ; '.' reste transparent.
function fromRows(rows, colors) {
  const top = Math.floor((SIZE - rows.length) / 2);
  const left = Math.floor((SIZE - rows[0].length) / 2);
  return image((x, y) => colors[rows[y - top]?.[x - left]]);
}

// Ballon : disque orange éclairé en haut à gauche, coutures droites et courbes, contour sombre.
const BALL = { light: [240, 160, 96], body: [214, 120, 62], shade: [168, 84, 48], seam: [70, 34, 28] };
const basket = image((x, y) => {
  const [px, py] = [x + 0.5, y + 0.5];
  const distance = Math.hypot(px - 8, py - 8);
  if (distance > 7.4) return null;
  if (distance > 6.4) return OUTLINE;
  const seam = x === 7 || y === 7
    || Math.abs(Math.hypot(px + 2, py - 8) - 8) < 0.5 || Math.abs(Math.hypot(px - 17, py - 8) - 8) < 0.5;
  if (seam) return BALL.seam;
  if (px + py < 10) return BALL.light;
  return px + py > 21 ? BALL.shade : BALL.body;
});

// Manette : croix directionnelle à gauche, deux boutons rose et bleu à droite.
const gamepad = fromRows([
  '..OOOO....OOOO..',
  '.OBBBBOOOOBBBBO.',
  'OBBDBBBBBBBBRBBO',
  'OBDDDBBBBBBRBGBO',
  'OBBDBBBBBBBBGBBO',
  'OBBBBBOOOOBBBBBO',
  'OBBBBO....OBBBBO',
  '.OBBO......OBBO.',
  '..OO........OO..',
], { O: OUTLINE, B: [98, 86, 95], D: [41, 32, 34], R: [229, 115, 157], G: [124, 183, 232] });

// Tome de manga : dos sombre, bandeau de titre crème, étoile dorée sur la couverture.
const manga = fromRows([
  'OOOOOOOOOOO',
  'OSRRRRRRRRO',
  'OSRWWWWWWRO',
  'OSRWKWKKWRO',
  'OSRWWWWWWRO',
  'OSRRRRRRRRO',
  'OSRRRYRRRRO',
  'OSRRYYYRRRO',
  'OSRYYYYYRRO',
  'OSRRYYYRRRO',
  'OSRRRRRRRRO',
  'OSPPPPPPPPO',
  'OOOOOOOOOOO',
], { O: OUTLINE, S: [98, 40, 48], R: [148, 57, 69], W: [255, 236, 231], K: OUTLINE, Y: [242, 182, 109], P: [227, 197, 195] });

const dir = new URL('../public/assets/interface/hobbies/', import.meta.url);
mkdirSync(dir, { recursive: true });
Object.entries({ basket, 'jeux-video': gamepad, mangas: manga }).forEach(([name, icon]) => {
  writeFileSync(new URL(`${name}.png`, dir), encodePNG(icon));
});
console.log('Icônes des hobbies écrites dans public/assets/interface/hobbies/.');
