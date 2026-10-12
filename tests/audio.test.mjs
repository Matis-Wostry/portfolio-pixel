import test from 'node:test';
import assert from 'node:assert/strict';
import { MUTE_KEY, getStorage, loadMuted, saveMuted } from '../src/audio/preferences.mjs';
import { SFX, SFX_NAMES, isValidRecipe, recipeDuration } from '../src/audio/sfx.mjs';
import { AUDIO_FILES } from '../src/config/assets.js';

const memory = () => {
  const data = new Map();
  return { getItem: (key) => (data.has(key) ? data.get(key) : null), setItem: (key, value) => data.set(key, String(value)) };
};

test('remembers the mute choice', () => {
  const storage = memory();
  assert.equal(loadMuted(storage), false);
  assert.equal(saveMuted(storage, true), true);
  assert.equal(storage.getItem(MUTE_KEY), '1');
  assert.equal(loadMuted(storage), true);
  saveMuted(storage, false);
  assert.equal(loadMuted(storage), false);
});

test('falls back to sound on when storage is missing or blocked', () => {
  const blocked = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  assert.equal(loadMuted(blocked), false);
  assert.equal(saveMuted(blocked, true), false);
  assert.equal(loadMuted(null), false);
  assert.equal(saveMuted(null, true), false);
  assert.equal(getStorage({ get localStorage() { throw new Error('SecurityError'); } }), null);
  const storage = memory();
  assert.equal(getStorage({ localStorage: storage }), storage);
});

test('defines every short sound used by the title and the room', () => {
  assert.deepEqual([...SFX_NAMES].sort(), ['click', 'close', 'enter', 'open']);
  assert.deepEqual(Object.keys(AUDIO_FILES.sfx).sort(), [...SFX_NAMES].sort());
  for (const name of SFX_NAMES) {
    assert.ok(isValidRecipe(SFX[name]), name);
    assert.ok(recipeDuration(SFX[name]) <= 0.6, name);
  }
});

test('rejects recipes the synthesizer cannot play', () => {
  const note = { wave: 'square', from: 440, to: 440, start: 0, duration: 0.1, volume: 0.2 };
  assert.equal(isValidRecipe([note]), true);
  assert.equal(isValidRecipe([]), false);
  assert.equal(isValidRecipe(null), false);
  for (const change of [{ wave: 'organ' }, { from: 0 }, { to: -1 }, { start: -0.1 }, { duration: 0 }, { volume: 0 }, { volume: 2 }, { from: Number.NaN }]) {
    assert.equal(isValidRecipe([{ ...note, ...change }]), false, JSON.stringify(change));
  }
});
