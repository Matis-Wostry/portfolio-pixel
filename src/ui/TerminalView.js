import { runCommand, complete, prompt } from './terminal.mjs';
import { appendLinks } from './renderContent.js';

const TYPE_DELAY = { min: 40, max: 85 };

// Écran de l'ordinateur : un terminal pour parcourir les projets par dossier (pro, école, perso).
// Chaque commande ou nom cliquable se tape tout seul, touche par touche, avant de se lancer.
export default class TerminalView {
  constructor({ content, audio = null, onExit = () => {} }) {
    this.content = content;
    this.audio = audio;
    this.onExit = onExit;
    this.history = [];
    this.element = document.createElement('div');
    this.element.className = 'terminal';
    this.element.innerHTML = `
      <div class="terminal-output" role="log" aria-live="polite"></div>
      <form class="terminal-line">
        <label class="terminal-prompt" for="terminal-input"></label>
        <input id="terminal-input" class="terminal-input" type="text" autocomplete="off" autocapitalize="off"
          spellcheck="false" enterkeyhint="go" aria-describedby="terminal-help">
      </form>
      <p id="terminal-help" class="sr-only">Tape help pour la liste des commandes. Tab complète, flèches haut et bas pour l’historique.</p>`;
    this.output = this.element.querySelector('.terminal-output');
    this.promptLabel = this.element.querySelector('.terminal-prompt');
    this.input = this.element.querySelector('.terminal-input');
    this.element.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      if (!this.typing) this.submit(this.input.value);
    });
    this.input.addEventListener('keydown', (event) => this.onKey(event));
    // Cliquer dans le vide de l'écran rend la main au clavier, sans voler un clic sur un lien ou une commande.
    this.output.addEventListener('click', (event) => {
      if (!event.target.closest('a, button') && !window.getSelection()?.toString()) this.focus();
    });
  }

  // Écran rallumé à chaque ouverture : message d'accueil puis `ls` tapé tout seul.
  start() {
    this.stop();
    this.state = { cwd: null };
    this.historyIndex = this.history.length;
    this.output.replaceChildren();
    this.updatePrompt();
    this.print([
      { type: 'text', text: 'MatisOS · terminal des projets' },
      { type: 'text', text: 'Clique sur une commande ou tape-la. help pour l’aide.', tone: 'muted' },
    ]);
    this.type('ls');
  }

  focus() {
    this.input.focus({ preventScroll: true });
  }

  // Coupe une frappe en cours (fenêtre fermée ou écran rallumé).
  stop() {
    clearTimeout(this.timer);
    this.typingRun = (this.typingRun ?? 0) + 1;
    this.typing = false;
    this.input.readOnly = false;
  }

  onKey(event) {
    if (this.typing) {
      event.preventDefault();
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      const completed = complete(this.content, this.state, this.input.value);
      if (completed !== this.input.value) {
        this.input.value = completed;
        this.audio?.play('key');
      }
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const step = event.key === 'ArrowUp' ? -1 : 1;
      this.historyIndex = Math.max(0, Math.min(this.history.length, this.historyIndex + step));
      this.input.value = this.history[this.historyIndex] ?? '';
      return;
    }
    if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Enter') this.audio?.play('key');
  }

  // Tape la commande lettre par lettre avec un bruit de touche, puis la lance.
  type(command) {
    if (this.typing) return;
    const run = (this.typingRun ?? 0) + 1;
    this.typingRun = run;
    this.typing = true;
    this.input.readOnly = true;
    this.input.value = '';
    const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = instant ? command.length : 0;
    const next = () => {
      if (this.typingRun !== run) return;
      if (index < command.length) {
        index += 1;
        this.input.value = command.slice(0, index);
        this.audio?.play('key');
        this.timer = setTimeout(next, TYPE_DELAY.min + Math.random() * (TYPE_DELAY.max - TYPE_DELAY.min));
        return;
      }
      this.input.value = command;
      this.typing = false;
      this.input.readOnly = false;
      this.submit(command);
      this.focus();
    };
    this.timer = setTimeout(next, instant ? 0 : 250);
  }

  submit(command) {
    this.input.value = '';
    if (command.trim()) {
      this.history.push(command.trim());
      this.historyIndex = this.history.length;
    }
    this.echo(command);
    const result = runCommand(this.content, this.state, command);
    this.state = result.state;
    this.updatePrompt();
    if (result.action === 'clear') this.output.replaceChildren();
    if (result.action === 'exit') {
      this.onExit();
      return;
    }
    this.print(result.output);
  }

  updatePrompt() {
    this.promptLabel.textContent = prompt(this.state);
  }

  echo(command) {
    const line = document.createElement('p');
    line.className = 'terminal-echo';
    const promptText = document.createElement('span');
    promptText.className = 'terminal-prompt';
    promptText.textContent = `${prompt(this.state)} `;
    line.append(promptText, command);
    this.output.append(line);
  }

  print(blocks) {
    blocks.forEach((block) => this.output.append(this.renderBlock(block)));
    this.output.scrollTop = this.output.scrollHeight;
  }

  commandButton(command, label = command) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'terminal-command';
    button.textContent = label;
    button.setAttribute('aria-label', `Lancer ${command}`);
    button.addEventListener('click', () => this.type(command));
    return button;
  }

  renderBlock(block) {
    if (block.type === 'list') {
      const list = document.createElement('ul');
      list.className = 'terminal-list';
      block.items.forEach(({ label, detail, command }) => {
        const item = document.createElement('li');
        const description = document.createElement('span');
        description.className = 'terminal-detail';
        description.textContent = detail;
        item.append(this.commandButton(command, label), description);
        list.append(item);
      });
      return list;
    }
    if (block.type === 'hints') {
      const hints = document.createElement('p');
      hints.className = 'terminal-hints';
      block.commands.forEach((command) => hints.append(this.commandButton(command)));
      return hints;
    }
    if (block.type === 'project') {
      const { card, category } = block;
      const project = document.createElement('article');
      project.className = 'terminal-project';
      const title = document.createElement('h2');
      title.textContent = card.title;
      if (category) {
        const tag = document.createElement('span');
        tag.className = 'terminal-category';
        tag.textContent = `[${category.title}]`;
        title.append(' ', tag);
      }
      const description = document.createElement('p');
      description.textContent = card.description;
      const tags = document.createElement('p');
      tags.className = 'terminal-tags';
      tags.textContent = card.tags.map((tag) => `#${tag}`).join(' ');
      project.append(title, description, tags);
      appendLinks(project, card.links ?? []);
      return project;
    }
    const line = document.createElement('p');
    line.className = `terminal-text${block.tone ? ` is-${block.tone}` : ''}`;
    line.textContent = block.text;
    return line;
  }
}
