import test from 'node:test';
import assert from 'node:assert/strict';
import { safeLink } from '../src/ui/content.mjs';
import { PORTFOLIO } from '../src/data/portfolio.js';
import { TITLE_CONTENT } from '../src/data/title.js';

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

test('project cards preserve the six projects and their published destinations', () => {
  assert.equal(PORTFOLIO.projets.cards.length, 6);
  const weather = PORTFOLIO.projets.cards.find((card) => card.id === 'weather');
  assert.ok(weather.tags.includes('Laravel'));
  assert.ok(weather.links.some(({ href }) => href === 'https://github.com/Matis-Wostry/iut-weather'));
  const pokedex = PORTFOLIO.projets.cards.find((card) => card.id === 'pokedex');
  assert.ok(pokedex.links.some(({ href }) => href === 'https://pokedex.matis-wostry.com/'));
});

test('contact and profile use the published identity and contact destinations', () => {
  assert.ok(PORTFOLIO.about.paragraphs.some((text) => text.includes('Matis Wostry')));
  assert.ok(PORTFOLIO.contact.links.some(({ href }) => href === 'mailto:matis.wostry@crea-inseec.com'));
  assert.ok(PORTFOLIO.contact.links.some(({ href }) => href === 'https://matis-wostry.com/assets/cv/CV_Matis_Wostry.pdf'));
});

test('title windows explain the controls and credit the project', () => {
  assert.deepEqual(Object.keys(TITLE_CONTENT).sort(), ['controls', 'credits']);
  for (const content of Object.values(TITLE_CONTENT)) {
    assert.ok(content.title && content.paragraphs.length && content.cards.length);
    for (const link of [...content.links, ...content.cards.flatMap((card) => card.links ?? [])]) {
      assert.equal(safeLink(link.href), link.href);
    }
  }
  const credits = JSON.stringify(TITLE_CONTENT.credits);
  assert.ok(credits.includes('Matis Wostry') && credits.includes('Pixelify Sans'));
});
