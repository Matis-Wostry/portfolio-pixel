import Phaser from 'phaser';
import { PLAYER } from '../config/player.js';

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
    if (this.failedFiles.has(PLAYER.texture) || !this.textures.exists(PLAYER.texture)) {
      this.createPlaceholder();
    }
    this.scene.start('GameScene');
  }

  showError() {
    const error = document.createElement('p');
    error.className = 'load-error';
    error.setAttribute('role', 'alert');
    error.textContent = 'La chambre ne peut pas ?tre charg?e. Recharge la page pour r?essayer.';
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
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        context.fillStyle = colors[row % colors.length];
        context.fillRect(col * w + 3, row * h + 2, w - 6, h - 4);
        context.fillStyle = '#ffffff';
        context.fillRect(col * w + 6, row * h + 5, 5, 5);
      }
    }
    const texture = this.textures.addCanvas(PLAYER.texture, canvas);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        texture.add(row * columns + col, 0, col * w, row * h, w, h);
      }
    }
  }
}
