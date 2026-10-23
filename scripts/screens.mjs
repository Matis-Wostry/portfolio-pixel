// Contenu animé des écrans du bureau, calculé à partir de la forme livrée par le designer
// (sources/bureau-ecrans.png) : écran gauche = éditeur de code qui défile, écran droit = terminal.
// Utilisé par animer-ecrans.mjs pour produire la planche PNG chargée par le jeu.
// Les lignes suivent l'inclinaison de chaque écran en partant de son bord supérieur.

export const SCREEN_FRAMES = 32;

const COLORS = {
  background: '#1d1b2e',
  keyword: '#e5739d',
  name: '#7cb7e8',
  text: '#d9d0e3',
  string: '#9bd88f',
  number: '#f2b66d',
  muted: '#7d7392',
  comment: '#575070',
  prompt: '#9bd88f',
  cursor: '#9bd88f',
};

// Une ligne = [indentation, [[longueur, couleur], ...]] ; un pixel d'espace entre les mots.
const CODE = [
  [0, [[3, 'keyword'], [6, 'name'], [2, 'muted']]],
  [2, [[3, 'keyword'], [4, 'text'], [1, 'muted'], [7, 'string']]],
  [2, [[2, 'keyword'], [3, 'text'], [5, 'name'], [2, 'muted']]],
  [4, [[5, 'text'], [1, 'muted'], [2, 'number']]],
  [4, [[4, 'name'], [6, 'string']]],
  [2, [[1, 'muted']]],
  [2, [[6, 'keyword'], [5, 'text']]],
  [0, [[1, 'muted']]],
  [0, []],
  [0, [[2, 'comment'], [8, 'comment'], [5, 'comment']]],
  [0, [[5, 'keyword'], [4, 'text'], [1, 'muted'], [5, 'name'], [2, 'muted']]],
  [2, [[4, 'text'], [1, 'muted'], [3, 'number']]],
  [2, [[3, 'keyword'], [5, 'name'], [3, 'muted']]],
  [4, [[6, 'name'], [4, 'string']]],
  [2, [[1, 'muted']]],
  [0, []],
];

// Terminal : invite « $ » puis commande, suivie de sa sortie.
const TERMINAL = [
  [[1, 'prompt'], [4, 'text'], [5, 'text']],
  [[2, 'muted'], [9, 'muted']],
  [[2, 'string'], [7, 'string']],
  [[1, 'prompt'], [3, 'text'], [4, 'text'], [3, 'number']],
  [[6, 'muted'], [5, 'muted'], [3, 'muted']],
  [[2, 'string'], [5, 'string'], [4, 'string']],
  [[1, 'prompt']],
];
const TYPE_SPEED = 3;

// Colonnes opaques du masque, regroupées par écran : [{ x, top, bottom }, ...] de gauche à droite.
export function findScreens(alpha, width, height) {
  const screens = [];
  let current = null;
  for (let x = 0; x < width; x += 1) {
    let top = -1;
    let bottom = -1;
    for (let y = 0; y < height; y += 1) {
      if (alpha[y * width + x] === 0) continue;
      if (top < 0) top = y;
      bottom = y;
    }
    if (top < 0) {
      current = null;
      continue;
    }
    if (!current) screens.push(current = []);
    current.push({ x, top, bottom });
  }
  return screens;
}

const lineCells = (indent, words) => {
  const cells = [];
  let u = indent;
  words.forEach(([length, color]) => {
    for (let i = 0; i < length; i += 1) cells[u + i] = color;
    u += length + 1;
  });
  return cells;
};
const CODE_CELLS = CODE.map(([indent, words]) => lineCells(indent, words));
const TERMINAL_CELLS = TERMINAL.map((words) => lineCells(0, words));

// Rangée de texte par pixel visible : on écrit une ligne sur deux pixels (texte + interligne).
function paintRows(screen, rowAt, pixels) {
  screen.slice(1, -1).forEach(({ x, top, bottom }, u) => {
    for (let d = 0; top + 2 + d <= bottom - 2; d += 1) {
      const color = rowAt(d)?.[u + 1];
      if (color) pixels.push({ x, y: top + 2 + d, color: COLORS[color] });
    }
  });
}

function codeRows(frame) {
  return (d) => {
    const position = d + frame;
    if (position % 2) return null;
    return CODE_CELLS[(position / 2) % CODE_CELLS.length];
  };
}

function terminalRows(screen, frame) {
  const visibleRows = Math.max(1, Math.floor((Math.min(...screen.map(({ top, bottom }) => bottom - top)) - 3) / 2));
  let budget = frame * TYPE_SPEED;
  const typed = [];
  for (const cells of TERMINAL_CELLS) {
    const shown = cells.slice(0, Math.max(0, budget));
    typed.push(shown);
    budget -= cells.length;
    if (budget <= 0) break;
  }
  // Curseur clignotant au bout de la dernière ligne tapée.
  if (Math.floor(frame / 4) % 2 === 0) {
    const last = typed[typed.length - 1];
    const end = last.length + (last.length ? 1 : 0);
    last[end] = 'cursor';
    last[end + 1] = 'cursor';
  }
  const rows = typed.slice(-visibleRows);
  return (d) => (d % 2 ? null : rows[d / 2]);
}

// Pixels à peindre pour une image : fond allumé sur tout le masque, puis le contenu des écrans.
export function screenFrame(screens, frame) {
  const pixels = [];
  screens.forEach((screen) => screen.forEach(({ x, top, bottom }) => {
    for (let y = top; y <= bottom; y += 1) pixels.push({ x, y, color: COLORS.background });
  }));
  const [code, terminal] = screens;
  if (code) paintRows(code, codeRows(frame), pixels);
  if (terminal) paintRows(terminal, terminalRows(terminal, frame), pixels);
  return pixels;
}
