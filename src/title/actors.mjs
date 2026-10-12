import { PALETTE } from './palette.mjs';
import { rect, fromPattern } from './pixels.mjs';
import { createRandom } from './random.mjs';

// Personnages et véhicules animés de la rue, dessinés tournés vers la droite.
const pad = (rows, width) => rows.map((row) => row.padEnd(width, '.').slice(0, width));
const DOG_COLORS = { g: PALETTE.dog, G: PALETTE.dogDark, l: PALETTE.dogLight, e: PALETTE.silhouette, n: PALETTE.silhouette };
const dog = (rows) => ({ width: 19, height: 13, rects: fromPattern(0, 0, pad(rows, 19), DOG_COLORS) });

const DOG_HEAD = ['..ggg', '.ggggg', '.ggegGG', 'nggggGG'];
const DOG_LEGS = ['...gG.gG....gG.gG', '...gG.gG....gG.gG', '...gG.gG....gG.gG', '...GG.GG....GG.GG'];

export const DOG_FRAMES = {
  dogStand: dog([...DOG_HEAD, '.gggGGG..........l', '..ggGGgllllllllgll', '...gggggggggggggGl', '...ggggggggggggg.l', '...GgggggggggggG..l', ...DOG_LEGS]),
  dogWag: dog([...DOG_HEAD, '.gggGGG', '..ggGGgllllllllgg', '...gggggggggggggGll', '...ggggggggggggg..l', '...GgggggggggggG', ...DOG_LEGS]),
  dogSit: dog([
    ...DOG_HEAD, '.gggGGG', '..ggGGglllll', '...gggggggggg', '...ggggggggggg', '...gGgggggggggg',
    '...gG.gGggggggg', '...gG.gG.gggggg.l', '...gG.gG.GgggggGll', '...GG.GG.GGGGGG',
  ]),
  dogSniff: dog([
    '', '', '.................l', '................l', '.....Gllllllllllgl', '....GGggggggggggG', '...gGgggggggggggg',
    '..ggGgggggggggggG', '.gggg.gG....gG.gG', '.gegg.gG....gG.gG', 'nggg..gG....gG.gG', '......gG....gG.gG', '......GG....GG.GG',
  ]),
};

const PERSON_TOP = ['..hhh', '.hhhhh', '..sss', '..sss', '.ccccc', 'ccccccc', 'c.cCc.c', 'c.cCc.c', 's.cCc.s', '..ccc', '..ccc'];
const PERSON_COLORS = { h: PALETTE.hair, s: PALETTE.skin, c: PALETTE.coat, C: PALETTE.coatDark, p: PALETTE.pants, b: PALETTE.shoes };
const person = (legs) => ({ width: 7, height: 16, rects: fromPattern(0, 0, pad([...PERSON_TOP, ...legs], 7), PERSON_COLORS) });

export const PEDESTRIAN_FRAMES = [
  person(['..p.p', '..p.p', '.p...p', '.p...p', 'bb...bb']),
  person(['..ppp', '..ppp', '..p.p', '..p.p', '.bb.bb']),
];

const RING = [[-3, 0], [3, 0], [0, -3], [0, 3], [-2, -2], [2, -2], [-2, 2], [2, 2], [-1, -3], [1, -3], [-1, 3], [1, 3]];

function cyclist(frame) {
  const rects = [];
  [[3, 10], [12, 10]].forEach(([cx, cy]) => {
    RING.forEach(([dx, dy]) => rects.push(rect(cx + dx, cy + dy, 1, 1, PALETTE.iron)));
    rects.push(rect(cx, cy, 1, 1, PALETTE.pipeLight));
  });
  rects.push(
    rect(4, 10, 4, 1, PALETTE.bike), rect(6, 7, 1, 3, PALETTE.bike), rect(6, 7, 6, 1, PALETTE.bike),
    rect(8, 9, 1, 1, PALETTE.bike), rect(9, 8, 1, 1, PALETTE.bike), rect(10, 7, 1, 1, PALETTE.bike),
    rect(12, 6, 1, 4, PALETTE.bike), rect(11, 5, 2, 1, PALETTE.iron), rect(5, 6, 3, 1, PALETTE.iron),
    rect(8, 0, 2, 2, PALETTE.skin), rect(8, 0, 2, 1, PALETTE.hair),
    rect(7, 2, 2, 3, PALETTE.jacket), rect(9, 3, 2, 1, PALETTE.jacket), rect(10, 4, 2, 1, PALETTE.skin),
    rect(6, 5, 3, 1, PALETTE.pants),
  );
  if (frame === 0) rects.push(rect(8, 6, 1, 1, PALETTE.pants), rect(9, 7, 1, 3, PALETTE.pants), rect(9, 10, 2, 1, PALETTE.shoes));
  else rects.push(rect(6, 6, 1, 1, PALETTE.pants), rect(6, 8, 1, 3, PALETTE.pants), rect(5, 11, 2, 1, PALETTE.shoes));
  return { width: 16, height: 14, rects };
}

export const CYCLIST_FRAMES = [cyclist(0), cyclist(1)];

// Tram moderne vu de côté : caisse blanche, bandeau vert, vitres éclairées et voyageurs.
function tram() {
  const width = 120;
  const random = createRandom(21);
  const rects = [
    rect(54, 0, 12, 1, PALETTE.iron), rect(57, 1, 1, 3, PALETTE.iron), rect(62, 1, 1, 3, PALETTE.iron), rect(58, 3, 4, 1, PALETTE.iron),
    rect(46, 4, 28, 3, PALETTE.tramShade),
    rect(3, 7, width - 6, 2, PALETTE.tramShade), rect(1, 9, width - 2, 15, PALETTE.tram),
    rect(1, 20, width - 2, 3, PALETTE.tramGreen), rect(1, 23, width - 2, 1, PALETTE.tramGreenDark),
    rect(3, 24, width - 6, 3, PALETTE.tramSkirt),
  ];
  for (let x = 6; x < width - 12; x += 12) {
    const door = x === 30 || x === 78;
    if (door) {
      rects.push(rect(x, 10, 9, 14, PALETTE.tramShade), rect(x + 1, 11, 3, 7, PALETTE.warm), rect(x + 5, 11, 3, 7, PALETTE.warm), rect(x + 4, 10, 1, 14, PALETTE.tramSkirt));
      continue;
    }
    rects.push(rect(x, 11, 9, 7, PALETTE.warm), rect(x, 11, 9, 1, PALETTE.warmDeep));
    if (random() < 0.6) {
      const head = x + 2 + Math.floor(random() * 5);
      rects.push(rect(head, 13, 2, 2, PALETTE.silhouette), rect(head - 1, 15, 4, 3, PALETTE.silhouette));
    }
  }
  // Avant à droite : pare-brise, phare, feu arrière à gauche.
  rects.push(rect(width - 6, 10, 4, 8, PALETTE.glass), rect(width - 3, 19, 2, 1, PALETTE.lampLight), rect(1, 19, 2, 1, PALETTE.flowerRed));
  [16, 104].forEach((bogie) => {
    rects.push(rect(bogie - 8, 27, 18, 2, PALETTE.iron));
    [bogie - 5, bogie + 5].forEach((wheel) => rects.push(rect(wheel - 2, 28, 5, 4, PALETTE.iron), rect(wheel, 29, 1, 1, PALETTE.pipeLight)));
  });
  return { width, height: 32, rects };
}

export const TRAM = tram();

export const LEAF = { width: 2, height: 2, rects: [rect(0, 0, 1, 1, PALETTE.leafOrange), rect(1, 0, 1, 1, PALETTE.leafGold), rect(1, 1, 1, 1, PALETTE.leafRed)] };

// Reflets sur les pavés mouillés : traits horizontaux brisés, plus courts et plus rares vers le bas.
function reflection(color, seed) {
  const random = createRandom(seed);
  const rects = [];
  for (let y = 0; y < 18; y += 2) {
    const strength = 1 - y / 18;
    if (random() > 0.35 + strength * 0.6) continue;
    const width = Math.max(1, Math.round(5 * strength * (0.5 + random() * 0.5)));
    const x = Math.max(0, Math.min(6 - width, Math.round(3 - width / 2 + (random() - 0.5) * 2)));
    rects.push(rect(x, y, width, 1, color));
  }
  return { width: 6, height: 18, rects };
}

export const REFLECTION_COLORS = { pink: PALETTE.neon, warm: PALETTE.warm, yellow: PALETTE.lampLight, blue: PALETTE.glowLight };
export const REFLECTIONS = Object.fromEntries(Object.entries(REFLECTION_COLORS).map(([name, color], index) => (
  [`reflection-${name}`, reflection(color, 31 + index)]
)));
