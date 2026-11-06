const STEPS = { ArrowUp: -1, KeyW: -1, KeyZ: -1, ArrowDown: 1, KeyS: 1 };

// Déplacement du curseur demandé par une touche : -1 vers le haut, 1 vers le bas, 0 sinon. Les raccourcis restent au navigateur.
export function menuStep({ code, ctrlKey = false, altKey = false, metaKey = false }) {
  if (ctrlKey || altKey || metaKey) return 0;
  return STEPS[code] ?? 0;
}

export function wrapIndex(index, step, count) {
  return (index + step + count) % count;
}
