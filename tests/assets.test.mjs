import test from 'node:test';
import assert from 'node:assert/strict';
import { isSafeAssetPath, listConfigured, isUsableArtSize } from '../src/systems/assetManifest.mjs';

test('accepts only relative paths inside public', () => {
  for (const path of ['assets/title/sky.png', 'assets/audio/sfx/click.mp3']) assert.equal(isSafeAssetPath(path), true, path);
  for (const path of ['https://example.com/a.png', 'javascript:alert(1)', 'data:image/png;base64,AA', '/assets/a.png',
    '../secret.png', 'assets/../../a.png', 'assets\\a.png', ' assets/a.png', '', null, 42]) {
    assert.equal(isSafeAssetPath(path), false, String(path));
  }
});

test('lists only configured files with prefixed keys', () => {
  const result = listConfigured('sfx-', { click: 'assets/audio/sfx/click.mp3', open: null, close: '', enter: '   ', extra: undefined });
  assert.deepEqual(result, { files: [{ key: 'sfx-click', path: 'assets/audio/sfx/click.mp3' }], invalid: [] });
});

test('reports unsafe or malformed entries without loading them', () => {
  const result = listConfigured('title-', { sky: 'https://example.com/sky.png', city: '../city.png', building: 42, street: '/street.png' });
  assert.deepEqual(result.files, []);
  assert.deepEqual(result.invalid, ['sky', 'city', 'building', 'street']);
  assert.deepEqual(listConfigured('music-', null), { files: [], invalid: [] });
});

test('accepts designer layers only at the world size', () => {
  const world = { width: 480, height: 300 };
  assert.equal(isUsableArtSize({ width: 480, height: 300 }, world), true);
  assert.equal(isUsableArtSize({ width: 960, height: 600 }, world), false);
  assert.equal(isUsableArtSize(null, world), false);
});
