// Règles des lumières de l'écran titre : la scène les rejoue, elles ne dépendent pas de Phaser.
const between = (random, min, max) => min + random() * (max - min);
const clamp = (value) => Math.min(Math.max(value, 0), 1);

// Une séquence d'intensités : bourdonnement léger la plupart du temps, parfois un
// bégaiement (double clignotement) ou une coupure franche avant de se rallumer.
export function flickerSequence(random, { hum = 0.08, stutterChance = 0.04, outageChance = 0.01 } = {}) {
  const roll = random();
  if (roll < outageChance) {
    return [
      { level: 0, duration: between(random, 350, 900) },
      { level: 0.6, duration: between(random, 40, 80) },
      { level: 0.1, duration: between(random, 40, 90) },
      { level: 1, duration: between(random, 200, 400) },
    ];
  }
  if (roll < outageChance + stutterChance) {
    return [
      { level: clamp(between(random, 0.15, 0.35)), duration: between(random, 40, 70) },
      { level: 1, duration: between(random, 50, 110) },
      { level: clamp(between(random, 0.1, 0.4)), duration: between(random, 30, 60) },
      { level: 1, duration: between(random, 120, 300) },
    ];
  }
  return [{ level: clamp(1 - random() * hum), duration: between(random, 120, 420) }];
}

// Choisit la prochaine fenêtre à allumer ou éteindre en gardant entre minLit et maxLit lumières.
export function nextToggle(random, lit, { minLit = 0, maxLit = lit.length, locked = [] } = {}) {
  const free = lit.map((_, index) => index).filter((index) => !locked.includes(index));
  if (free.length === 0) return null;
  const count = lit.filter(Boolean).length;
  const canOff = free.filter((index) => lit[index] && count - 1 >= minLit);
  const canOn = free.filter((index) => !lit[index] && count + 1 <= maxLit);
  const choices = [...canOff, ...canOn];
  if (choices.length === 0) return null;
  const index = choices[Math.floor(random() * choices.length)];
  return { index, lit: !lit[index], delay: Math.round(between(random, 1500, 6000)) };
}

// Pixels voisins d'un motif (8-connexité) : sert à dessiner le halo serré d'un tube néon.
export function outline(rows) {
  const filled = new Set();
  rows.forEach((row, y) => [...row].forEach((cell, x) => { if (cell !== '.') filled.add(`${x},${y}`); }));
  const ring = new Map();
  filled.forEach((cell) => {
    const [x, y] = cell.split(',').map(Number);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const key = `${x + dx},${y + dy}`;
        if (!filled.has(key)) ring.set(key, { x: x + dx, y: y + dy });
      }
    }
  });
  return [...ring.values()];
}
