import { createRandom, generateStars } from './random.mjs';
import { TITLE_WORLD } from './layout.mjs';
import { PALETTE } from './palette.mjs';
import { rect, fromPattern, disc, ellipse, dither, clip } from './pixels.mjs';
import { building, facadeWindows, litWindowRects } from './building.mjs';
import { street, foreground } from './street.mjs';
import { DOG_FRAMES, PEDESTRIAN_FRAMES, CYCLIST_FRAMES, TRAM, LEAF, REFLECTIONS } from './actors.mjs';
import { outline } from './lights.mjs';

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
  doorLamp: { x: 249, y: 225 },
  screens: [{ x: 128, y: 231, w: 4, h: 3 }, { x: 139, y: 231, w: 4, h: 3 }],
  tree: { x: 318, y: 210 },
  dog: { x: 287, y: 246 },
  // Reflets sur les pavés mouillés, centrés sous leur lumière (light : source qui les fait varier).
  reflections: [
    { x: 140, color: 'pink', light: 'neon' },
    { x: 346, color: 'yellow', light: 'lamp' },
    { x: 249, color: 'warm', light: 'door' },
    { x: 231, color: 'blue', light: 'matis' },
    { x: 196, color: 'warm', light: 'column', column: 188 },
    { x: 266, color: 'warm', light: 'column', column: 258 },
  ],
  lake: { x: 280, y: 238, w: 200, h: 12 },
  jet: { x: 400, y: 241, h: 80 },
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
const JET_CROWN = [
  '..........mwm............',
  '.........mwwwmm..........',
  '........mswwwwsmm.m......',
  '.......m.swwwwwssmm..m...',
  '......m..sswwwssssmm.m...',
  '.........s.swwsss.smm..m.',
  '........m..s.w.ss.s.mm...',
  '...........s.w.s.s..m.m.m',
  '.......m.....w..s.s..m...',
  '...........s.w..s..s..m.m',
  '.............w.m...s...m.',
  '...........s.w....s..m..m',
  '.............w.m...s.....',
  '...........s.w.......m..m',
];
const JET_FOAM = [
  '..........sws............',
  '....m....swwws....m......',
  '...m.s..swwwwws..s.m.....',
  '..m..ssswwwwwwwsss..m....',
  '.m.ssswwwwwwwwwwwsss.m...',
  'm.sswwwwwwwwwwwwwwwss.m..',
  '.mmssssssssssssssssssmm..',
  '...mm.mmmmmmmmmmmmm.mm...',
];

// Jet d'eau de Genève : colonne fine, plumet rabattu par le vent vers la droite, rideau d'embruns et écume.
export const JET_CENTER = 11;
function jetRects() {
  const c = JET_CENTER;
  const colors = { w: PALETTE.jet, s: PALETTE.jetSide, m: PALETTE.jetMist };
  const rects = [
    rect(c, 1, 1, 73, PALETTE.jet), rect(c - 1, 16, 1, 58, PALETTE.jetSide), rect(c + 1, 12, 1, 62, PALETTE.jetSide),
    rect(c + 2, 14, 1, 30, PALETTE.jetMist), rect(c - 2, 24, 1, 28, PALETTE.jetMist),
  ];
  const random = createRandom(11);
  for (let y = 14; y < 66; y++) {
    const spread = 4 + Math.floor((66 - y) / 6);
    if (random() < 0.7) {
      const dense = random() < 1 - (y - 14) / 60;
      rects.push(rect(c + 2 + Math.floor(random() * spread), y, 1, 1, dense ? PALETTE.jetSide : PALETTE.jetMist));
    }
  }
  return [...rects, ...fromPattern(0, 0, JET_CROWN, colors), ...fromPattern(0, 72, JET_FOAM, colors)];
}

export const SPRITES = {
  cloud: { width: 24, height: 7, rects: fromPattern(0, 0, CLOUD, { c: PALETTE.cloud, d: PALETTE.cloudShade, l: PALETTE.cloudLight }) },
  // Tube allumé : cœur pâle cerné d'un liseré rose, posé un pixel au-dessus et à gauche de l'ancre.
  neon: {
    width: 15,
    height: 9,
    rects: [...outline(GAMEPAD).map(({ x, y }) => rect(x + 1, y + 1, 1, 1, PALETTE.neon)), ...fromPattern(1, 1, GAMEPAD, { n: PALETTE.neonCore })],
  },
  neonGlow: { width: 25, height: 25, rects: disc(12, 12, 12, PALETTE.neon) },
  litWindow: { width: 18, height: 25, rects: litWindowRects(false) },
  litWindowFlowers: { width: 18, height: 25, rects: litWindowRects(true) },
  lampPool: { width: 73, height: 29, rects: ellipse(36, 14, 36, 14, PALETTE.lampLight) },
  ...DOG_FRAMES,
  pedestrian0: PEDESTRIAN_FRAMES[0],
  pedestrian1: PEDESTRIAN_FRAMES[1],
  cyclist0: CYCLIST_FRAMES[0],
  cyclist1: CYCLIST_FRAMES[1],
  tram: TRAM,
  leaf: LEAF,
  ...REFLECTIONS,
  jet: { width: 25, height: 80, rects: jetRects() },
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

function skyline(random, { color, roof, minH, maxH, minW, maxW, lights, lightChance, landmarks = [], collect = null }) {
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
        if (random() < lightChance) {
          rects.push(rect(wx, wy, lights.size, lights.size, random() < 0.7 ? lights.colors[0] : lights.colors[1]));
          collect?.push({ x: wx, y: wy, w: lights.size, h: lights.size });
        }
      }
    }
    x += w + Math.floor(random() * 3);
  }
  landmarks.forEach(({ x, h, w }) => {
    rects.push(rect(x - w / 2, GROUND_Y - h, w, h, color), ...spire(x, GROUND_Y - h, 18, color));
  });
  return rects;
}

function city(random, cityLights) {
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
      lights: { size: 2, colors: [PALETTE.cityLight, PALETTE.cityLightWarm] }, lightChance: 0.2, collect: cityLights,
    }),
  ];
  // Lac Léman à droite, reflets des lumières et du Jet d'eau.
  const { x, y, w, h } = ANCHORS.lake;
  rects.push(rect(x, y, w, h, PALETTE.lake), rect(x, y, w, 1, PALETTE.lakeLight), rect(x, y + 8, w, h - 8, PALETTE.lakeDeep));
  for (let dx = 3; dx < w - 4; dx += 7) rects.push(rect(x + dx, y + 2 + (dx % 3) * 2, 3 + (dx % 2), 1, PALETTE.lakeLight));
  for (let dx = 12; dx < w - 2; dx += 23) rects.push(rect(x + dx, y + 3, 1, 2, PALETTE.lakeGlow), rect(x + dx, y + 6, 1, 1, PALETTE.lakeGlow));
  const { x: jetX } = ANCHORS.jet;
  rects.push(rect(jetX - 2, y + 1, 5, 1, PALETTE.jetSide), rect(jetX, y + 3, 1, 2, PALETTE.jet), rect(jetX, y + 7, 1, 2, PALETTE.jetSide));
  return rects;
}

export function buildScenery(seed = 7) {
  const { moon } = ANCHORS;
  const { width, height } = TITLE_WORLD;
  const cityLights = [];
  const layers = {
    sky: sky(),
    city: city(createRandom(seed), cityLights),
    building: building(createRandom(seed + 2), ANCHORS),
    street: street(createRandom(seed + 3), ANCHORS, width),
    foreground: foreground(createRandom(seed + 4), width),
  };
  Object.keys(layers).forEach((name) => { layers[name] = clip(layers[name], width, height); });
  return {
    layers,
    stars: generateStars(seed + 1, { width, height: 140, count: 70, avoid: [{ x: moon.x, y: moon.y, r: moon.r + 10 }] }),
    clouds: [{ x: 30, y: 26, speed: 3 }, { x: 190, y: 56, speed: 2 }, { x: 340, y: 18, speed: 4 }],
    anchors: ANCHORS,
    windows: facadeWindows(ANCHORS),
    // Lumières du plan proche visibles dans le décor, que la scène peut éteindre une à une.
    cityLights: cityLights.filter(({ x, y }) => {
      const hidden = (x + 2 > 117 && x < 286 && y + 2 > 188) || (x + 2 > 176 && x < 286) || y + 2 > ANCHORS.lake.y;
      return x >= 0 && x + 2 <= width && !hidden;
    }),
  };
}
