import test from 'node:test';
import assert from 'node:assert/strict';
import { ROOM, TILE, ROOM_ZONES, SEATS, FURNITURE, CHESS_TABLE, PAPER_SHOT } from '../src/data/room.js';
import { interactionCue } from '../src/systems/cues.mjs';
import { armsBehindFurniture } from '../src/systems/arms.mjs';
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

const solidRects = () => FURNITURE.flatMap((item) => (item.solid ?? []).map(([x, y, width, height]) => ({
  left: item.x + x, right: item.x + x + width, top: item.y + y, bottom: item.y + y + height,
})));

// La bulle doit rester à l'écran quand le joueur est à portée, même avec la chambre plein écran sur téléphone (844 × 390).
test('the bookcase cue stays on screen while its zone is in reach on a landscape phone', () => {
  const zoom = Math.max(844 / (ROOM.columns * TILE), 390 / (ROOM.rows * TILE));
  const halfView = 390 / zoom / 2;
  // Bulle de 26 px, décalée de 2 px et qui flotte de 4 px vers le haut.
  const BUBBLE_TOP = 15;
  const zone = normalizeZones(ROOM_ZONES).find(({ id }) => id === 'bibliotheque');
  const { y } = interactionCue(zone);
  const farthestFeet = zone.y + zone.height + zone.radius;
  const cameraTop = Math.max(0, farthestFeet - halfView);
  assert.ok(y - BUBBLE_TOP >= cameraTop, `bulle à ${y}, haut de l'écran à ${cameraTop}`);
});

test('standing up in any direction lands the player clear of every obstacle', () => {
  const { width, height, x: hitX, y: hitY } = PLAYER.hitbox;
  SEATS.forEach((seat) => {
    assert.deepEqual(Object.keys(seat.exits).sort(), ['down', 'left', 'right'], seat.id);
    Object.entries(seat.exits).forEach(([direction, exit]) => {
      const left = exit.x - PLAYER.frameWidth * PLAYER.origin.x + hitX;
      const top = exit.y - PLAYER.frameHeight * PLAYER.origin.y + hitY;
      const blocked = solidRects().some((solid) => left < solid.right && left + width > solid.left && top < solid.bottom && top + height > solid.top);
      assert.equal(blocked, false, `${seat.id} : sortie ${direction}`);
    });
    assert.ok(seat.exits.left.x < seat.x && seat.exits.right.x > seat.x && seat.exits.down.y > seat.y, seat.id);
  });
});

test('the arms only hide behind furniture that actually reaches their height', () => {
  const rects = FURNITURE.flatMap((item) => (item.solid ?? []).map(([x, y, width]) => ({
    left: item.x + x, right: item.x + x + width, top: item.y + y, imageTop: item.y,
  })));
  // Bras gauche à côté de la bibliothèque : le coin jeu est 150 px plus bas, il ne compte pas.
  assert.equal(armsBehindFurniture(rects, { from: 68, to: 76, feet: 105, armsBottom: 88 }), false);
  // Derrière le tableau, au-dessus de son empreinte et à hauteur de son image : les bras passent derrière.
  assert.equal(armsBehindFurniture(rects, { from: 122, to: 130, feet: 100, armsBottom: 83 }), true);
  // Devant le même tableau, les pieds sous son empreinte : les bras restent visibles.
  assert.equal(armsBehindFurniture(rects, { from: 122, to: 130, feet: 180, armsBottom: 163 }), false);
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
