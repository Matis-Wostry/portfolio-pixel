import { PALETTE } from './palette.mjs';
import { fromPattern } from './pixels.mjs';

// Planches 9 tranches (coins de 6 pixels) pour le panneau titre et les boutons, dans le style
// des bulles de la chambre : contour sombre, panneau brun à pointillés crème, boutons en bois.
const COLORS = {
  o: PALETTE.outline, C: '#ffece7', Q: '#3a2929', q: '#2b2025',
  W: '#a84d36', w: '#c47054', M: '#86302a', m: '#5a2522',
};

const PANEL = [
  '.oooooooooooooooo.',
  'oQQQQQQQQQQQQQQQQo',
  'oQCQCQCQCQCQCQCQQo',
  'oQQQQQQQQQQQQQQCQo',
  'oQCQQQQQQQQQQQQQQo',
  'oQQQQQQQQQQQQQQCQo',
  'oQCQQQQQQQQQQQQQQo',
  'oQQQQQQQQQQQQQQCQo',
  'oQCQQQQQQQQQQQQQQo',
  'oQQQQQQQQQQQQQQCQo',
  'oQCQQQQQQQQQQQQQQo',
  'oQQQQQQQQQQQQQQCQo',
  'oQCQQQQQQQQQQQQQQo',
  'oQQQQQQQQQQQQQQCQo',
  'oQQCQCQCQCQCQCQCQo',
  'oqqqqqqqqqqqqqqqqo',
  '.oooooooooooooooo.',
  '..oooooooooooooo..',
];

const BUTTON = [
  '.oooooooooooooooo.',
  'owwwwwwwwwwwwwwwwo',
  'owWWWWWWWWWWWWWWMo',
  'owWWWWWWWWWWWWWWMo',
  'owWWWWWWWWWWWWWWMo',
  'owWWWWWWWWWWWWWWMo',
  'owWWWWWWWWWWWWWWMo',
  'owWWWWWWWWWWWWWWMo',
  'owWWWWWWWWWWWWWWMo',
  'owWWWWWWWWWWWWWWMo',
  'owWWWWWWWWWWWWWWMo',
  'owWWWWWWWWWWWWWWMo',
  'owWWWWWWWWWWWWWWMo',
  'owWWWWWWWWWWWWWWMo',
  'oMMMMMMMMMMMMMMMMo',
  'ommmmmmmmmmmmmmmmo',
  '.oooooooooooooooo.',
  '..oooooooooooooo..',
];

const sheet = (rows) => ({ width: rows[0].length, height: rows.length, rects: fromPattern(0, 0, rows, COLORS) });
export const INTERFACE = { panneau: sheet(PANEL), bouton: sheet(BUTTON) };
