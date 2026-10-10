export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'joueur');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Hitbox plus petite que le sprite pour les collisions
    this.body.setSize(13, 26);
    this.body.setOffset(4, 4);

    this.speed = 120;

    this._createAnimations(scene);

    // Contrôles clavier
    this.keys = scene.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      z:     Phaser.Input.Keyboard.KeyCodes.Z,
      q:     Phaser.Input.Keyboard.KeyCodes.Q,
      s:     Phaser.Input.Keyboard.KeyCodes.S,
      d:     Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.lastDirection = 'down';
  }

  _createAnimations(scene) {
    const anims = scene.anims;

    // Bas — row 0 (frames 0–3)
    anims.create({
      key: 'walk-down',
      frames: anims.generateFrameNumbers('joueur', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    // Haut — row 1 (frames 4–7)
    anims.create({
      key: 'walk-up',
      frames: anims.generateFrameNumbers('joueur', { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1
    });

    // Gauche — row 2 (frames 8–11)
    anims.create({
      key: 'walk-left',
      frames: anims.generateFrameNumbers('joueur', { start: 8, end: 11 }),
      frameRate: 8,
      repeat: -1
    });

    // Droite — row 3 (frames 12–15)
    anims.create({
      key: 'walk-right',
      frames: anims.generateFrameNumbers('joueur', { start: 12, end: 15 }),
      frameRate: 8,
      repeat: -1
    });

    // Idle par direction (frame fixe début de chaque row)
    anims.create({ key: 'idle-down',  frames: [{ key: 'joueur', frame: 0 }],  frameRate: 1 });
    anims.create({ key: 'idle-up',    frames: [{ key: 'joueur', frame: 4 }],  frameRate: 1 });
    anims.create({ key: 'idle-left',  frames: [{ key: 'joueur', frame: 8 }],  frameRate: 1 });
    anims.create({ key: 'idle-right', frames: [{ key: 'joueur', frame: 12 }], frameRate: 1 });
  }

  update() {
    const { keys, speed } = this;
    let vx = 0;
    let vy = 0;

    if (keys.left.isDown  || keys.q.isDown) vx = -speed;
    if (keys.right.isDown || keys.d.isDown) vx =  speed;
    if (keys.up.isDown    || keys.z.isDown) vy = -speed;
    if (keys.down.isDown  || keys.s.isDown) vy =  speed;

    // Normalise la diagonale
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.setVelocity(vx, vy);

    if (vx < 0)      { this.play('walk-left',  true); this.lastDirection = 'left'; }
    else if (vx > 0) { this.play('walk-right', true); this.lastDirection = 'right'; }
    else if (vy < 0) { this.play('walk-up',    true); this.lastDirection = 'up'; }
    else if (vy > 0) { this.play('walk-down',  true); this.lastDirection = 'down'; }
    else             { this.play(`idle-${this.lastDirection}`, true); }
  }
}
