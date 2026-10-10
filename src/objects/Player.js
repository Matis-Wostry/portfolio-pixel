import Phaser from 'phaser';
import { PLAYER } from '../config/player.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, PLAYER.texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(PLAYER.origin.x, PLAYER.origin.y);
    this.body.setSize(PLAYER.hitbox.width, PLAYER.hitbox.height);
    this.body.setOffset(PLAYER.hitbox.x, PLAYER.hitbox.y);
    this.lastDirection = 'down';
    PLAYER.directions.forEach((direction, row) => {
      const start = row * PLAYER.columns;
      if (!scene.anims.exists(`walk-${direction}`)) {
        scene.anims.create({
          key: `walk-${direction}`,
          frames: scene.anims.generateFrameNumbers(PLAYER.texture, {
            start, end: start + PLAYER.columns - 1,
          }),
          frameRate: PLAYER.frameRate,
          repeat: -1,
        });
      }
      if (!scene.anims.exists(`idle-${direction}`)) {
        scene.anims.create({
          key: `idle-${direction}`,
          frames: [{ key: PLAYER.texture, frame: start }],
        });
      }
    });
  }

  getFeet() {
    return { x: this.body.center.x, y: this.body.bottom };
  }

  update({ x = 0, y = 0 } = {}) {
    this.setVelocity(x * PLAYER.speed, y * PLAYER.speed);
    if (x < 0) this.lastDirection = 'left';
    else if (x > 0) this.lastDirection = 'right';
    else if (y < 0) this.lastDirection = 'up';
    else if (y > 0) this.lastDirection = 'down';
    this.play(`${x || y ? 'walk' : 'idle'}-${this.lastDirection}`, true);
    this.setDepth(this.getFeet().y);
  }
}
