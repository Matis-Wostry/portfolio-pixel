import test from 'node:test';
import assert from 'node:assert/strict';
import { createRandom } from '../src/title/random.mjs';
import { flickerSequence, nextToggle, outline } from '../src/title/lights.mjs';
import { buildScenery, SPRITES } from '../src/title/scenery.mjs';

const many = (count, make) => Array.from({ length: count }, (_, i) => make(i));

test('flicker steps stay between dark and full light with positive durations', () => {
  const random = createRandom(4);
  for (const sequence of many(500, () => flickerSequence(random, { stutterChance: 0.2, outageChance: 0.1 }))) {
    assert.ok(sequence.length > 0);
    for (const { level, duration } of sequence) {
      assert.ok(level >= 0 && level <= 1, String(level));
      assert.ok(Number.isFinite(duration) && duration > 0, String(duration));
    }
  }
});

test('flicker mostly hums near full light and sometimes stutters or cuts out', () => {
  const random = createRandom(9);
  const sequences = many(2000, () => flickerSequence(random, { hum: 0.1, stutterChance: 0.05, outageChance: 0.02 }));
  const steady = sequences.filter((sequence) => sequence.length === 1);
  assert.ok(steady.length > 1700);
  assert.ok(steady.every(([step]) => step.level >= 0.9));
  assert.ok(sequences.some((sequence) => sequence.some((step) => step.level === 0)), 'outage');
  assert.ok(sequences.some((sequence) => sequence.length > 1 && sequence.every((step) => step.level > 0)), 'stutter');
  assert.deepEqual(flickerSequence(createRandom(3)), flickerSequence(createRandom(3)));
});

test('a calm flicker never stutters', () => {
  const random = createRandom(2);
  for (const sequence of many(300, () => flickerSequence(random, { hum: 0.05, stutterChance: 0, outageChance: 0 }))) {
    assert.equal(sequence.length, 1);
    assert.ok(sequence[0].level >= 0.95);
  }
});

test('window toggles keep the street lit within bounds and skip locked windows', () => {
  const random = createRandom(5);
  let lit = [true, false, false, true, false, false];
  for (let i = 0; i < 500; i++) {
    const toggle = nextToggle(random, lit, { minLit: 1, maxLit: 3, locked: [0] });
    assert.ok(toggle, `step ${i}`);
    assert.notEqual(toggle.index, 0);
    assert.notEqual(toggle.lit, lit[toggle.index]);
    assert.ok(toggle.delay >= 1500 && toggle.delay <= 6000);
    lit = lit.map((value, index) => (index === toggle.index ? toggle.lit : value));
    const count = lit.filter(Boolean).length;
    assert.ok(count >= 1 && count <= 3, `count ${count}`);
  }
});

test('no toggle when every window is locked or empty', () => {
  assert.equal(nextToggle(createRandom(1), [true, false], { locked: [0, 1] }), null);
  assert.equal(nextToggle(createRandom(1), []), null);
});

test('outline surrounds a pixel pattern without touching it', () => {
  const ring = outline(['.n.', '...']);
  const cells = new Set(ring.map(({ x, y }) => `${x},${y}`));
  assert.ok(!cells.has('1,0'));
  ['0,0', '2,0', '1,-1', '0,1', '1,1', '2,1'].forEach((cell) => assert.ok(cells.has(cell), cell));
});

test('the scenery exposes switchable windows and city lights', () => {
  const { windows, cityLights } = buildScenery();
  assert.ok(windows.length >= 8);
  assert.ok(windows.some((win) => win.lit) && windows.some((win) => !win.lit));
  assert.ok(cityLights.length >= 12);
  for (const { x, y, w, h } of cityLights) assert.ok([x, y, w, h].every(Number.isInteger));
  ['neonGlow', 'litWindow', 'litWindowFlowers', 'lampPool'].forEach((name) => assert.ok(SPRITES[name], name));
});
