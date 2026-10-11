import Phaser from 'phaser';
import { PLAYER } from '../config/player.js';
import { buildPlaceholderFrames } from '../config/placeholder.mjs';
import { TITLE_ART, AUDIO_FILES } from '../config/assets.js';
import { listConfigured } from '../systems/assetManifest.mjs';

export const TILESETS = ['Sol', 'Mur', 'Mur-bas', 'Mur-haut', 'Mur-droit', 'Mur-gauche', 'Mur-coin'];
const assetURL = (path) => `${import.meta.env.BASE_URL}${path}`;

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.failedFiles = new Set();
    const onError = (file) => this.failedFiles.add(file.key);
    this.load.on('loaderror', onError);
    this.load.tilemapTiledJSON('chambre', assetURL('assets/tilemaps/chambre.json'));
    TILESETS.forEach((name) => this.load.image(name, assetURL(`assets/tilesets/${name}.png`)));
    if (!this.textures.exists(PLAYER.texture)) {
      this.load.spritesheet(PLAYER.texture, assetURL(PLAYER.path), {
        frameWidth: PLAYER.frameWidth,
        frameHeight: PLAYER.frameHeight,
      });
    }
    this.optionalFiles = [
      ...this.configuredFiles('title-', TITLE_ART, 'image'),
      ...this.configuredFiles('music-', AUDIO_FILES.music, 'audio'),
      ...this.configuredFiles('sfx-', AUDIO_FILES.sfx, 'audio'),
    ];
    this.optionalFiles.forEach(({ key, path, type }) => this.load[type](key, assetURL(path)));
    const { width, height } = this.scale;
    const bar = this.add.rectangle(width / 2, height / 2, 0, 8, 0xffffff);
    const progress = (value) => bar.setSize(width * value, 8);
    this.load.on('progress', progress);
    this.load.once('complete', () => {
      this.load.off('progress', progress);
      this.load.off('loaderror', onError);
      bar.destroy();
    });
  }

  create() {
    if (!this.cache.tilemap.exists('chambre') || TILESETS.some((key) => this.failedFiles.has(key))) {
      this.showError();
      return;
    }
    // Un fichier absent peut revenir en 200 (page HTML du serveur) et échouer au décodage
    // sans loaderror : on vérifie donc ce qui a réellement été chargé.
    this.optionalFiles.filter(({ key, type }) => !(type === 'image' ? this.textures.exists(key) : this.cache.audio.exists(key)))
      .forEach(({ key, path }) => console.warn(`Fichier ${path} inutilisable pour ${key} : version générée utilisée.`));
    if (this.failedFiles.has(PLAYER.texture) || !this.textures.exists(PLAYER.texture)) {
      this.createPlaceholder();
    }
    this.scene.start('TitleScene');
  }

  configuredFiles(prefix, entries, type) {
    const { files, invalid } = listConfigured(prefix, entries);
    invalid.forEach((name) => console.warn(`Chemin ignoré pour ${prefix}${name} : indiquer un chemin relatif au dossier public/.`));
    return files.map((file) => ({ ...file, type }));
  }

  showError() {
    const error = document.createElement('p');
    error.className = 'load-error';
    error.setAttribute('role', 'alert');
    error.textContent = 'La chambre ne peut pas être chargée. Recharge la page pour réessayer.';
    document.body.append(error);
    this.events.once('shutdown', () => error.remove());
  }

  createPlaceholder() {
    if (this.textures.exists(PLAYER.texture)) this.textures.remove(PLAYER.texture);
    const { frameWidth: w, frameHeight: h, columns, rows } = PLAYER;
    const canvas = document.createElement('canvas');
    canvas.width = w * columns;
    canvas.height = h * rows;
    const context = canvas.getContext('2d');
    const frames = buildPlaceholderFrames(PLAYER);
    frames.forEach(({ x, y, rects }) => {
      rects.forEach((rect) => {
        context.fillStyle = rect.color;
        context.fillRect(x + rect.x, y + rect.y, rect.width, rect.height);
      });
    });
    const texture = this.textures.addCanvas(PLAYER.texture, canvas);
    frames.forEach(({ index, x, y }) => texture.add(index, 0, x, y, w, h));
  }
}
