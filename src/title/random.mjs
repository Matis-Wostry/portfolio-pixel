// Générateur mulberry32 : même graine, même ciel à chaque visite.
export function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateStars(seed, { width, height, count, avoid = [] }) {
  const random = createRandom(seed);
  const stars = [];
  for (let attempt = 0; stars.length < count && attempt < count * 20; attempt++) {
    const x = Math.floor(random() * width);
    const y = Math.floor(random() * height);
    if (avoid.some((zone) => Math.hypot(x - zone.x, y - zone.y) <= zone.r)) continue;
    stars.push({ x, y, bright: random() < 0.3 });
  }
  return stars;
}
