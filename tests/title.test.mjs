import test from 'node:test';
import assert from 'node:assert/strict';
import { createRandom, generateStars } from '../src/title/random.mjs';
import { computeTitleView, TITLE_WORLD } from '../src/title/layout.mjs';
import { buildScenery, ANCHORS, SPRITES, TITLE_LAYERS, GROUND_Y } from '../src/title/scenery.mjs';
import { planShot, shotArc, MAKE_CHANCE } from '../src/title/shot.mjs';
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

test('keeps the lit window, the hoop and the ball visible on common screens', () => {
  const { x, y, r } = ANCHORS.ball;
  for (const [width, height] of SCREENS) {
    const view = computeTitleView(width, height, ANCHORS.focus);
    assert.ok(inside(view, ANCHORS.window), `window ${width}x${height}`);
    assert.ok(inside(view, ANCHORS.hoop), `hoop ${width}x${height}`);
    assert.ok(inside(view, { x: x - r, y: y - r, w: r * 2, h: r * 2 }), `ball ${width}x${height}`);
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

test('places the lit window in the building and the ball on the court', () => {
  const { window: win, ball } = ANCHORS;
  assert.ok(win.x >= 176 && win.x + win.w <= 286 && win.y >= 90 && win.y + win.h <= GROUND_Y);
  assert.ok(ball.y - ball.r >= GROUND_Y && ball.y + ball.r < 280);
});

test('a low roll scores in the middle of the rim', () => {
  const shot = planShot(0.1, ANCHORS);
  assert.equal(shot.made, true);
  assert.deepEqual(shotArc(shot, 0), { x: 268, y: 262 });
  assert.deepEqual(shotArc(shot, 1), { x: 298, y: 197 });
  assert.equal(planShot(MAKE_CHANCE - 0.01, ANCHORS).made, true);
});

test('a high or invalid roll misses on the rim edge', () => {
  for (const roll of [MAKE_CHANCE, 0.99, 1.5, -1, Number.NaN, undefined]) {
    const shot = planShot(roll, ANCHORS);
    assert.equal(shot.made, false, String(roll));
    assert.deepEqual(shotArc(shot, 1), { x: 305, y: 196 });
  }
});

test('the arc rises above both ends and clamps time', () => {
  const shot = planShot(0.1, ANCHORS);
  assert.ok(shotArc(shot, 0.5).y < Math.min(shot.from.y, shot.to.y) - 10);
  assert.deepEqual(shotArc(shot, -1), shotArc(shot, 0));
  assert.deepEqual(shotArc(shot, 2), shotArc(shot, 1));
  assert.deepEqual(shotArc(shot, Number.NaN), shotArc(shot, 0));
});
