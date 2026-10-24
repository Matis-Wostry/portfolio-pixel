// Seuls les éléments du portfolio gardent leur bulle en permanence ; les autres (s'asseoir, échecs, panier)
// ne la montrent que lorsque le joueur est à portée.
export const PORTFOLIO_ACTIONS = new Set(['projets', 'skills', 'about', 'contact']);

export function isCueVisible(zone, { target = null, excluded = null, enabled = true } = {}) {
  if (!enabled || zone.id === excluded) return false;
  return PORTFOLIO_ACTIONS.has(zone.action) || zone === target;
}

export function interactionCue(zone, { active = false, touch = false } = {}) {
  return {
    x: zone.x + zone.width / 2,
    y: zone.y - 20,
    key: active ? touch ? '!' : 'E' : '…',
    active,
    label: zone.label,
  };
}
