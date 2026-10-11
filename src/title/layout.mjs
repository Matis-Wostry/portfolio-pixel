export const TITLE_WORLD = { width: 480, height: 300 };

// Zoom entier le plus proche de la hauteur, augmenté jusqu'à ce que la vue tienne dans le monde,
// puis vue centrée sur le point focal et bornée au décor.
export function computeTitleView(screenWidth, screenHeight, focus, world = TITLE_WORLD) {
  const valid = [screenWidth, screenHeight].every((value) => Number.isFinite(value) && value > 0);
  const width = valid ? screenWidth : world.width;
  const height = valid ? screenHeight : world.height;
  let zoom = Math.max(1, Math.round(height / world.height));
  while (width / zoom > world.width || height / zoom > world.height) zoom += 1;
  const viewWidth = width / zoom;
  const viewHeight = height / zoom;
  const clamp = (value, max) => Math.min(Math.max(value, 0), max);
  const left = clamp(focus.x - viewWidth / 2, world.width - viewWidth);
  const top = clamp(focus.y - viewHeight / 2, world.height - viewHeight);
  return { zoom, viewWidth, viewHeight, left, top, centerX: left + viewWidth / 2, centerY: top + viewHeight / 2 };
}
