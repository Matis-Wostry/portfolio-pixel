import { normalizeZones, selectTarget } from './interactions.mjs';
import { interactionCue } from './cues.mjs';
import { iconKey } from '../config/interface.js';

export default class InteractionSystem {
  constructor(scene, zones, onAction = () => {}) {
    this.zones = normalizeZones(zones);
    this.cues = [];
    this.target = null;
    this.excluded = null;
    this.enabled = true;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.zones.forEach((zone) => {
      const position = interactionCue(zone);
      // Bulle en pixel art : l'icône de l'action, puis la touche à presser quand l'objet est à portée.
      const bubble = scene.add.image(0, 2, 'bulle');
      const icon = scene.add.image(0, 0, iconKey(zone.action));
      const keyCap = scene.add.image(11, 8, 'touche-e').setVisible(false);
      const container = scene.add.container(position.x, position.y, [bubble, icon, keyCap]).setDepth(10001).setSize(40, 40)
        .setInteractive({ useHandCursor: true });
      container.on('pointerdown', () => {
        if (this.enabled && this.target === zone) onAction();
      });
      const tween = reducedMotion ? null : scene.tweens.add({
        targets: container, y: position.y - 4, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.cues.push({ zone, container, bubble, keyCap, tween, key: null });
    });
    this.refreshCues();
  }

  update(feet) {
    this.target = selectTarget(this.zones.filter((zone) => zone.id !== this.excluded), feet);
    this.refreshCues();
    return this.target;
  }

  activate() {
    return this.target?.action ?? null;
  }

  // Ignore une zone (la place où le joueur est assis) ; null pour toutes les reprendre.
  exclude(id) {
    this.excluded = id;
    this.cues.forEach(({ zone, container }) => container.setVisible(this.enabled && zone.id !== id));
  }

  refreshCues() {
    const touch = window.matchMedia('(any-pointer: coarse), (max-width: 760px)').matches;
    this.cues.forEach((cue) => {
      const state = interactionCue(cue.zone, { active: this.enabled && cue.zone === this.target, touch });
      cue.container.input.enabled = state.active;
      if (cue.key === state.key) return;
      cue.key = state.key;
      cue.bubble.setTexture(state.active ? 'bulle-active' : 'bulle');
      cue.keyCap.setVisible(state.active).setTexture(touch ? 'touche-tap' : 'touche-e');
    });
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.target = null;
    this.cues.forEach(({ zone, container, tween }) => {
      container.setVisible(enabled && zone.id !== this.excluded);
      if (tween) enabled ? tween.resume() : tween.pause();
    });
    this.refreshCues();
  }

  destroy() {
    this.cues.forEach(({ container, tween }) => { tween?.remove(); container.destroy(); });
    this.cues = [];
    this.zones = [];
    this.target = null;
  }
}
