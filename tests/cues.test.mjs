import test from 'node:test';
import assert from 'node:assert/strict';
import { interactionCue, isCueVisible } from '../src/systems/cues.mjs';

const zone = { x: 100, y: 120, width: 48, height: 32, label: 'Projets' };

test('world cues sit above their object and distinguish discoverable from actionable', () => {
  assert.deepEqual(interactionCue(zone, { active: false }), { x: 124, y: 100, key: '…', active: false, label: 'Projets' });
  assert.equal(interactionCue(zone, { active: true, touch: false }).key, 'E');
  assert.equal(interactionCue(zone, { active: true, touch: true }).key, '!');
});

test('cue placement follows edited object geometry', () => {
  const cue = interactionCue({ ...zone, x: 320, y: 240, width: 64 }, { active: true });
  assert.equal(cue.x, 352);
  assert.equal(cue.y, 220);
});

test('a zone can place its cue explicitly when the default would leave the screen', () => {
  assert.equal(interactionCue({ ...zone, cueY: 42 }).y, 42);
});

test('portfolio cues stay visible while the others only appear within reach', () => {
  const projets = { ...zone, id: 'bureau', action: 'projets' };
  const panier = { ...zone, id: 'panier', action: 'shoot' };
  assert.equal(isCueVisible(projets), true);
  assert.equal(isCueVisible(panier), false);
  assert.equal(isCueVisible(panier, { target: panier }), true);
  assert.equal(isCueVisible(projets, { enabled: false }), false);
  assert.equal(isCueVisible(panier, { target: panier, excluded: 'panier' }), false);
});
