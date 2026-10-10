import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeZone, normalizeZones, selectTarget } from '../src/systems/interactions.mjs';

const zone = (id, x = 100) => ({ id, label: id, action: 'projets', x, y: 100, width: 32, height: 32, radius: 32 });

test('normalizes Tiled properties and supplies the default radius', () => {
  const object = { x: 100, y: 100, width: 32, height: 32, properties: [
    { name: 'id', value: 'bureau' }, { name: 'label', value: 'Bureau' }, { name: 'action', value: 'projets' },
  ] };
  assert.deepEqual(normalizeZone(object), { ...zone('bureau'), label: 'Bureau' });
});

test('invalid rectangles, actions and rotated shapes are rejected', () => {
  for (const invalid of [{ width: -1 }, { x: NaN }, { radius: -1 }, { rotation: 10 }, { ellipse: true }, { action: 'unknown' }, { id: '' }]) {
    assert.equal(normalizeZone({ ...zone('a'), ...invalid }), null);
  }
});

test('interaction distance is measured to the nearest edge, inclusive at 32', () => {
  assert.equal(selectTarget([zone('a')], { x: 164, y: 110 })?.id, 'a');
  assert.equal(selectTarget([zone('a')], { x: 165, y: 110 }), null);
  assert.equal(selectTarget([zone('a')], { x: 110, y: 110 })?.id, 'a');
});

test('nearest target wins with a stable identifier tie break', () => {
  assert.equal(selectTarget([zone('b'), zone('a')], { x: 100, y: 110 })?.id, 'a');
  assert.equal(selectTarget([zone('b', 150), zone('a')], { x: 145, y: 110 })?.id, 'b');
  assert.equal(selectTarget([zone('a')], { x: NaN, y: 0 }), null);
});

test('malformed properties do not crash the room and duplicate ids are ignored', () => {
  assert.equal(normalizeZone({ ...zone('a'), properties: 'invalid' }), null);
  assert.equal(normalizeZone({ ...zone('a'), properties: [null] }), null);
  const warnings = [];
  const result = normalizeZones([zone('a'), zone('a', 200), zone('b'), { ...zone('c'), action: 'invalid' }], (object) => warnings.push(object));
  assert.deepEqual(result.map(({ id }) => id), ['a', 'b']);
  assert.equal(warnings.length, 2);
});
