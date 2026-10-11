export function paintRects(rects, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  rects.forEach(({ x, y, w, h, color }) => {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
  });
  return canvas;
}
