import { newGame, makeMove, chooseMove, gameStatus, isOver } from '../chess/engine.mjs';
import { CHESS_TABLE } from '../data/room.js';

const ORDER = 'pnbrqk';
const frameOf = ({ type, color }) => (color === 'w' ? 0 : 6) + ORDER.indexOf(type);

// Partie qui se joue toute seule sur l'échiquier de la table : un coup toutes les quelques secondes,
// puis une nouvelle partie après un mat, un pat ou une partie trop longue.
export default class TableChess {
  constructor(scene, { x, y, depth }) {
    this.scene = scene;
    this.origin = { x: x + CHESS_TABLE.board.x, y: y + CHESS_TABLE.board.y };
    this.depth = depth;
    this.sprites = new Map();
    this.reset();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.timer = scene.time.delayedCall(this.pause(), () => this.play());
  }

  position(square) {
    const size = CHESS_TABLE.square;
    return { x: this.origin.x + (square % 8) * size, y: this.origin.y + Math.floor(square / 8) * size };
  }

  pause() {
    return CHESS_TABLE.minDelay + Math.random() * (CHESS_TABLE.maxDelay - CHESS_TABLE.minDelay);
  }

  reset() {
    this.sprites.forEach((sprite) => sprite.destroy());
    this.sprites.clear();
    this.state = newGame();
    this.moves = 0;
    this.state.board.forEach((piece, square) => {
      if (!piece) return;
      const { x, y } = this.position(square);
      this.sprites.set(square, this.scene.add.image(x, y, CHESS_TABLE.key, frameOf(piece)).setOrigin(0).setDepth(this.depth));
    });
  }

  play() {
    const move = chooseMove(this.state, { depth: 1, noise: 60 });
    if (!move) return this.restartLater();
    const sprite = this.sprites.get(move.from);
    const captured = move.enPassant ? move.to + (this.state.turn === 'w' ? 8 : -8) : move.to;
    this.sprites.get(captured)?.destroy();
    this.sprites.delete(captured);
    this.sprites.delete(move.from);
    this.sprites.set(move.to, sprite);
    this.scene.tweens.add({ targets: sprite, ...this.position(move.to), duration: 260, ease: 'Sine.easeInOut' });
    if (move.castle) {
      const [rookFrom, rookTo] = move.castle === 'K' ? [move.to + 1, move.to - 1] : [move.to - 2, move.to + 1];
      const rook = this.sprites.get(rookFrom);
      this.sprites.delete(rookFrom);
      this.sprites.set(rookTo, rook);
      this.scene.tweens.add({ targets: rook, ...this.position(rookTo), duration: 260, delay: 120, ease: 'Sine.easeInOut' });
    }
    if (move.promotion) sprite.setFrame(frameOf({ type: move.promotion, color: this.state.turn }));
    this.state = makeMove(this.state, move);
    this.moves += 1;
    if (isOver(gameStatus(this.state)) || this.moves >= CHESS_TABLE.maxMoves) return this.restartLater();
    this.timer = this.scene.time.delayedCall(this.pause(), () => this.play());
    return null;
  }

  restartLater() {
    this.timer = this.scene.time.delayedCall(CHESS_TABLE.restartDelay, () => {
      this.reset();
      this.timer = this.scene.time.delayedCall(this.pause(), () => this.play());
    });
  }
}
