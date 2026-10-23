import Phaser from 'phaser';
import { TILE, ROOM, TILES, FURNITURE, ledKey } from '../data/room.js';
import { findScreens, screenFrame, SCREEN_FRAMES, SCREEN_FPS } from './screens.mjs';

const animatedKey = (key) => `${key}-anim`;

// Dessine la chambre et renvoie ses dimensions et ses obstacles.
export default class Room {
  constructor(scene) {
    this.scene = scene;
    this.width = ROOM.columns * TILE;
    this.height = ROOM.rows * TILE;
    this.solids = scene.physics.add.staticGroup();
    this.buildTiles();
    FURNITURE.forEach((item) => this.placeFurniture(item));
  }

  // Zone de déplacement : le mur du fond et le cadre bloquent le joueur.
  get walkBounds() {
    const top = ROOM.wallRows * TILE - 4;
    return { x: 9, y: top, width: this.width - 18, height: this.height - top - 10 };
  }

  buildTiles() {
    for (let row = 0; row < ROOM.rows; row += 1) {
      for (let column = 0; column < ROOM.columns; column += 1) {
        const key = row < ROOM.wallRows
          ? `mur-${row}`
          : `sol-${(column * 7 + row * 13 + column * row) % TILES.floor.length}`;
        this.scene.add.image(column * TILE, row * TILE, key).setOrigin(0).setDepth(-1000);
      }
    }
    const last = { x: (ROOM.columns - 1) * TILE, y: (ROOM.rows - 1) * TILE };
    const border = (name, x, y) => this.scene.add.image(x, y, `bord-${name}`).setOrigin(0).setDepth(9000);
    for (let column = 1; column < ROOM.columns - 1; column += 1) {
      border('top', column * TILE, 0);
      border('bottom', column * TILE, last.y);
    }
    for (let row = 1; row < ROOM.rows - 1; row += 1) {
      border('left', 0, row * TILE);
      border('right', last.x, row * TILE);
    }
    border('topLeft', 0, 0);
    border('topRight', last.x, 0);
    border('bottomLeft', 0, last.y);
    border('bottomRight', last.x, last.y);
  }

  placeFurniture(item) {
    const { scene } = this;
    const image = scene.add.image(item.x, item.y, item.key).setOrigin(0);
    const depth = item.wall ? -500 : item.y + image.height;
    image.setDepth(depth);
    item.solid?.forEach(([x, y, width, height]) => {
      this.solids.add(scene.add.zone(item.x + x + width / 2, item.y + y + height / 2, width, height));
    });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    item.overlays?.forEach((overlay) => {
      if (overlay.effect === 'screens') {
        const screens = scene.add.sprite(item.x, item.y, animatedKey(overlay.key), 0).setOrigin(0).setDepth(depth + 0.25);
        if (!reducedMotion) screens.play(animatedKey(overlay.key));
        return;
      }
      const layer = scene.add.image(item.x, item.y, overlay.key).setOrigin(0).setDepth(depth + 0.5)
        .setBlendMode(Phaser.BlendModes.ADD);
      if (!reducedMotion) {
        scene.tweens.add({ targets: layer, alpha: { from: 0.55, to: 1 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    });
    if (item.leds) this.animateLeds(item, depth + 0.5);
  }

  animateLeds(item, depth) {
    const keys = item.leds.map((_, index) => ledKey(index));
    const led = this.scene.add.image(item.x, item.y, keys[0]).setOrigin(0).setDepth(depth);
    let index = 0;
    this.scene.time.addEvent({
      delay: 350,
      loop: true,
      callback: () => {
        index = (index + 1) % keys.length;
        led.setTexture(keys[index]);
      },
    });
  }
}

// Fabrique la planche animée des écrans à partir de leur forme (une image par pas d'animation).
export function prepareRoomTextures(scene) {
  FURNITURE.flatMap((item) => item.overlays ?? []).filter(({ effect }) => effect === 'screens').forEach(({ key }) => {
    const sheetKey = animatedKey(key);
    if (scene.textures.exists(sheetKey)) return;
    const source = scene.textures.get(key).getSourceImage();
    const { width, height } = source;
    const mask = document.createElement('canvas');
    mask.width = width;
    mask.height = height;
    const maskContext = mask.getContext('2d', { willReadFrequently: true });
    maskContext.drawImage(source, 0, 0);
    const data = maskContext.getImageData(0, 0, width, height).data;
    const alpha = new Uint8Array(width * height).map((_, i) => data[i * 4 + 3]);
    const screens = findScreens(alpha, width, height);

    const canvas = document.createElement('canvas');
    canvas.width = width * SCREEN_FRAMES;
    canvas.height = height;
    const context = canvas.getContext('2d');
    for (let frame = 0; frame < SCREEN_FRAMES; frame += 1) {
      screenFrame(screens, frame).forEach(({ x, y, color }) => {
        context.fillStyle = color;
        context.fillRect(frame * width + x, y, 1, 1);
      });
    }
    const texture = scene.textures.addCanvas(sheetKey, canvas);
    for (let frame = 0; frame < SCREEN_FRAMES; frame += 1) texture.add(frame, 0, frame * width, 0, width, height);
    scene.anims.create({
      key: sheetKey,
      frames: Array.from({ length: SCREEN_FRAMES }, (_, frame) => ({ key: sheetKey, frame })),
      frameRate: SCREEN_FPS,
      repeat: -1,
    });
  });
}
