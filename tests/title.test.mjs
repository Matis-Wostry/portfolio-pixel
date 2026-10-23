import test from 'node:test';
import assert from 'node:assert/strict';
import { createRandom, generateStars } from '../scripts/intro/random.mjs';
import { computeTitleView, TITLE_WORLD } from '../src/title/layout.mjs';
import { buildScenery, ANCHORS, SPRITES, TITLE_LAYERS, GROUND_Y, STAGE_X } from '../scripts/intro/scenery.mjs';
import { BUILDING } from '../scripts/intro/building.mjs';
import { flatten } from '../scripts/intro/pixels.mjs';
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

const BROWSERS = [[1920, 950], [1366, 657], [1536, 730], [1280, 640], [1440, 780], [2560, 1300], [1680, 920]];

test('uses the smallest zoom that covers the screen inside the world', () => {
  for (const [width, height] of [...SCREENS, ...BROWSERS, [200, 150], [3840, 2160]]) {
    const view = computeTitleView(width, height, ANCHORS.focus);
    assert.ok(view.zoom > 0, `${width}x${height}`);
    assert.ok(view.viewWidth <= TITLE_WORLD.width + 1e-9 && view.viewHeight <= TITLE_WORLD.height + 1e-9, `${width}x${height}`);
    assert.ok(view.left >= 0 && view.top >= 0, `${width}x${height}`);
    assert.ok(Math.abs(view.viewWidth - TITLE_WORLD.width) < 1e-9 || Math.abs(view.viewHeight - TITLE_WORLD.height) < 1e-9, `covers ${width}x${height}`);
    assert.equal(view.centerX, view.left + view.viewWidth / 2);
  }
});

test('shows the whole height of the scene in landscape browser windows', () => {
  assert.equal(TITLE_WORLD.width, 720);
  for (const [width, height] of [...BROWSERS, ...SCREENS.filter(([w, h]) => w > h && w / h <= 2.4)]) {
    const view = computeTitleView(width, height, ANCHORS.focus);
    assert.ok(Math.abs(view.viewHeight - TITLE_WORLD.height) < 1e-9, `${width}x${height} shows ${view.viewHeight} rows`);
  }
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
    assert.deepEqual([view.zoom, view.viewWidth, view.viewHeight], [1, 720, 300]);
  }
});

test('builds the same night for the same seed', () => {
  assert.deepEqual(buildScenery(7), buildScenery(7));
  assert.notDeepEqual(buildScenery(7).layers.city, buildScenery(8).layers.city);
  assert.deepEqual(Object.keys(TITLE_ART), TITLE_LAYERS);
});

test('draws only integer pixels inside the world and the sprites', () => {
  const check = (items, width, height, label) => {
    const rects = flatten(items);
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
  const left = BUILDING.left + STAGE_X;
  const right = BUILDING.right + STAGE_X;
  assert.ok(win.x >= left && win.x + win.w <= right && win.y >= 90 && win.y + win.h <= GROUND_Y);
  assert.ok(door.x >= left && door.x + door.w <= right && door.y + door.h === GROUND_Y);
});

test('the title scene no longer has a basketball hoop', () => {
  assert.deepEqual(TITLE_LAYERS, ['sky', 'city', 'building', 'street', 'foreground']);
  ['hoop', 'rim', 'ball'].forEach((name) => assert.equal(ANCHORS[name], undefined, name));
  assert.equal(SPRITES.ball, undefined);
});

test('the street has animated passers, a dog and wet reflections to draw', () => {
  ['dogStand', 'dogWag', 'dogSit', 'dogSniff', 'cyclist0', 'cyclist1', 'tram', 'leaf'].forEach((name) => assert.ok(SPRITES[name], name));
  ['dogStand', 'dogWag', 'dogSit', 'dogSniff'].forEach((name) => assert.deepEqual([SPRITES[name].width, SPRITES[name].height], [19, 13], name));
  const { dog, reflections } = ANCHORS;
  assert.ok(dog.y + 13 <= 262 && dog.y + 13 >= GROUND_Y, 'dog stands on the sidewalk');
  assert.ok(reflections.length >= 4);
  for (const { x, color } of reflections) {
    assert.ok(Number.isInteger(x) && x >= 0 && x < TITLE_WORLD.width);
    assert.ok(SPRITES[`reflection-${color}`], color);
  }
});

test('the street has at least two lit lamps and six trees that never hide the Jet d\'eau', () => {
  const { lamps, trees, jet, reflections } = ANCHORS;
  assert.ok(lamps.length >= 2 && trees.length >= 6);
  for (const tree of trees) assert.ok(tree.x + 16 < jet.x - 12 || tree.x - 16 > jet.x + 13, `tree ${tree.x}`);
  lamps.forEach((lamp, index) => {
    assert.ok(reflections.some((reflection) => reflection.light === 'lamp' && reflection.column === index && reflection.x === lamp.x), `lamp ${index}`);
  });
});
