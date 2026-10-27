import test from 'node:test';
import assert from 'node:assert/strict';
import { computeView, computeBounds } from '../src/config/viewport.mjs';

test('reference viewport shows 640 by 480 without zoom', () => {
  assert.deepEqual(computeView(640, 480), { worldWidth: 640, worldHeight: 480, zoom: 1 });
});

test('portrait and landscape preserve aspect ratio and world scale', () => {
  for (const [width, height] of [[360, 800], [800, 360], [1440, 900]]) {
    const view = computeView(width, height);
    assert.equal(Math.min(view.worldWidth, view.worldHeight), 480);
    assert.ok(Math.abs(view.worldWidth / view.worldHeight - width / height) < 1e-10);
    assert.ok(view.zoom > 0);
    assert.ok(Math.abs(view.worldWidth * view.zoom - width) < 1e-10);
    assert.ok(Math.abs(view.worldHeight * view.zoom - height) < 1e-10);
  }
});

test('invalid screen measurements fall back to the reference', () => {
  for (const dimensions of [[0, 480], [-1, 10], [NaN, 800], [360, Infinity]]) {
    assert.deepEqual(computeView(...dimensions), { worldWidth: 640, worldHeight: 480, zoom: 1 });
  }
});

test('a map smaller than the viewport is centered with symmetric padding', () => {
  const portrait = computeBounds(640, 480, computeView(360, 800));
  assert.equal(portrait.x, 0);
  assert.ok(portrait.y < 0);
  assert.ok(Math.abs((portrait.height - 480) / 2 + portrait.y) < 1e-10);
  const landscape = computeBounds(640, 480, computeView(800, 360));
  assert.equal(landscape.y, 0);
  assert.ok(landscape.x < 0);
  assert.ok(Math.abs((landscape.width - 640) / 2 + landscape.x) < 1e-10);
});

test('on a phone the map covers the whole screen and the camera scrolls', () => {
  const map = { width: 512, height: 384 };
  for (const [width, height] of [[698, 326], [360, 800]]) {
    const view = computeView(width, height, map);
    assert.ok(view.worldWidth <= map.width + 1e-10 && view.worldHeight <= map.height + 1e-10);
    assert.ok(Math.abs(view.worldWidth - map.width) < 1e-10 || Math.abs(view.worldHeight - map.height) < 1e-10);
    assert.deepEqual(computeBounds(map.width, map.height, view), { x: 0, y: 0, width: map.width, height: map.height });
  }
});

test('large screens keep the whole map visible', () => {
  const map = { width: 512, height: 384 };
  assert.deepEqual(computeView(1440, 900, map), computeView(1440, 900));
});
