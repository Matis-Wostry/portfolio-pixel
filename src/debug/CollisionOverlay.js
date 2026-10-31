import Phaser from 'phaser';
import { FURNITURE, ROOM_ZONES } from '../data/room.js';

const DEPTH = 9500;
const LEGEND = [
  ['#ff3030', 'Collision des meubles'],
  ['#ffd23f', 'Limites de déplacement'],
  ['#3fe07a', 'Zone d’interaction (trait plein) et portée (pointillé)'],
  ['#30d5ff', 'Pieds du joueur'],
  ['#9aa0b4', 'Image du meuble'],
];

// Affiche les boîtes de collision de la chambre pour les vérifier à l'œil : F2 les montre ou les cache,
// et `?debug` dans l'adresse les montre dès l'ouverture. Réservé au développement et à `?debug`.
export const collisionOverlayAvailable = () => import.meta.env.DEV || new URLSearchParams(window.location.search).has('debug');

export default class CollisionOverlay {
  constructor(scene, { room, player }) {
    this.scene = scene;
    this.room = room;
    this.player = player;
    this.fixed = scene.add.graphics().setDepth(DEPTH);
    this.live = scene.add.graphics().setDepth(DEPTH + 1);
    this.labels = [];
    this.legend = this.createLegend();
    this.drawFixed();
    this.onKeyDown = (event) => {
      if (event.code !== 'F2') return;
      event.preventDefault();
      this.setVisible(!this.visible);
    };
    this.onUpdate = () => this.drawPlayer();
    window.addEventListener('keydown', this.onKeyDown);
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.onUpdate);
    scene.events.once('shutdown', () => this.destroy());
    this.setVisible(new URLSearchParams(window.location.search).has('debug'));
  }

  createLegend() {
    const element = document.createElement('div');
    element.setAttribute('aria-hidden', 'true');
    element.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:20;padding:8px 10px;background:#000c;color:#fff;font:12px/1.5 ui-monospace,monospace;pointer-events:none';
    element.innerHTML = [
      '<strong>Collisions (F2 pour masquer)</strong>',
      ...LEGEND.map(([color, text]) => `<div><span style="display:inline-block;width:10px;height:10px;margin-right:6px;background:${color}"></span>${text}</div>`),
    ].join('');
    document.body.append(element);
    return element;
  }

  drawFixed() {
    const { fixed, scene } = this;
    FURNITURE.forEach((item) => {
      const { width, height } = scene.textures.get(item.key).getSourceImage();
      fixed.lineStyle(1, 0x9aa0b4, 0.7).strokeRect(item.x + 0.5, item.y + 0.5, width - 1, height - 1);
      item.solid?.forEach(([x, y, w, h]) => {
        fixed.fillStyle(0xff3030, 0.35).fillRect(item.x + x, item.y + y, w, h);
        fixed.lineStyle(1, 0xff3030, 1).strokeRect(item.x + x + 0.5, item.y + y + 0.5, w - 1, h - 1);
      });
      const label = scene.add.text(item.x + 2, item.y + 2, item.key, { fontSize: '8px', color: '#ffffff', backgroundColor: '#000000aa' }).setDepth(DEPTH + 2);
      this.labels.push(label);
    });
    ROOM_ZONES.forEach(({ x, y, width, height, radius = 32 }) => {
      fixed.lineStyle(1, 0x3fe07a, 0.35).strokeRect(x - radius, y - radius, width + radius * 2, height + radius * 2);
      fixed.lineStyle(1, 0x3fe07a, 1).strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
    });
    const { x, y, width, height } = this.room.walkBounds;
    fixed.lineStyle(1, 0xffd23f, 1).strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  }

  drawPlayer() {
    this.live.clear();
    if (!this.visible || !this.player.body) return;
    const { x, y, width, height } = this.player.body;
    this.live.fillStyle(0x30d5ff, 0.45).fillRect(x, y, width, height);
    this.live.lineStyle(1, 0x30d5ff, 1).strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  }

  setVisible(visible) {
    this.visible = visible;
    this.fixed.setVisible(visible);
    this.labels.forEach((label) => label.setVisible(visible));
    this.legend.style.display = visible ? 'block' : 'none';
    this.drawPlayer();
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.onUpdate);
    this.legend.remove();
  }
}
