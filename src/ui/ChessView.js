import { newGame, legalMoves, makeMove, chooseMove, gameStatus, isOver, squareName, inCheck } from '../chess/engine.mjs';

const PIECE_DIR = `${import.meta.env.BASE_URL}assets/interface/echecs`;
const NAMES = { p: 'pion', n: 'cavalier', b: 'fou', r: 'tour', q: 'dame', k: 'roi' };
const AI_DELAY = 450;

// Échiquier de la fenêtre « Échecs » : on joue les blancs contre l'ordinateur.
// Cliquer (ou Entrée) sur une pièce blanche montre ses coups ; cliquer sur une case marquée joue le coup.
export default class ChessView {
  constructor({ audio = null } = {}) {
    this.audio = audio;
    this.element = document.createElement('div');
    this.element.className = 'chess';
    this.element.innerHTML = `
      <p class="chess-status" role="status" aria-live="polite"></p>
      <div class="chess-board" role="group" aria-label="Échiquier, les blancs en bas"></div>
      <button class="chess-new" type="button">Nouvelle partie</button>`;
    this.status = this.element.querySelector('.chess-status');
    this.board = this.element.querySelector('.chess-board');
    this.squares = Array.from({ length: 64 }, (_, square) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `chess-square ${(square + Math.floor(square / 8)) % 2 ? 'is-dark' : 'is-light'}`;
      button.append(Object.assign(document.createElement('img'), { alt: '', draggable: false }));
      button.addEventListener('click', () => this.click(square));
      this.board.append(button);
      return button;
    });
    this.element.querySelector('.chess-new').addEventListener('click', () => this.restart());
    this.restart();
  }

  restart() {
    clearTimeout(this.aiTimer);
    this.state = newGame();
    this.selected = null;
    this.lastMove = null;
    this.thinking = false;
    this.render();
  }

  movesFrom(square) {
    return legalMoves(this.state).filter((move) => move.from === square);
  }

  click(square) {
    if (this.thinking || this.state.turn !== 'w' || isOver(gameStatus(this.state))) return;
    const move = this.selected !== null && this.movesFrom(this.selected)
      .find((candidate) => candidate.to === square && (!candidate.promotion || candidate.promotion === 'q'));
    if (move) {
      this.play(move);
      return;
    }
    const piece = this.state.board[square];
    this.selected = piece?.color === 'w' && this.movesFrom(square).length && this.selected !== square ? square : null;
    this.render();
  }

  play(move) {
    this.state = makeMove(this.state, move);
    this.lastMove = move;
    this.selected = null;
    this.audio?.play('click');
    if (!isOver(gameStatus(this.state)) && this.state.turn === 'b') {
      this.thinking = true;
      this.aiTimer = setTimeout(() => {
        this.thinking = false;
        this.play(chooseMove(this.state, { depth: 2, noise: 15 }));
      }, AI_DELAY);
    }
    this.render();
  }

  message() {
    const status = gameStatus(this.state);
    if (status === 'checkmate') return this.state.turn === 'b' ? 'Échec et mat : tu as gagné !' : 'Échec et mat : l’ordinateur gagne.';
    if (status === 'stalemate') return 'Pat : partie nulle.';
    if (status === 'draw') return 'Partie nulle.';
    if (this.thinking) return 'L’ordinateur réfléchit…';
    return status === 'check' ? 'Échec ! À toi de jouer.' : 'À toi de jouer (blancs).';
  }

  render() {
    const targets = new Set(this.selected === null ? [] : this.movesFrom(this.selected).map(({ to }) => to));
    const checkedKing = inCheck(this.state)
      ? this.state.board.findIndex((piece) => piece?.type === 'k' && piece.color === this.state.turn) : -1;
    this.status.textContent = this.message();
    this.squares.forEach((button, square) => {
      const piece = this.state.board[square];
      const image = button.firstChild;
      if (piece) image.src = `${PIECE_DIR}/${piece.color}${piece.type}.png`;
      image.hidden = !piece;
      button.classList.toggle('is-selected', square === this.selected);
      button.classList.toggle('is-target', targets.has(square));
      button.classList.toggle('is-last', Boolean(this.lastMove) && [this.lastMove.from, this.lastMove.to].includes(square));
      button.classList.toggle('is-check', square === checkedKing);
      const content = piece ? `${NAMES[piece.type]} ${piece.color === 'w' ? 'blanc' : 'noir'}` : 'vide';
      button.setAttribute('aria-label', `${squareName(square)} : ${content}${targets.has(square) ? ', coup possible' : ''}`);
    });
  }
}
