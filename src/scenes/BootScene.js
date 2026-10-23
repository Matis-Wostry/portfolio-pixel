import Phaser from 'phaser';
import { PLAYER } from '../config/player.js';
import { buildPlaceholderFrames } from '../config/placeholder.mjs';
import { TITLE_ART, AUDIO_FILES } from '../config/assets.js';
import { listConfigured } from '../systems/assetManifest.mjs';
import { ROOM_DIR, ROOM_FILES } from '../data/room.js';
import { INTERFACE_DIR, CUE_FILES, ACTION_ICONS, iconKey } from '../config/interface.js';

const assetURL = (path) => `${import.meta.env.BASE_URL}${path}`;
const frameKey = (row, column) => `${PLAYER.texture}-${row}-${column}`;

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.failedFiles = new Set();
    const onError = (file) => this.failedFiles.add(file.key);
    this.load.on('loaderror', onError);
    ROOM_FILES.forEach(({ key, file, frameWidth, frameHeight }) => {
      const url = assetURL(`${ROOM_DIR}/${file}`);
      if (frameWidth) this.load.spritesheet(key, url, { frameWidth, frameHeight });
      else this.load.image(key, url);
    });
    this.load.image(PLAYER.shadow.texture, assetURL(PLAYER.shadow.path));
    PLAYER.seated.forEach((pose) => this.load.image(`${PLAYER.texture}-assis-${pose}`, assetURL(`${PLAYER.dir}/assis-${pose}.png`)));
    CUE_FILES.forEach(({ key, file }) => this.load.image(key, assetURL(`${INTERFACE_DIR}/${file}`)));
    Object.entries(ACTION_ICONS).forEach(([action, file]) => this.load.image(iconKey(action), assetURL(`${INTERFACE_DIR}/${file}`)));
    if (!this.textures.exists(PLAYER.texture)) {
      PLAYER.names.forEach((name, row) => {
        for (let column = 0; column < PLAYER.columns; column += 1) {
          this.load.image(frameKey(row, column), assetURL(`${PLAYER.dir}/${name}-${column + 1}.png`));
        }
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
    const required = [...ROOM_FILES, ...CUE_FILES].map(({ key }) => key).concat(Object.keys(ACTION_ICONS).map(iconKey));
    if (required.some((key) => this.failedFiles.has(key) || !this.textures.exists(key))) {
      this.showError();
      return;
    }
    // Un fichier absent peut revenir en 200 (page HTML du serveur) et échouer au décodage
    // sans loaderror : on vérifie donc ce qui a réellement été chargé.
    this.optionalFiles.filter(({ key, type }) => !(type === 'image' ? this.textures.exists(key) : this.cache.audio.exists(key)))
      .forEach(({ key, path }) => console.warn(`Fichier ${path} inutilisable pour ${key} : version générée utilisée.`));
    if (!this.textures.exists(PLAYER.texture) && !this.createPlayerSheet()) this.createPlaceholder();
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

  // Assemble les images du personnage en une planche : une ligne par direction, un pas par colonne.
  createPlayerSheet() {
    const { frameWidth: w, frameHeight: h, columns, rows } = PLAYER;
    const keys = Array.from({ length: rows * columns }, (_, index) => frameKey(Math.floor(index / columns), index % columns));
    if (keys.some((key) => this.failedFiles.has(key) || !this.textures.exists(key))) return false;
    const canvas = document.createElement('canvas');
    canvas.width = w * columns;
    canvas.height = h * rows;
    const context = canvas.getContext('2d');
    keys.forEach((key, index) => context.drawImage(this.textures.get(key).getSourceImage(), (index % columns) * w, Math.floor(index / columns) * h));
    const texture = this.textures.addCanvas(PLAYER.texture, canvas);
    keys.forEach((key, index) => {
      texture.add(index, 0, (index % columns) * w, Math.floor(index / columns) * h, w, h);
      this.textures.remove(key);
    });
    return true;
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
