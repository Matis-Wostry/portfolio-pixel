import { normalizeZone, selectTarget } from './interactions.mjs';
import { DEMO_ZONES } from '../data/interactables.js';

export default class InteractionSystem {
  constructor(scene, map) {
    const layer = map.getObjectLayer('objets_interaction');
    this.zones = [];
    this.markers = [];
    this.target = null;
    const ids = new Set();
    (layer ? layer.objects : DEMO_ZONES).forEach((object) => {
      const zone = normalizeZone(object);
      if (!zone || ids.has(zone.id)) {
        console.warn('Zone interactive ignorée : rectangle, propriétés ou identifiant invalides.', object);
        return;
      }
      ids.add(zone.id);
      this.zones.push(zone);
      if (!layer) {
        const marker = scene.add.rectangle(zone.x + zone.width / 2, zone.y + zone.height / 2, zone.width, zone.height, 0x4e392d)
          .setStrokeStyle(2, 0xd8b889).setDepth(zone.y + zone.height);
        const label = scene.add.text(zone.x + zone.width / 2, zone.y - 4, zone.label, {
          fontFamily: 'monospace', fontSize: '10px', color: '#fff2d5', backgroundColor: '#201b2d', padding: { x: 3, y: 2 },
        }).setOrigin(0.5, 1).setDepth(10000);
        this.markers.push({ zone, marker, label });
      }
    });
  }

  update(feet) {
    this.target = selectTarget(this.zones, feet);
    this.markers.forEach(({ zone, marker }) => marker.setStrokeStyle(2, zone === this.target ? 0xffe59a : 0xd8b889));
    return this.target;
  }

  activate() {
    return this.target?.action ?? null;
  }

  destroy() {
    this.markers.forEach(({ marker, label }) => { marker.destroy(); label.destroy(); });
    this.markers = [];
    this.zones = [];
    this.target = null;
  }
}
