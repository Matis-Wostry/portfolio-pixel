// Génère la planche animée des écrans du bureau à partir de la forme livrée par le designer.
// Usage : npm run assets:ecrans
// Entrée : scripts/sources/bureau-ecrans.png ; sortie : public/assets/chambre/effets/bureau-ecrans-anim.png
// (SCREEN_FRAMES images de la taille du bureau, côte à côte, à superposer sur meubles/bureau.png).
import { readFileSync, writeFileSync } from 'node:fs';
import { decodePNG, encodePNG } from './png.mjs';
import { findScreens, screenFrame, SCREEN_FRAMES } from './screens.mjs';

const SOURCE = new URL('./sources/bureau-ecrans.png', import.meta.url);
const OUTPUT = new URL('../public/assets/chambre/effets/bureau-ecrans-anim.png', import.meta.url);

const mask = decodePNG(readFileSync(SOURCE));
const alpha = new Uint8Array(mask.width * mask.height).map((_, i) => mask.data[i * 4 + 3]);
const screens = findScreens(alpha, mask.width, mask.height);

const sheet = { width: mask.width * SCREEN_FRAMES, height: mask.height };
sheet.data = Buffer.alloc(sheet.width * sheet.height * 4);
for (let frame = 0; frame < SCREEN_FRAMES; frame += 1) {
  screenFrame(screens, frame).forEach(({ x, y, color }) => {
    const offset = (y * sheet.width + frame * mask.width + x) * 4;
    sheet.data.set([1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16)), offset);
    sheet.data[offset + 3] = 255;
  });
}
writeFileSync(OUTPUT, encodePNG(sheet));
console.log(`${SCREEN_FRAMES} images de ${mask.width} × ${mask.height} écrites dans ${OUTPUT.pathname}`);
