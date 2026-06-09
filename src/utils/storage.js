const STORAGE_KEY = 'carfin-state';

export function loadState() {
  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return undefined;
    }
    return JSON.parse(serialized);
  } catch (e) {
    return undefined;
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore write errors (e.g. storage full or unavailable)
  }
}

export function clearState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}

export { STORAGE_KEY };
