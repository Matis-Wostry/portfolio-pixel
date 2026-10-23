import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, fromFEN, legalMoves, makeMove, gameStatus, chooseMove, squareIndex, squareName } from '../src/chess/engine.mjs';

const perft = (state, depth) => (depth === 0 ? 1 : legalMoves(state).reduce((sum, move) => sum + perft(makeMove(state, move), depth - 1), 0));
const find = (state, from, to, promotion) => legalMoves(state).find((move) => move.from === squareIndex(from) && move.to === squareIndex(to)
  && (!promotion || move.promotion === promotion));

test('square names match the board layout', () => {
  assert.equal(squareName(0), 'a8');
  assert.equal(squareName(63), 'h1');
  assert.equal(squareIndex('e2'), 52);
});

test('move generation matches the reference counts from the start position', () => {
  assert.equal(perft(newGame(), 1), 20);
  assert.equal(perft(newGame(), 2), 400);
  assert.equal(perft(newGame(), 3), 8902);
});

test('castling, en passant and promotions match the Kiwipete reference counts', () => {
  const kiwipete = fromFEN('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1');
  assert.equal(perft(kiwipete, 1), 48);
  assert.equal(perft(kiwipete, 2), 2039);
  const endgame = fromFEN('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1');
  assert.equal(perft(endgame, 3), 2812);
});

test('special moves update the board', () => {
  let state = fromFEN('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  state = makeMove(state, find(state, 'e1', 'g1'));
  assert.equal(state.board[squareIndex('f1')].type, 'r');
  assert.equal(state.castling.K || state.castling.Q, false);
  state = fromFEN('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1');
  state = makeMove(state, find(state, 'e5', 'd6'));
  assert.equal(state.board[squareIndex('d5')], null);
  state = fromFEN('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
  state = makeMove(state, find(state, 'a7', 'a8', 'q'));
  assert.equal(state.board[squareIndex('a8')].type, 'q');
});

test('detects mate, stalemate and check', () => {
  assert.equal(gameStatus(fromFEN('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1')), 'checkmate');
  assert.equal(gameStatus(fromFEN('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')), 'stalemate');
  assert.equal(gameStatus(fromFEN('4k3/8/8/8/8/8/8/4KR2 w - - 0 1')), 'playing');
  assert.equal(gameStatus(fromFEN('4k3/8/8/8/8/8/8/K3R3 b - - 0 1')), 'check');
  assert.equal(gameStatus(fromFEN('4k3/8/8/8/8/8/8/4K3 w - - 0 1')), 'draw');
});

test('the computer takes a free queen and finds mate in one', () => {
  const free = fromFEN('4k3/8/8/3q4/4P3/8/8/4K3 w - - 0 1');
  assert.equal(squareName(chooseMove(free).to), 'd5');
  const mate = fromFEN('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1');
  assert.equal(squareName(chooseMove(mate).to), 'a8');
});
