export function computeView(width, height) {
  if (![width, height].every(Number.isFinite) || width <= 0 || height <= 0) {
    return { worldWidth: 640, worldHeight: 480, zoom: 1 };
  }
  const zoom = Math.min(width, height) / 480;
  return { worldWidth: width / zoom, worldHeight: height / zoom, zoom };
}

export function computeBounds(mapWidth, mapHeight, view) {
  const width = Math.max(mapWidth, view.worldWidth);
  const height = Math.max(mapHeight, view.worldHeight);
  return { x: (mapWidth - width) / 2, y: (mapHeight - height) / 2, width, height };
}
