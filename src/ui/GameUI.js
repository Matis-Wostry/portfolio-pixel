import { joystickDirection } from '../input/direction.mjs';
import './game.css';

export default class GameUI {
  constructor({ onJoystick, onAction, onCancel, onClose = () => {} }) {
    this.callbacks = { onJoystick, onAction, onCancel, onClose };
    this.abort = new AbortController();
    this.root = document.createElement('div');
    this.root.className = 'game-ui';
    this.root.innerHTML = `
      <div class="game-help">Explore la chambre · Flèches / ZQSD / WASD · E pour interagir</div>
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
  }

  listen(target, type, listener) {
    target.addEventListener(type, listener, { signal: this.abort.signal });
  }

  bindJoystick() {
    this.listen(this.stick, 'pointerdown', (event) => {
      if (!this.enabled || this.pointerId !== null || event.button > 0) return;
      event.preventDefault();
      this.pointerId = event.pointerId;
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
    this.target = zone;
    this.hint.textContent = zone ? `${zone.label} · E / Interagir` : '';
    this.actionButton.disabled = !zone || !this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.root.classList.toggle('is-paused', !enabled);
    this.cancelGesture();
    this.setTarget(enabled ? this.target : null);
  }

  destroy() {
    this.cancelGesture();
    this.abort.abort();
    this.root.remove();
  }
}
