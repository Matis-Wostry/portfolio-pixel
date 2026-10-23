// Bulles d'interaction en pixel art (public/assets/interface/), dans la palette du designer.
export const INTERFACE_DIR = 'assets/interface';

export const CUE_FILES = [
  { key: 'bulle', file: 'bulle.png' },
  { key: 'bulle-active', file: 'bulle-active.png' },
  { key: 'touche-e', file: 'touche-e.png' },
  { key: 'touche-tap', file: 'touche-tap.png' },
];

// Icône affichée dans la bulle et sur le bouton tactile, par action.
export const ACTION_ICONS = {
  projets: 'icones/projets.png',
  skills: 'icones/competences.png',
  about: 'icones/presentation.png',
  contact: 'icones/contact.png',
  sit: 'icones/asseoir.png',
  chess: 'icones/echecs.png',
};

export const iconKey = (action) => `icone-${action}`;

// Verbe du bouton tactile et de l'aide, selon l'action.
const VERBS = { sit: 'S’asseoir', chess: 'Jouer' };
export const actionVerb = (action) => VERBS[action] ?? 'Ouvrir';
