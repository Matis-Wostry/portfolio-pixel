import { createRandom, generateStars } from './random.mjs';
import { TITLE_WORLD } from './layout.mjs';

export const TITLE_LAYERS = ['sky', 'city', 'building', 'court', 'foreground'];
export const GROUND_Y = 250;

export const PALETTE = {
  skyTop: '#141029', skyMid: '#1f1840', skyLow: '#2c2153', skyHorizon: '#43306a',
  moon: '#f4e7c3', moonShade: '#d9c99b',
  city: '#1d1838', cityLight: '#f8d68b', lake: '#22305a', lakeLight: '#4a6aa8',
  roof: '#2e1a14', brick: '#5a2a1c', brickLine: '#41190f', windowOff: '#1c1a2e', frame: '#3a2a24', windowWarm: '#5a4a3a',
  glowDark: '#1b2d55', glowLight: '#6fb7ff', silhouette: '#0f0d1c', posterRed: '#e8505b', posterGold: '#f8d68b', knight: '#6a5f8f',
  shop: '#2b2540', shopWindow: '#16132a', cabinetPink: '#ff4fd8', cabinetCyan: '#4ff0ff', neonDim: '#4a2a50', neon: '#ff4fd8',
  asphalt: '#24212f', curb: '#3a3548', line: '#d8b889', board: '#e9e3d6', boardMark: '#c0392b', rim: '#e8742a', net: '#fff2d5',
  pole: '#5c5f6e', lampPole: '#3a3a4a', lampLight: '#fff2a8', fence: '#15121f', fenceLight: '#2a2540',
  ball: '#e8742a', ballSeam: '#7a3818', cloud: '#3b3466', cloudShade: '#2c2650', jet: '#dfefff', jetSide: '#9fc7ef',
};

// Positions en pixels du monde (480 × 300). Les calques du designer doivent les respecter.
export const ANCHORS = {
  focus: { x: 265, y: 200 },
  window: { x: 223, y: 136, w: 16, h: 20 },
  hoop: { x: 290, y: 184, w: 16, h: 24 },
  rim: { x: 292, y: 199, w: 12, h: 2 },
  ball: { x: 268, y: 262, r: 3 },
  lamp: { x: 345, y: 199 },
  jet: { x: 70, y: 240, h: 72 },
  neon: { x: 134, y: 205 },
  moon: { x: 404, y: 42, r: 12 },
};

const rect = (x, y, w, h, color) => ({ x, y, w, h, color });

export function fromPattern(x, y, rows, colors) {
  const rects = [];
  rows.forEach((row, dy) => {
    for (let start = 0; start < row.length;) {
      let end = start + 1;
      while (end < row.length && row[end] === row[start]) end += 1;
      if (colors[row[start]]) rects.push(rect(x + start, y + dy, end - start, 1, colors[row[start]]));
      start = end;
    }
  });
  return rects;
}

export function disc(cx, cy, r, color) {
  const rects = [];
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.round(Math.sqrt(r * r - dy * dy));
    rects.push(rect(cx - half, cy + dy, half * 2 + 1, 1, color));
  }
  return rects;
}

const KNIGHT = ['..kkk..', '.kkkkk.', 'kk.kkkk', 'kkkkkkk', '...kkkk', '..kkkk.', '..kkkk.', '.kkkkkk', 'kkkkkkk'];
const GAMEPAD = ['..nnnnnnnnn..', '.n.........n.', 'n..n.....n..n', 'n.nnn...n.n.n', 'n..n.....n..n', '.n...nnn...n.', '..nnn...nnn..'];
const BALL = ['..oOo..', '.ooOoo.', 'oooOooo', 'OOOOOOO', 'oooOooo', '.ooOoo.', '..oOo..'];
const CLOUD = [
  '........cccc............',
  '.....cccccccc...ccc.....',
  '...cccccccccccccccccc...',
  '.cccccccccccccccccccccc.',
  'cccccccccccccccccccccccc',
  '.dddddddddddddddddddddd.',
];

export const SPRITES = {
  ball: { width: 7, height: 7, rects: fromPattern(0, 0, BALL, { o: PALETTE.ball, O: PALETTE.ballSeam }) },
  cloud: { width: 24, height: 6, rects: fromPattern(0, 0, CLOUD, { c: PALETTE.cloud, d: PALETTE.cloudShade }) },
  neon: { width: 13, height: 7, rects: fromPattern(0, 0, GAMEPAD, { n: PALETTE.neon }) },
  jet: {
    width: 5,
    height: 72,
    rects: [rect(2, 0, 1, 72, PALETTE.jet), rect(1, 8, 1, 64, PALETTE.jetSide), rect(3, 12, 1, 60, PALETTE.jetSide),
      rect(0, 3, 1, 1, PALETTE.jetSide), rect(4, 5, 1, 1, PALETTE.jetSide), rect(1, 1, 1, 1, PALETTE.jet)],
  },
  haloOuter: { width: 57, height: 57, rects: disc(28, 28, 28, PALETTE.lampLight) },
  haloInner: { width: 33, height: 33, rects: disc(16, 16, 16, PALETTE.lampLight) },
};

function sky() {
  const stops = [0, 70, 140, 200, GROUND_Y];
  const colors = [PALETTE.skyTop, PALETTE.skyMid, PALETTE.skyLow, PALETTE.skyHorizon];
  const rects = colors.map((color, i) => rect(0, stops[i], TITLE_WORLD.width, stops[i + 1] - stops[i], color));
  for (let i = 1; i < colors.length; i++) {
    for (let row = 0; row < 4; row++) {
      const color = row < 2 ? colors[i] : colors[i - 1];
      for (let x = row % 2; x < TITLE_WORLD.width; x += 2) rects.push(rect(x, stops[i] - 2 + row, 1, 1, color));
    }
  }
  const { x, y, r } = ANCHORS.moon;
  rects.push(...disc(x, y, r, PALETTE.moon), rect(x + 2, y - 5, 4, 3, PALETTE.moonShade),
    rect(x - 6, y + 3, 3, 3, PALETTE.moonShade), rect(x + 4, y + 5, 2, 2, PALETTE.moonShade));
  return rects;
}

function city(random) {
  const rects = [];
  for (let x = 0; x < TITLE_WORLD.width;) {
    const w = Math.min(14 + Math.floor(random() * 22), TITLE_WORLD.width - x);
    const h = 24 + Math.floor(random() * 56);
    const top = GROUND_Y - h;
    rects.push(rect(x, top, w, h, PALETTE.city));
    for (let wy = top + 4; wy < GROUND_Y - 6; wy += 6) {
      for (let wx = x + 3; wx + 2 <= x + w - 3; wx += 5) {
        if (random() < 0.18) rects.push(rect(wx, wy, 2, 2, PALETTE.cityLight));
      }
    }
    x += w + Math.floor(random() * 3);
  }
  rects.push(rect(0, 240, 160, 10, PALETTE.lake));
  for (let x = 4; x < 160; x += 9) rects.push(rect(x, 243 + (x % 2) * 3, 4, 1, PALETTE.lakeLight));
  return rects;
}

function litWindow() {
  const { x, y, w, h } = ANCHORS.window;
  return [
    rect(x - 1, y - 1, w + 2, h + 2, PALETTE.frame),
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

function shop() {
  return [
    rect(118, 192, 58, 4, PALETTE.roof),
    rect(120, 196, 56, 54, PALETTE.shop),
    ...fromPattern(ANCHORS.neon.x, ANCHORS.neon.y, GAMEPAD, { n: PALETTE.neonDim }),
    rect(124, 222, 22, 16, PALETTE.shopWindow),
    rect(127, 226, 5, 12, PALETTE.cabinetPink),
    rect(136, 226, 5, 12, PALETTE.cabinetCyan),
    rect(156, 226, 12, 24, PALETTE.frame),
  ];
}

function building() {
  const left = 176;
  const right = 286;
  const top = 90;
  const rects = [rect(left, top, right - left, GROUND_Y - top, PALETTE.brick), rect(left - 2, top - 4, right - left + 4, 4, PALETTE.roof)];
  for (let row = 0, y = top + 2; y < GROUND_Y; row++, y += 4) {
    for (let x = left + (row % 2) * 4; x < right; x += 8) rects.push(rect(x, y, 1, 1, PALETTE.brickLine));
  }
  [104, 136, 168, 200].forEach((y) => [188, 223, 258].forEach((x) => {
    if (x === 223 && (y === 200 || y === ANCHORS.window.y)) return;
    const glass = x === 258 && y === 104 ? PALETTE.windowWarm : PALETTE.windowOff;
    rects.push(rect(x - 1, y - 1, 18, 22, PALETTE.frame), rect(x, y, 16, 20, glass));
  }));
  rects.push(...litWindow());
  rects.push(rect(222, 223, 18, 27, PALETTE.frame), rect(223, 224, 16, 26, PALETTE.windowOff));
  rects.push(rect(281, 74, 1, 12, PALETTE.knight), ...fromPattern(278, 64, KNIGHT, { k: PALETTE.knight }));
  rects.push(...shop());
  return rects;
}

function court() {
  return [
    rect(0, GROUND_Y, TITLE_WORLD.width, TITLE_WORLD.height - GROUND_Y, PALETTE.asphalt),
    rect(0, GROUND_Y, TITLE_WORLD.width, 2, PALETTE.curb),
    rect(200, 276, 240, 1, PALETTE.line),
    rect(280, 254, 1, 18, PALETTE.line), rect(316, 254, 1, 18, PALETTE.line), rect(280, 272, 37, 1, PALETTE.line),
    rect(286, 188, 4, 2, PALETTE.pole),
    rect(290, 184, 16, 13, PALETTE.board),
    rect(294, 189, 8, 1, PALETTE.boardMark), rect(294, 189, 1, 6, PALETTE.boardMark), rect(301, 189, 1, 6, PALETTE.boardMark),
    rect(292, 199, 12, 2, PALETTE.rim),
    ...[293, 296, 299, 302].map((x) => rect(x, 201, 1, 6, PALETTE.net)),
    rect(294, 206, 8, 1, PALETTE.net),
    rect(344, 198, 2, 52, PALETTE.lampPole), rect(340, 194, 10, 4, PALETTE.lampPole), rect(342, 198, 6, 2, PALETTE.lampLight),
  ];
}

function foreground() {
  const rects = [rect(0, 284, TITLE_WORLD.width, 16, PALETTE.fence), rect(0, 284, TITLE_WORLD.width, 1, PALETTE.fenceLight)];
  for (let x = 0; x < TITLE_WORLD.width; x += 32) rects.push(rect(x, 280, 2, 20, PALETTE.fence));
  for (let y = 287; y < TITLE_WORLD.height; y += 3) {
    for (let x = (y % 2) * 3; x < TITLE_WORLD.width; x += 6) rects.push(rect(x, y, 1, 1, PALETTE.fenceLight));
  }
  return rects;
}

export function buildScenery(seed = 7) {
  const { moon } = ANCHORS;
  return {
    layers: { sky: sky(), city: city(createRandom(seed)), building: building(), court: court(), foreground: foreground() },
    stars: generateStars(seed + 1, { width: TITLE_WORLD.width, height: 150, count: 70, avoid: [{ x: moon.x, y: moon.y, r: moon.r + 4 }] }),
    clouds: [{ x: 30, y: 26, speed: 3 }, { x: 190, y: 56, speed: 2 }, { x: 340, y: 18, speed: 4 }],
    anchors: ANCHORS,
  };
}
