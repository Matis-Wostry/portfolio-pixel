// Génère la boule de papier du panier de basket, dans la palette du designer.
// Usage : npm run assets:papier
// Sorties : public/assets/chambre/effets/boule-papier.png (2 images de 5 × 5 : la boule tourne en vol)
// et public/assets/interface/icones/papier.png (bulle, 14 × 14).
import { writeFileSync } from 'node:fs';
import { encodePNG } from './png.mjs';

// O : contour ; L : reflet ; B : papier ; S : ombre ; D : pli.
const COLORS = {
  O: [29, 23, 27], L: [255, 248, 244], B: [255, 236, 231], S: [227, 197, 195], D: [175, 167, 173],
};

function draw(frames) {
  const height = frames[0].length;
  const width = frames[0][0].length;
  const image = { width: width * frames.length, height, data: Buffer.alloc(width * frames.length * height * 4) };
  frames.forEach((rows, index) => rows.forEach((row, y) => [...row].forEach((char, x) => {
    if (COLORS[char]) image.data.set([...COLORS[char], 255], (y * image.width + index * width + x) * 4);
  })));
  return image;
}

const BALL = [
  ['.OOO.', 'OLBSO', 'OBDSO', 'OSSSO', '.OOO.'],
  ['.OOO.', 'OLDBO', 'OBBSO', 'OSDSO', '.OOO.'],
];

// Boule froissée vue de près : facettes claires en haut à gauche, plis gris, ombre en bas à droite.
const ICON = [
  '....OOOOO.....',
  '..OOLLBBBOO...',
  '.OLLBBDBBBSO..',
  '.OLBBDBBBBSO..',
  'OLBBDDBBDBBSO.',
  'OLBBBBBDBBBSO.',
  'OBBDBBBDBBSSO.',
  'OBBBDDBBBBDSO.',
  'OBBBBBDBBDSSO.',
  '.OSBBBBDBSSO..',
  '.OSSBBBBSSSO..',
  '..OOSSSSSOO...',
  '....OOOOO.....',
  '..............',
];

const root = new URL('../public/assets/', import.meta.url);
writeFileSync(new URL('chambre/effets/boule-papier.png', root), encodePNG(draw(BALL)));
writeFileSync(new URL('interface/icones/papier.png', root), encodePNG(draw([ICON])));
console.log('Boule de papier et icône du panier générées.');
