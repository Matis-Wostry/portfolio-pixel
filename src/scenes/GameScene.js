import Phaser from 'phaser';
import Player from '../objects/Player.js';
import { resolveDirection } from '../input/direction.mjs';

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
    this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,Z,Q,S,D,W,A');
    // --- Tilemap ---
    const map = this.make.tilemap({ key: 'chambre' });

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
    this.player.setDepth(10);

    // Collisions joueur ↔ murs
    if (layerMurs) {
      this.physics.add.collider(this.player, layerMurs);
    }

    // --- Caméra ---
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Monde physique limité à la taille de la map
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player.setCollideWorldBounds(true);

  }

  _createLayer(map, layerName, tilesets) {
    const layer = map.createLayer(layerName, tilesets, 0, 0);
    if (!layer) {
      console.warn(`Calque introuvable : "${layerName}" — ce n'est pas bloquant.`);
      return null;
    }
    return layer;
  }

  update() {
    if (!this.player) return;
    const k = this.keys;
    this.player.update(resolveDirection({
      x: Number(k.RIGHT.isDown || k.D.isDown) - Number(k.LEFT.isDown || k.Q.isDown || k.A.isDown),
      y: Number(k.DOWN.isDown || k.S.isDown) - Number(k.UP.isDown || k.Z.isDown || k.W.isDown),
    }));
  }
}
