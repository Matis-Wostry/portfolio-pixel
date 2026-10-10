export function interactionCue(zone, { active = false, touch = false } = {}) {
  return {
    x: zone.x + zone.width / 2,
    y: zone.y - 20,
    key: active ? touch ? '!' : 'E' : '…',
    active,
    label: zone.label,
  };
}
