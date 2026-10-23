import test from 'node:test';
import assert from 'node:assert/strict';
import { ROOM_ZONES, SEATS, FURNITURE } from '../src/data/room.js';
import { PLAYER } from '../src/config/player.js';
import { ACTION_ICONS } from '../src/config/interface.js';
import { normalizeZones } from '../src/systems/interactions.mjs';

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
