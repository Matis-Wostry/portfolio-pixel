import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { menuStep, wrapIndex } from '../src/ui/titleMenu.mjs';

const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the menu cursor loops over its items', () => {
  assert.equal(wrapIndex(0, 1, 2), 1);
  assert.equal(wrapIndex(1, 1, 2), 0);
  assert.equal(wrapIndex(0, -1, 2), 1);
});

test('the arrows and the game keys move the cursor, other keys do not', () => {
  for (const code of ['ArrowUp', 'KeyW', 'KeyZ']) assert.equal(menuStep({ code }), -1, code);
  for (const code of ['ArrowDown', 'KeyS']) assert.equal(menuStep({ code }), 1, code);
  assert.equal(menuStep({ code: 'Tab' }), 0);
  assert.equal(menuStep({ code: 'ArrowDown', ctrlKey: true }), 0);
});

test('the home page offers the game and a real link to the classic portfolio', () => {
  assert.match(page, /<button[^>]*data-enter[^>]*>Entrer dans le jeu<\/button>/);
  assert.match(page, /<a[^>]*href="https:\/\/portfolio\.matis-wostry\.com\/"[^>]*>Portfolio classique<\/a>/);
});

test('Phaser is only loaded once the visitor enters the game', () => {
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.doesNotMatch(main, /from 'phaser'/);
  assert.match(main, /import\('\.\/game\.js'\)/);
});
