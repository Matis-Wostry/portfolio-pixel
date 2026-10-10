import { resolveDirection } from './direction.mjs';

const MOVEMENT = {
  ArrowUp: [0, -1], KeyZ: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyQ: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
};
const ACTION = new Set(['KeyE', 'Space']);

export default class GameControls {
  constructor(target = window, visibility = document) {
    this.target = target;
    this.visibility = visibility;
    this.enabled = true;
    this.pressed = new Set();
    this.blocked = new Set();
    this.joystick = { x: 0, y: 0 };
    this.action = false;
    this.onKeyDown = (event) => {
      if (!MOVEMENT[event.code] && !ACTION.has(event.code)) return;
      if (!this.enabled || event.target?.closest?.('input, textarea, select, button, dialog, [contenteditable]')) return;
      event.preventDefault();
      if (event.repeat || this.pressed.has(event.code)) return;
      this.blocked.delete(event.code);
      this.pressed.add(event.code);
      if (ACTION.has(event.code)) this.requestAction();
    };
    this.onKeyUp = (event) => {
      this.pressed.delete(event.code);
      this.blocked.delete(event.code);
    };
    this.onBlur = () => this.reset();
    this.onVisibility = () => { if (visibility.hidden) this.reset(); };
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
    target.addEventListener('blur', this.onBlur);
    visibility.addEventListener('visibilitychange', this.onVisibility);
  }

  getDirection() {
    if (!this.enabled) return { x: 0, y: 0 };
    const direction = { x: 0, y: 0 };
    // Multiple keys for the same direction count as one input.
    const values = [...this.pressed].filter((key) => !this.blocked.has(key)).map((key) => MOVEMENT[key]).filter(Boolean);
    direction.x = Number(values.some(([x]) => x > 0)) - Number(values.some(([x]) => x < 0));
    direction.y = Number(values.some(([, y]) => y > 0)) - Number(values.some(([, y]) => y < 0));
    return values.length ? resolveDirection(direction) : resolveDirection({}, this.joystick);
  }

  setJoystick(direction) {
    if (this.enabled) this.joystick = resolveDirection({}, direction);
  }

  requestAction() {
    if (this.enabled) this.action = true;
  }

  consumeAction() {
    const action = this.enabled && this.action;
    this.action = false;
    return action;
  }

  reset() {
    this.pressed.forEach((key) => this.blocked.add(key));
    this.pressed.clear();
    this.joystick = { x: 0, y: 0 };
    this.action = false;
  }

  setEnabled(enabled) {
    this.reset();
    this.enabled = enabled;
  }

  destroy() {
    this.setEnabled(false);
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
    this.target.removeEventListener('blur', this.onBlur);
    this.visibility.removeEventListener('visibilitychange', this.onVisibility);
  }
}
