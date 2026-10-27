import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { safeLink } from '../src/ui/content.mjs';
import { PORTFOLIO } from '../src/data/portfolio.js';

test('portfolio links support web and email destinations', () => {
  for (const href of ['https://example.com/work', 'http://example.com', 'mailto:dev@example.com']) {
    assert.equal(safeLink(href), href);
  }
});

test('invalid and executable links are omitted', () => {
  for (const href of ['javascript:alert(1)', 'data:text/html,hello', '/relative', '', null]) {
    assert.equal(safeLink(href), null);
  }
});

test('every interaction has real portfolio content and safe links', () => {
  assert.deepEqual(Object.keys(PORTFOLIO).sort(), ['about', 'contact', 'projets', 'skills']);
  for (const content of Object.values(PORTFOLIO)) {
    assert.ok(content.title);
    assert.ok(content.paragraphs.every((text) => !text.includes('Contenu provisoire')));
    for (const link of [...content.links, ...(content.cards ?? []).flatMap((card) => card.links ?? [])]) {
      assert.ok(link.label);
      assert.equal(safeLink(link.href), link.href);
    }
  }
});

test('project cards preserve the nine projects and their published destinations', () => {
  assert.equal(PORTFOLIO.projets.cards.length, 9);
  const weather = PORTFOLIO.projets.cards.find((card) => card.id === 'meteo');
  assert.ok(weather.tags.includes('Laravel'));
  assert.ok(weather.links.some(({ href }) => href === 'https://github.com/Matis-Wostry/iut-weather'));
  const pokedex = PORTFOLIO.projets.cards.find((card) => card.id === 'pokedex');
  assert.ok(pokedex.links.some(({ href }) => href === 'https://pokedex.matis-wostry.com/'));
});

test('skills fill a whiteboard with one colored magnet per category', () => {
  const { board } = PORTFOLIO.skills;
  assert.equal(board.length, 4);
  board.forEach(({ title, color, tags }) => {
    assert.ok(title && tags.length, title);
    assert.match(color, /^#[0-9a-f]{6}$/);
  });
  assert.equal(new Set(board.map(({ color }) => color)).size, board.length);
});

test('contact and profile use the published identity and contact destinations', () => {
  assert.ok(PORTFOLIO.about.paragraphs.some((text) => text.includes('Matis Wostry')));
  assert.ok(PORTFOLIO.contact.links.some(({ href }) => href === 'mailto:matis.wostry@crea-inseec.com'));
  assert.ok(PORTFOLIO.contact.links.some(({ href }) => href === 'https://matis-wostry.com/assets/cv/CV_Matis_Wostry.pdf'));
});

test('the presentation is a persona backed by proofs, a dated path and illustrated hobbies', () => {
  const { persona } = PORTFOLIO.about;
  assert.equal(persona.name, 'Matis Wostry');
  for (const key of ['goals', 'motivations', 'frustrations', 'workStyle', 'timeline', 'hobbies']) assert.ok(persona[key].length, key);
  persona.workStyle.forEach(({ quality, proof }) => assert.ok(quality && proof));
  persona.timeline.forEach(({ period, kind }) => {
    assert.match(period, /^\d{4}–\d{4}$/);
    assert.ok(['etudes', 'pro'].includes(kind));
  });
  const starts = persona.timeline.map(({ period }) => Number(period.slice(0, 4)));
  assert.deepEqual(starts, [...starts].sort((a, b) => a - b));
  persona.hobbies.forEach(({ label, icon }) => assert.ok(label && existsSync(new URL(`../public/assets/interface/${icon}`, import.meta.url)), label));
});
