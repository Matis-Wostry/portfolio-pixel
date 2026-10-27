import { joystickDirection } from '../input/direction.mjs';
import { renderContent } from './renderContent.js';
import { renderPersona } from './renderPersona.js';
import { LandscapeSuggestion } from './orientation.mjs';
import SoundButton from './SoundButton.js';
import ChessView from './ChessView.js';
import TerminalView from './TerminalView.js';
import SkillsBoard from './SkillsBoard.js';
import './game.css';
import { INTERFACE_DIR, ACTION_ICONS, actionVerb } from '../config/interface.js';

const iconURL = (action) => `${import.meta.env.BASE_URL}${INTERFACE_DIR}/${ACTION_ICONS[action]}`;

export default class GameUI {
  constructor({ onJoystick, onAction, onCancel, onPauseChange = () => {}, audio = null }) {
    this.callbacks = { onJoystick, onAction, onCancel, onPauseChange };
    this.audio = audio;
    this.abort = new AbortController();
    this.root = document.createElement('div');
    this.root.className = 'game-ui';
    this.root.innerHTML = `
      <div class="game-help">
        <span class="desktop-help">Flèches / ZQSD / WASD · Approche une bulle et appuie sur E pour ouvrir</span>
        <span class="mobile-help">Joystick pour bouger · Approche une bulle puis touche Ouvrir</span>
      </div>
      <p class="interaction-hint sr-only" role="status" aria-live="polite"></p>
      <div class="touch-controls">
        <div class="joystick" aria-label="Joystick de déplacement">
          <span class="joystick-knob"></span>
        </div>
        <button class="action-button" type="button" disabled>
          <img class="action-icon" src="${iconURL('projets')}" alt="">
          <span class="action-label">Ouvrir</span>
        </button>
      </div>`;
    document.body.append(this.root);
    this.soundButton = audio ? new SoundButton(audio, this.root, { onPointerToggle: () => this.restoreFocus() }) : null;
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
    // Échap ferme la fenêtre ouverte dans tous les navigateurs, sans dépendre de l'élément qui a le focus
    // (capture : la ligne du terminal ou une autre vue ne peut pas l'intercepter).
    window.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (this.orientationDialog.open) {
        event.preventDefault();
        this.dismissOrientation();
      } else if (this.dialog.open) {
        event.preventDefault();
        this.close();
      }
    }, { capture: true, signal: this.abort.signal });
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
      const verb = actionVerb(zone?.action);
      this.hint.textContent = zone ? `${zone.label} · Appuie sur E ou utilise ${verb}.` : '';
      this.actionButton.setAttribute('aria-label', zone ? `${verb} : ${zone.label}` : 'Approche un objet pour ouvrir son contenu');
      this.actionButton.querySelector('.action-label').textContent = verb;
      if (zone) this.actionButton.querySelector('.action-icon').src = iconURL(zone.action);
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
      this.terminal?.stop();
      this.audio?.play('close');
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
    const enabled = !paused;
    if (this.enabled !== enabled) this.setEnabled(enabled);
    this.callbacks.onPauseChange(paused);
  }

  restoreFocus() {
    const focusTarget = this.orientationDialog.open ? this.orientationDialog.querySelector('button')
      : this.dialog.open ? (this.dialog.classList.contains('is-terminal') && this.terminal.autoFocus ? this.terminal.input : this.dialog.querySelector('.close-button'))
        : document.querySelector('canvas');
    focusTarget?.focus({ preventScroll: true });
  }

  open(content) {
    if (this.dialog.open) return;
    // Les rubriques rangées en dossiers (les projets) s'ouvrent dans le terminal de l'ordinateur.
    if (content.categories) {
      this.openTerminal(content);
      return;
    }
    const body = this.dialog.querySelector('.dialog-content');
    // Les compétences s'affichent sur un tableau blanc qui tient lieu de fenêtre.
    if (content.board) body.replaceChildren(new SkillsBoard({ categories: content.board, audio: this.audio }).element);
    else (content.persona ? renderPersona : renderContent)(body, content);
    this.show(content.title, { board: Boolean(content.board) });
    body.scrollTop = 0;
  }

  // Ouvre la fenêtre avec le contenu déjà en place ; `focusTarget` reçoit le clavier (le bouton Fermer par défaut).
  show(title, { terminal = false, board = false, focusTarget = this.dialog.querySelector('.close-button') } = {}) {
    this.dialog.querySelector('h1').textContent = title;
    this.dialog.classList.toggle('is-terminal', terminal);
    this.dialog.classList.toggle('is-board', board);
    this.audio?.play('open');
    this.dialog.showModal();
    this.syncPause();
    focusTarget.focus();
  }

  // Partie d'échecs contre l'ordinateur, dans la même fenêtre que les rubriques ; elle reprend où on l'a laissée.
  openChess() {
    if (this.dialog.open) return;
    this.chess = this.chess ?? new ChessView({ audio: this.audio });
    this.dialog.querySelector('.dialog-content').replaceChildren(this.chess.element);
    this.chess.render();
    this.show('Échecs');
  }

  openTerminal(content) {
    this.terminal = this.terminal ?? new TerminalView({ content, audio: this.audio, onExit: () => this.close() });
    this.dialog.querySelector('.dialog-content').replaceChildren(this.terminal.element);
    this.show(`Terminal · ${content.title}`, { terminal: true, focusTarget: this.terminal.autoFocus ? this.terminal.input : undefined });
    this.terminal.start();
  }

  close() {
    if (this.dialog.open) this.dialog.close();
  }

  destroy() {
    this.terminal?.stop();
    this.soundButton?.destroy();
    this.cancelGesture();
    this.abort.abort();
    this.dialog.remove();
    this.orientationDialog.remove();
    this.root.remove();
  }
}
