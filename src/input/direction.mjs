const finite = (value) => Number.isFinite(value) ? value : 0;

export function resolveDirection(keyboard = {}, joystick = {}) {
  const keys = { x: finite(keyboard.x), y: finite(keyboard.y) };
  const input = keys.x || keys.y ? keys : joystick;
  const x = finite(input.x);
  const y = finite(input.y);
  const length = Math.hypot(x, y);
  return length > 1 ? { x: x / length, y: y / length } : { x, y };
}
