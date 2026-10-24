// Génère la favicon à partir de la tête du personnage (public/assets/personnage/face-1.png).
// Usage : npm run assets:favicon
// Sorties : public/favicon.png (32 × 32, fond transparent) et public/apple-touch-icon.png
// (180 × 180, tête agrandie sans lissage sur le fond sombre de la chambre).
import { readFileSync, writeFileSync } from 'node:fs';
import { decodePNG, encodePNG } from './png.mjs';

// Carré de la tête dans le sprite (32 × 64) : des cheveux au menton.
const HEAD = { x: 4, y: 0, size: 24 };
const BACKGROUND = [43, 32, 37];

const root = new URL('../public/', import.meta.url);
const sprite = decodePNG(readFileSync(new URL('assets/personnage/face-1.png', root)));

function icon(size, scale, background = null) {
  const data = Buffer.alloc(size * size * 4);
  const offset = Math.floor((size - HEAD.size * scale) / 2);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const sx = Math.floor((x - offset) / scale);
      const sy = Math.floor((y - offset) / scale);
      const inside = x >= offset && y >= offset && sx < HEAD.size && sy < HEAD.size;
      const source = ((HEAD.y + sy) * sprite.width + HEAD.x + sx) * 4;
      if (inside && sprite.data[source + 3]) sprite.data.copy(data, (y * size + x) * 4, source, source + 4);
      else if (background) data.set([...background, 255], (y * size + x) * 4);
    }
  }
  return { width: size, height: size, data };
}

writeFileSync(new URL('favicon.png', root), encodePNG(icon(32, 1)));
writeFileSync(new URL('apple-touch-icon.png', root), encodePNG(icon(180, 7, BACKGROUND)));
console.log('Favicon et icône d’écran d’accueil générées dans public/.');
