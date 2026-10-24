import { arcPoint, planShot } from '../systems/paperShot.mjs';
import { PAPER_SHOT } from '../data/room.js';

const AIR_DEPTH = 8500;

// Boule de papier lancée de la main du joueur vers le panier : elle passe dans le filet et tombe dans la poubelle,
// ou rebondit sur l'arceau et roule au sol. Un seul lancer à la fois.
export default class PaperShot {
  constructor(scene, { hoopDepth, binDepth }) {
    this.scene = scene;
    this.depths = { air: AIR_DEPTH, net: hoopDepth - 0.1, bin: binDepth + 0.1 };
    this.ball = null;
  }

  get busy() {
    return Boolean(this.ball);
  }

  shoot(hand, onSound = () => {}) {
    if (this.busy) return;
    const plan = planShot(hand, PAPER_SHOT);
    this.ball = this.scene.add.image(hand.x, hand.y, PAPER_SHOT.key, 0);
    const run = (index) => {
      const step = plan.steps[index];
      if (!step) {
        this.ball.destroy();
        this.ball = null;
        return;
      }
      if (step.sound) onSound(step.sound);
      this.animate(step, () => run(index + 1));
    };
    run(0);
  }

  animate(step, done) {
    const { ball, scene } = this;
    const progress = { t: 0 };
    let frame = 0;
    scene.tweens.add({
      targets: progress,
      t: 1,
      duration: step.duration,
      ease: step.ease ?? 'Linear',
      onUpdate: () => {
        const { x, y } = arcPoint(step.from, step.to, step.height, progress.t);
        ball.setPosition(Math.round(x), Math.round(y));
        ball.setDepth(step.layer === 'floor' ? y : this.depths[step.layer]);
        // La boule tourne sur elle-même en vol : une image sur deux toutes les ~80 ms.
        const next = step.spin ? Math.floor((progress.t * step.duration) / 80) % 2 : frame;
        if (next !== frame) ball.setFrame((frame = next));
        if (step.vanish) ball.setAlpha(1 - Math.max(0, progress.t - 0.5) * 2);
      },
      onComplete: done,
    });
  }
}
