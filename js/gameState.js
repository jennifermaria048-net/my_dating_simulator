export const SAVE_KEY = 'under-the-moonlight.save.v1';
export const SETTINGS_KEY = 'under-the-moonlight.settings.v1';

export function createState(playerName, startNode) {
  return { version: 1, playerName: cleanName(playerName), nodeId: startNode, affection: 0, choices: {}, history: [], updatedAt: Date.now() };
}

export function cleanName(name) {
  return String(name ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 24) || 'Alex';
}

export function saveState(state, storage) {
  try { storage ??= globalThis.localStorage; storage.setItem(SAVE_KEY, JSON.stringify({ ...state, updatedAt: Date.now() })); return true; }
  catch { return false; }
}

export function loadState(story, storage) {
  try {
    storage ??= globalThis.localStorage;
    const state = JSON.parse(storage.getItem(SAVE_KEY));
    if (!state || state.version !== 1 || typeof state.playerName !== 'string' || !story.nodes[state.nodeId]) return null;
    if (!state.choices || typeof state.choices !== 'object' || Array.isArray(state.choices)) return null;
    if (!Number.isFinite(state.affection) || state.affection < 0 || state.affection > story.maxAffection) return null;
    let expectedAffection = 0;
    for (const [nodeId, optionId] of Object.entries(state.choices)) {
      const option = story.nodes[nodeId]?.options?.find(item => item.id === optionId);
      if (!option) return null;
      expectedAffection += option.affection;
    }
    if (expectedAffection !== state.affection) return null;
    return { ...state, playerName: cleanName(state.playerName), history: Array.isArray(state.history) ? state.history.filter(entry => typeof entry?.text === 'string' && typeof entry?.speaker === 'string').slice(-150) : [] };
  } catch { return null; }
}

export function readSettings(storage) {
  const defaults = { textSpeed: 30, music: false, reducedMotion: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false };
  try {
    storage ??= globalThis.localStorage;
    const value = JSON.parse(storage.getItem(SETTINGS_KEY));
    if (!value || typeof value !== 'object') return defaults;
    return { textSpeed: Number.isFinite(value.textSpeed) ? Math.max(0, Math.min(60, value.textSpeed)) : defaults.textSpeed, music: value.music === true, reducedMotion: typeof value.reducedMotion === 'boolean' ? value.reducedMotion : defaults.reducedMotion };
  } catch { return defaults; }
}

export function writeSettings(settings, storage) {
  try { storage ??= globalThis.localStorage; storage.setItem(SETTINGS_KEY, JSON.stringify(settings)); return true; } catch { return false; }
}
