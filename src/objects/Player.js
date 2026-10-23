import Phaser from 'phaser';
import { PLAYER } from '../config/player.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config = PLAYER) {
    super(scene, x, y, config.texture);
    this.config = config;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(config.origin.x, config.origin.y);
    this.body.setSize(config.hitbox.width, config.hitbox.height);
    this.body.setOffset(config.hitbox.x, config.hitbox.y);
    this.lastDirection = 'down';
    config.directions.forEach((direction, row) => {
      const start = row * config.columns;
      if (!scene.anims.exists(`${config.texture}-walk-${direction}`)) {
        scene.anims.create({
          key: `${config.texture}-walk-${direction}`,
          frames: scene.anims.generateFrameNumbers(config.texture, {
            start, end: start + config.columns - 1,
          }),
          frameRate: config.frameRate,
          repeat: -1,
        });
      }
      if (!scene.anims.exists(`${config.texture}-idle-${direction}`)) {
        scene.anims.create({
          key: `${config.texture}-idle-${direction}`,
          frames: [{ key: config.texture, frame: start }],
        });
      }
    });
  }

  getFeet() {
    return { x: this.body.center.x, y: this.body.bottom };
  }

  update({ x = 0, y = 0 } = {}) {
    this.setVelocity(x * this.config.speed, y * this.config.speed);
    if (x < 0) this.lastDirection = 'left';
    else if (x > 0) this.lastDirection = 'right';
    else if (y < 0) this.lastDirection = 'up';
    else if (y > 0) this.lastDirection = 'down';
    this.play(`${this.config.texture}-${x || y ? 'walk' : 'idle'}-${this.lastDirection}`, true);
    this.setDepth(this.getFeet().y);
  }
}
