// Peint une liste de rectangles (et d'objets cernés) dans une image RGBA.
const hex = (color) => [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));

function paint(data, width, height, items) {
  items.forEach((item) => {
    if (item.group) {
      paintGroup(data, width, height, item);
      return;
    }
    const [r, g, b] = hex(item.color);
    for (let y = Math.max(0, item.y); y < Math.min(height, item.y + item.h); y += 1) {
      for (let x = Math.max(0, item.x); x < Math.min(width, item.x + item.w); x += 1) data.set([r, g, b, 255], (y * width + x) * 4);
    }
  });
}

function paintGroup(data, width, height, { group, outline }) {
  const layer = Buffer.alloc(width * height * 4);
  paint(layer, width, height, group);
  const opaque = (x, y) => x >= 0 && y >= 0 && x < width && y < height && layer[(y * width + x) * 4 + 3] > 0;
  const [r, g, b] = hex(outline);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      if (layer[i + 3] > 0) data.set(layer.subarray(i, i + 4), i);
      else if (opaque(x - 1, y) || opaque(x + 1, y) || opaque(x, y - 1) || opaque(x, y + 1)) data.set([r, g, b, 255], i);
    }
  }
}

export function renderRects(items, width, height) {
  const data = Buffer.alloc(width * height * 4);
  paint(data, width, height, items);
  return { width, height, data };
}
