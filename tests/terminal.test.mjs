import test from 'node:test';
import assert from 'node:assert/strict';
import { PORTFOLIO } from '../src/data/portfolio.js';
import { runCommand, complete, parseCommand, prompt } from '../src/ui/terminal.mjs';

const content = PORTFOLIO.projets;
const root = { cwd: null };
const commandsOf = (output) => output.flatMap((block) => (block.type === 'list' ? block.items.map(({ command }) => command) : block.commands ?? []));

test('every project belongs to a pro, school or personal folder', () => {
  assert.deepEqual(content.categories.map(({ id }) => id), ['pro', 'ecole', 'perso']);
  const ids = new Set(content.categories.map(({ id }) => id));
  content.cards.forEach((card) => assert.ok(ids.has(card.category), card.id));
  content.categories.forEach(({ id }) => assert.ok(content.cards.some((card) => card.category === id), id));
  content.cards.forEach((card) => assert.match(card.id, /^[a-z0-9-]+$/, card.id));
});

test('ls lists the folders, cd enters one and lists its projects, cd .. comes back', () => {
  assert.deepEqual(commandsOf(runCommand(content, root, 'ls').output), ['cd pro', 'cd ecole', 'cd perso']);
  const inside = runCommand(content, root, 'cd École/');
  assert.equal(inside.state.cwd, 'ecole');
  assert.equal(prompt(inside.state), 'matis@chambre:~/projets/ecole$');
  assert.ok(commandsOf(inside.output).includes('open pokedex'));
  assert.ok(!commandsOf(inside.output).includes('open mieuxdisant'));
  assert.equal(runCommand(content, inside.state, 'cd ..').state.cwd, null);
  assert.equal(runCommand(content, root, 'cd nulle-part').output[0].tone, 'error');
});

test('open shows a project with its folder, from anywhere', () => {
  const { output } = runCommand(content, root, 'cat ecole/pokedex');
  assert.equal(output[0].type, 'project');
  assert.equal(output[0].card.title, 'Pokédex');
  assert.equal(output[0].category.id, 'ecole');
  assert.equal(runCommand(content, root, 'open').output[0].tone, 'error');
});

test('special and unknown commands', () => {
  assert.equal(runCommand(content, root, 'clear').action, 'clear');
  assert.equal(runCommand(content, root, 'EXIT').action, 'exit');
  assert.deepEqual(runCommand(content, root, '   ').output, []);
  const unknown = runCommand(content, root, 'sudo rm -rf');
  assert.equal(unknown.output[0].tone, 'error');
  assert.deepEqual(commandsOf(unknown.output), ['help']);
  assert.deepEqual(parseCommand('  open   pokedex '), { name: 'open', args: ['pokedex'] });
});

test('tab completes a single match and leaves ambiguous input alone', () => {
  assert.equal(complete(content, root, 'he'), 'help ');
  assert.equal(complete(content, root, 'cd ec'), 'cd ecole');
  assert.equal(complete(content, root, 'open pok'), 'open pokedex');
  assert.equal(complete(content, { cwd: 'perso' }, 'open p'), 'open portfolio');
  assert.equal(complete(content, root, 'c'), 'c');
});

test('help commands all run without error when clicked', () => {
  const { output } = runCommand(content, root, 'help');
  commandsOf(output).forEach((command) => {
    assert.ok(!runCommand(content, root, command).output.some(({ tone }) => tone === 'error'), command);
  });
});
