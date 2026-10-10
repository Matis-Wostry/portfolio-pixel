const finite = (value) => Number.isFinite(value) ? value : 0;

export function resolveDirection(keyboard = {}, joystick = {}) {
  const keys = { x: finite(keyboard.x), y: finite(keyboard.y) };
  const input = keys.x || keys.y ? keys : joystick;
  const x = finite(input.x);
  const y = finite(input.y);
  const length = Math.hypot(x, y);
  return length > 1 ? { x: x / length, y: y / length } : { x, y };
}

export function joystickDirection(dx, dy, radius, deadZone = 0.15) {
  if (![dx, dy, radius].every(Number.isFinite) || radius <= 0) return { x: 0, y: 0 };
  const distance = Math.hypot(dx, dy);
  const fraction = Math.min(distance / radius, 1);
  if (fraction <= deadZone) return { x: 0, y: 0 };
  const amplitude = (fraction - deadZone) / (1 - deadZone);
  return { x: dx / distance * amplitude, y: dy / distance * amplitude };
}
