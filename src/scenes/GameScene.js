import Phaser from 'phaser';
import Player from '../objects/Player.js';
import GameControls from '../input/GameControls.js';
import GameUI from '../ui/GameUI.js';
import InteractionSystem from '../systems/InteractionSystem.js';
import { PORTFOLIO } from '../data/portfolio.js';
import { computeView, computeBounds } from '../config/viewport.mjs';

const TILESETS = [
  { tiledName: 'Sol',        key: 'Sol' },
  { tiledName: 'Mur',        key: 'Mur' },
  { tiledName: 'Mur-bas',    key: 'Mur-bas' },
  { tiledName: 'Mur-haut',   key: 'Mur-haut' },
  { tiledName: 'Mur-droit',  key: 'Mur-droit' },
  { tiledName: 'Mur-gauche', key: 'Mur-gauche' },
  { tiledName: 'Mur-coin',   key: 'Mur-coin' },
];

// Noms des calques dans Tiled
const LAYERS = {
  sol:          'sol',
  murs:         'murs',
  decorations:  'decorations',        // peut ne pas exister encore
  interactions: 'objets_interaction', // peut ne pas exister encore
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.player = null;
    this.mapSize = null;
    this.interactions = null;
    this.paused = false;
    this.controls = new GameControls();
    this.ui = new GameUI({
      onJoystick: (direction) => this.controls.setJoystick(direction),
      onAction: () => this.controls.requestAction(),
      onCancel: () => this.controls.reset(),
      onPauseChange: (paused) => this.setPaused(paused),
    });
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.resizeViewport, this);
      this.interactions?.destroy();
      this.ui.destroy();
      this.controls.destroy();
    });
    // --- Tilemap ---
    const map = this.make.tilemap({ key: 'chambre' });
    this.mapSize = { width: map.widthInPixels, height: map.heightInPixels };
    this.interactions = new InteractionSystem(this, map, () => this.controls.requestAction());

    // Ajoute chaque tileset (ignore silencieusement s'il n'existe pas dans la map)
    const tilesets = TILESETS.map(({ tiledName, key }) => {
      const ts = map.addTilesetImage(tiledName, key);
      if (!ts) console.warn(`Tileset introuvable dans la map : "${tiledName}"`);
      return ts;
    }).filter(Boolean);

    if (tilesets.length === 0) {
      console.error('Aucun tileset chargé — vérifie les noms dans TILESETS et dans Tiled.');
      return;
    }

    // --- Calques ---
    const layerSol   = this._createLayer(map, LAYERS.sol,  tilesets);
    const layerMurs  = this._createLayer(map, LAYERS.murs, tilesets);
    const layerDeco  = this._createLayer(map, LAYERS.decorations, tilesets);
    layerSol?.setDepth(-1000);
    layerMurs?.setDepth(-900);
    layerDeco?.setDepth(-800);
    this._createLayer(map, 'premier_plan', tilesets)?.setDepth(10000);

    // Collision sur toutes les tiles non-vides du calque murs
    if (layerMurs) {
      layerMurs.forEachTile(tile => {
        if (tile.index !== -1) tile.setCollision(true, true, true, true);
      });
    }

    // --- Joueur ---
    // Spawn au centre de la map par défaut
    const spawnX = map.widthInPixels  / 2;
    const spawnY = map.heightInPixels / 2;
    this.player = new Player(this, spawnX, spawnY);
    this.game.canvas.tabIndex = 0;
    this.game.canvas.setAttribute('aria-label', 'La Chambre du Dev : déplace-toi avec les flèches, ZQSD ou WASD et utilise E pour interagir.');
    this.player.setDepth(this.player.getFeet().y);

    // Collisions joueur ↔ murs
    if (layerMurs) {
      this.physics.add.collider(this.player, layerMurs);
    }

    // --- Caméra ---
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.resizeViewport(this.scale.gameSize);
    this.scale.on('resize', this.resizeViewport, this);

    // Monde physique limité à la taille de la map
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player.setCollideWorldBounds(true);

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

  _createLayer(map, layerName, tilesets) {
    if (!map.layers.some((layer) => layer.name === layerName)) return null;
    const layer = map.createLayer(layerName, tilesets, 0, 0);
    if (!layer) {
      console.warn(`Calque introuvable : "${layerName}" — ce n'est pas bloquant.`);
      return null;
    }
    return layer;
  }

  update() {
    if (!this.player) return;
    this.player.update(this.controls.getDirection());
    if (this.paused) return;
    this.ui.setTarget(this.interactions.update(this.player.getFeet()));
    if (this.controls.consumeAction()) {
      const content = PORTFOLIO[this.interactions.activate()];
      if (!content) return;
      this.ui.open(content);
    }
  }
}
