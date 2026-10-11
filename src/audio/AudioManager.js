import Phaser from 'phaser';
import { SFX } from './sfx.mjs';
import { playRecipe } from './synth.js';
import { getStorage, loadMuted, saveMuted } from './preferences.mjs';

const MUSIC_VOLUME = 0.35;
const SFX_VOLUME = 0.8;
const FADE_MS = 800;

export default class AudioManager {
  static get(game) {
    let manager = game.registry.get('audio');
    if (!manager) {
      manager = new AudioManager(game);
      game.registry.set('audio', manager);
    }
    return manager;
  }

  constructor(game) {
    this.sound = game.sound;
    this.cache = game.cache.audio;
    // Les bruitages synthétisés passent par sound.destination : ils respectent la sourdine
    // et le déblocage au premier geste gérés par Phaser.
    this.available = this.sound instanceof Phaser.Sound.WebAudioSoundManager;
    this.storage = getStorage(window);
    this.listeners = new Set();
    this.fades = new Map();
    this.music = null;
    this.musicName = null;
    this.sound.mute = loadMuted(this.storage);
  }

  get muted() {
    return this.sound.mute;
  }

  setMuted(muted) {
    this.sound.mute = muted;
    saveMuted(this.storage, muted);
    this.listeners.forEach((listener) => listener(muted));
  }

  toggle() {
    this.setMuted(!this.muted);
  }

  onChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  play(name) {
    if (!this.available || this.sound.locked) return;
    const key = `sfx-${name}`;
    if (this.cache.exists(key)) {
      this.sound.play(key, { volume: SFX_VOLUME });
      return;
    }
    if (SFX[name]) playRecipe(this.sound.context, this.sound.destination, SFX[name], SFX_VOLUME);
  }

  playMusic(name) {
    if (!this.available || this.musicName === name) return;
    const previous = this.music;
    this.music = null;
    this.musicName = name;
    if (previous) this.fade(previous, 0, () => previous.destroy());
    const key = `music-${name}`;
    if (!this.cache.exists(key)) return;
    this.music = this.sound.add(key, { loop: true, volume: 0 });
    this.music.play();
    this.fade(this.music, MUSIC_VOLUME);
  }

  fade(sound, to, done) {
    clearInterval(this.fades.get(sound));
    const from = sound.volume;
    const start = performance.now();
    const id = setInterval(() => {
      const progress = Math.min(1, (performance.now() - start) / FADE_MS);
      sound.setVolume(from + (to - from) * progress);
      if (progress < 1) return;
      clearInterval(id);
      this.fades.delete(sound);
      done?.();
    }, 50);
    this.fades.set(sound, id);
  }
}
