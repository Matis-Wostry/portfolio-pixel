import test from 'node:test';
import assert from 'node:assert/strict';
import { ROOM_ZONES, SEATS, FURNITURE, CHESS_TABLE, PAPER_SHOT } from '../src/data/room.js';
import { fromFEN, gameStatus, isAttacked } from '../src/chess/engine.mjs';
import { PLAYER } from '../src/config/player.js';
import { ACTION_ICONS } from '../src/config/interface.js';
import { normalizeZones } from '../src/systems/interactions.mjs';
import { arcPoint, planShot } from '../src/systems/paperShot.mjs';

test('every room zone is valid, including the seats', () => {
  const zones = normalizeZones(ROOM_ZONES, () => assert.fail('zone invalide'));
  assert.equal(zones.length, ROOM_ZONES.length);
  assert.equal(zones.filter(({ action }) => action === 'sit').length, SEATS.length);
});

test('seats use an existing pose and furniture, and every action has an icon', () => {
  const keys = new Set(FURNITURE.map(({ key }) => key));
  SEATS.forEach((seat) => {
    assert.ok(PLAYER.seated.includes(seat.pose), seat.id);
    assert.ok(keys.has(seat.furniture), seat.id);
  });
  ROOM_ZONES.forEach(({ action }) => assert.ok(ACTION_ICONS[action], action));
});

test('the table chess positions are light, legal and playable', () => {
  CHESS_TABLE.positions.forEach((fen) => {
    const state = fromFEN(fen);
    const pieces = state.board.filter(Boolean).length;
    assert.ok(pieces >= 8 && pieces <= 16, fen);
    assert.equal(gameStatus(state), 'playing', fen);
    const blackKing = state.board.findIndex((piece) => piece?.type === 'k' && piece.color === 'b');
    assert.equal(isAttacked(state.board, blackKing, 'w'), false, fen);
  });
});

test('a paper ball either drops through the net into the bin or bounces off the rim to the floor', () => {
  const hand = { x: 150, y: 140 };
  const made = planShot(hand, PAPER_SHOT, () => 0);
  assert.equal(made.made, true);
  assert.deepEqual(made.steps[0].from, hand);
  assert.deepEqual(made.steps.at(-1).to, PAPER_SHOT.bin);
  assert.ok(made.steps.some(({ layer }) => layer === 'net'));
  const missed = planShot(hand, PAPER_SHOT, () => 0.99);
  assert.equal(missed.made, false);
  assert.ok(missed.steps.at(-1).to.y >= PAPER_SHOT.floor);
  [made, missed].forEach(({ steps }) => steps.slice(1).forEach((step, index) => assert.deepEqual(step.from, steps[index].to)));
  // La cloche passe au-dessus de l'arceau avant de redescendre dedans.
  const apex = arcPoint(made.steps[0].from, made.steps[0].to, made.steps[0].height, 0.75);
  assert.ok(apex.y < PAPER_SHOT.rim.y);
});
