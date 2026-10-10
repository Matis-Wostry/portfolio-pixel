import { normalizeZones, selectTarget } from './interactions.mjs';
import { DEMO_ZONES } from '../data/interactables.js';
import { interactionCue } from './cues.mjs';

export default class InteractionSystem {
  constructor(scene, map, onAction = () => {}) {
    const layer = map.getObjectLayer('objets_interaction');
    this.zones = normalizeZones(layer ? layer.objects : DEMO_ZONES);
    this.markers = [];
    this.cues = [];
    this.target = null;
    this.enabled = true;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.zones.forEach((zone) => {
      if (!layer) {
        const marker = scene.add.rectangle(zone.x + zone.width / 2, zone.y + zone.height / 2, zone.width, zone.height, 0x4e392d)
          .setStrokeStyle(2, 0xd8b889).setDepth(zone.y + zone.height);
        const label = scene.add.text(zone.x + zone.width / 2, zone.y + zone.height + 4, zone.label, {
          fontFamily: 'monospace', fontSize: '10px', color: '#fff2d5', backgroundColor: '#201b2d', padding: { x: 3, y: 2 },
        }).setOrigin(0.5, 0).setDepth(10000);
        this.markers.push({ zone, marker, label });
      }
      const position = interactionCue(zone);
      const graphic = scene.add.graphics();
      const text = scene.add.text(8, -1, '', { fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold' }).setOrigin(0.5);
      const container = scene.add.container(position.x, position.y, [graphic, text]).setDepth(10001).setSize(64, 64)
        .setInteractive({ useHandCursor: true });
      container.on('pointerdown', () => {
        if (this.enabled && this.target === zone) onAction();
      });
      const tween = reducedMotion ? null : scene.tweens.add({
        targets: container, y: position.y - 4, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.cues.push({ zone, container, graphic, text, tween, key: null });
    });
    this.refreshCues();
  }

  update(feet) {
    this.target = selectTarget(this.zones, feet);
    this.markers.forEach(({ zone, marker }) => marker.setStrokeStyle(2, zone === this.target ? 0xffe59a : 0xd8b889));
    this.refreshCues();
    return this.target;
  }

  activate() {
    return this.target?.action ?? null;
  }

  refreshCues() {
    const touch = window.matchMedia('(any-pointer: coarse), (max-width: 760px)').matches;
    this.cues.forEach((cue) => {
      const state = interactionCue(cue.zone, { active: this.enabled && cue.zone === this.target, touch });
      cue.container.input.enabled = state.active;
      if (cue.key === state.key) return;
      cue.key = state.key;
      const foreground = state.active ? 0x282232 : 0xf8d68b;
      cue.graphic.clear().fillStyle(state.active ? 0xf8d68b : 0x282232, 1)
        .fillRect(-20, -12, 40, 24).fillTriangle(-6, 12, 2, 12, -2, 17)
        .lineStyle(2, state.active ? 0xfff2d5 : 0x9d7859, 1).strokeRect(-20, -12, 40, 24)
        .lineStyle(1, foreground, 1).strokeRect(-14, -7, 14, 12).lineBetween(-14, -3, 0, -3);
      cue.text.setText(state.key).setColor(state.active ? '#282232' : '#f8d68b');
    });
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.target = null;
    this.cues.forEach(({ container, tween }) => {
      container.setVisible(enabled);
      if (tween) enabled ? tween.resume() : tween.pause();
    });
    this.refreshCues();
  }

  destroy() {
    this.cues.forEach(({ container, tween }) => { tween?.remove(); container.destroy(); });
    this.cues = [];
    this.markers.forEach(({ marker, label }) => { marker.destroy(); label.destroy(); });
    this.markers = [];
    this.zones = [];
    this.target = null;
  }
}
