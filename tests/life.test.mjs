import test from 'node:test';
import assert from 'node:assert/strict';
import { createRandom } from '../src/title/random.mjs';
import { PASSERS, nextPassage, crossing, nextDogAction, DOG_ACTIONS } from '../src/title/life.mjs';

const many = (count, make) => Array.from({ length: count }, (_, i) => make(i));

test('passages pick a known passer, a direction, a pause and a speed in range', () => {
  const random = createRandom(6);
  const passages = many(600, () => nextPassage(random));
  for (const { kind, direction, delay, speed } of passages) {
    assert.ok(PASSERS[kind], kind);
    assert.ok(direction === 1 || direction === -1);
    assert.ok(delay >= 4000 && delay <= 12000, String(delay));
    assert.ok(speed >= PASSERS[kind].speed[0] && speed <= PASSERS[kind].speed[1], `${kind} ${speed}`);
  }
  Object.keys(PASSERS).forEach((kind) => assert.ok(passages.some((passage) => passage.kind === kind), kind));
  assert.ok(passages.some((passage) => passage.direction === 1) && passages.some((passage) => passage.direction === -1));
  assert.deepEqual(nextPassage(createRandom(2)), nextPassage(createRandom(2)));
});

test('a crossing starts and ends fully outside the scene', () => {
  for (const direction of [1, -1]) {
    const { fromX, toX, duration } = crossing({ direction, speed: 40 }, 480, 120);
    assert.ok(direction === 1 ? fromX <= -120 && toX >= 480 : fromX >= 480 && toX <= -120);
    assert.equal(duration, (Math.abs(toX - fromX) / 40) * 1000);
  }
});

test('the dog mostly wags and sometimes sits or sniffs', () => {
  const random = createRandom(8);
  const actions = many(1000, () => nextDogAction(random));
  for (const { action, duration } of actions) {
    assert.ok(DOG_ACTIONS.includes(action), action);
    assert.ok(duration >= 800 && duration <= 5000, String(duration));
  }
  const count = (name) => actions.filter(({ action }) => action === name).length;
  assert.ok(count('wag') > count('sit') && count('wag') > count('sniff'));
  DOG_ACTIONS.forEach((name) => assert.ok(count(name) > 0, name));
});

test('only cyclists and trams pass, nobody walks on the sidewalk', () => {
  assert.deepEqual(Object.keys(PASSERS).sort(), ['cyclist', 'tram']);
  const total = Object.values(PASSERS).reduce((sum, { weight }) => sum + weight, 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
});
