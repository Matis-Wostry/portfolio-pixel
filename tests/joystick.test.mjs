import test from 'node:test';
import assert from 'node:assert/strict';
import { joystickDirection } from '../src/input/direction.mjs';
import GameControls from '../src/input/GameControls.js';

test('joystick ignores jitter, scales amplitude and caps movement', () => {
  assert.deepEqual(joystickDirection(5, 0, 50), { x: 0, y: 0 });
  assert.deepEqual(joystickDirection(50, 0, 50), { x: 1, y: 0 });
  assert.deepEqual(joystickDirection(100, 0, 50), { x: 1, y: 0 });
  assert.deepEqual(joystickDirection(20, 0, 0), { x: 0, y: 0 });
  assert.deepEqual(joystickDirection(NaN, 0, 50), { x: 0, y: 0 });
  const middle = joystickDirection(25, 0, 50);
  assert.ok(middle.x > 0 && middle.x < 1);
});

function setup() {
  const target = new EventTarget();
  const visibility = new EventTarget();
  const controls = new GameControls(target, visibility);
  const key = (type, code, extra = {}) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ...extra });
    target.dispatchEvent(event);
    return event;
  };
  return { target, visibility, controls, key };
}

test('keyboard and action are independent and action is consumed once', () => {
  const { controls, key } = setup();
  key('keydown', 'KeyD');
  key('keydown', 'KeyE');
  key('keydown', 'KeyE', { repeat: true });
  assert.deepEqual(controls.getDirection(), { x: 1, y: 0 });
  assert.equal(controls.consumeAction(), true);
  assert.equal(controls.consumeAction(), false);
  controls.destroy();
});

test('dialog resets inputs and held keys require release before resuming', () => {
  const { controls, key } = setup();
  key('keydown', 'KeyD');
  controls.setEnabled(false);
  controls.setEnabled(true);
  key('keydown', 'KeyD', { repeat: true });
  assert.deepEqual(controls.getDirection(), { x: 0, y: 0 });
  key('keyup', 'KeyD');
  key('keydown', 'KeyD');
  assert.deepEqual(controls.getDirection(), { x: 1, y: 0 });
  controls.destroy();
});

test('tactile action does not cancel joystick and cancellation clears both', () => {
  const { controls } = setup();
  controls.setJoystick({ x: 0, y: -0.5 });
  controls.requestAction();
  assert.equal(controls.consumeAction(), true);
  assert.deepEqual(controls.getDirection(), { x: 0, y: -0.5 });
  controls.reset();
  assert.deepEqual(controls.getDirection(), { x: 0, y: 0 });
  assert.equal(controls.consumeAction(), false);
  controls.destroy();
});

test('blur, hidden document and destruction release movement', () => {
  const { controls, target, visibility, key } = setup();
  key('keydown', 'ArrowUp');
  target.dispatchEvent(new Event('blur'));
  assert.deepEqual(controls.getDirection(), { x: 0, y: 0 });
  key('keyup', 'ArrowUp');
  key('keydown', 'ArrowUp');
  visibility.hidden = true;
  visibility.dispatchEvent(new Event('visibilitychange'));
  assert.deepEqual(controls.getDirection(), { x: 0, y: 0 });
  controls.destroy();
  key('keydown', 'KeyD');
  assert.deepEqual(controls.getDirection(), { x: 0, y: 0 });
});
