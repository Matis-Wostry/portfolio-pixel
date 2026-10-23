import Phaser from 'phaser';
import { TILE, ROOM, TILES, FURNITURE, ledKey } from '../data/room.js';

// Dessine la chambre et renvoie ses dimensions et ses obstacles.
export default class Room {
  constructor(scene) {
    this.scene = scene;
    this.width = ROOM.columns * TILE;
    this.height = ROOM.rows * TILE;
    this.solids = scene.physics.add.staticGroup();
    // Profondeur de chaque meuble, pour placer le joueur assis devant ou derrière.
    this.depths = {};
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
    this.depths[item.key] = depth;
    item.solid?.forEach(([x, y, width, height]) => {
      this.solids.add(scene.add.zone(item.x + x + width / 2, item.y + y + height / 2, width, height));
    });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    item.overlays?.forEach((overlay) => {
      if (overlay.effect === 'random') {
        overlay.spots.forEach((spot) => this.flickerRandomly(item, overlay, spot, depth + 0.3, reducedMotion));
        return;
      }
      if (overlay.effect === 'animation') {
        if (!scene.anims.exists(overlay.key)) {
          scene.anims.create({ key: overlay.key, frames: scene.anims.generateFrameNumbers(overlay.key), frameRate: overlay.frameRate, repeat: -1 });
        }
        const sprite = scene.add.sprite(item.x, item.y, overlay.key, 0).setOrigin(0).setDepth(depth + 0.25);
        if (!reducedMotion) sprite.play(overlay.key);
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

  // Change d'intensité au hasard : monte ou descend image par image vers un niveau tiré au sort, puis attend.
  flickerRandomly(item, { key, levels }, { x, y, first }, depth, reducedMotion) {
    const { scene } = this;
    const sprite = scene.add.image(item.x + x, item.y + y, key, first).setOrigin(0).setDepth(depth);
    if (reducedMotion) return;
    let level = 0;
    const next = () => {
      const target = Math.floor(Math.random() * levels);
      const step = () => {
        if (level === target) {
          scene.time.delayedCall(250 + Math.random() * 1500, next);
          return;
        }
        level += Math.sign(target - level);
        sprite.setFrame(first + level);
        scene.time.delayedCall(70 + Math.random() * 60, step);
      };
      step();
    };
    next();
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
