import test from 'node:test';
import assert from 'node:assert/strict';
import { interactionCue } from '../src/systems/cues.mjs';

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
