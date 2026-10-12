import { createRandom, generateStars } from './random.mjs';
import { TITLE_WORLD } from './layout.mjs';
import { PALETTE } from './palette.mjs';
import { rect, fromPattern, disc, dither, clip } from './pixels.mjs';
import { building } from './building.mjs';

export { PALETTE } from './palette.mjs';
export { fromPattern, disc } from './pixels.mjs';

export const TITLE_LAYERS = ['sky', 'city', 'building', 'street', 'foreground'];
export const GROUND_Y = 250;

// Positions en pixels du monde (480 × 300). Les calques du designer doivent les respecter.
export const ANCHORS = {
  focus: { x: 245, y: 200 },
  window: { x: 223, y: 136, w: 16, h: 20 },
  door: { x: 222, y: 222, w: 18, h: 28 },
  lamp: { x: 346, y: 196 },
  warmLights: [{ x: 249, y: 225 }, { x: 266, y: 114 }, { x: 196, y: 178 }],
  jet: { x: 70, y: 240, h: 72 },
  neon: { x: 134, y: 205 },
  moon: { x: 404, y: 42, r: 12 },
};

const GAMEPAD = ['..nnnnnnnnn..', '.n.........n.', 'n..n.....n..n', 'n.nnn...n.n.n', 'n..n.....n..n', '.n...nnn...n.', '..nnn...nnn..'];
const CLOUD = [
  '........llll............',
  '.....llllcccl...lll.....',
  '...lccccccccccllcccll...',
  '.lccccccccccccccccccccl.',
  'cccccccccccccccccccccccc',
  '.dddddddddddddddddddddd.',
  '...dddddd.....ddddd.....',
];
const CAT = ['k...k...', 'kkkkk...', 'kekek...', 'kkkkk..k', '.kkk...k', 'kkkkk.k.', 'kkkkkkk.'];

export const SPRITES = {
  cloud: { width: 24, height: 7, rects: fromPattern(0, 0, CLOUD, { c: PALETTE.cloud, d: PALETTE.cloudShade, l: PALETTE.cloudLight }) },
  neon: { width: 13, height: 7, rects: fromPattern(0, 0, GAMEPAD, { n: PALETTE.neon }) },
  jet: {
    width: 5,
    height: 72,
    rects: [rect(2, 0, 1, 72, PALETTE.jet), rect(1, 8, 1, 64, PALETTE.jetSide), rect(3, 12, 1, 60, PALETTE.jetSide),
      rect(0, 3, 1, 1, PALETTE.jetSide), rect(4, 5, 1, 1, PALETTE.jetSide), rect(1, 1, 1, 1, PALETTE.jet)],
  },
  haloOuter: { width: 57, height: 57, rects: disc(28, 28, 28, PALETTE.lampLight) },
  haloInner: { width: 33, height: 33, rects: disc(16, 16, 16, PALETTE.lampLight) },
  haloSmall: { width: 21, height: 21, rects: disc(10, 10, 10, PALETTE.warm) },
};

function sky() {
  const stops = [0, 30, 60, 92, 124, 156, 188, 220, GROUND_Y];
  const colors = PALETTE.sky;
  const rects = colors.map((color, i) => rect(0, stops[i], TITLE_WORLD.width, stops[i + 1] - stops[i], color));
  for (let i = 1; i < colors.length; i++) {
    rects.push(...dither(0, stops[i] - 6, TITLE_WORLD.width, 6, colors[i]));
  }
  const { x, y, r } = ANCHORS.moon;
  rects.push(...disc(x, y, r + 9, PALETTE.moonHalo), ...disc(x, y, r + 4, PALETTE.moonHaloInner));
  rects.push(...disc(x, y, r, PALETTE.moon), ...disc(x + 2, y + 1, r - 1, PALETTE.moonShade), ...disc(x - 1, y - 1, r - 2, PALETTE.moon),
    rect(x + 2, y - 5, 4, 3, PALETTE.moonShade), rect(x - 6, y + 3, 3, 3, PALETTE.moonShade), rect(x + 4, y + 5, 2, 2, PALETTE.moonShade));
  return rects;
}

function spire(x, base, height, color) {
  const rects = [];
  for (let dy = 0; dy < height; dy++) {
    const half = Math.floor((dy * 3) / height);
    rects.push(rect(x - half, base - height + dy, half * 2 + 1, 1, color));
  }
  return rects;
}

function skyline(random, { color, roof, minH, maxH, minW, maxW, lights, lightChance, landmarks = [] }) {
  const rects = [];
  for (let x = -4; x < TITLE_WORLD.width;) {
    const w = minW + Math.floor(random() * (maxW - minW));
    const h = minH + Math.floor(random() * (maxH - minH));
    const top = GROUND_Y - h;
    rects.push(rect(x, top, w, h, color), rect(x, top, w, 1, roof));
    const shape = random();
    if (shape < 0.25) {
      for (let step = 1; step <= Math.floor(w / 2); step++) rects.push(rect(x + step, top - step, w - step * 2, 1, color));
    } else if (shape < 0.45) rects.push(rect(x + 2 + Math.floor(random() * (w - 5)), top - 4, 2, 4, color));
    for (let wy = top + 4; wy < GROUND_Y - 6; wy += 6) {
      for (let wx = x + 3; wx + 2 <= x + w - 3; wx += 5) {
        if (random() < lightChance) rects.push(rect(wx, wy, lights.size, lights.size, random() < 0.7 ? lights.colors[0] : lights.colors[1]));
      }
    }
    x += w + Math.floor(random() * 3);
  }
  landmarks.forEach(({ x, h, w }) => {
    rects.push(rect(x - w / 2, GROUND_Y - h, w, h, color), ...spire(x, GROUND_Y - h, 18, color));
  });
  return rects;
}

function city(random) {
  const rects = [
    // Plan lointain dans la brume : la vieille ville et les flèches de la cathédrale.
    ...skyline(random, {
      color: PALETTE.cityFar, roof: PALETTE.cityFar, minH: 50, maxH: 92, minW: 18, maxW: 36,
      lights: { size: 1, colors: [PALETTE.cityFarLight, PALETTE.cityFarLight] }, lightChance: 0.12,
      landmarks: [{ x: 412, h: 104, w: 6 }, { x: 428, h: 98, w: 6 }],
    }),
    // Plan proche, plus sombre, avec des fenêtres chaudes.
    ...skyline(random, {
      color: PALETTE.cityNear, roof: PALETTE.cityNearRoof, minH: 22, maxH: 62, minW: 14, maxW: 34,
      lights: { size: 2, colors: [PALETTE.cityLight, PALETTE.cityLightWarm] }, lightChance: 0.2,
    }),
  ];
  // Lac Léman et reflets des lumières.
  rects.push(rect(0, 238, 166, 12, PALETTE.lake), rect(0, 238, 166, 1, PALETTE.lakeLight), rect(0, 246, 166, 4, PALETTE.lakeDeep));
  for (let x = 3; x < 164; x += 7) rects.push(rect(x, 240 + (x % 3) * 2, 3 + (x % 2), 1, PALETTE.lakeLight));
  for (let x = 12; x < 160; x += 23) rects.push(rect(x, 241, 1, 2, PALETTE.lakeGlow), rect(x, 244, 1, 1, PALETTE.lakeGlow));
  return rects;
}

function tree(cx, top, random) {
  const rects = [
    rect(cx - 2, top + 24, 5, 34, PALETTE.trunk), rect(cx + 1, top + 24, 2, 34, PALETTE.trunkDark),
    rect(cx - 4, top + 56, 9, 2, PALETTE.trunkDark),
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
  return rects;
}

function lamp({ x, y }) {
  const left = x - 5;
  return [
    rect(x - 2, y + 8, 4, 50, PALETTE.lampPole), rect(x - 2, y + 8, 1, 50, PALETTE.lampPoleLight),
    rect(x - 4, y + 52, 8, 4, PALETTE.lampPole), rect(x - 5, y + 56, 10, 2, PALETTE.lampPole),
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

function street(random) {
  const width = TITLE_WORLD.width;
  const rects = [
    // Garde-corps du quai, devant le lac.
    rect(0, 244, 117, 1, PALETTE.railingLight), rect(0, 245, 117, 1, PALETTE.railing),
  ];
  for (let x = 2; x < 117; x += 10) rects.push(rect(x, 245, 2, 5, PALETTE.railing));
  // Trottoir dallé, bordure et chaussée pavée, réchauffés par la flaque de lumière du lampadaire.
  const lit = (x, y) => ((x - ANCHORS.lamp.x) / 36) ** 2 + ((y - 262) / 14) ** 2 < 1;
  rects.push(rect(0, GROUND_Y, width, 12, PALETTE.sidewalk), rect(0, GROUND_Y, width, 1, PALETTE.sidewalkLight));
  for (let y = GROUND_Y + 1; y < 262; y++) {
    const half = Math.round(36 * Math.sqrt(Math.max(0, 1 - ((y - 262) / 14) ** 2)));
    if (half > 0) rects.push(rect(ANCHORS.lamp.x - half, y, half * 2, 1, PALETTE.sidewalkLit));
  }
  rects.push(rect(0, 256, width, 1, PALETTE.sidewalkLine));
  for (let x = 0; x < width; x += 12) rects.push(rect(x, 251, 1, 5, PALETTE.sidewalkLine), rect(x + 6, 257, 1, 5, PALETTE.sidewalkLine));
  rects.push(rect(0, 262, width, 1, PALETTE.curbTop), rect(0, 263, width, 2, PALETTE.curbFace), rect(0, 265, width, 19, PALETTE.road));
  for (let row = 0, y = 266; y < 284; row++, y += 4) {
    for (let x = -(row % 2) * 3; x < width; x += 6) {
      const warm = lit(x + 2, y);
      rects.push(rect(x, y, 5, 3, warm ? PALETTE.cobbleLit : PALETTE.cobble));
      if (random() < 0.6) rects.push(rect(x, y, 2, 1, warm ? PALETTE.cobbleLitLight : PALETTE.cobbleLight));
    }
  }
  // Mobilier : pots de part et d'autre de la porte, banc et chat face au lac, arbre et lampadaire.
  rects.push(...pot(207), ...pot(247), ...bench(78), ...fromPattern(88, 243, CAT, { k: PALETTE.silhouette, e: PALETTE.flowerYellow }));
  rects.push(...tree(318, 186, random), ...lamp(ANCHORS.lamp), ...bench(392));
  return rects;
}

function foreground(random) {
  const width = TITLE_WORLD.width;
  const rects = [rect(0, 290, width, 10, PALETTE.hedge)];
  for (let x = 0; x < width; x += 4) {
    const top = 284 + Math.floor(random() * 4);
    rects.push(rect(x, top, 4, 290 - top, PALETTE.hedge), rect(x + 1, top, 2, 1, PALETTE.hedgeLight));
  }
  for (let i = 0; i < 260; i++) {
    const x = Math.floor(random() * width);
    const y = 287 + Math.floor(random() * 13);
    rects.push(rect(x, y, 1, 1, random() < 0.5 ? PALETTE.hedgeLight : PALETTE.hedgeDark));
  }
  const flowers = [PALETTE.flowerPink, PALETTE.flowerYellow, PALETTE.awningLight];
  for (let x = 3; x < width; x += 7 + Math.floor(random() * 6)) {
    rects.push(rect(x, 288 + Math.floor(random() * 4), 1, 1, flowers[Math.floor(random() * flowers.length)]));
  }
  // Clôture en bois basse devant la haie.
  rects.push(rect(0, 292, width, 2, PALETTE.fence), rect(0, 294, width, 1, PALETTE.fenceDark));
  for (let x = 10; x < width; x += 40) rects.push(rect(x, 287, 3, 13, PALETTE.fence), rect(x, 287, 3, 1, PALETTE.fenceDark), rect(x + 2, 288, 1, 12, PALETTE.fenceDark));
  return rects;
}

export function buildScenery(seed = 7) {
  const { moon } = ANCHORS;
  const { width, height } = TITLE_WORLD;
  const layers = {
    sky: sky(),
    city: city(createRandom(seed)),
    building: building(createRandom(seed + 2), ANCHORS),
    street: street(createRandom(seed + 3)),
    foreground: foreground(createRandom(seed + 4)),
  };
  Object.keys(layers).forEach((name) => { layers[name] = clip(layers[name], width, height); });
  return {
    layers,
    stars: generateStars(seed + 1, { width, height: 140, count: 70, avoid: [{ x: moon.x, y: moon.y, r: moon.r + 10 }] }),
    clouds: [{ x: 30, y: 26, speed: 3 }, { x: 190, y: 56, speed: 2 }, { x: 340, y: 18, speed: 4 }],
    anchors: ANCHORS,
  };
}
