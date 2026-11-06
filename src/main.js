import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import './ui/title.css';
import { initTitleScreen } from './ui/titleScreen.js';

// Phaser pèse l'essentiel du site : il n'est téléchargé que si le visiteur choisit d'entrer dans le jeu.
initTitleScreen(document.getElementById('title-screen'), async () => {
  const { startGame } = await import('./game.js');
  startGame();
});
