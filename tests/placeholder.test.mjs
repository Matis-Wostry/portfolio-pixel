import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlaceholderFrames } from '../src/config/placeholder.mjs';
import { PLAYER } from '../src/config/player.js';

test('missing sprite fallback has a visible gait in each direction', () => {
  const frames = buildPlaceholderFrames(PLAYER);
  assert.equal(frames.length, 16);
  for (let row = 0; row < PLAYER.rows; row++) {
    assert.notDeepEqual(frames[row * 4].rects, frames[row * 4 + 1].rects);
  }
});

test('fallback drawings fit their individual animation frames', () => {
  const frames = buildPlaceholderFrames(PLAYER);
  assert.deepEqual(frames.map(({ index }) => index), Array.from({ length: 16 }, (_, i) => i));
  for (const { rects } of frames) {
    for (const rect of rects) {
      assert.ok(rect.x >= 0 && rect.y >= 0);
      assert.ok(rect.x + rect.width <= PLAYER.frameWidth);
      assert.ok(rect.y + rect.height <= PLAYER.frameHeight);
    }
  }
});
