import { INTERFACE_DIR, SKILL_LOGOS } from '../config/interface.js';

// Degrés de rotation par pixel de glissé pendant qu'on tient le tableau.
const DRAG_RATIO = 1.2;

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

// Compétences sur un tableau blanc sur pied, une catégorie par face : titre au feutre, technos en post-it et,
// à droite, une étiquette aimantée par catégorie. Le tableau bascule de haut en bas pour changer de catégorie :
// clic sur une étiquette, flèches du clavier, ou on l'attrape et on le pousse (haut : suivante, bas : précédente).
// Il n'a que deux faces : celle qui est cachée reçoit la catégorie demandée juste avant le demi-tour.
export default class SkillsBoard {
  constructor({ categories, audio = null }) {
    this.categories = categories;
    this.audio = audio;
    this.current = 0;
    this.angle = 0;
    this.element = element('section', 'skills-board');
    this.element.setAttribute('aria-label', 'Tableau des compétences');
    this.element.tabIndex = 0;
    this.board = element('div', 'board');
    this.faces = [element('div', 'board-face is-front'), element('div', 'board-face is-back')];
    this.board.append(...this.faces);
    this.status = element('p', 'sr-only');
    this.status.setAttribute('aria-live', 'polite');
    this.element.append(this.board, this.createStand(), this.status);
    this.fill(this.faces[0], 0);
    this.faces[1].inert = true;
    this.bindGestures();
  }

  // Pied du tableau de la chambre : deux montants avec le pivot à mi-hauteur, un patin et ses roulettes en bas.
  createStand() {
    const stand = element('div', 'board-stand');
    stand.setAttribute('aria-hidden', 'true');
    for (let side = 0; side < 2; side += 1) {
      const post = element('div', 'board-post');
      post.append(element('span', 'board-pivot'), element('span', 'board-foot'));
      stand.append(post);
    }
    return stand;
  }

  // Face visible : la première tant que le nombre de demi-tours est pair.
  get frontFace() {
    return this.faces[Math.round(this.angle / 180) % 2 === 0 ? 0 : 1];
  }

  get hiddenFace() {
    return this.faces.find((face) => face !== this.frontFace);
  }

  fill(face, index) {
    const { title, tags, color } = this.categories[index];
    const content = element('div', 'board-content');
    const notes = element('ul', 'board-notes');
    // Les post-it reprennent la couleur de l'aimant de leur catégorie.
    notes.style.setProperty('--magnet', color);
    tags.forEach((tag) => {
      const note = element('li');
      if (SKILL_LOGOS[tag]) {
        const logo = element('img', 'board-logo');
        logo.src = `${import.meta.env.BASE_URL}${INTERFACE_DIR}/${SKILL_LOGOS[tag]}`;
        logo.alt = '';
        // Sinon le navigateur lance un glisser-déposer de l'image au lieu de faire basculer le tableau.
        logo.draggable = false;
        note.append(logo);
      }
      note.append(tag);
      notes.append(note);
    });
    content.append(element('h2', 'board-title', title), notes);
    const magnets = element('div', 'board-magnets');
    this.categories.forEach((category, target) => {
      const button = element('button', 'board-magnet', category.title);
      button.type = 'button';
      button.dataset.index = String(target);
      button.style.setProperty('--magnet', category.color);
      button.setAttribute('aria-pressed', String(target === index));
      magnets.append(button);
    });
    face.replaceChildren(content, magnets);
  }

  bindGestures() {
    this.element.addEventListener('keydown', (event) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      this.go(this.current + step, step);
    });

    let drag = null;
    this.board.addEventListener('click', (event) => {
      const magnet = event.target.closest('.board-magnet');
      if (!magnet || drag?.moved) return;
      const index = Number(magnet.dataset.index);
      this.go(index, index > this.current ? 1 : -1);
    });
    this.board.addEventListener('pointerdown', (event) => {
      drag = { y: event.clientY, moved: false, direction: 0, tilt: 0 };
    });
    this.board.addEventListener('pointermove', (event) => {
      if (!drag || drag.released) return;
      // Bouton relâché hors du tableau, avant la capture : le survol ne doit pas continuer le glissé.
      if (!event.buttons) {
        release();
        return;
      }
      const dy = event.clientY - drag.y;
      if (!drag.moved && Math.abs(dy) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        this.board.classList.add('is-dragging');
        this.board.setPointerCapture(event.pointerId);
      }
      // Pousser vers le haut montre la catégorie suivante sur la face qui apparaît, vers le bas la précédente.
      const direction = dy < 0 ? 1 : -1;
      if (direction !== drag.direction) {
        drag.direction = direction;
        this.fill(this.hiddenFace, this.wrap(this.current + direction));
      }
      drag.tilt = Math.max(-180, Math.min(180, -dy * DRAG_RATIO));
      this.board.style.transform = `rotateX(${this.angle + drag.tilt}deg)`;
    });
    // Au relâché, le tableau finit sa course vers la face la plus proche : passé le quart de tour il bascule,
    // sinon il revient. Une perte de capture (fenêtre qui perd le focus…) relâche aussi, pour ne jamais rester penché.
    const release = () => {
      if (!drag || drag.released) return;
      drag.released = true;
      this.board.classList.remove('is-dragging');
      const steps = Math.round(drag.tilt / 180);
      if (steps) this.flip(this.wrap(this.current + steps), steps);
      else this.board.style.transform = `rotateX(${this.angle}deg)`;
      // Le clic qui suit un glissé ne doit pas aussi actionner l'étiquette sous le doigt.
      setTimeout(() => { drag = null; });
    };
    this.board.addEventListener('pointerup', release);
    this.board.addEventListener('pointercancel', release);
    this.board.addEventListener('lostpointercapture', release);
  }

  wrap(index) {
    const count = this.categories.length;
    return ((index % count) + count) % count;
  }

  go(index, direction) {
    const next = this.wrap(index);
    if (next === this.current) return;
    this.fill(this.hiddenFace, next);
    this.flip(next, direction);
  }

  // La face cachée porte déjà la catégorie `next` : demi-tour, puis le clavier suit sur la nouvelle face.
  flip(next, direction) {
    const hadFocus = this.board.contains(document.activeElement);
    this.angle += 180 * direction;
    this.current = next;
    this.board.style.transform = `rotateX(${this.angle}deg)`;
    this.frontFace.inert = false;
    this.hiddenFace.inert = true;
    if (hadFocus) this.frontFace.querySelector(`[data-index="${next}"]`).focus({ preventScroll: true });
    this.audio?.play('click');
    this.status.textContent = `${this.categories[next].title}, ${next + 1} sur ${this.categories.length}`;
  }
}
