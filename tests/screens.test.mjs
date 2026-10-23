import test from 'node:test';
import assert from 'node:assert/strict';
import { findScreens, screenFrame, SCREEN_FRAMES } from '../src/objects/screens.mjs';

// Deux écrans inclinés en miroir, comme sur le bureau.
const width = 40;
const height = 30;
const alpha = new Uint8Array(width * height);
for (let x = 2; x < 18; x += 1) for (let y = 10 - Math.floor(x / 3); y < 26 - Math.floor(x / 3); y += 1) alpha[y * width + x] = 255;
for (let x = 22; x < 38; x += 1) for (let y = Math.floor(x / 3) - 3; y < Math.floor(x / 3) + 13; y += 1) alpha[y * width + x] = 255;

test('screen columns are grouped per monitor', () => {
  const screens = findScreens(alpha, width, height);
  assert.equal(screens.length, 2);
  assert.deepEqual(screens.map((screen) => [screen[0].x, screen.at(-1).x]), [[2, 17], [22, 37]]);
});

test('every painted pixel stays inside the designer mask', () => {
  const screens = findScreens(alpha, width, height);
  for (let frame = 0; frame < SCREEN_FRAMES; frame += 1) {
    for (const { x, y } of screenFrame(screens, frame)) assert.ok(alpha[y * width + x] > 0, `${x},${y} @${frame}`);
  }
});

test('the screens change over time and the code loops seamlessly', () => {
  const screens = findScreens(alpha, width, height);
  const key = (frame) => JSON.stringify(screenFrame([screens[0]], frame));
  assert.notEqual(key(0), key(1));
  assert.equal(key(0), key(SCREEN_FRAMES));
});
