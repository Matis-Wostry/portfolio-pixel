import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  pixelArt: true,
  scale: { mode: Phaser.Scale.RESIZE },
  render: { roundPixels: true },
  backgroundColor: '#140f17',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  input: { keyboard: false },
  scene: [BootScene, GameScene]
};

const game = new Phaser.Game(config);

// Phaser 3.90 : au changement d'orientation, refresh() redimensionne avec l'ancienne taille du parent puis
// mémorise la nouvelle, si bien que le jeu reste bloqué en portrait. On relit la taille et on redimensionne
// à l'image suivante, une fois la mise en page du navigateur à jour.
const resyncSize = () => requestAnimationFrame(() => {
  game.scale.getParentBounds();
  game.scale.refresh();
});
window.addEventListener('resize', resyncSize);
screen.orientation?.addEventListener('change', resyncSize);
