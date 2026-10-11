const noiseBuffers = new WeakMap();

function noiseBuffer(context) {
  if (!noiseBuffers.has(context)) {
    const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.5), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(context, buffer);
  }
  return noiseBuffers.get(context);
}

export function playRecipe(context, destination, notes, volume = 1) {
  const now = context.currentTime;
  notes.forEach((note) => {
    const start = now + note.start;
    const end = start + note.duration;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(note.volume * volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    gain.connect(destination);
    let source;
    if (note.wave === 'noise') {
      source = context.createBufferSource();
      source.buffer = noiseBuffer(context);
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(note.from, start);
      filter.frequency.exponentialRampToValueAtTime(note.to, end);
      source.connect(filter).connect(gain);
    } else {
      source = context.createOscillator();
      source.type = note.wave;
      source.frequency.setValueAtTime(note.from, start);
      source.frequency.exponentialRampToValueAtTime(note.to, end);
      source.connect(gain);
    }
    source.onended = () => gain.disconnect();
    source.start(start);
    source.stop(end + 0.02);
  });
}
