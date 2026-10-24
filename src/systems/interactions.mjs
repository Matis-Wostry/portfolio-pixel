export const ACTIONS = new Set(['projets', 'skills', 'about', 'contact', 'sit', 'chess', 'shoot']);

export function normalizeZone(object) {
  if (!object || object.ellipse || object.polygon || object.polyline || object.gid || object.point || (object.rotation ?? 0) !== 0) return null;
  const entries = object.properties ?? [];
  if (!Array.isArray(entries) || entries.some((entry) => !entry || typeof entry.name !== 'string')) return null;
  const properties = Object.fromEntries(entries.map(({ name, value }) => [name, value]));
  const zone = {
    id: properties.id ?? object.id,
    label: properties.label ?? object.label ?? object.name,
    action: properties.action ?? object.action,
    x: object.x, y: object.y, width: object.width, height: object.height,
    radius: properties.radius ?? object.radius ?? 32,
  };
  if (typeof zone.id !== 'string' || !zone.id.trim() || typeof zone.label !== 'string' || !zone.label.trim()) return null;
  if (!ACTIONS.has(zone.action)) return null;
  if (![zone.x, zone.y, zone.width, zone.height, zone.radius].every(Number.isFinite)) return null;
  if (zone.width <= 0 || zone.height <= 0 || zone.radius < 0) return null;
  return zone;
}

export function normalizeZones(objects, warn = (object) => console.warn('Zone interactive ignorée : rectangle, propriétés ou identifiant invalides.', object)) {
  const ids = new Set();
  const zones = [];
  if (!Array.isArray(objects)) { warn(objects); return zones; }
  objects.forEach((object) => {
    const zone = normalizeZone(object);
    if (!zone || ids.has(zone.id)) { warn(object); return; }
    ids.add(zone.id);
    zones.push(zone);
  });
  return zones;
}

export function selectTarget(zones, feet) {
  if (!Number.isFinite(feet?.x) || !Number.isFinite(feet?.y)) return null;
  let nearest = null;
  let bestDistance = Infinity;
  for (const zone of zones) {
    const x = Math.max(zone.x, Math.min(feet.x, zone.x + zone.width));
    const y = Math.max(zone.y, Math.min(feet.y, zone.y + zone.height));
    const distance = Math.hypot(feet.x - x, feet.y - y);
    if (distance > zone.radius) continue;
    if (distance < bestDistance || (distance === bestDistance && (!nearest || zone.id < nearest.id))) {
      nearest = zone;
      bestDistance = distance;
    }
  }
  return nearest;
}
