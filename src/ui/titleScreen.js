import { menuStep, wrapIndex } from './titleMenu.mjs';

// Écran-titre écrit dans index.html, pour s'afficher sans attendre le JavaScript : un menu au clavier, à la souris ou au doigt.
export function initTitleScreen(root, startGame) {
  const items = [...root.querySelectorAll('.title-item')];
  const enter = root.querySelector('[data-enter]');
  const status = root.querySelector('.title-status');
  const listeners = new AbortController();
  const { signal } = listeners;
  let selected = 0;
  let loading = false;

  const select = (index) => {
    selected = index;
    items.forEach((item, position) => item.classList.toggle('is-selected', position === index));
    if (document.activeElement !== items[index]) items[index].focus({ preventScroll: true });
  };

  const launch = async () => {
    if (loading) return;
    loading = true;
    root.classList.add('is-loading');
    status.textContent = 'Chargement de la chambre…';
    try {
      await startGame();
      listeners.abort();
    } catch (error) {
      console.error(error);
      loading = false;
      root.classList.remove('is-loading');
      status.textContent = 'Le jeu n’a pas pu se charger. Vérifie ta connexion et réessaie.';
      select(items.indexOf(enter));
    }
  };

  items.forEach((item, index) => {
    item.addEventListener('pointerenter', () => { if (!loading) select(index); }, { signal });
    item.addEventListener('focus', () => select(index), { signal });
  });
  enter.addEventListener('click', launch, { signal });
  window.addEventListener('keydown', (event) => {
    if (loading) return;
    const step = menuStep(event);
    if (step) {
      event.preventDefault();
      select(wrapIndex(selected, step, items.length));
    } else if (event.code === 'Space' && !event.repeat) {
      // Entrée valide déjà le bouton et le lien ; Espace ne valide pas un lien tout seul.
      event.preventDefault();
      items[selected].click();
    }
  }, { signal });
  select(items.indexOf(enter));
}
