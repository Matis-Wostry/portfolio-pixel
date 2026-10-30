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
  shoot: 'icones/papier.png',
};

export const iconKey = (action) => `icone-${action}`;

// Logo affiché sur le post-it de chaque compétence qui en a un (logos/ : Simple Icons, voir le README ; Ps et Ai dessinés à la main).
export const SKILL_LOGOS = {
  HTML: 'logos/html5.svg',
  CSS: 'logos/css.svg',
  JavaScript: 'logos/javascript.svg',
  TypeScript: 'logos/typescript.svg',
  SCSS: 'logos/sass.svg',
  PHP: 'logos/php.svg',
  Python: 'logos/python.svg',
  C: 'logos/c.svg',
  Java: 'logos/openjdk.svg',
  React: 'logos/react.svg',
  Laravel: 'logos/laravel.svg',
  'Node.js': 'logos/nodedotjs.svg',
  WordPress: 'logos/wordpress.svg',
  MySQL: 'logos/mysql.svg',
  MongoDB: 'logos/mongodb.svg',
  Docker: 'logos/docker.svg',
  Linux: 'logos/linux.svg',
  Git: 'logos/git.svg',
  GitHub: 'logos/github.svg',
  Figma: 'logos/figma.svg',
  Photoshop: 'logos/photoshop.svg',
  Illustrator: 'logos/illustrator.svg',
  Analytics: 'logos/googleanalytics.svg',
  'Search Console': 'logos/googlesearchconsole.svg',
  SEMrush: 'logos/semrush.svg',
  Claude: 'logos/claude.svg',
  'Claude Code': 'logos/claudecode.svg',
  OpenAI: 'logos/openai.svg',
};

// Verbe du bouton tactile et de l'aide, selon l'action.
const VERBS = { sit: 'S’asseoir', chess: 'Jouer', shoot: 'Lancer' };
export const actionVerb = (action) => VERBS[action] ?? 'Ouvrir';
