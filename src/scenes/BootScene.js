export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // --- MAP ---
    this.load.tilemapTiledJSON('chambre', '/assets/tilemaps/chambre.json');

    // --- Tilesets ---
    this.load.image('Sol',        '/assets/tilesets/Sol.png');
    this.load.image('Mur',        '/assets/tilesets/Mur.png');
    this.load.image('Mur-bas',    '/assets/tilesets/Mur-bas.png');
    this.load.image('Mur-haut',   '/assets/tilesets/Mur-haut.png');
    this.load.image('Mur-droit',  '/assets/tilesets/Mur-droit.png');
    this.load.image('Mur-gauche', '/assets/tilesets/Mur-gauche.png');
    this.load.image('Mur-coin',   '/assets/tilesets/Mur-coin.png');
    // Note : Mur.png fait 32×64px (tile plus haut que la grille — normal)

    // --- Personnage ---
    // Charge le vrai sprite s'il existe, sinon génère un placeholder
    if (this.textures.exists('joueur')) return;
    this.load.spritesheet('joueur', '/assets/sprites/joueur.png', {
      frameWidth: 19,
      frameHeight: 32
    });
    this.load.on('filecomplete-spritesheet-joueur', () => { /* sprite prêt */ });

    // Barre de chargement simple
    const { width, height } = this.scale;
    const bar = this.add.rectangle(width / 2, height / 2, 0, 8, 0xffffff);
    this.load.on('progress', (p) => bar.setSize(width * p, 8));
    this.load.on('complete', () => bar.destroy());
  }

  create() {
    if (!this.textures.exists('joueur')) this._createPlaceholder();
    this.scene.start('GameScene');
  }

  _createPlaceholder() {
    // Spritesheet 64×128 : 4 colonnes × 4 lignes, chaque frame 16×32
    // Couleur différente par direction pour visualiser les anims
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12]; // bas haut gauche droite
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        gfx.fillStyle(colors[row], 1);
        gfx.fillRect(col * 17, row * 30, 15, 28);
        gfx.fillStyle(0xffffff, 0.6);
        gfx.fillRect(col * 17 + 5, row * 30 + 4, 5, 6);
      }
    }
    gfx.generateTexture('joueur', 68, 120);
    gfx.destroy();
  }
}
