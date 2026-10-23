import { PALETTE } from './palette.mjs';
import { rect, fromPattern, outlined } from './pixels.mjs';

// Immeuble de Matis (x 176 à 286, toit à y 90) et boutique d'arcade accolée à gauche.
export const BUILDING = { left: 176, right: 286, top: 90, bottom: 250, plinth: 236 };
const COLUMNS = [188, 223, 258];
const FLOORS = [104, 136, 168, 200];
const LIT = ['258,104', '188,168'];
const FLOWERS = ['188,136', '258,168', '188,200', '258,200'];

const KNIGHT = ['..kkk..', '.kkkkk.', 'kk.kkkk', 'kkkkkkk', '...kkkk', '..kkkk.', '..kkkk.', '.kkkkkk', 'kkkkkkk'];
const FLOWER_BOX = [
  '..p.....y....r....',
  '.ppp.l.yyy..rrr.p.',
  '.lpl.llly.l.lrl.ll',
  'dlldlldllldlldlldl',
  'bbbbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbbbb',
  'BBBBBBBBBBBBBBBBBB',
];
const FLOWER_COLORS = { p: PALETTE.flowerPink, y: PALETTE.flowerYellow, r: PALETTE.flowerRed, l: PALETTE.leaf, d: PALETTE.leafDark, b: PALETTE.box, B: PALETTE.boxDark };

function bricks(random) {
  const { left, right, top, plinth } = BUILDING;
  const rects = [rect(left, top, right - left, plinth - top, PALETTE.mortar)];
  for (let row = 0, y = top + 3; y < plinth; row++, y += 4) {
    for (let x = left - (row % 2) * 4; x < right; x += 8) {
      const roll = random();
      let color = roll < 0.15 ? PALETTE.brickDark : roll < 0.3 ? PALETTE.brickLight : PALETTE.brick;
      if (x < left + 6) color = PALETTE.brickShade;
      const start = Math.max(x, left);
      const end = Math.min(x + 7, right);
      rects.push(rect(start, y, end - start, Math.min(3, plinth - y), color));
    }
  }
  return rects;
}

function cornice() {
  const { left, right, top } = BUILDING;
  const rects = [
    rect(left - 3, top - 8, right - left + 6, 2, PALETTE.stoneDark),
    rect(left - 3, top - 6, right - left + 6, 1, PALETTE.stoneLight),
    rect(left - 3, top - 5, right - left + 6, 3, PALETTE.stone),
    rect(left - 2, top - 2, right - left + 4, 2, PALETTE.stoneDark),
    rect(left, top, right - left, 1, PALETTE.brickShade),
  ];
  for (let x = left; x < right; x += 4) rects.push(rect(x, top, 2, 2, PALETTE.stoneDark));
  return rects;
}

function roofline() {
  // Cheminée à gauche, girouette cavalier à droite.
  return [
    rect(192, 70, 11, 12, PALETTE.chimney),
    rect(192, 73, 11, 1, PALETTE.mortar), rect(192, 77, 11, 1, PALETTE.mortar),
    rect(197, 70, 1, 3, PALETTE.mortar), rect(195, 74, 1, 3, PALETTE.mortar), rect(200, 74, 1, 3, PALETTE.mortar),
    rect(190, 67, 15, 3, PALETTE.stoneDark), rect(190, 67, 15, 1, PALETTE.stone),
    rect(193, 63, 3, 4, PALETTE.potDark), rect(199, 64, 3, 3, PALETTE.potDark),
    rect(281, 74, 1, 8, PALETTE.knight), ...fromPattern(278, 64, KNIGHT, { k: PALETTE.knight }),
  ];
}

function shutters(x, y) {
  const rects = [];
  [x - 6, x + 17].forEach((sx) => {
    rects.push(rect(sx, y - 1, 5, 22, PALETTE.shutter), rect(sx, y - 1, 1, 22, PALETTE.shutterLight));
    for (let sy = y + 1; sy < y + 20; sy += 3) rects.push(rect(sx + 1, sy, 4, 1, PALETTE.shutterDark));
  });
  return rects;
}

function windowFrame(x, y) {
  return [
    rect(x - 2, y - 4, 20, 3, PALETTE.stone), rect(x - 2, y - 4, 20, 1, PALETTE.stoneLight), rect(x + 6, y - 5, 4, 4, PALETTE.stoneLight),
    rect(x - 1, y - 1, 18, 22, PALETTE.frame),
  ];
}

function sill(x, y) {
  return [rect(x - 2, y + 20, 20, 2, PALETTE.stone), rect(x - 2, y + 20, 20, 1, PALETTE.stoneLight), rect(x - 1, y + 22, 18, 1, PALETTE.brickShade)];
}

function darkGlass(x, y) {
  return [
    rect(x, y, 16, 20, PALETTE.glass),
    rect(x + 2, y + 2, 1, 4, PALETTE.glassShine), rect(x + 3, y + 2, 2, 1, PALETTE.glassShine), rect(x + 11, y + 12, 1, 3, PALETTE.glassShine),
    rect(x + 7, y, 2, 20, PALETTE.frame), rect(x, y + 9, 16, 1, PALETTE.frame),
  ];
}

function litGlass(x, y) {
  return [
    rect(x, y, 16, 20, PALETTE.warm), rect(x + 4, y + 3, 8, 12, PALETTE.warmCore),
    rect(x, y, 4, 20, PALETTE.curtain), rect(x + 12, y, 4, 20, PALETTE.curtain),
    rect(x + 1, y + 2, 1, 18, PALETTE.curtainDark), rect(x + 14, y + 2, 1, 18, PALETTE.curtainDark),
    rect(x, y, 16, 2, PALETTE.curtainDark), rect(x + 4, y + 17, 8, 3, PALETTE.warmDeep),
    rect(x + 7, y, 2, 20, PALETTE.frame), rect(x, y + 9, 16, 1, PALETTE.frame),
  ];
}

// Fenêtre de Matis : écrans bleutés, affiches, silhouette au bureau. Cible du zoom d'entrée.
function matisWindow({ x, y, w, h }) {
  return [
    rect(x, y, w, h, PALETTE.glowDark),
    rect(x + 2, y + 2, 4, 6, PALETTE.posterRed),
    rect(x + 11, y + 2, 3, 5, PALETTE.posterGold),
    rect(x + 2, y + 9, 6, 4, PALETTE.glowLight),
    rect(x + 9, y + 9, 6, 4, PALETTE.glowLight),
    rect(x, y + 18, w, 2, PALETTE.frame),
    rect(x + 6, y + 11, 4, 4, PALETTE.silhouette),
    rect(x + 4, y + 15, 8, 3, PALETTE.silhouette),
  ];
}

// Fenêtres des voisins, dessinées éteintes : la scène pose par-dessus leur version allumée.
export function facadeWindows(anchors) {
  const windows = [];
  FLOORS.forEach((y) => COLUMNS.forEach((x) => {
    if ((x === 223 && y === 200) || (x === anchors.window.x && y === anchors.window.y)) return;
    const id = `${x},${y}`;
    windows.push({ x, y, lit: LIT.includes(id), flowers: FLOWERS.includes(id) });
  }));
  return windows;
}

// Fenêtre allumée vue depuis son coin (x - 1, y) : vitre, rideaux, jardinière éventuelle et lumière sur les briques.
export function litWindowRects(flowers) {
  const rects = [...litGlass(1, 0), rect(0, 23, 18, 1, PALETTE.brickLit), rect(2, 24, 14, 1, PALETTE.brickLit)];
  if (flowers) rects.push(...fromPattern(0, 13, FLOWER_BOX, FLOWER_COLORS));
  return rects;
}

function windows(anchors) {
  const rects = [];
  const draw = (x, y, glass, flowers) => {
    if (y < 200) rects.push(...shutters(x, y));
    rects.push(...windowFrame(x, y), ...glass, ...sill(x, y));
    if (flowers) rects.push(...fromPattern(x - 1, y + 13, FLOWER_BOX, FLOWER_COLORS));
  };
  facadeWindows(anchors).forEach(({ x, y, flowers }) => draw(x, y, darkGlass(x, y), flowers));
  draw(anchors.window.x, anchors.window.y, matisWindow(anchors.window), false);
  return rects;
}

function plinth() {
  const { left, right, plinth: y, bottom } = BUILDING;
  const rects = [rect(left, y, right - left, bottom - y, PALETTE.stoneDark), rect(left, y, right - left, 1, PALETTE.stoneLight)];
  [y + 2, y + 8].forEach((rowY, row) => {
    for (let x = left + (row % 2) * 6; x < right; x += 12) {
      const end = Math.min(x + 11, right);
      rects.push(rect(x, rowY, end - x, 5, PALETTE.stone), rect(x, rowY, end - x, 1, PALETTE.stoneLight));
    }
  });
  return rects;
}

function entrance({ x, y, w, h }) {
  return [
    rect(x - 4, y - 5, w + 8, h + 5, PALETTE.stone), rect(x - 4, y - 5, w + 8, 1, PALETTE.stoneLight),
    rect(x + 7, y - 8, 4, 4, PALETTE.stoneLight),
    rect(x - 1, y - 1, w + 2, h + 1, PALETTE.doorDark),
    rect(x, y, w, 5, PALETTE.warm), rect(x + 3, y + 1, w - 6, 3, PALETTE.warmCore), rect(x + 8, y, 2, 5, PALETTE.doorDark),
    rect(x, y + 6, w, h - 6, PALETTE.door), rect(x + 8, y + 6, 2, h - 6, PALETTE.doorDark),
    rect(x + 2, y + 8, 5, 7, PALETTE.doorPanel), rect(x + 11, y + 8, 5, 7, PALETTE.doorPanel),
    rect(x + 2, y + 18, 5, 7, PALETTE.doorPanel), rect(x + 11, y + 18, 5, 7, PALETTE.doorPanel),
    rect(x + 6, y + 16, 1, 1, PALETTE.knob), rect(x + 11, y + 16, 1, 1, PALETTE.knob),
    rect(x - 6, y + h - 2, w + 12, 2, PALETTE.stoneLight),
    // Applique murale à droite de la porte.
    rect(x + w + 5, y + 2, 3, 1, PALETTE.iron), rect(x + w + 6, y - 1, 6, 1, PALETTE.iron),
    rect(x + w + 7, y, 4, 6, PALETTE.lampGlass), rect(x + w + 8, y + 1, 2, 4, PALETTE.lampLight), rect(x + w + 7, y + 6, 4, 1, PALETTE.iron),
  ];
}

// Plaque de rue bleue à liseré blanc, à l'angle de la façade.
function streetSign() {
  return [
    rect(178, 225, 10, 6, PALETTE.signWhite), rect(179, 226, 8, 4, PALETTE.signBlue),
    rect(180, 227, 2, 1, PALETTE.signWhite), rect(183, 227, 3, 1, PALETTE.signWhite), rect(181, 228, 4, 1, PALETTE.signWhite),
  ];
}

function drainpipe() {
  const { right, top, bottom } = BUILDING;
  const rects = [rect(right - 6, top - 2, 6, 3, PALETTE.pipe), rect(right - 4, top, 3, bottom - top, PALETTE.pipe), rect(right - 4, top, 1, bottom - top, PALETTE.pipeLight)];
  for (let y = top + 20; y < bottom; y += 36) rects.push(rect(right - 5, y, 5, 1, PALETTE.iron));
  return rects;
}

function shop(neon) {
  const rects = [
    rect(117, 190, 61, 3, PALETTE.shopWoodLight), rect(118, 193, 59, 2, PALETTE.shopWoodDark),
    rect(120, 195, 56, 55, PALETTE.shopWood),
  ];
  for (let x = 123; x < 176; x += 6) rects.push(rect(x, 195, 1, 55, PALETTE.shopWoodDark));
  // Enseigne sombre centrée sous le néon manette.
  rects.push(rect(neon.x - 5, neon.y - 4, 23, 14, PALETTE.shopWoodDark), rect(neon.x - 4, neon.y - 3, 21, 12, PALETTE.sign),
    ...fromPattern(neon.x, neon.y, ['..nnnnnnnnn..', '.n.........n.', 'n..n.....n..n', 'n.nnn...n.n.n', 'n..n.....n..n', '.n...nnn...n.', '..nnn...nnn..'], { n: PALETTE.neonDim }));
  // Store rayé avec bord festonné.
  for (let x = 119, stripe = 0; x < 177; x += 4, stripe++) {
    const color = stripe % 2 ? PALETTE.awningLight : PALETTE.awning;
    rects.push(rect(x, 217, Math.min(4, 177 - x), 4, color), rect(x + 1, 221, Math.min(2, 176 - x), 1, color));
  }
  rects.push(rect(119, 217, 58, 1, PALETTE.awningShade));
  // Vitrine avec deux bornes d'arcade.
  rects.push(rect(123, 225, 27, 19, PALETTE.frame), rect(124, 226, 25, 17, PALETTE.shopWindow), rect(124, 226, 25, 2, PALETTE.shopGlow),
    rect(127, 230, 6, 13, PALETTE.cabinetBodyPink), rect(128, 231, 4, 3, PALETTE.cabinetCyan), rect(128, 235, 4, 1, PALETTE.cabinetPink),
    rect(138, 230, 6, 13, PALETTE.cabinetBodyBlue), rect(139, 231, 4, 3, PALETTE.cabinetPink), rect(139, 235, 4, 1, PALETTE.cabinetCyan),
    rect(146, 227, 1, 3, PALETTE.glassShine), rect(122, 244, 29, 2, PALETTE.shopWoodLight));
  // Porte vitrée éclairée.
  rects.push(rect(155, 224, 14, 26, PALETTE.frame), rect(156, 225, 12, 25, PALETTE.door),
    rect(158, 227, 8, 9, PALETTE.warm), rect(159, 228, 6, 7, PALETTE.warmCore), rect(161, 227, 2, 9, PALETTE.door),
    rect(165, 239, 1, 2, PALETTE.knob));
  return rects;
}

// Boutique puis immeuble, chacun cerné du contour sombre du designer.
export function building(random, anchors) {
  return [
    outlined(shop(anchors.neon), PALETTE.outline),
    outlined([
      ...bricks(random),
      ...cornice(),
      ...roofline(),
      ...windows(anchors),
      ...plinth(),
      ...entrance(anchors.door),
      ...drainpipe(),
      ...streetSign(),
    ], PALETTE.outline),
  ];
}
