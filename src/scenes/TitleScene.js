import Phaser from 'phaser';
import AudioManager from '../audio/AudioManager.js';
import TitleUI from '../ui/TitleUI.js';
import { TITLE_ART } from '../config/assets.js';
import { isUsableArtSize } from '../systems/assetManifest.mjs';
import { computeTitleView, TITLE_WORLD } from '../title/layout.mjs';
import { introLayerKey, introSpriteKey } from '../title/intro.js';
import { flickerSequence, nextToggle } from '../title/lights.mjs';
import { nextPassage, crossing, nextDogAction } from '../title/life.mjs';

const DEPTH = {
  sky: 0, stars: 1, clouds: 2, city: 3, cityLights: 3.5, jet: 4, building: 5, windows: 5.5, glow: 6,
  street: 7, reflections: 7.05, dog: 7.2, cyclist: 7.4, tram: 7.5, leaves: 7.6, halo: 8, fireflies: 8.5, foreground: 9,
};
const PASSER_LAYOUT = {
  cyclist: { frames: ['cyclist0', 'cyclist1'], bottom: 283, frameDelay: 150 },
  tram: { frames: ['tram'], bottom: 283, frameDelay: 0 },
};
const SCREEN_FRAMES = 5;
const ENTER_DURATION = 900;

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    this.audio = AudioManager.get(this.game);
    // Décor et sprites en PNG (public/assets/intro/), positions dans scene.json.
    this.scenery = this.cache.json.get('intro');
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.entering = false;
    this.generated = {};
    this.scenery.layers.forEach((name) => { this.generated[name] = this.addLayer(name); });
    this.addReflections();
    this.addStars();
    this.addClouds();
    this.addJet();
    this.addWindowGlow();
    this.addNeon();
    this.addLamp();
    // Les lumières calées sur le dessin exact ne s'appliquent qu'au décor généré.
    if (this.generated.city) this.addCityLights();
    if (this.generated.building) {
      this.addWindows();
      this.addArcadeScreens();
    }
    this.addFireflies();
    this.addDog();
    this.addLeaves();
    this.addPassers();
    this.ui = new TitleUI({ audio: this.audio, onEnter: () => this.enter() });
    this.audio.playMusic('title');
    this.resize(this.scale.gameSize);
    this.scale.on('resize', this.resize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.resize, this);
      this.ui.destroy();
    });
  }

  sprite(name) {
    return introSpriteKey(name);
  }

  size(name) {
    return this.scenery.sprites[name];
  }

  // Renvoie true quand le calque est celui livré avec le jeu (les lumières sont calées dessus).
  addLayer(name) {
    const fileKey = `title-${name}`;
    if (TITLE_ART[name] && this.textures.exists(fileKey)) {
      if (isUsableArtSize(this.textures.get(fileKey).getSourceImage(), TITLE_WORLD)) {
        this.add.image(0, 0, fileKey).setOrigin(0).setDepth(DEPTH[name]);
        return false;
      }
      console.warn(`Calque ${name} ignoré : ${TITLE_WORLD.width} × ${TITLE_WORLD.height} pixels attendus.`);
    }
    this.add.image(0, 0, introLayerKey(name)).setOrigin(0).setDepth(DEPTH[name]);
    return true;
  }

  // Rejoue sans fin des séquences d'intensité ; lumière fixe si le visiteur réduit les animations.
  flicker(apply, options) {
    if (this.reducedMotion) {
      apply(1);
      return;
    }
    const play = () => {
      let at = 0;
      flickerSequence(Math.random, options).forEach(({ level, duration }) => {
        this.time.delayedCall(at, () => apply(level));
        at += duration;
      });
      this.time.delayedCall(at, play);
    };
    play();
  }

  // Allume ou éteint une lumière à la fois, à intervalles irréguliers.
  toggleLoop(states, options, apply, speed = 1) {
    if (this.reducedMotion) return;
    const tick = () => {
      const toggle = nextToggle(Math.random, states, options);
      if (!toggle) return;
      this.time.delayedCall(toggle.delay / speed, () => {
        states[toggle.index] = toggle.lit;
        apply(toggle.index, toggle.lit);
        tick();
      });
    };
    tick();
  }

  glowImage(x, y, name, alpha, depth = DEPTH.glow) {
    return this.add.image(x, y, this.sprite(name)).setAlpha(alpha).setBlendMode(Phaser.BlendModes.ADD).setDepth(depth);
  }

  addStars() {
    // Les étoiles fixes sont peintes dans le ciel ; celles-ci scintillent.
    this.scenery.stars.forEach(({ x, y, bright }, index) => {
      const star = this.add.image(x, y, this.sprite(bright ? 'star' : 'starDim')).setOrigin(0).setDepth(DEPTH.stars);
      if (this.reducedMotion) return;
      const i = index * 3;
      this.tweens.add({ targets: star, alpha: 0.2, duration: 900 + (i % 7) * 180, delay: (i * 137) % 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
  }

  addClouds() {
    const key = this.sprite('cloud');
    this.clouds = this.scenery.clouds.map(({ x, y, speed }) => ({
      image: this.add.image(x, y, key).setOrigin(0).setDepth(DEPTH.clouds),
      speed,
    }));
  }

  addJet() {
    const { x, y, h } = this.scenery.anchors.jet;
    const jet = this.add.image(x, y, this.sprite('jet')).setOrigin(this.scenery.jetCenter / this.size('jet').width, 1).setDepth(DEPTH.jet);
    if (this.reducedMotion) return;
    this.tweens.add({ targets: jet, scaleY: 0.97, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // Embruns : gouttes qui quittent la couronne et retombent sous le vent, vers la droite.
    for (let i = 0; i < 10; i++) {
      const startX = x + (i % 3) - 1;
      const startY = y - h + 3 + (i % 4);
      const drop = this.add.image(startX, startY, this.sprite(i % 3 ? 'dropSide' : 'drop')).setOrigin(0).setDepth(DEPTH.jet);
      this.tweens.add({
        targets: drop,
        x: startX + 5 + (i % 5) * 3,
        y: startY + 18 + (i % 4) * 7,
        alpha: { from: 1, to: 0 },
        duration: 1100 + (i % 4) * 250,
        delay: i * 170,
        repeat: -1,
        ease: 'Quad.easeIn',
      });
    }
  }

  addWindowGlow() {
    const { x, y, w, h } = this.scenery.anchors.window;
    const glow = this.add.image(x, y, this.sprite('windowGlow')).setOrigin(0).setAlpha(0.3)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.glow);
    // Lumière d'écran : varie sans cesse, sans jamais s'éteindre.
    this.flicker((level) => {
      glow.setAlpha(0.14 + 0.3 * level);
      this.reflect('matis', level);
    }, { hum: 0.7, stutterChance: 0.03, outageChance: 0 });
  }

  addNeon() {
    const { x, y } = this.scenery.anchors.neon;
    const centerX = x + 6.5;
    const centerY = y + 3.5;
    const wide = this.glowImage(centerX, centerY, 'neonGlow', 0.08).setScale(1.9, 1.1);
    const middle = this.glowImage(centerX, centerY, 'neonGlow', 0.08).setScale(1.35, 0.8);
    const close = this.glowImage(centerX, centerY, 'neonGlow', 0.16).setScale(0.9, 0.55);
    const tube = this.add.image(x - 1, y - 1, this.sprite('neon')).setOrigin(0).setDepth(DEPTH.glow);
    this.flicker((level) => {
      tube.setAlpha(level);
      wide.setAlpha(0.08 * level);
      middle.setAlpha(0.08 * level);
      close.setAlpha(0.16 * level);
      this.reflect('neon', level);
    }, { hum: 0.15, stutterChance: 0.06, outageChance: 0.015 });
  }

  addLamp() {
    // Chaque lampadaire grésille à son propre rythme.
    this.scenery.anchors.lamps.forEach(({ x, y }, index) => {
      const outer = this.glowImage(x, y, 'haloOuter', 0.07, DEPTH.halo);
      const inner = this.glowImage(x, y, 'haloInner', 0.1, DEPTH.halo);
      const pool = this.glowImage(x, 262, 'lampPool', 0.045, DEPTH.halo);
      const bulb = this.add.image(x - 3, y - 2, this.sprite('bulb')).setOrigin(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.halo);
      this.flicker((level) => {
        outer.setAlpha(0.07 * level);
        inner.setAlpha(0.1 * level);
        pool.setAlpha(0.045 * level);
        bulb.setAlpha(0.35 * level);
        this.reflect('lamp', level, index);
      }, { hum: 0.25, stutterChance: 0.03, outageChance: 0.005 });
    });
    const door = this.scenery.anchors.doorLamp;
    const doorGlow = this.glowImage(door.x, door.y, 'haloSmall', 0.1);
    this.flicker((level) => {
      doorGlow.setAlpha(0.1 * level);
      this.reflect('door', level);
    }, { hum: 0.3, stutterChance: 0.01, outageChance: 0 });
  }

  addWindows() {
    const states = this.scenery.windows.map(({ lit }) => lit);
    const lights = this.scenery.windows.map(({ x, y, lit, flowers }) => {
      const image = this.add.image(x - 1, y, this.sprite(flowers ? 'litWindowFlowers' : 'litWindow')).setOrigin(0).setDepth(DEPTH.windows);
      const halo = this.glowImage(x + 8, y + 10, 'haloSmall', 0.09);
      [image, halo].forEach((item) => item.setVisible(lit));
      return { image, halo };
    });
    // Le reflet d'une colonne de fenêtres grandit avec le nombre de voisins allumés.
    const updateColumns = () => {
      const lit = {};
      this.scenery.windows.forEach(({ x }, index) => { lit[x] = (lit[x] ?? 0) + (states[index] ? 1 : 0); });
      Object.entries(lit).forEach(([column, count]) => this.reflect('column', Math.min(count / 2, 1), Number(column)));
    };
    updateColumns();
    this.toggleLoop(states, { minLit: 1, maxLit: 4 }, (index, lit) => {
      const { image, halo } = lights[index];
      [image, halo].forEach((item) => item.setVisible(lit));
      // Un interrupteur : bref sursaut à l'allumage, extinction franche.
      if (lit) this.tweens.add({ targets: image, alpha: { from: 0.4, to: 1 }, duration: 90 });
      updateColumns();
    });
  }

  addCityLights() {
    const lights = this.scenery.cityLights;
    const states = lights.map(() => true);
    // Un cache de la couleur des immeubles éteint la fenêtre peinte dessous.
    const covers = lights.map(({ x, y }) => this.add.image(x, y, this.sprite('cityLightOff')).setOrigin(0).setDepth(DEPTH.cityLights).setVisible(false));
    this.toggleLoop(states, { minLit: lights.length - 6 }, (index, lit) => covers[index].setVisible(!lit), 3);
  }

  addArcadeScreens() {
    const screens = this.scenery.anchors.screens.map(({ x, y }, index) => (
      this.add.image(x, y, this.sprite(`arcadeScreen${index}`)).setOrigin(0).setDepth(DEPTH.glow)
    ));
    if (this.reducedMotion) return;
    screens.forEach((screen) => {
      const change = () => {
        screen.setTexture(this.sprite(`arcadeScreen${Math.floor(Math.random() * SCREEN_FRAMES)}`));
        this.time.delayedCall(300 + Math.random() * 900, change);
      };
      change();
    });
  }

  addFireflies() {
    if (this.reducedMotion) return;
    const { x, y } = this.scenery.anchors.tree;
    for (let i = 0; i < 6; i++) {
      const fly = this.add.image(x - 18 + i * 7, y - 6 + (i % 3) * 10, this.sprite('firefly')).setOrigin(0)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.fireflies).setAlpha(0);
      const wander = () => this.tweens.add({
        targets: fly,
        x: x - 24 + Math.random() * 48,
        y: y - 14 + Math.random() * 40,
        duration: 2500 + Math.random() * 2500,
        ease: 'Sine.easeInOut',
        onComplete: wander,
      });
      wander();
      this.tweens.add({
        targets: fly, alpha: 1, duration: 700 + i * 120, delay: i * 400, hold: 300, repeatDelay: 900 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }
  }

  // Reflets des lumières sur les pavés mouillés : seulement sur la chaussée générée.
  addReflections() {
    this.reflections = [];
    if (!this.generated.street) return;
    this.reflections = this.scenery.anchors.reflections.map(({ x, color, light, column }) => {
      const image = this.add.image(x - 3, 266, this.sprite(`reflection-${color}`)).setOrigin(0)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.reflections).setAlpha(0);
      return { image, light, column };
    });
  }

  reflect(light, level, column) {
    this.reflections.forEach((reflection) => {
      if (reflection.light === light && (column === undefined || reflection.column === column)) reflection.image.setAlpha(0.4 * level);
    });
  }

  addDog() {
    const { x, y } = this.scenery.anchors.dog;
    const dog = this.add.image(x, y, this.sprite('dogStand')).setOrigin(0).setDepth(DEPTH.dog);
    if (this.reducedMotion) return;
    const frames = { idle: ['dogStand'], wag: ['dogStand', 'dogWag'], sit: ['dogSit'], sniff: ['dogSniff', 'dogStand', 'dogSniff'] };
    const act = () => {
      const { action, duration } = nextDogAction(Math.random);
      const sequence = frames[action];
      const step = action === 'wag' ? 160 : duration / sequence.length;
      let index = 0;
      dog.setTexture(this.sprite(sequence[0]));
      const timer = this.time.addEvent({
        delay: step,
        loop: true,
        callback: () => {
          index += 1;
          dog.setTexture(this.sprite(sequence[index % sequence.length]));
        },
      });
      this.time.delayedCall(duration, () => {
        timer.remove();
        act();
      });
    };
    act();
  }

  addLeaves() {
    if (this.reducedMotion) return;
    const { x, y } = this.scenery.anchors.tree;
    const key = this.sprite('leaf');
    const drop = () => {
      const startX = x - 14 + Math.random() * 28;
      const startY = y - 8 + Math.random() * 14;
      const leaf = this.add.image(startX, startY, key).setDepth(DEPTH.leaves);
      const progress = { t: 0 };
      const drift = -6 + Math.random() * 12;
      this.tweens.add({
        targets: progress,
        t: 1,
        duration: 4000 + Math.random() * 2500,
        onUpdate: () => {
          const { t } = progress;
          leaf.setPosition(startX + drift * t + Math.sin(t * Math.PI * 4) * 3, startY + (257 - startY) * t);
          leaf.setAngle(Math.sin(t * Math.PI * 6) * 60);
          leaf.setAlpha(t > 0.85 ? (1 - t) / 0.15 : 1);
        },
        onComplete: () => leaf.destroy(),
      });
      this.time.delayedCall(2000 + Math.random() * 3500, drop);
    };
    this.time.delayedCall(1200, drop);
  }

  // Un passage à la fois sur la chaussée : cycliste ou tram.
  addPassers() {
    if (this.reducedMotion) return;
    const next = () => {
      const passage = nextPassage(Math.random);
      this.time.delayedCall(passage.delay, () => this.pass(passage, next));
    };
    next();
  }

  pass(passage, done) {
    const layout = PASSER_LAYOUT[passage.kind];
    const sprite = this.size(layout.frames[0]);
    const { fromX, toX, duration } = crossing(passage, TITLE_WORLD.width, sprite.width);
    const passer = this.add.image(fromX, layout.bottom - sprite.height + 1, this.sprite(layout.frames[0]))
      .setOrigin(0).setDepth(DEPTH[passage.kind]).setFlipX(passage.direction === -1);
    let frame = 0;
    const timer = layout.frames.length > 1 ? this.time.addEvent({
      delay: layout.frameDelay,
      loop: true,
      callback: () => {
        frame += 1;
        passer.setTexture(this.sprite(layout.frames[frame % layout.frames.length]));
      },
    }) : null;
    this.tweens.add({
      targets: passer,
      x: toX,
      duration,
      onComplete: () => {
        timer?.remove();
        passer.destroy();
        done();
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
      if (cloud.image.x > TITLE_WORLD.width) cloud.image.x = -this.size('cloud').width;
    });
  }
}
