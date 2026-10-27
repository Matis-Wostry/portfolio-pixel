import { appendLinks } from './renderContent.js';
import { PLAYER } from '../config/player.js';
import { INTERFACE_DIR } from '../config/interface.js';

const PORTRAIT = `${import.meta.env.BASE_URL}${PLAYER.dir}/face-1.png`;

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function section(title, ...children) {
  const block = element('section', 'persona-section');
  block.append(element('h3', 'persona-heading', title), ...children);
  return block;
}

function list(items, className = 'persona-list') {
  const ul = element('ul', className);
  items.forEach((item) => ul.append(element('li', '', item)));
  return ul;
}

function workStyle(items) {
  const ul = element('ul', 'persona-work');
  items.forEach(({ quality, proof }) => {
    const item = element('li');
    item.append(element('strong', 'persona-quality', quality), element('span', '', proof));
    ul.append(item);
  });
  return ul;
}

const KINDS = { etudes: 'Études', pro: 'Pro' };

function timeline(steps) {
  const ol = element('ol', 'persona-timeline');
  steps.forEach(({ period, kind, title, place }) => {
    const item = element('li', `is-${kind}`);
    const head = element('span', 'persona-period', period);
    head.append(element('span', 'persona-kind', KINDS[kind]));
    item.append(head, element('strong', '', title), element('span', 'persona-place', place));
    ol.append(item);
  });
  return ol;
}

// Hobbies en tuiles illustrées.
function hobbies(items) {
  const ul = element('ul', 'persona-hobbies');
  items.forEach(({ label, icon }) => {
    const item = element('li');
    const image = element('img', 'persona-hobby-icon');
    image.src = `${import.meta.env.BASE_URL}${INTERFACE_DIR}/${icon}`;
    image.alt = '';
    item.append(image, element('strong', '', label));
    ul.append(item);
  });
  return ul;
}

// Fiche persona de la rubrique Présentation : la personne derrière le portfolio plutôt qu'une simple liste.
export function renderPersona(body, content) {
  const { persona } = content;
  body.replaceChildren();
  const root = element('div', 'persona');

  const identity = element('header', 'persona-id');
  const portrait = element('div', 'persona-portrait');
  portrait.setAttribute('role', 'img');
  portrait.setAttribute('aria-label', `Portrait de ${persona.name} en pixel art`);
  portrait.style.backgroundImage = `url("${PORTRAIT}")`;
  const card = element('div', 'persona-card');
  const facts = element('dl', 'persona-facts');
  persona.facts.forEach(({ label, value }) => facts.append(element('dt', '', label), element('dd', '', value)));
  card.append(element('h2', 'persona-name', persona.name), element('p', 'persona-role', persona.role), facts);
  identity.append(portrait, card);
  // Le CV en haut à droite de la fiche.
  appendLinks(identity, content.links ?? []);

  const columns = element('div', 'persona-columns');
  columns.append(
    section('Objectifs', list(persona.goals)),
    section('Ce qui me motive', list(persona.motivations)),
    section('Ce qui m’agace', list(persona.frustrations)),
  );

  root.append(
    identity,
    columns,
    section('Ma façon de travailler', workStyle(persona.workStyle)),
    section('Parcours', timeline(persona.timeline)),
    section('Hors du clavier', hobbies(persona.hobbies)),
  );
  body.append(root);
}
