import Phaser from 'phaser';
import Player from '../objects/Player.js';
import Room from '../objects/Room.js';
import GameControls from '../input/GameControls.js';
import GameUI from '../ui/GameUI.js';
import InteractionSystem from '../systems/InteractionSystem.js';
import { PORTFOLIO } from '../data/portfolio.js';
import { ROOM, ROOM_ZONES, SEATS } from '../data/room.js';
import { computeView, computeBounds } from '../config/viewport.mjs';
import AudioManager from '../audio/AudioManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.player = null;
    this.mapSize = null;
    this.interactions = null;
    this.paused = false;
    this.audio = AudioManager.get(this.game);
    this.controls = new GameControls();
    this.ui = new GameUI({
      onJoystick: (direction) => this.controls.setJoystick(direction),
      onAction: () => this.controls.requestAction(),
      onCancel: () => this.controls.reset(),
      onPauseChange: (paused) => this.setPaused(paused),
      audio: this.audio,
    });
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.resizeViewport, this);
      this.interactions?.destroy();
      this.ui.destroy();
      this.controls.destroy();
    });
    const room = new Room(this);
    this.room = room;
    this.mapSize = { width: room.width, height: room.height };
    this.interactions = new InteractionSystem(this, ROOM_ZONES, () => this.controls.requestAction());

    this.player = new Player(this, ROOM.spawn.x, ROOM.spawn.y);
    this.game.canvas.tabIndex = 0;
    this.game.canvas.setAttribute('aria-label', 'La Chambre du Dev : déplace-toi avec les flèches, ZQSD ou WASD et utilise E pour interagir.');
    this.player.setDepth(this.player.getFeet().y);
    this.physics.add.collider(this.player, room.solids);
    const bounds = room.walkBounds;
    this.physics.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    this.player.setCollideWorldBounds(true);

    // --- Caméra ---
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.resizeViewport(this.scale.gameSize);
    this.scale.on('resize', this.resizeViewport, this);
    this.audio.playMusic('room');
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  resizeViewport(size) {
    if (!this.mapSize) return;
    const view = computeView(size.width, size.height);
    const bounds = computeBounds(this.mapSize.width, this.mapSize.height, view);
    const camera = this.cameras.main;
    camera.setSize(size.width, size.height);
    camera.setZoom(view.zoom);
    camera.setBounds(bounds.x, bounds.y, bounds.width, bounds.height, true);
    this.ui.cancelGesture();
    this.controls.reset();
    this.player?.setVelocity(0, 0);
    this.ui.updateOrientation(size);
  }

  setPaused(paused) {
    if (this.paused === paused) return;
    this.paused = paused;
    this.controls.setEnabled(!paused);
    this.interactions?.setEnabled(!paused);
    this.player?.update();
    this.ui.setTarget(null);
  }

  sitOn(id) {
    const seat = SEATS.find((candidate) => candidate.id === id);
    if (!seat) return;
    const furnitureDepth = this.room.depths[seat.furniture] ?? seat.y;
    this.player.sit({ ...seat, depth: furnitureDepth + (seat.behind ? -0.75 : 0.75) });
    this.interactions.exclude(id);
  }

  standUp() {
    this.player.stand();
    this.interactions.exclude(null);
  }

  update() {
    if (!this.player) return;
    const direction = this.controls.getDirection();
    // Assis, un déplacement fait se relever.
    if (this.player.seat && !this.paused && (direction.x || direction.y)) this.standUp();
    this.player.update(direction);
    if (this.paused) return;
    this.ui.setTarget(this.interactions.update(this.player.getFeet()));
    if (this.controls.consumeAction()) {
      const zone = this.interactions.target;
      if (!zone) {
        if (this.player.seat) this.standUp();
        return;
      }
      if (zone.action === 'sit') {
        this.sitOn(zone.id);
        return;
      }
      const content = PORTFOLIO[zone.action];
      if (content) this.ui.open(content);
    }
  }
}
