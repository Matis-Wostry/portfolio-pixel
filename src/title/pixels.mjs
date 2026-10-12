// Petites briques de dessin : le décor est une liste de rectangles colorés en pixels du monde.
export const rect = (x, y, w, h, color) => ({ x, y, w, h, color });

export function fromPattern(x, y, rows, colors) {
  const rects = [];
  rows.forEach((row, dy) => {
    for (let start = 0; start < row.length;) {
      let end = start + 1;
      while (end < row.length && row[end] === row[start]) end += 1;
      if (colors[row[start]]) rects.push(rect(x + start, y + dy, end - start, 1, colors[row[start]]));
      start = end;
    }
  });
  return rects;
}

export function disc(cx, cy, r, color) {
  const rects = [];
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.round(Math.sqrt(r * r - dy * dy));
    rects.push(rect(cx - half, cy + dy, half * 2 + 1, 1, color));
  }
  return rects;
}

const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

// Trame ordonnée sur `rows` lignes : `color` de plus en plus dense vers le bas, à la manière du pixel art 16 bits.
export function dither(x, y, w, rows, color) {
  const rects = [];
  for (let row = 0; row < rows; row++) {
    const threshold = ((row + 1) * 16) / (rows + 1);
    for (let dx = 0; dx < w; dx++) {
      if (BAYER[(y + row) % 4][(x + dx) % 4] < threshold) rects.push(rect(x + dx, y + row, 1, 1, color));
    }
  }
  return rects;
}

// Coupe les rectangles au cadre du calque pour que tout dessin débordant reste valide.
export function clip(rects, width, height) {
  return rects.flatMap(({ x, y, w, h, color }) => {
    const left = Math.max(0, x);
    const top = Math.max(0, y);
    const right = Math.min(width, x + w);
    const bottom = Math.min(height, y + h);
    return right > left && bottom > top ? [rect(left, top, right - left, bottom - top, color)] : [];
  });
}
