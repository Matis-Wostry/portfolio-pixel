import SoundButton from './SoundButton.js';
import { renderContent } from './renderContent.js';
import { TITLE_CONTENT } from '../data/title.js';
import { UI_ART } from '../config/assets.js';
import { isSafeAssetPath, listConfigured } from '../systems/assetManifest.mjs';
import './game.css';
import './title.css';

const assetURL = (path) => `${import.meta.env.BASE_URL}${path}`;

export default class TitleUI {
  constructor({ audio, onEnter, onShoot }) {
    this.audio = audio;
    this.callbacks = { onEnter, onShoot };
    this.abort = new AbortController();
    this.returnFocus = null;
    this.root = document.createElement('div');
    this.root.className = 'title-ui';
    this.root.innerHTML = `
      <header class="title-header">
        <h1 class="title-sign">
          <span class="title-sign-main">La Chambre du Dev</span>
          <span class="title-sign-sub">Matis Wostry · développeur full-stack</span>
        </h1>
        <p class="title-score" aria-live="polite"></p>
        <button class="wood-button ball-button" type="button">Tirer au panier</button>
      </header>
      <nav class="title-menu" aria-label="Menu principal">
        <button class="wood-button" type="button" data-action="enter">Entrer</button>
        <button class="wood-button" type="button" data-action="controls">Commandes</button>
        <button class="wood-button" type="button" data-action="credits">Crédits</button>
      </nav>`;
    document.body.append(this.root);
    this.score = this.root.querySelector('.title-score');
    this.buttons = [...this.root.querySelectorAll('.wood-button')];
    this.applyArt();
    this.soundButton = new SoundButton(audio, this.root);
    this.createDialog();
    this.listen(this.root.querySelector('.ball-button'), 'click', () => this.callbacks.onShoot());
    this.listen(this.root.querySelector('.title-menu'), 'click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button || button.disabled) return;
      if (button.dataset.action === 'enter') {
        this.audio.play('click');
        this.setEnabled(false);
        this.callbacks.onEnter();
        return;
      }
      this.open(TITLE_CONTENT[button.dataset.action], button);
    });
    this.root.querySelector('[data-action="enter"]').focus({ preventScroll: true });
  }

  listen(target, type, listener) {
    target.addEventListener(type, listener, { signal: this.abort.signal });
  }

  applyArt() {
    listConfigured('ui-', UI_ART).invalid
      .forEach((name) => console.warn(`Chemin ignoré pour ui-${name} : indiquer un chemin relatif au dossier public/.`));
    if (isSafeAssetPath(UI_ART.logo)) {
      const sign = this.root.querySelector('.title-sign');
      const image = document.createElement('img');
      image.className = 'title-logo-image';
      image.alt = '';
      this.listen(image, 'load', () => sign.classList.add('has-logo-image'));
      this.listen(image, 'error', () => {
        console.warn(`Logo introuvable : ${UI_ART.logo}. Logo texte conservé.`);
        image.remove();
      });
      image.src = assetURL(UI_ART.logo);
      sign.prepend(image);
    }
    if (isSafeAssetPath(UI_ART.button)) {
      // Précharger la planche : les boutons générés restent en place si elle est inutilisable.
      const url = assetURL(UI_ART.button);
      const image = new Image();
      this.listen(image, 'load', () => {
        this.root.style.setProperty('--wood-image', `url("${url}")`);
        this.root.classList.add('has-wood-image');
      });
      this.listen(image, 'error', () => console.warn(`Planche de bouton introuvable : ${UI_ART.button}. Boutons générés conservés.`));
      image.src = url;
    }
  }

  createDialog() {
    this.dialog = document.createElement('dialog');
    this.dialog.className = 'portfolio-dialog';
    this.dialog.setAttribute('aria-labelledby', 'title-dialog-heading');
    this.dialog.innerHTML = `
      <header class="dialog-header">
        <h1 id="title-dialog-heading"></h1>
        <button class="close-button" type="button" aria-label="Fermer la fenêtre">Fermer ×</button>
      </header>
      <div class="dialog-content"></div>`;
    document.body.append(this.dialog);
    this.listen(this.dialog.querySelector('.close-button'), 'click', () => this.dialog.close());
    this.listen(this.dialog, 'close', () => {
      this.audio.play('close');
      this.returnFocus?.focus({ preventScroll: true });
    });
  }

  open(content, opener) {
    if (!content || this.dialog.open) return;
    this.returnFocus = opener;
    this.dialog.querySelector('h1').textContent = content.title;
    const body = this.dialog.querySelector('.dialog-content');
    renderContent(body, content);
    this.audio.play('open');
    this.dialog.showModal();
    body.scrollTop = 0;
    this.dialog.querySelector('.close-button').focus();
  }

  setScore(made) {
    this.score.textContent = made > 0 ? `Paniers marqués : ${made}` : '';
  }

  setEnabled(enabled) {
    this.buttons.forEach((button) => { button.disabled = !enabled; });
  }

  destroy() {
    this.abort.abort();
    this.soundButton.destroy();
    this.dialog.remove();
    this.root.remove();
  }
}
