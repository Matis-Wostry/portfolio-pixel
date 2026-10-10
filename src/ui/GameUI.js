import { joystickDirection } from '../input/direction.mjs';
import { safeLink } from './content.mjs';
import { LandscapeSuggestion } from './orientation.mjs';
import './game.css';

export default class GameUI {
  constructor({ onJoystick, onAction, onCancel, onPauseChange = () => {} }) {
    this.callbacks = { onJoystick, onAction, onCancel, onPauseChange };
    this.abort = new AbortController();
    this.root = document.createElement('div');
    this.root.className = 'game-ui';
    this.root.innerHTML = `
      <div class="game-help">
        <span class="desktop-help">Explore la chambre · Flèches / ZQSD / WASD · E pour interagir</span>
        <span class="mobile-help">Explore la chambre · Joystick pour bouger · Interagir près d’un objet</span>
      </div>
      <p class="interaction-hint" role="status" aria-live="polite"></p>
      <div class="touch-controls">
        <div class="joystick" aria-label="Joystick de déplacement">
          <span class="joystick-knob"></span>
          <span class="joystick-caption">Déplacer</span>
        </div>
        <button class="action-button" type="button" disabled>Interagir</button>
      </div>`;
    document.body.append(this.root);
    this.hint = this.root.querySelector('.interaction-hint');
    this.stick = this.root.querySelector('.joystick');
    this.knob = this.root.querySelector('.joystick-knob');
    this.actionButton = this.root.querySelector('.action-button');
    this.enabled = true;
    this.pointerId = null;
    this.bindJoystick();
    this.listen(this.actionButton, 'pointerdown', (event) => event.stopPropagation());
    this.listen(this.actionButton, 'click', () => {
      if (this.enabled) this.callbacks.onAction();
    });
    this.listen(window, 'blur', () => this.cancelGesture());
    this.listen(document, 'visibilitychange', () => {
      if (document.hidden) this.cancelGesture();
    });
    this.createDialog();
    this.createOrientationDialog();
  }

  listen(target, type, listener) {
    target.addEventListener(type, listener, { signal: this.abort.signal });
  }

  bindJoystick() {
    this.listen(this.stick, 'pointerdown', (event) => {
      if (!this.enabled || this.pointerId !== null || event.button > 0) return;
      event.preventDefault();
      this.pointerId = event.pointerId;
      document.querySelector('canvas')?.focus({ preventScroll: true });
      this.stick.setPointerCapture(event.pointerId);
      this.moveJoystick(event);
    });
    this.listen(this.stick, 'pointermove', (event) => {
      if (event.pointerId === this.pointerId) this.moveJoystick(event);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => {
      this.listen(this.stick, type, (event) => {
        if (event.pointerId === this.pointerId) this.cancelGesture();
      });
    });
  }

  moveJoystick(event) {
    const bounds = this.stick.getBoundingClientRect();
    const radius = bounds.width / 2;
    const dx = event.clientX - bounds.left - radius;
    const dy = event.clientY - bounds.top - bounds.height / 2;
    const direction = joystickDirection(dx, dy, radius);
    this.knob.style.transform = `translate(${direction.x * radius * 0.55}px, ${direction.y * radius * 0.55}px)`;
    this.callbacks.onJoystick(direction);
  }

  cancelGesture() {
    const pointer = this.pointerId;
    this.pointerId = null;
    if (pointer !== null && this.stick.hasPointerCapture(pointer)) this.stick.releasePointerCapture(pointer);
    this.knob.style.transform = '';
    this.callbacks.onCancel();
  }

  setTarget(zone) {
    if (this.target !== zone) {
      this.target = zone;
      this.hint.textContent = zone ? `${zone.label} · E / Interagir` : '';
    }
    this.actionButton.disabled = !zone || !this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.root.classList.toggle('is-paused', !enabled);
    this.cancelGesture();
    this.setTarget(enabled ? this.target : null);
  }

  createDialog() {
    this.dialog = document.createElement('dialog');
    this.dialog.className = 'portfolio-dialog';
    this.dialog.setAttribute('aria-labelledby', 'portfolio-title');
    this.dialog.innerHTML = `
      <header class="dialog-header">
        <h1 id="portfolio-title"></h1>
        <button class="close-button" type="button" aria-label="Fermer la fenêtre">Fermer ×</button>
      </header>
      <div class="dialog-content"></div>`;
    document.body.append(this.dialog);
    this.listen(this.dialog.querySelector('.close-button'), 'click', () => this.close());
    this.listen(this.dialog, 'close', () => {
      this.setTarget(null);
      this.syncPause();
      this.restoreFocus();
    });
  }

  createOrientationDialog() {
    this.landscapeSuggestion = new LandscapeSuggestion();
    this.orientationDialog = document.createElement('dialog');
    this.orientationDialog.className = 'portfolio-dialog orientation-dialog';
    this.orientationDialog.setAttribute('aria-labelledby', 'orientation-title');
    this.orientationDialog.setAttribute('aria-describedby', 'orientation-description');
    this.orientationDialog.innerHTML = `
      <div class="orientation-content">
        <svg class="orientation-phone" viewBox="0 0 80 80" aria-hidden="true">
          <rect x="24" y="10" width="32" height="58" rx="4" fill="none" stroke="currentColor" stroke-width="4"/>
          <path d="M34 18h12M36 60h8" fill="none" stroke="currentColor" stroke-width="3"/>
        </svg>
        <h1 id="orientation-title">Tourne ton téléphone</h1>
        <p id="orientation-description">La chambre se découvre mieux en paysage : plus de place pour explorer et utiliser les commandes.</p>
        <p class="orientation-note">La fenêtre se fermera automatiquement après la rotation.</p>
        <button class="close-button" type="button">Continuer en portrait</button>
      </div>`;
    document.body.append(this.orientationDialog);
    this.listen(this.orientationDialog.querySelector('button'), 'click', () => this.dismissOrientation());
    this.listen(this.orientationDialog, 'cancel', (event) => {
      event.preventDefault();
      this.dismissOrientation();
    });
    this.listen(this.orientationDialog, 'close', () => {
      this.syncPause();
      this.restoreFocus();
    });
  }

  updateOrientation({ width, height }) {
    const shouldOpen = this.landscapeSuggestion.shouldOpen({
      width, height, coarsePointer: window.matchMedia('(any-pointer: coarse)').matches,
    });
    if (shouldOpen && !this.orientationDialog.open) {
      this.orientationDialog.showModal();
      this.orientationDialog.querySelector('button').focus();
    } else if (!this.landscapeSuggestion.mobilePortrait && this.orientationDialog.open) {
      this.orientationDialog.close();
    }
    this.syncPause();
  }

  dismissOrientation() {
    this.landscapeSuggestion.dismiss();
    this.orientationDialog.close();
    this.syncPause();
  }

  syncPause() {
    const paused = this.dialog.open || this.orientationDialog.open;
    if (this.enabled === paused) this.setEnabled(!paused);
    this.callbacks.onPauseChange(paused);
  }

  restoreFocus() {
    const focusTarget = this.orientationDialog.open ? this.orientationDialog.querySelector('button')
      : this.dialog.open ? this.dialog.querySelector('.close-button') : document.querySelector('canvas');
    focusTarget?.focus({ preventScroll: true });
  }

  open(content) {
    if (this.dialog.open) return;
    this.dialog.querySelector('h1').textContent = content.title;
    const body = this.dialog.querySelector('.dialog-content');
    body.replaceChildren();
    content.paragraphs.forEach((text) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      body.append(paragraph);
    });
    content.links.forEach(({ label, href }) => {
      const destination = safeLink(href);
      if (!destination) return;
      const link = document.createElement('a');
      link.textContent = label;
      link.href = destination;
      if (/^https?:/i.test(destination)) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      body.append(link);
    });
    this.dialog.showModal();
    this.syncPause();
    body.scrollTop = 0;
    this.dialog.querySelector('.close-button').focus();
  }

  close() {
    if (this.dialog.open) this.dialog.close();
  }

  destroy() {
    this.cancelGesture();
    this.abort.abort();
    this.dialog.remove();
    this.orientationDialog.remove();
    this.root.remove();
  }
}
