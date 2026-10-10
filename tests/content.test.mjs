import test from 'node:test';
import assert from 'node:assert/strict';
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

test('every interaction opens explicitly temporary portfolio content', () => {
  assert.deepEqual(Object.keys(PORTFOLIO).sort(), ['about', 'contact', 'projets', 'skills']);
  for (const content of Object.values(PORTFOLIO)) {
    assert.ok(content.title);
    assert.match(content.paragraphs[0], /Contenu provisoire/);
    assert.deepEqual(content.links, []);
  }
});
