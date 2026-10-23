// Génère les images de l'écran titre : calques du décor, sprites et description de la scène.
// Usage : npm run assets:intro
// Sortie : public/assets/intro/calques/*.png, public/assets/intro/sprites/*.png, public/assets/intro/scene.json
// et public/assets/interface/{panneau,bouton}.png
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { encodePNG } from './png.mjs';
import { renderRects } from './intro/render.mjs';
import { buildScenery, SPRITES, TITLE_LAYERS, JET_CENTER } from './intro/scenery.mjs';
import { TITLE_WORLD } from '../src/title/layout.mjs';
import { outlined, mapRects } from './intro/pixels.mjs';
import { PALETTE } from './intro/palette.mjs';
import { INTERFACE } from './intro/interface.mjs';

const OUT = new URL('../public/assets/intro/', import.meta.url);
rmSync(OUT, { recursive: true, force: true });
['calques', 'sprites'].forEach((dir) => mkdirSync(new URL(dir, OUT), { recursive: true }));
const save = (path, image) => writeFileSync(new URL(path, OUT), encodePNG(image));

const scenery = buildScenery();
const { width, height } = TITLE_WORLD;

TITLE_LAYERS.forEach((name) => save(`calques/${name}.png`, renderRects(scenery.layers[name], width, height)));
// Les sprites cernés (personnages, véhicules, nuages) gagnent un pixel de marge pour leur contour.
const spriteImage = ({ rects, width: w, height: h, outline }) => (outline
  ? renderRects([outlined(mapRects(rects, (item) => [{ ...item, x: item.x + 1, y: item.y + 1 }]), PALETTE.outline)], w + 2, h + 2)
  : renderRects(rects, w, h));
const images = Object.fromEntries(Object.entries(SPRITES).map(([key, sprite]) => [key, spriteImage(sprite)]));
Object.entries(images).forEach(([key, image]) => save(`sprites/${key}.png`, image));

const scene = {
  world: TITLE_WORLD,
  layers: TITLE_LAYERS,
  sprites: Object.fromEntries(Object.entries(images).map(([key, { width: w, height: h }]) => [key, { width: w, height: h }])),
  jetCenter: JET_CENTER,
  anchors: scenery.anchors,
  windows: scenery.windows,
  cityLights: scenery.cityLights,
  clouds: scenery.clouds,
  stars: scenery.stars,
};
writeFileSync(new URL('scene.json', OUT), `${JSON.stringify(scene, null, 1)}\n`);

// Panneau titre et boutons de l'écran titre (planches 9 tranches).
const UI = new URL('../public/assets/interface/', import.meta.url);
Object.entries(INTERFACE).forEach(([name, { rects, width: w, height: h }]) => writeFileSync(new URL(`${name}.png`, UI), encodePNG(renderRects(rects, w, h))));
console.log(`${TITLE_LAYERS.length} calques et ${Object.keys(SPRITES).length} sprites écrits dans public/assets/intro/`);
