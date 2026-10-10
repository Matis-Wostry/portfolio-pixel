import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDirection } from '../src/input/direction.mjs';

test('idle and malformed input cannot move the player', () => {
  assert.deepEqual(resolveDirection({}, {}), { x: 0, y: 0 });
  assert.deepEqual(resolveDirection({}, { x: NaN, y: Infinity }), { x: 0, y: 0 });
});

test('keyboard takes priority and diagonal movement has unit length', () => {
  const direction = resolveDirection({ x: 1, y: -1 }, { x: -1, y: 0 });
  assert.ok(direction.x > 0 && direction.y < 0);
  assert.ok(Math.abs(Math.hypot(direction.x, direction.y) - 1) < 1e-10);
});

test('analog amplitude is retained and excessive input is capped', () => {
  assert.deepEqual(resolveDirection({}, { x: 0.4, y: 0 }), { x: 0.4, y: 0 });
  assert.deepEqual(resolveDirection({}, { x: 4, y: 0 }), { x: 1, y: 0 });
});
