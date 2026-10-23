// Moteur d'échecs sans dépendance : règles complètes (roque, prise en passant, promotion, échec,
// mat, pat) et une petite IA. Les cases vont de 0 (a8, en haut à gauche) à 63 (h1).
const FILES = 'abcdefgh';
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const KNIGHT = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KING = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const STRAIGHT = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const DIAGONAL = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

export const opponent = (color) => (color === 'w' ? 'b' : 'w');
export const squareName = (square) => `${FILES[square % 8]}${8 - Math.floor(square / 8)}`;
export const squareIndex = (name) => (8 - Number(name[1])) * 8 + FILES.indexOf(name[0]);
const at = (row, col) => (row >= 0 && row < 8 && col >= 0 && col < 8 ? row * 8 + col : -1);

export function fromFEN(fen) {
  const [placement, turn, castling, ep, halfmove = '0'] = fen.split(' ');
  const board = Array(64).fill(null);
  placement.split('/').forEach((rank, row) => {
    let col = 0;
    for (const char of rank) {
      if (/\d/.test(char)) col += Number(char);
      else board[row * 8 + col++] = { type: char.toLowerCase(), color: char === char.toUpperCase() ? 'w' : 'b' };
    }
  });
  const rights = { K: castling.includes('K'), Q: castling.includes('Q'), k: castling.includes('k'), q: castling.includes('q') };
  return { board, turn, castling: rights, ep: ep === '-' ? null : squareIndex(ep), halfmove: Number(halfmove) };
}

export const newGame = () => fromFEN(START);

export function isAttacked(board, square, by) {
  const row = Math.floor(square / 8);
  const col = square % 8;
  const is = (target, types) => target >= 0 && board[target]?.color === by && types.includes(board[target].type);
  const pawnRow = by === 'w' ? row + 1 : row - 1;
  if (is(at(pawnRow, col - 1), 'p') || is(at(pawnRow, col + 1), 'p')) return true;
  if (KNIGHT.some(([dr, dc]) => is(at(row + dr, col + dc), 'n'))) return true;
  if (KING.some(([dr, dc]) => is(at(row + dr, col + dc), 'k'))) return true;
  for (const [dirs, types] of [[STRAIGHT, 'rq'], [DIAGONAL, 'bq']]) {
    for (const [dr, dc] of dirs) {
      for (let r = row + dr, c = col + dc; at(r, c) >= 0; r += dr, c += dc) {
        const piece = board[r * 8 + c];
        if (!piece) continue;
        if (piece.color === by && types.includes(piece.type)) return true;
        break;
      }
    }
  }
  return false;
}

const kingSquare = (board, color) => board.findIndex((piece) => piece?.type === 'k' && piece.color === color);

function pseudoMoves(state) {
  const { board, turn, castling, ep } = state;
  const enemy = opponent(turn);
  const moves = [];
  const add = (from, to, extra = {}) => moves.push({ from, to, piece: board[from].type, captured: board[to]?.type ?? null, ...extra });
  board.forEach((piece, from) => {
    if (!piece || piece.color !== turn) return;
    const row = Math.floor(from / 8);
    const col = from % 8;
    if (piece.type === 'p') {
      const forward = turn === 'w' ? -1 : 1;
      const lastRow = turn === 'w' ? 0 : 7;
      const push = (to, extra) => {
        if (Math.floor(to / 8) === lastRow) ['q', 'r', 'b', 'n'].forEach((promotion) => add(from, to, { ...extra, promotion }));
        else add(from, to, extra);
      };
      const one = at(row + forward, col);
      if (one >= 0 && !board[one]) {
        push(one);
        const two = at(row + forward * 2, col);
        if (row === (turn === 'w' ? 6 : 1) && !board[two]) add(from, two, { double: true });
      }
      [col - 1, col + 1].forEach((c) => {
        const target = at(row + forward, c);
        if (target < 0) return;
        if (board[target]?.color === enemy) push(target);
        else if (target === ep) add(from, target, { enPassant: true, captured: 'p' });
      });
      return;
    }
    if (piece.type === 'n' || piece.type === 'k') {
      (piece.type === 'n' ? KNIGHT : KING).forEach(([dr, dc]) => {
        const target = at(row + dr, col + dc);
        if (target >= 0 && board[target]?.color !== turn) add(from, target);
      });
      if (piece.type === 'k') {
        const home = turn === 'w' ? 60 : 4;
        const [kingSide, queenSide] = turn === 'w' ? ['K', 'Q'] : ['k', 'q'];
        const safe = (...squares) => squares.every((square) => !isAttacked(board, square, enemy));
        const rook = (square) => board[square]?.type === 'r' && board[square].color === turn;
        if (from === home && castling[kingSide] && !board[home + 1] && !board[home + 2] && rook(home + 3) && safe(home, home + 1, home + 2)) {
          add(from, home + 2, { castle: 'K' });
        }
        if (from === home && castling[queenSide] && !board[home - 1] && !board[home - 2] && !board[home - 3] && rook(home - 4) && safe(home, home - 1, home - 2)) {
          add(from, home - 2, { castle: 'Q' });
        }
      }
      return;
    }
    const dirs = piece.type === 'r' ? STRAIGHT : piece.type === 'b' ? DIAGONAL : [...STRAIGHT, ...DIAGONAL];
    dirs.forEach(([dr, dc]) => {
      for (let r = row + dr, c = col + dc; at(r, c) >= 0; r += dr, c += dc) {
        const target = r * 8 + c;
        if (board[target]?.color === turn) break;
        add(from, target);
        if (board[target]) break;
      }
    });
  });
  return moves;
}

// Position après un coup (l'état d'origine n'est pas modifié).
export function makeMove(state, move) {
  const board = state.board.slice();
  const piece = board[move.from];
  board[move.to] = move.promotion ? { type: move.promotion, color: piece.color } : piece;
  board[move.from] = null;
  if (move.enPassant) board[move.to + (piece.color === 'w' ? 8 : -8)] = null;
  if (move.castle) {
    const [rookFrom, rookTo] = move.castle === 'K' ? [move.to + 1, move.to - 1] : [move.to - 2, move.to + 1];
    board[rookTo] = board[rookFrom];
    board[rookFrom] = null;
  }
  const castling = { ...state.castling };
  if (piece.type === 'k') {
    if (piece.color === 'w') castling.K = castling.Q = false;
    else castling.k = castling.q = false;
  }
  const corners = { 63: 'K', 56: 'Q', 7: 'k', 0: 'q' };
  [move.from, move.to].forEach((square) => { if (corners[square]) castling[corners[square]] = false; });
  return {
    board,
    turn: opponent(state.turn),
    castling,
    ep: move.double ? (move.from + move.to) / 2 : null,
    halfmove: piece.type === 'p' || move.captured ? 0 : state.halfmove + 1,
  };
}

export function legalMoves(state) {
  return pseudoMoves(state).filter((move) => {
    const next = makeMove(state, move);
    return !isAttacked(next.board, kingSquare(next.board, state.turn), next.turn);
  });
}

export const inCheck = (state) => isAttacked(state.board, kingSquare(state.board, state.turn), opponent(state.turn));

function insufficientMaterial(board) {
  const others = board.filter((piece) => piece && piece.type !== 'k');
  return others.length === 0 || (others.length === 1 && 'nb'.includes(others[0].type));
}

// 'checkmate' | 'stalemate' | 'draw' | 'check' | 'playing'
export function gameStatus(state) {
  const check = inCheck(state);
  if (legalMoves(state).length === 0) return check ? 'checkmate' : 'stalemate';
  if (state.halfmove >= 100 || insufficientMaterial(state.board)) return 'draw';
  return check ? 'check' : 'playing';
}

export const isOver = (status) => ['checkmate', 'stalemate', 'draw'].includes(status);

// Évaluation du point de vue du camp qui joue : matériel, pions avancés, pièces centralisées.
function evaluate(state) {
  let score = 0;
  state.board.forEach((piece, square) => {
    if (!piece) return;
    const row = Math.floor(square / 8);
    const col = square % 8;
    let value = VALUES[piece.type];
    if (piece.type === 'p') value += (piece.color === 'w' ? 6 - row : row - 1) * 6;
    if ('nbq'.includes(piece.type)) value += 12 - (Math.abs(3.5 - row) + Math.abs(3.5 - col)) * 3;
    score += piece.color === state.turn ? value : -value;
  });
  return score;
}

const ordered = (moves) => moves.slice().sort((a, b) => (b.captured ? VALUES[b.captured] : 0) - (a.captured ? VALUES[a.captured] : 0));

function negamax(state, depth, alpha, beta) {
  if (depth === 0) return evaluate(state);
  const moves = legalMoves(state);
  if (moves.length === 0) return inCheck(state) ? -100000 - depth : 0;
  let best = -Infinity;
  for (const move of ordered(moves)) {
    best = Math.max(best, -negamax(makeMove(state, move), depth - 1, -beta, -alpha));
    alpha = Math.max(alpha, best);
    if (alpha >= beta) break;
  }
  return best;
}

// Choisit un coup : recherche à `depth` demi-coups, `noise` ajoute du hasard pour varier les parties.
export function chooseMove(state, { depth = 2, noise = 0, random = Math.random } = {}) {
  let best = null;
  let bestScore = -Infinity;
  for (const move of ordered(legalMoves(state))) {
    const score = -negamax(makeMove(state, move), depth - 1, -Infinity, Infinity) + noise * (random() * 2 - 1);
    if (score > bestScore) {
      best = move;
      bestScore = score;
    }
  }
  return best;
}
