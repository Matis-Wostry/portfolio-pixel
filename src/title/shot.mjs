export const MAKE_CHANCE = 0.6;
export const SHOT_DURATION = 900;
const PEAK = 48;

export function planShot(roll, { ball, rim }) {
  const made = Number.isFinite(roll) && roll >= 0 && roll < MAKE_CHANCE;
  const to = made ? { x: rim.x + rim.w / 2, y: rim.y - 2 } : { x: rim.x + rim.w + 1, y: rim.y - 3 };
  return { made, from: { x: ball.x, y: ball.y }, to, peak: PEAK };
}

export function shotArc({ from, to, peak }, t) {
  const time = Math.min(Math.max(Number.isFinite(t) ? t : 0, 0), 1);
  return {
    x: from.x + (to.x - from.x) * time,
    y: from.y + (to.y - from.y) * time - 4 * peak * time * (1 - time),
  };
}
