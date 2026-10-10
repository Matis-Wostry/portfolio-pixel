import test from 'node:test';
import assert from 'node:assert/strict';
import { LandscapeSuggestion } from '../src/ui/orientation.mjs';

test('suggests landscape only for a mobile portrait layout', () => {
  const suggestion = new LandscapeSuggestion();
  assert.equal(suggestion.shouldOpen({ width: 390, height: 844, coarsePointer: true }), true);
  assert.equal(suggestion.shouldOpen({ width: 844, height: 390, coarsePointer: true }), false);
  assert.equal(suggestion.shouldOpen({ width: 1000, height: 1200, coarsePointer: false }), false);
  assert.equal(suggestion.shouldOpen({ width: 768, height: 1024, coarsePointer: true }), true);
  assert.equal(suggestion.shouldOpen({ width: 0, height: 800, coarsePointer: true }), false);
});

test('dismissal survives portrait resizing and resets on a new portrait visit', () => {
  const suggestion = new LandscapeSuggestion();
  const portrait = { width: 390, height: 844, coarsePointer: true };
  assert.equal(suggestion.shouldOpen(portrait), true);
  suggestion.dismiss();
  assert.equal(suggestion.shouldOpen({ ...portrait, height: 790 }), false);
  assert.equal(suggestion.shouldOpen({ width: 844, height: 390, coarsePointer: true }), false);
  assert.equal(suggestion.shouldOpen(portrait), true);
});
