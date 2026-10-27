// Sur petit écran (téléphone), la chambre remplit tout l'écran et la caméra suit le joueur
// au lieu de la montrer entière en miniature. `map` : taille de la chambre en pixels.
export function computeView(width, height, map = null) {
  if (![width, height].every(Number.isFinite) || width <= 0 || height <= 0) {
    return { worldWidth: 640, worldHeight: 480, zoom: 1 };
  }
  const compact = map && Math.min(width, height) < 480;
  const zoom = compact ? Math.max(width / map.width, height / map.height) : Math.min(width, height) / 480;
  return { worldWidth: width / zoom, worldHeight: height / zoom, zoom };
}

export function computeBounds(mapWidth, mapHeight, view) {
  const width = Math.max(mapWidth, view.worldWidth);
  const height = Math.max(mapHeight, view.worldHeight);
  return { x: (mapWidth - width) / 2, y: (mapHeight - height) / 2, width, height };
}
