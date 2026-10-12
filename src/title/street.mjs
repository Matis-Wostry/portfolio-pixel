import { PALETTE } from './palette.mjs';
import { rect, fromPattern, disc, ellipse } from './pixels.mjs';

// Rue de nuit après une averse : quai, trottoir dallé, chaussée pavée mouillée et rails de tram.
const SIDEWALK = { top: 250, bottom: 262 };
const ROAD = { top: 265, bottom: 284 };
export const RAILS = [272, 280];

const FOUNTAIN = [
  '...ii....', '..iiii...', '...ii....', '...iiI...', '...ii.w..', '...ii.w..', '...ii.w..', '...ii.w..',
  '...ii.w..', '...ii.w..', '...ii.w..', 'kiiiiiiik', '.kbbbbbk.', '..kkkkk..', '...ii....', '...ii....', '..iiii...', '.iiiiii..',
];
const FOUNTAIN_COLORS = { i: PALETTE.fountain, I: PALETTE.fountainLight, w: PALETTE.water, b: PALETTE.basin, k: PALETTE.fountainDark };
const RING = [[-3, 0], [3, 0], [0, -3], [0, 3], [-2, -2], [2, -2], [-2, 2], [2, 2], [-1, -3], [1, -3], [-1, 3], [1, 3]];

function tree(cx, top, ground, random) {
  const rects = [
    rect(cx - 2, top + 24, 5, ground - top - 24, PALETTE.trunk), rect(cx + 1, top + 24, 2, ground - top - 24, PALETTE.trunkDark),
    rect(cx - 4, ground - 2, 9, 2, PALETTE.trunkDark), rect(cx - 7, ground, 15, 2, PALETTE.trunkDark),
    ...disc(cx, top + 14, 16, PALETTE.treeDark),
    ...disc(cx - 7, top + 10, 10, PALETTE.tree), ...disc(cx + 7, top + 12, 10, PALETTE.tree), ...disc(cx, top + 4, 9, PALETTE.tree),
    ...disc(cx + 3, top + 4, 5, PALETTE.treeLight), ...disc(cx - 8, top + 8, 4, PALETTE.treeLight),
    ...disc(cx + 12, top + 12, 4, PALETTE.treeLit),
  ];
  for (let i = 0; i < 40; i++) {
    const dx = Math.floor(random() * 28) - 14;
    const dy = Math.floor(random() * 24) - 6;
    if (dx * dx + (dy - 8) * (dy - 8) < 180) rects.push(rect(cx + dx, top + dy, 1, 1, random() < 0.5 ? PALETTE.treeLight : PALETTE.treeDark));
  }
  // Quelques feuilles mortes au pied.
  const leaves = [PALETTE.leafOrange, PALETTE.leafRed, PALETTE.leafGold];
  for (let i = 0; i < 14; i++) {
    rects.push(rect(cx - 16 + Math.floor(random() * 32), ground - 3 + Math.floor(random() * 6), 1, 1, leaves[i % leaves.length]));
  }
  return rects;
}

function lamp({ x, y }) {
  const left = x - 5;
  return [
    rect(x - 2, y + 8, 4, 52, PALETTE.lampPole), rect(x - 2, y + 8, 1, 52, PALETTE.lampPoleLight),
    rect(x - 4, y + 56, 8, 4, PALETTE.lampPole), rect(x - 5, y + 60, 10, 2, PALETTE.lampPole),
    rect(x - 1, y - 10, 2, 2, PALETTE.lampPole), rect(left + 1, y - 8, 9, 2, PALETTE.lampPole), rect(left - 1, y - 6, 13, 2, PALETTE.lampPole),
    rect(left, y - 4, 11, 9, PALETTE.lampGlass), rect(left + 2, y - 2, 7, 5, PALETTE.lampLight),
    rect(left, y - 4, 1, 9, PALETTE.lampPole), rect(left + 10, y - 4, 1, 9, PALETTE.lampPole),
    rect(left - 1, y + 5, 13, 2, PALETTE.lampPole), rect(x - 3, y + 7, 6, 1, PALETTE.lampPole),
  ];
}

function bench(x) {
  return [
    rect(x, 244, 20, 2, PALETTE.bench), rect(x, 246, 20, 1, PALETTE.benchDark),
    rect(x, 249, 20, 2, PALETTE.bench), rect(x, 251, 20, 1, PALETTE.benchDark),
    rect(x + 1, 244, 1, 12, PALETTE.iron), rect(x + 18, 244, 1, 12, PALETTE.iron),
  ];
}

function pot(x) {
  return [
    ...disc(x + 4, 240, 5, PALETTE.leafDark), ...disc(x + 3, 239, 3, PALETTE.leaf),
    rect(x + 6, 237, 1, 1, PALETTE.flowerPink), rect(x + 1, 241, 1, 1, PALETTE.flowerYellow),
    rect(x, 244, 9, 2, PALETTE.potDark), rect(x + 1, 246, 7, 5, PALETTE.pot), rect(x + 1, 246, 1, 5, PALETTE.potDark),
  ];
}

function bin(x) {
  return [
    rect(x - 1, 247, 9, 1, PALETTE.binDark), rect(x, 248, 7, 10, PALETTE.bin), rect(x, 248, 1, 10, PALETTE.fountainLight),
    rect(x + 2, 250, 1, 6, PALETTE.binDark), rect(x + 4, 250, 1, 6, PALETTE.binDark), rect(x + 1, 258, 5, 1, PALETTE.binDark),
  ];
}

// Vélo appuyé contre l'arbre, roues centrées sur (x, 256) et (x + 10, 256).
function bicycle(x) {
  const rects = [];
  [x, x + 10].forEach((cx) => RING.forEach(([dx, dy]) => rects.push(rect(cx + dx, 256 + dy, 1, 1, PALETTE.iron))));
  rects.push(
    rect(x + 1, 256, 4, 1, PALETTE.bike), rect(x + 4, 252, 1, 4, PALETTE.bike), rect(x + 4, 252, 6, 1, PALETTE.bike),
    rect(x + 6, 255, 1, 1, PALETTE.bike), rect(x + 7, 254, 1, 1, PALETTE.bike), rect(x + 8, 253, 1, 1, PALETTE.bike),
    rect(x + 10, 251, 1, 5, PALETTE.bike), rect(x + 9, 250, 3, 1, PALETTE.iron), rect(x + 3, 251, 3, 1, PALETTE.iron),
  );
  return rects;
}

function sidewalk(random, anchors, { left, right }) {
  const { top, bottom } = SIDEWALK;
  const width = right - left;
  const rects = [rect(left, top, width, bottom - top, PALETTE.sidewalk)];
  // Dalles de teintes variées en deux rangées décalées.
  [[top + 1, 0], [top + 7, 6]].forEach(([y, offset]) => {
    for (let x = left - offset; x < right; x += 12) {
      const roll = random();
      if (roll < 0.5) rects.push(rect(x + 1, y, 11, 5, roll < 0.25 ? PALETTE.sidewalkAlt : PALETTE.sidewalkDark));
      rects.push(rect(x, y, 1, 5, PALETTE.sidewalkLine));
    }
  });
  // Flaque de lumière du lampadaire.
  for (let y = top + 1; y < bottom; y++) {
    const half = Math.round(36 * Math.sqrt(Math.max(0, 1 - ((y - bottom) / 14) ** 2)));
    if (half > 0) rects.push(rect(anchors.lamp.x - half, y, half * 2, 1, PALETTE.sidewalkLit));
  }
  rects.push(rect(left, top, width, 1, PALETTE.sidewalkLight), rect(left, top + 6, width, 1, PALETTE.sidewalkLine));
  // Fissures avec un brin d'herbe.
  [52, 168, 262, 420].forEach((x) => {
    rects.push(rect(x, top + 2, 1, 1, PALETTE.crack), rect(x + 1, top + 3, 1, 2, PALETTE.crack), rect(x + 2, top + 5, 1, 1, PALETTE.crack),
      rect(x + 1, top + 2, 1, 1, PALETTE.grass));
  });
  // Ombres portées à l'opposé du lampadaire, et sous le chien.
  const { dog } = anchors;
  rects.push(
    rect(296, 257, 20, 2, PALETTE.sidewalkShadow), rect(290, 259, 18, 1, PALETTE.sidewalkShadow),
    rect(460, 255, 18, 2, PALETTE.sidewalkShadow), rect(78, 256, 20, 1, PALETTE.sidewalkShadow),
    ...ellipse(dog.x + 10, dog.y + 13, 9, 1, PALETTE.sidewalkShadow),
  );
  return rects;
}

function road(random, anchors, { left, right }) {
  const width = right - left;
  const rects = [
    rect(left, 262, width, 1, PALETTE.curbTop), rect(left, 263, width, 2, PALETTE.curbFace),
    rect(left, ROAD.top, width, ROAD.bottom - ROAD.top, PALETTE.road), rect(left, ROAD.top, width, 1, PALETTE.gutter),
  ];
  for (let x = left; x < right; x += 5 + Math.floor(random() * 6)) rects.push(rect(x, 262, 1, 1, PALETTE.curbSpeck));
  const lit = (x, y) => ((x - anchors.lamp.x) / 36) ** 2 + ((y - 262) / 14) ** 2 < 1;
  for (let row = 0, y = ROAD.top + 1; y < ROAD.bottom; row++, y += 4) {
    for (let x = left - (row % 2) * 3; x < right; x += 6) {
      const roll = random();
      const base = lit(x + 2, y) ? PALETTE.cobbleLit : roll < 0.3 ? PALETTE.cobbleDark : PALETTE.cobble;
      rects.push(rect(x, y, 5, 3, base));
      if (roll > 0.55) rects.push(rect(x, y, 2, 1, lit(x + 2, y) ? PALETTE.cobbleLitLight : PALETTE.wetShine));
    }
  }
  // Grille d'égout dans le caniveau et plaque d'égout.
  rects.push(rect(186, ROAD.top, 10, 2, PALETTE.gutter));
  for (let x = 187; x < 196; x += 2) rects.push(rect(x, ROAD.top, 1, 2, PALETTE.railTop));
  rects.push(...ellipse(60, 276, 6, 2, PALETTE.gutter), ...ellipse(60, 276, 4, 1, PALETTE.cobbleDark));
  // Rails de tram encastrés.
  RAILS.forEach((y) => rects.push(rect(left, y, width, 1, PALETTE.railTop), rect(left, y + 1, width, 1, PALETTE.railGroove)));
  // Flaques : la lune dans l'une, la porte éclairée dans l'autre.
  rects.push(...ellipse(404, 277, 13, 2, PALETTE.puddle), ...ellipse(404, 277, 10, 1, PALETTE.puddleLight),
    ...ellipse(400, 277, 3, 1, PALETTE.puddleMoon));
  rects.push(...ellipse(214, 268, 9, 1, PALETTE.puddle), rect(212, 268, 4, 1, PALETTE.warmDeep));
  return rects;
}

export function street(random, anchors, span) {
  // Garde-corps du quai, du coin de l'immeuble jusqu'au bord droit.
  const quay = 287;
  const rects = [rect(quay, 244, span.right - quay, 1, PALETTE.railingLight), rect(quay, 245, span.right - quay, 1, PALETTE.railing)];
  for (let x = quay + 3; x < span.right; x += 10) rects.push(rect(x, 245, 2, 5, PALETTE.railing));
  rects.push(...sidewalk(random, anchors, span), ...road(random, anchors, span));
  // Mobilier : fontaine, poubelle, bancs, pots, arbre et son vélo, lampadaire.
  rects.push(...fromPattern(30, 241, FOUNTAIN, FOUNTAIN_COLORS), ...bin(106));
  rects.push(...pot(207), ...pot(247), ...bench(78), ...bench(440));
  rects.push(...tree(anchors.tree.x, 196, 256, random), ...bicycle(325), ...lamp(anchors.lamp));
  // Prolongements : bancs et arbres sur les bords élargis.
  rects.push(...bench(-60), ...tree(-92, 196, 256, random), ...bench(548), ...tree(578, 196, 256, random));
  return rects;
}

export function foreground(random, { left, right }) {
  const width = right - left;
  const rects = [rect(left, 290, width, 10, PALETTE.hedge)];
  // Buissons arrondis de hauteurs variées.
  for (let x = left; x < right + 8;) {
    const r = 5 + Math.floor(random() * 4);
    rects.push(...disc(x, 292, r, PALETTE.hedge), ...disc(x - 1, 291, r - 2, PALETTE.hedgeLight), ...disc(x + 1, 293, r - 3, PALETTE.hedge));
    x += r + 4 + Math.floor(random() * 6);
  }
  for (let i = 0; i < 260; i++) {
    const x = left + Math.floor(random() * width);
    const y = 287 + Math.floor(random() * 13);
    rects.push(rect(x, y, 1, 1, random() < 0.5 ? PALETTE.hedgeLight : PALETTE.hedgeDark));
  }
  // Massifs d'hortensias bleus et roses.
  for (let x = left + 22; x < right; x += 48 + Math.floor(random() * 30)) {
    const [main, deep] = random() < 0.5 ? [PALETTE.hydrangeaBlue, PALETTE.hydrangeaDeep] : [PALETTE.hydrangeaPink, PALETTE.flowerPink];
    rects.push(...disc(x, 289, 3, deep), ...disc(x - 1, 288, 2, main), ...disc(x + 4, 291, 2, deep), ...disc(x + 4, 290, 1, main));
  }
  const flowers = [PALETTE.flowerPink, PALETTE.flowerYellow, PALETTE.awningLight];
  for (let x = left + 3; x < right; x += 7 + Math.floor(random() * 6)) {
    rects.push(rect(x, 288 + Math.floor(random() * 4), 1, 1, flowers[Math.floor(random() * flowers.length)]));
  }
  // Clôture en bois basse devant la haie.
  rects.push(rect(left, 292, width, 2, PALETTE.fence), rect(left, 294, width, 1, PALETTE.fenceDark));
  for (let x = left + 10; x < right; x += 40) rects.push(rect(x, 287, 3, 13, PALETTE.fence), rect(x, 287, 3, 1, PALETTE.fenceDark), rect(x + 2, 288, 1, 12, PALETTE.fenceDark));
  return rects;
}
