const ICONS = {
  on: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/><path d="M15 9c1.5 1.5 1.5 4.5 0 6M18 6c3 3 3 9 0 12" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  off: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/><path d="M15 9l6 6M21 9l-6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
};

export default class SoundButton {
  constructor(audio, parent, { onPointerToggle = () => {} } = {}) {
    this.audio = audio;
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.className = 'sound-button';
    this.button.hidden = !audio.available;
    this.onClick = (event) => {
      audio.toggle();
      if (!audio.muted) audio.play('click');
      // Après un clic souris ou tactile, rendre le clavier au jeu ; au clavier, garder le focus ici.
      if (event.detail > 0) onPointerToggle();
    };
    this.button.addEventListener('click', this.onClick);
    this.unsubscribe = audio.onChange((muted) => this.render(muted));
    this.render(audio.muted);
    parent.append(this.button);
  }

  render(muted) {
    this.button.innerHTML = muted ? ICONS.off : ICONS.on;
    this.button.setAttribute('aria-label', muted ? 'Activer le son' : 'Couper le son');
  }

  destroy() {
    this.unsubscribe();
    this.button.removeEventListener('click', this.onClick);
    this.button.remove();
  }
}
