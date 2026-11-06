import { slideOffset } from './terminal.mjs';
import { appendLinks } from './renderContent.js';

const SWIPE_DISTANCE = 40;

// Carte d'un projet, façon petite fenêtre de terminal : chemin du fichier, titre, description, technos et liens.
export function renderProjectCard(card, category) {
  const article = document.createElement('article');
  article.className = 'project-card';
  const bar = document.createElement('p');
  bar.className = 'project-card-bar';
  bar.setAttribute('aria-hidden', 'true');
  bar.textContent = `~/projets/${card.category}/${card.id}`;
  const title = document.createElement('h2');
  title.textContent = card.title;
  if (category) {
    const tag = document.createElement('span');
    tag.className = 'project-card-category';
    tag.textContent = category.title;
    title.append(tag);
  }
  const description = document.createElement('p');
  description.className = 'project-card-description';
  description.textContent = card.description;
  const tags = document.createElement('p');
  tags.className = 'project-card-tags';
  tags.textContent = card.tags.map((tag) => `#${tag}`).join(' ');
  article.append(bar, title, description, tags);
  appendLinks(article, card.links ?? []);
  return article;
}

// Projets d'un dossier en carrousel : sur grand écran trois cartes, celle du milieu en avant et ses voisines
// en retrait ; sur téléphone une carte à la fois. Flèches, points, clavier (← →), glisser ou clic sur une voisine.
export default class ProjectCarousel {
  constructor({ cards, category, audio = null }) {
    this.cards = cards;
    this.audio = audio;
    this.current = 0;
    this.element = document.createElement('section');
    this.element.className = 'carousel';
    this.element.setAttribute('aria-roledescription', 'carrousel');
    this.element.setAttribute('aria-label', category?.title ?? 'Projets');
    this.element.tabIndex = 0;
    this.track = document.createElement('div');
    this.track.className = 'carousel-track';
    this.slides = cards.map((card, index) => {
      const slide = renderProjectCard(card, category);
      slide.classList.add('carousel-slide');
      slide.setAttribute('aria-roledescription', 'diapositive');
      slide.setAttribute('aria-label', `${index + 1} sur ${cards.length} : ${card.title}`);
      // Une voisine en retrait se met au centre au clic, sans suivre ses liens.
      slide.addEventListener('click', (event) => {
        // Le clic qui suit un glissé à la souris ne doit ni ramener à la carte de départ ni suivre un lien.
        if (this.swiped) {
          this.swiped = false;
          event.preventDefault();
          return;
        }
        if (index === this.current) return;
        event.preventDefault();
        this.go(index);
      }, true);
      this.track.append(slide);
      return slide;
    });
    this.status = document.createElement('p');
    this.status.className = 'sr-only';
    this.status.setAttribute('aria-live', 'polite');
    this.element.append(this.track, this.status);
    if (cards.length > 1) this.addControls();
    this.bindGestures();
    this.render();
  }

  addControls() {
    const arrow = (label, step, text) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `carousel-arrow is-${step < 0 ? 'previous' : 'next'}`;
      button.setAttribute('aria-label', label);
      button.textContent = text;
      button.addEventListener('click', () => this.go(this.current + step));
      return button;
    };
    const nav = document.createElement('div');
    nav.className = 'carousel-nav';
    this.dots = this.cards.map((card, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Voir ${card.title}`);
      dot.addEventListener('click', () => this.go(index));
      return dot;
    });
    nav.append(arrow('Projet précédent', -1, '‹'), ...this.dots, arrow('Projet suivant', 1, '›'));
    this.element.append(nav);
  }

  bindGestures() {
    this.element.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      this.go(this.current + (event.key === 'ArrowLeft' ? -1 : 1));
    });
    let start = null;
    this.track.addEventListener('pointerdown', (event) => {
      start = { x: event.clientX, y: event.clientY };
      // Au doigt, aucun clic ne suit un glissé : le prochain appui repart de zéro.
      this.swiped = false;
    });
    this.track.addEventListener('pointerup', (event) => {
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      start = null;
      if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)) {
        this.swiped = true;
        this.go(this.current + (dx < 0 ? 1 : -1));
      }
    });
    this.track.addEventListener('pointercancel', () => { start = null; });
  }

  go(index) {
    const count = this.cards.length;
    const next = ((index % count) + count) % count;
    if (next === this.current) return;
    this.current = next;
    this.audio?.play('click');
    this.render();
    this.status.textContent = `${this.cards[next].title}, ${next + 1} sur ${count}`;
  }

  render() {
    const count = this.cards.length;
    this.slides.forEach((slide, index) => {
      const offset = slideOffset(index, this.current, count);
      slide.dataset.offset = String(Math.max(-2, Math.min(2, offset)));
      // Seule la carte du milieu est lisible au clavier et par les lecteurs d'écran ; les voisines restent cliquables.
      slide.setAttribute('aria-hidden', String(offset !== 0));
      slide.querySelectorAll('a').forEach((link) => { link.tabIndex = offset === 0 ? 0 : -1; });
    });
    this.dots?.forEach((dot, index) => dot.setAttribute('aria-current', String(index === this.current)));
  }
}
