import test from 'node:test';
import assert from 'node:assert/strict';
import { createRandom, generateStars } from '../src/title/random.mjs';
import { computeTitleView, TITLE_WORLD } from '../src/title/layout.mjs';
import { buildScenery, ANCHORS, SPRITES, TITLE_LAYERS, GROUND_Y } from '../src/title/scenery.mjs';
import { TITLE_ART } from '../src/config/assets.js';

const SCREENS = [[1920, 1080], [1366, 768], [2560, 1080], [390, 844], [412, 915], [360, 800], [320, 568], [768, 1024], [844, 390], [667, 375]];
const inside = (view, { x, y, w, h }) => x >= view.left && y >= view.top && x + w <= view.left + view.viewWidth && y + h <= view.top + view.viewHeight;

test('seeded randomness repeats and stays in range', () => {
  const a = createRandom(7);
  const b = createRandom(7);
  const values = Array.from({ length: 50 }, () => a());
  assert.deepEqual(values, Array.from({ length: 50 }, () => b()));
  assert.ok(values.every((value) => value >= 0 && value < 1));
  assert.notDeepEqual(values, Array.from({ length: 50 }, createRandom(8)));
});

test('stars fill the sky and avoid the moon', () => {
  const avoid = [{ x: 404, y: 42, r: 16 }];
  const stars = generateStars(3, { width: 480, height: 150, count: 70, avoid });
  assert.equal(stars.length, 70);
  assert.deepEqual(stars, generateStars(3, { width: 480, height: 150, count: 70, avoid }));
  for (const { x, y } of stars) {
    assert.ok(Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < 480 && y >= 0 && y < 150);
    assert.ok(Math.hypot(x - 404, y - 42) > 16);
  }
});

test('uses an integer zoom that covers the screen inside the world', () => {
  for (const [width, height] of [...SCREENS, [200, 150], [3840, 2160]]) {
    const view = computeTitleView(width, height, ANCHORS.focus);
    assert.ok(Number.isInteger(view.zoom) && view.zoom >= 1, `${width}x${height}`);
    assert.ok(view.viewWidth <= TITLE_WORLD.width && view.viewHeight <= TITLE_WORLD.height, `${width}x${height}`);
    assert.ok(view.left >= 0 && view.top >= 0, `${width}x${height}`);
    assert.equal(view.centerX, view.left + view.viewWidth / 2);
  }
  assert.equal(computeTitleView(1920, 1080, ANCHORS.focus).zoom, 4);
  assert.equal(computeTitleView(390, 844, ANCHORS.focus).zoom, 3);
});

test('keeps the lit window and the front door visible on common screens', () => {
  for (const [width, height] of SCREENS) {
    const view = computeTitleView(width, height, ANCHORS.focus);
    assert.ok(inside(view, ANCHORS.window), `window ${width}x${height}`);
    assert.ok(inside(view, ANCHORS.door), `door ${width}x${height}`);
  }
});

test("shows the Jet d'eau rising from the lake on landscape screens", () => {
  const { jet, lake } = ANCHORS;
  assert.ok(jet.x - 2 >= lake.x && jet.x + 3 <= lake.x + lake.w && jet.y >= lake.y && jet.y <= lake.y + lake.h);
  assert.ok(lake.x > TITLE_WORLD.width / 2, 'lake on the right');
  for (const [width, height] of SCREENS.filter(([w, h]) => w > h)) {
    const view = computeTitleView(width, height, ANCHORS.focus);
    assert.ok(inside(view, { x: jet.x - 2, y: jet.y - jet.h, w: 5, h: jet.h }), `jet ${width}x${height}`);
  }
});

test('invalid screen sizes fall back to the whole world', () => {
  for (const [width, height] of [[0, 800], [Number.NaN, 600], [-5, -5]]) {
    const view = computeTitleView(width, height, ANCHORS.focus);
    assert.deepEqual([view.zoom, view.viewWidth, view.viewHeight], [1, 480, 300]);
  }
});

test('builds the same night for the same seed', () => {
  assert.deepEqual(buildScenery(7), buildScenery(7));
  assert.notDeepEqual(buildScenery(7).layers.city, buildScenery(8).layers.city);
  assert.deepEqual(Object.keys(TITLE_ART), TITLE_LAYERS);
});

test('draws only integer pixels inside the world and the sprites', () => {
  const check = (rects, width, height, label) => {
    assert.ok(rects.length > 0, label);
    for (const { x, y, w, h, color } of rects) {
      assert.ok([x, y, w, h].every(Number.isInteger) && w > 0 && h > 0, `${label} ${x},${y}`);
      assert.ok(x >= 0 && y >= 0 && x + w <= width && y + h <= height, `${label} ${x},${y},${w},${h}`);
      assert.match(color, /^#[0-9a-f]{6}$/i);
    }
  };
  const { layers } = buildScenery();
  TITLE_LAYERS.forEach((name) => check(layers[name], TITLE_WORLD.width, TITLE_WORLD.height, name));
  Object.entries(SPRITES).forEach(([name, sprite]) => check(sprite.rects, sprite.width, sprite.height, name));
});

test('places the lit window in the building and the door on the street', () => {
  const { window: win, door } = ANCHORS;
  assert.ok(win.x >= 176 && win.x + win.w <= 286 && win.y >= 90 && win.y + win.h <= GROUND_Y);
  assert.ok(door.x >= 176 && door.x + door.w <= 286 && door.y + door.h === GROUND_Y);
});

test('the title scene no longer has a basketball hoop', () => {
  assert.deepEqual(TITLE_LAYERS, ['sky', 'city', 'building', 'street', 'foreground']);
  ['hoop', 'rim', 'ball'].forEach((name) => assert.equal(ANCHORS[name], undefined, name));
  assert.equal(SPRITES.ball, undefined);
});
