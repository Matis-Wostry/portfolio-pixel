const WAVES = new Set(['square', 'triangle', 'sine', 'sawtooth', 'noise']);
const tone = (wave, from, to, start, duration, volume) => ({ wave, from, to, start, duration, volume });

// Fréquences en Hz, temps en secondes, volume entre 0 et 1.
export const SFX = {
  click: [tone('square', 520, 660, 0, 0.05, 0.15)],
  open: [tone('square', 392, 392, 0, 0.07, 0.12), tone('square', 587, 587, 0.07, 0.1, 0.12)],
  close: [tone('square', 587, 587, 0, 0.07, 0.12), tone('square', 392, 392, 0.07, 0.1, 0.12)],
  enter: [tone('triangle', 220, 880, 0, 0.45, 0.18)],
  bounce: [tone('triangle', 140, 60, 0, 0.09, 0.3)],
  swish: [tone('noise', 3000, 1200, 0, 0.25, 0.12), tone('square', 784, 784, 0.12, 0.08, 0.1), tone('square', 1047, 1047, 0.2, 0.14, 0.1)],
  rim: [tone('square', 300, 180, 0, 0.12, 0.15), tone('triangle', 900, 850, 0, 0.18, 0.08)],
};

export const SFX_NAMES = Object.keys(SFX);

export function isValidRecipe(notes) {
  return Array.isArray(notes) && notes.length > 0 && notes.every((note) => note && WAVES.has(note.wave)
    && [note.from, note.to, note.start, note.duration, note.volume].every(Number.isFinite)
    && note.from > 0 && note.to > 0 && note.start >= 0 && note.duration > 0 && note.volume > 0 && note.volume <= 1);
}

export function recipeDuration(notes) {
  return Math.max(0, ...notes.map((note) => note.start + note.duration));
}
