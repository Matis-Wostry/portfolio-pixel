// Terminal de l'ordinateur : interprète les commandes tapées et renvoie des blocs que TerminalView affiche.
// Dans l'aide, cliquer sur une commande à argument lance son exemple.
// Blocs : { type: 'text', text, tone? } ; { type: 'list', items: [{ label, detail, command }] } (lignes cliquables) ;
// { type: 'project', card, category } ; { type: 'hints', commands } (suggestions cliquables).
// `state.cwd` est le dossier courant : null pour ~/projets, sinon l'identifiant d'une catégorie.

export const COMMANDS = [
  { name: 'ls', usage: 'ls', detail: 'liste le dossier courant' },
  { name: 'cd', usage: 'cd <dossier>', detail: 'entre dans un dossier (cd .. pour revenir)', example: 'cd ecole' },
  { name: 'open', usage: 'open <projet>', detail: 'affiche un projet et ses liens', example: 'open pokedex' },
  { name: 'clear', usage: 'clear', detail: 'efface l’écran' },
  { name: 'help', usage: 'help', detail: 'affiche cette aide' },
  { name: 'exit', usage: 'exit', detail: 'éteint l’écran' },
];
const ALIASES = { cat: 'open', dir: 'ls', quit: 'exit', aide: 'help' };

// « École/ », « ~/projets/ecole » et « ECOLE » désignent le même dossier.
const normalize = (value) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const lastSegment = (path) => normalize(path).split('/').filter(Boolean).pop() ?? '';
const plural = (count, word) => `${count} ${word}${count > 1 ? 's' : ''}`;

export const prompt = ({ cwd }) => `matis@chambre:~/projets${cwd ? `/${cwd}` : ''}$`;

export function parseCommand(input) {
  const [name = '', ...args] = input.trim().split(/\s+/).filter(Boolean);
  const lower = name.toLowerCase();
  return { name: ALIASES[lower] ?? lower, args };
}

const projectsIn = (content, category) => content.cards.filter((card) => card.category === category);
const findCategory = (content, path) => content.categories.find(({ id }) => id === lastSegment(path));
const findProject = (content, path) => content.cards.find(({ id }) => id === lastSegment(path));

function listCategories(content) {
  return {
    type: 'list',
    items: content.categories.map((category) => ({
      label: `${category.id}/`,
      detail: `${plural(projectsIn(content, category.id).length, 'projet')} · ${category.description}`,
      command: `cd ${category.id}`,
    })),
  };
}

function listProjects(content, category) {
  return { type: 'list', items: projectsIn(content, category).map((card) => ({ label: card.id, detail: card.title, command: `open ${card.id}` })) };
}

const error = (text) => [{ type: 'text', text, tone: 'error' }];

export function runCommand(content, state, input) {
  const { name, args } = parseCommand(input);
  const target = args[0];
  switch (name) {
    case '':
      return { state, output: [] };
    case 'help':
      return {
        state,
        output: [
          { type: 'text', text: 'Commandes disponibles (clique dessus ou tape-les) :' },
          { type: 'list', items: COMMANDS.map(({ name: command, usage, detail, example }) => ({ label: usage, detail, command: example ?? command })) },
        ],
      };
    case 'ls': {
      if (!target) {
        return { state, output: [state.cwd ? listProjects(content, state.cwd) : listCategories(content)] };
      }
      const category = findCategory(content, target);
      return { state, output: category ? [listProjects(content, category.id)] : error(`ls : ${target} : dossier introuvable`) };
    }
    case 'cd': {
      if (!target || ['..', '~', '/', '~/projets'].includes(target)) {
        return { state: { ...state, cwd: null }, output: [listCategories(content)] };
      }
      const category = findCategory(content, target);
      if (!category) return { state, output: error(`cd : ${target} : dossier introuvable`) };
      return {
        state: { ...state, cwd: category.id },
        output: [
          { type: 'text', text: `${category.title} · ${category.description}`, tone: 'muted' },
          listProjects(content, category.id),
          { type: 'hints', commands: ['cd ..'] },
        ],
      };
    }
    case 'open': {
      if (!target) return { state, output: error('open : précise un projet, par exemple open pokedex') };
      const card = findProject(content, target);
      if (!card) return { state, output: error(`open : ${target} : projet introuvable`) };
      const category = content.categories.find(({ id }) => id === card.category);
      return { state, output: [{ type: 'project', card, category }, { type: 'hints', commands: [state.cwd ? 'ls' : `cd ${card.category}`, 'cd ..'] }] };
    }
    case 'clear':
      return { state, output: [], action: 'clear' };
    case 'exit':
      return { state, output: [], action: 'exit' };
    default:
      return { state, output: [...error(`${name} : commande introuvable`), { type: 'hints', commands: ['help'] }] };
  }
}

// Tab : complète la commande, puis le dossier (cd, ls) ou le projet (open), s'il n'y a qu'une possibilité.
export function complete(content, state, input) {
  const words = input.trimStart().split(/\s+/);
  if (words.length === 1) {
    const matches = COMMANDS.filter(({ name }) => name.startsWith(words[0].toLowerCase()));
    return matches.length === 1 ? `${matches[0].name} ` : input;
  }
  const { name } = parseCommand(words[0]);
  const prefix = normalize(words[1] ?? '');
  const candidates = name === 'open'
    ? (state.cwd ? projectsIn(content, state.cwd) : content.cards).map(({ id }) => id)
    : ['cd', 'ls'].includes(name) ? content.categories.map(({ id }) => id) : [];
  const matches = candidates.filter((id) => id.startsWith(prefix));
  return matches.length === 1 ? `${words[0]} ${matches[0]}` : input;
}
