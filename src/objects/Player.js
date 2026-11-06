import Phaser from 'phaser';
import { PLAYER } from '../config/player.js';
import { facingDirection } from '../input/direction.mjs';

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
    // Renseigné par la scène une fois la chambre construite.
    this.solidRects = [];
    this.createArms(scene, config);
    // L'ombre reste au sol, sous les meubles, et suit les pieds après chaque pas de la physique.
    if (config.shadow && scene.textures.exists(config.shadow.texture)) {
      this.shadow = scene.add.image(x, y + config.shadow.offsetY, config.shadow.texture).setDepth(-900);
      scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncShadow, this);
      this.once(Phaser.GameObjects.Events.DESTROY, () => {
        scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncShadow, this);
        this.shadow.destroy();
      });
    }
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

  // Deux copies du sprite rognées sur les colonnes hors de la hitbox et sur les lignes des bras, toujours au-dessus des meubles.
  createArms(scene, config) {
    const { x, width } = config.hitbox;
    const columns = [[0, x], [x + width, config.frameWidth - x - width]];
    this.arms = columns.map(([left, columnWidth]) => ({
      left, columnWidth, sprite: scene.add.sprite(this.x, this.y, config.texture).setOrigin(config.origin.x, config.origin.y).setDepth(config.armsDepth),
    }));
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncArms, this);
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncArms, this);
      this.arms.forEach(({ sprite }) => sprite.destroy());
    });
  }

  // Derrière un meuble (pieds au-dessus du haut de son empreinte, bras au-dessus de elle) : les bras passent derrière lui.
  isBehindFurniture(from, to) {
    const feet = this.body.bottom;
    return this.solidRects.some(({ left, right, top }) => from < right && to > left && feet <= top + 0.5);
  }

  // Changer la profondeur relance le tri de toute la scène : uniquement si elle change vraiment.
  updateDepth(object, depth) {
    if (object.depth !== depth) object.setDepth(depth);
  }

  syncArms() {
    const origin = this.x - this.config.origin.x * this.config.frameWidth;
    this.arms.forEach(({ left, columnWidth, sprite }) => {
      sprite.setVisible(!this.seat);
      if (this.seat) return;
      this.updateDepth(sprite, this.isBehindFurniture(origin + left, origin + left + columnWidth) ? this.depth + 0.01 : this.config.armsDepth);
      sprite.setTexture(this.texture.key, this.frame.name).setPosition(this.x, this.y).setFlip(this.flipX, this.flipY);
      const { top, bottom } = this.config.armsRows;
      sprite.setCrop(left, top, columnWidth, bottom - top);
    });
  }

  syncShadow() {
    this.shadow.setPosition(this.x, this.y + this.config.shadow.offsetY);
  }

  // Pose assise : le corps physique est coupé et le joueur reprendra sa place en se levant.
  sit(seat) {
    this.standPosition = { x: this.x, y: this.y };
    this.seat = seat;
    this.setVelocity(0, 0);
    this.body.enable = false;
    this.anims.stop();
    const texture = `${this.config.texture}-assis-${seat.pose}`;
    if (this.scene.textures.exists(texture)) this.setTexture(texture);
    this.setPosition(seat.x, seat.y).setDepth(seat.depth);
    this.shadow?.setVisible(false);
  }

  stand() {
    if (!this.seat) return;
    this.seat = null;
    this.body.enable = true;
    this.body.reset(this.standPosition.x, this.standPosition.y);
    this.shadow?.setVisible(true);
    this.update();
  }

  getFeet() {
    if (this.seat) return { x: this.x, y: this.y };
    return { x: this.body.center.x, y: this.body.bottom };
  }

  update({ x = 0, y = 0 } = {}) {
    if (this.seat) return;
    this.setVelocity(x * this.config.speed, y * this.config.speed);
    this.lastDirection = facingDirection({ x, y }, this.lastDirection);
    this.play(`${this.config.texture}-${x || y ? 'walk' : 'idle'}-${this.lastDirection}`, true);
    this.updateDepth(this, this.getFeet().y);
  }
}
