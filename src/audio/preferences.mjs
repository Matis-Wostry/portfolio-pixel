export const MUTE_KEY = 'chambre-du-dev:muted';

export function getStorage(source) {
  try {
    return source?.localStorage ?? null;
  } catch {
    return null;
  }
}

export function loadMuted(storage) {
  try {
    return storage?.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveMuted(storage, muted) {
  if (!storage) return false;
  try {
    storage.setItem(MUTE_KEY, muted ? '1' : '0');
    return true;
  } catch {
    return false;
  }
}
