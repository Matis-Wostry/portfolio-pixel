import Phaser from 'phaser';
import AudioManager from '../audio/AudioManager.js';
import TitleUI from '../ui/TitleUI.js';
import { TITLE_ART } from '../config/assets.js';
import { isUsableArtSize } from '../systems/assetManifest.mjs';
import { buildScenery, TITLE_LAYERS, SPRITES } from '../title/scenery.mjs';
import { computeTitleView, TITLE_WORLD } from '../title/layout.mjs';
import { planShot, shotArc, SHOT_DURATION } from '../title/shot.mjs';
import { paintRects } from '../title/paint.js';

const DEPTH = { sky: 0, stars: 1, clouds: 2, city: 3, jet: 4, building: 5, glow: 6, court: 7, ball: 8, halo: 9, foreground: 10 };
const ENTER_DURATION = 900;

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    this.audio = AudioManager.get(this.game);
    this.scenery = buildScenery();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.entering = false;
    this.shooting = false;
    this.made = 0;
    TITLE_LAYERS.forEach((name) => this.addLayer(name));
    this.addStars();
    this.addClouds();
    this.addJet();
    this.addWindowGlow();
    this.addNeon();
    this.addHalo();
    this.addBall();
    this.ui = new TitleUI({ audio: this.audio, onEnter: () => this.enter(), onShoot: () => this.shoot() });
    this.audio.playMusic('title');
    this.resize(this.scale.gameSize);
    this.scale.on('resize', this.resize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.resize, this);
      this.ui.destroy();
    });
  }

  texture(key, { width, height, rects }) {
    if (!this.textures.exists(key)) this.textures.addCanvas(key, paintRects(rects, width, height));
    return key;
  }

  addLayer(name) {
    const fileKey = `title-${name}`;
    if (TITLE_ART[name] && this.textures.exists(fileKey)) {
      if (isUsableArtSize(this.textures.get(fileKey).getSourceImage(), TITLE_WORLD)) {
        this.add.image(0, 0, fileKey).setOrigin(0).setDepth(DEPTH[name]);
        return;
      }
      console.warn(`Calque ${name} ignoré : ${TITLE_WORLD.width} × ${TITLE_WORLD.height} pixels attendus.`);
    }
    const key = this.texture(`title-generated-${name}`, { ...TITLE_WORLD, rects: this.scenery.layers[name] });
    this.add.image(0, 0, key).setOrigin(0).setDepth(DEPTH[name]);
  }

  addStars() {
    this.scenery.stars.forEach(({ x, y, bright }, index) => {
      const star = this.add.rectangle(x, y, 1, 1, bright ? 0xfff2d5 : 0x9d98c8).setOrigin(0).setDepth(DEPTH.stars);
      if (this.reducedMotion || index % 3) return;
      this.tweens.add({ targets: star, alpha: 0.2, duration: 900 + (index % 7) * 180, delay: (index * 137) % 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
  }

  addClouds() {
    const key = this.texture('title-cloud', SPRITES.cloud);
    this.clouds = this.scenery.clouds.map(({ x, y, speed }) => ({
      image: this.add.image(x, y, key).setOrigin(0).setDepth(DEPTH.clouds),
      speed,
    }));
  }

  addJet() {
    const { x, y } = this.scenery.anchors.jet;
    const jet = this.add.image(x, y, this.texture('title-jet', SPRITES.jet)).setOrigin(0.5, 1).setDepth(DEPTH.jet);
    if (!this.reducedMotion) this.tweens.add({ targets: jet, scaleY: 0.92, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  addWindowGlow() {
    const { x, y, w, h } = this.scenery.anchors.window;
    const glow = this.add.rectangle(x, y, w, h, 0x6fb7ff).setOrigin(0).setAlpha(0.18)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.glow);
    if (!this.reducedMotion) this.tweens.add({ targets: glow, alpha: 0.4, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  addNeon() {
    const { x, y } = this.scenery.anchors.neon;
    const neon = this.add.image(x, y, this.texture('title-neon', SPRITES.neon)).setOrigin(0).setDepth(DEPTH.glow);
    if (this.reducedMotion) return;
    this.time.addEvent({ delay: 140, loop: true, callback: () => neon.setAlpha(Math.random() < 0.06 ? 0.3 : 1) });
  }

  addHalo() {
    const { x, y } = this.scenery.anchors.lamp;
    [['title-halo-outer', SPRITES.haloOuter, 0.07], ['title-halo-inner', SPRITES.haloInner, 0.1]].forEach(([key, sprite, alpha]) => {
      this.add.image(x, y, this.texture(key, sprite)).setAlpha(alpha).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.halo);
    });
  }

  addBall() {
    const { x, y } = this.scenery.anchors.ball;
    this.ball = this.add.image(x, y, this.texture('title-ball', SPRITES.ball)).setDepth(DEPTH.ball);
    // Zone de toucher de 19 pixels du monde, soit au moins 48 pixels CSS dès le zoom 3.
    this.ball.setInteractive(new Phaser.Geom.Rectangle(-6, -6, 19, 19), Phaser.Geom.Rectangle.Contains);
    this.ball.input.cursor = 'pointer';
    this.ball.on('pointerdown', () => this.shoot());
  }

  shoot() {
    if (this.shooting || this.entering) return;
    this.shooting = true;
    this.audio.play('bounce');
    const shot = planShot(Math.random(), this.scenery.anchors);
    const progress = { t: 0 };
    this.tweens.add({
      targets: progress,
      t: 1,
      duration: this.reducedMotion ? 450 : SHOT_DURATION,
      onUpdate: () => {
        const point = shotArc(shot, progress.t);
        this.ball.setPosition(point.x, point.y);
      },
      onComplete: () => this.finishShot(shot),
    });
  }

  finishShot(shot) {
    this.audio.play(shot.made ? 'swish' : 'rim');
    if (shot.made) {
      this.made += 1;
      this.ui.setScore(this.made);
    }
    const { x, y } = this.scenery.anchors.ball;
    this.tweens.add({
      targets: this.ball,
      x,
      y,
      duration: this.reducedMotion ? 250 : 650,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.audio.play('bounce');
        this.shooting = false;
      },
    });
  }

  enter() {
    if (this.entering) return;
    this.entering = true;
    this.audio.play('enter');
    this.audio.playMusic('room');
    const camera = this.cameras.main;
    camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('GameScene'));
    if (this.reducedMotion) {
      camera.fadeOut(400, 0, 0, 0);
      return;
    }
    const { x, y, w, h } = this.scenery.anchors.window;
    camera.pan(x + w / 2, y + h / 2, ENTER_DURATION, 'Sine.easeInOut');
    camera.zoomTo(camera.zoom * 6, ENTER_DURATION, 'Sine.easeIn');
    this.time.delayedCall(ENTER_DURATION - 300, () => camera.fadeOut(300, 0, 0, 0));
  }

  resize(size) {
    if (this.entering) return;
    const view = computeTitleView(size.width, size.height, this.scenery.anchors.focus);
    const camera = this.cameras.main;
    camera.setSize(size.width, size.height);
    camera.setZoom(view.zoom);
    camera.centerOn(view.centerX, view.centerY);
  }

  update(time, delta) {
    if (this.reducedMotion) return;
    this.clouds.forEach((cloud) => {
      cloud.image.x += (cloud.speed * delta) / 1000;
      if (cloud.image.x > TITLE_WORLD.width) cloud.image.x = -SPRITES.cloud.width;
    });
  }
}
