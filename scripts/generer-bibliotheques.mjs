// Variantes de la bibliothèque du designer : même cadre (resserré à 40 px), étagères vidées puis regarnies
// avec ses propres livres, redistribués, recolorés dans ses teintes ou raccourcis, et son livre penché ;
// les figurines laissent la place à une plante et à des piles de livres couchés.
// Usage : npm run assets:bibliotheques
// Sorties : public/assets/chambre/meubles/bibliotheque-{2,3}.png (40 × 96).
import { readFileSync, writeFileSync } from 'node:fs';
import { decodePNG, encodePNG } from './png.mjs';

const dir = new URL('../public/assets/chambre/meubles/', import.meta.url);
const source = decodePNG(readFileSync(new URL('bibliotheque.png', dir)));
const at = (image, x, y) => [...image.data.subarray((y * image.width + x) * 4, (y * image.width + x) * 4 + 4)];
const same = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

// Teintes du designer.
const C = {
  outline: [29, 23, 27], back: [64, 30, 28], edge: [54, 26, 28], floor: [94, 37, 34], gap: [30, 24, 29],
  wood: [168, 77, 54], woodLight: [181, 101, 82], woodShade: [134, 48, 40],
  cream: [227, 197, 195], creamLight: [255, 236, 231], gold: [169, 130, 78],
  leaf: [55, 92, 73], leafShade: [41, 74, 58], leafDark: [34, 56, 45], leafLight: [69, 100, 95],
};
// Une couleur de livre = quatre tons : haut de la tranche, bord de l'étiquette, reflet, corps.
const PALETTES = {
  red: [[60, 25, 28], [80, 33, 37], [133, 54, 62], [110, 41, 48]],
  violet: [[22, 35, 34], [52, 43, 66], [85, 70, 109], [68, 54, 88]],
  plum: [[20, 14, 38], [51, 15, 29], [103, 39, 63], [76, 25, 45]],
  blue: [[20, 14, 38], [26, 22, 57], [59, 51, 114], [41, 35, 85]],
  teal: [[22, 35, 34], [34, 54, 53], [55, 89, 87], [42, 71, 70]],
  olive: [[20, 14, 38], [28, 32, 0], [62, 70, 7], [44, 50, 0]],
  brown: [[22, 35, 34], [62, 42, 43], [102, 68, 70], [82, 53, 54]],
  green: [[22, 36, 29], [34, 56, 45], [55, 92, 73], [41, 74, 58]],
};

// Livres debout de l'étagère du bas (5 × 17), chacun avec son motif de dorures.
const BOOK = { width: 5, height: 17 };
const BOOKS = [6, 13, 19, 26, 33, 40, 46, 53].map((x) => Array.from({ length: BOOK.height }, (_, y) => (
  Array.from({ length: BOOK.width }, (_, i) => at(source, x + i, 70 + y))
)));
// Étagères : première ligne du fond, dernière ligne des livres, dernière ligne du plancher.
const SHELVES = [{ top: 21, books: 38, bottom: 40 }, { top: 46, books: 62, bottom: 64 }, { top: 70, books: 86, bottom: 89 }];

function frame(width) {
  const image = { width, height: source.height, data: Buffer.alloc(width * source.height * 4) };
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sx = x < 20 ? x : x - width + source.width;
      image.data.set(at(source, sx, y), (y * width + x) * 4);
    }
  }
  return image;
}

function painter(image) {
  const px = (x, y, color) => image.data.set([...color.slice(0, 3), 255], (y * image.width + x) * 4);
  const rect = (x, y, w, h, color) => {
    for (let j = y; j < y + h; j += 1) for (let i = x; i < x + w; i += 1) px(i, j, color);
  };
  return { px, rect };
}

// Vide une étagère : fond sombre, arête, puis plancher plus clair, comme les cases libres du designer.
function clearShelf(image, { top, bottom }) {
  const { rect } = painter(image);
  const width = image.width - 10;
  rect(5, top, width, 9, C.back);
  rect(5, top + 9, width, 1, C.edge);
  rect(5, top + 10, width, bottom - top - 9, C.floor);
}

// Range des livres debout à partir de x : ombre derrière et dessous, écarts de 2 puis 1 pixel en alternance.
// Chaque livre : [indice du modèle, palette ou null pour garder la sienne, true pour un livre plus court].
function placeBooks(image, shelf, x, books) {
  const { px, rect } = painter(image);
  let left = x;
  books.forEach(([index, palette, short], n) => {
    const rows = short ? [...BOOKS[index].slice(0, 9), ...BOOKS[index].slice(12)] : BOOKS[index];
    const top = shelf.books - rows.length + 1;
    const from = [rows[0][0], rows[1][0], rows[7][0], rows[8][0]];
    const gap = n % 2 ? 1 : 2;
    // L'ombre s'arrête au montant droit du cadre.
    rect(left - 1, top, Math.min(BOOK.width + gap + 1, image.width - 5 - (left - 1)), rows.length + 1, C.gap);
    rows.forEach((row, y) => row.forEach((color, i) => {
      const tone = palette ? from.findIndex((tint) => same(tint, color)) : -1;
      px(left + i, top + y, tone >= 0 ? PALETTES[palette][tone] : color);
    }));
    left += BOOK.width + gap;
  });
  return left - 1;
}

// Livre penché du designer (étagère du haut), posé contre le livre debout qui le précède.
function placeLeaning(image, shelf, x) {
  const { px } = painter(image);
  const background = [C.back, C.edge, C.floor, [62, 30, 28]];
  for (let y = 21; y <= 39; y += 1) {
    for (let i = 0; i < 14; i += 1) {
      const color = at(source, 26 + i, y);
      if (color[3] && !background.some((tint) => same(tint, color))) px(x + i, y - 21 + shelf.top + (shelf.books - 38), color);
    }
  }
}

// Pile de livres couchés, du plus large au plus étroit : tranche colorée, pages crème à droite, contour sombre.
function placeStack(image, shelf, x, palettes) {
  const { px, rect } = painter(image);
  let bottom = shelf.books;
  rect(x, bottom + 1, 16, 1, C.gap);
  palettes.forEach((name, n) => {
    const [, edge, light, body] = PALETTES[name];
    const w = 16 - n * 2;
    const left = x + (n % 2);
    rect(left, bottom - 4, w, 5, C.outline);
    rect(left + 1, bottom - 3, w - 2, 1, light);
    rect(left + 1, bottom - 2, w - 2, 1, body);
    rect(left + 1, bottom - 1, w - 2, 1, edge);
    rect(left + w - 4, bottom - 3, 3, 3, C.cream);
    rect(left + w - 4, bottom - 2, 3, 1, C.creamLight);
    px(left + 3, bottom - 2, C.gold);
    px(left + 4, bottom - 2, C.gold);
    bottom -= 4;
  });
}

// Plante en pot : feuillage à trois verts éclairé en haut à gauche, pot en bois du designer.
const PLANT = [
  '...ll.ll...',
  '..lLlolLl..',
  '.lLLlolLLl.',
  'lLlooloolLl',
  'lloLlolLoll',
  '.lolloollo.',
  '..lo.o.ol..',
  '...nnnnn...',
  '..nhhhhhn..',
  '..nwwwwsn..',
  '..nwwwwsn..',
  '...nwwsn...',
  '...nnnnn...',
];
const PLANT_COLORS = { l: C.leaf, L: C.leafLight, o: C.leafShade, n: C.outline, h: C.woodLight, w: C.wood, s: C.woodShade };

function placePlant(image, shelf, x) {
  const { px, rect } = painter(image);
  const top = shelf.books - PLANT.length + 1;
  rect(x + 3, shelf.books + 1, 5, 1, C.gap);
  PLANT.forEach((row, y) => [...row].forEach((char, i) => {
    if (PLANT_COLORS[char]) px(x + i, top + y, char === 'o' && y > 5 ? C.leafDark : PLANT_COLORS[char]);
  }));
}

function bookcase(fill) {
  const image = frame(40);
  SHELVES.forEach((shelf) => clearShelf(image, shelf));
  fill(image);
  return image;
}

const [top, middle, bottom] = SHELVES;
const variants = {
  // Entre la bibliothèque d'origine et le panier : livres et plante en haut, pile couchée au milieu.
  'bibliotheque-2': bookcase((image) => {
    placeBooks(image, top, 6, [[4, 'red'], [1, null, true], [6, 'teal']]);
    placePlant(image, top, 24);
    placeStack(image, middle, 6, ['blue', 'olive', 'red']);
    placeBooks(image, middle, 23, [[0, 'plum', true], [3, 'green']]);
    placeBooks(image, bottom, 6, [[2, 'brown'], [5, 'violet', true], [7, 'blue'], [4, 'olive', true]]);
  }),
  // Contre le mur de droite : livre penché en haut, plante au milieu, pile couchée en bas.
  'bibliotheque-3': bookcase((image) => {
    placeLeaning(image, top, placeBooks(image, top, 6, [[3, 'violet'], [6, 'olive']]) + 1);
    placePlant(image, middle, 6);
    placeBooks(image, middle, 21, [[7, 'teal', true], [2, 'red']]);
    placeBooks(image, bottom, 6, [[1, 'green'], [4, 'plum', true]]);
    placeStack(image, bottom, 19, ['brown', 'teal']);
  }),
};

Object.entries(variants).forEach(([name, image]) => writeFileSync(new URL(`${name}.png`, dir), encodePNG(image)));
console.log('Bibliothèques bibliotheque-2.png et bibliotheque-3.png générées.');
