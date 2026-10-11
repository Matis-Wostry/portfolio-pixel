export function isSafeAssetPath(path) {
  if (typeof path !== 'string') return false;
  const value = path.trim();
  return value !== '' && value === path && !value.includes(':') && !value.startsWith('/')
    && !value.includes('\\') && !value.split('/').includes('..');
}

export function listConfigured(prefix, entries) {
  const files = [];
  const invalid = [];
  Object.entries(entries ?? {}).forEach(([name, path]) => {
    if (path === null || path === undefined || (typeof path === 'string' && path.trim() === '')) return;
    if (isSafeAssetPath(path)) files.push({ key: `${prefix}${name}`, path });
    else invalid.push(name);
  });
  return { files, invalid };
}

export function isUsableArtSize(size, world) {
  return Boolean(size) && size.width === world.width && size.height === world.height;
}
