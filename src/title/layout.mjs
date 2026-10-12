export const TITLE_WORLD = { width: 720, height: 300 };

// Plus petit zoom qui couvre l'écran : en paysage jusqu'à 2,4:1, toute la hauteur du décor est visible.
// Vue centrée sur le point focal et bornée au décor.
export function computeTitleView(screenWidth, screenHeight, focus, world = TITLE_WORLD) {
  const valid = [screenWidth, screenHeight].every((value) => Number.isFinite(value) && value > 0);
  const width = valid ? screenWidth : world.width;
  const height = valid ? screenHeight : world.height;
  const zoom = Math.max(width / world.width, height / world.height);
  const viewWidth = width / zoom;
  const viewHeight = height / zoom;
  const clamp = (value, max) => Math.min(Math.max(value, 0), max);
  const left = clamp(focus.x - viewWidth / 2, world.width - viewWidth);
  const top = clamp(focus.y - viewHeight / 2, world.height - viewHeight);
  return { zoom, viewWidth, viewHeight, left, top, centerX: left + viewWidth / 2, centerY: top + viewHeight / 2 };
}
