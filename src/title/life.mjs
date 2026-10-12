// Vie de la rue : qui passe, dans quel sens, quand, et ce que fait le chien. Sans Phaser.
const between = (random, min, max) => min + random() * (max - min);

// Vitesses en pixels du monde par seconde ; poids = fréquence relative des passages.
export const PASSERS = {
  pedestrian: { weight: 0.45, speed: [10, 14] },
  cyclist: { weight: 0.3, speed: [30, 42] },
  tram: { weight: 0.25, speed: [45, 60] },
};

export function nextPassage(random) {
  let roll = random();
  const kinds = Object.keys(PASSERS);
  const kind = kinds.find((name) => (roll -= PASSERS[name].weight) < 0) ?? kinds[kinds.length - 1];
  const [min, max] = PASSERS[kind].speed;
  return {
    kind,
    direction: random() < 0.5 ? 1 : -1,
    delay: Math.round(between(random, 4000, 12000)),
    speed: between(random, min, max),
  };
}

// Trajet horizontal d'un bord à l'autre, sprite entièrement caché au départ et à l'arrivée.
export function crossing({ direction, speed }, worldWidth, spriteWidth) {
  const left = -spriteWidth;
  const right = worldWidth;
  const [fromX, toX] = direction === 1 ? [left, right] : [right, left];
  return { fromX, toX, duration: (Math.abs(toX - fromX) / speed) * 1000 };
}

export const DOG_ACTIONS = ['wag', 'idle', 'sit', 'sniff'];

export function nextDogAction(random) {
  const roll = random();
  if (roll < 0.45) return { action: 'wag', duration: Math.round(between(random, 1200, 2600)) };
  if (roll < 0.7) return { action: 'idle', duration: Math.round(between(random, 800, 2000)) };
  if (roll < 0.87) return { action: 'sit', duration: Math.round(between(random, 3000, 5000)) };
  return { action: 'sniff', duration: Math.round(between(random, 1200, 2200)) };
}
