import { createState, cleanName, saveState, loadState, readSettings, writeSettings } from './gameState.js';
import { loadStory, StoryEngine } from './story.js';
import { DialogueRenderer } from './dialogue.js';
import { AmbientAudio } from './audio.js';

const $ = id => document.getElementById(id);
const dialogue = new DialogueRenderer($('dialogue-text'));
const audio = new AmbientAudio();
const settings = readSettings();
let story, engine, rendering = false, renderVersion = 0, toastTimer, currentBackground = 'beach', activeBackground = 0;
let storageWarningShown = false;
const backgrounds = [$('background-current'), $('background-next')];

function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3000);
}

function persist(manual = false) {
  const saved = saveState(engine.state);
  if (manual) toast(saved ? 'This moment is saved.' : 'Saving is unavailable in this browser. You can still keep playing.');
  else if (!saved && !storageWarningShown) {
    storageWarningShown = true;
    toast('Browser storage is unavailable. Progress will last for this visit.');
  }
}

function changeBackground(key) {
  if (key === currentBackground) return;
  currentBackground = key;
  const oldLayer = backgrounds[activeBackground];
  const newLayer = backgrounds[1 - activeBackground];
  newLayer.style.backgroundImage = `url("${story.backgrounds[key]}")`;
  newLayer.style.opacity = '1';
  oldLayer.style.opacity = '0';
  activeBackground = 1 - activeBackground;
}

function updateRelationship(animate = false) {
  const value = engine.state.affection;
  $('relationship-label').textContent = value >= story.romanceThreshold ? 'Something like love' : value >= 12 ? 'A little closer' : 'A familiar warmth';
  $('affection-fill').style.width = `${value / story.maxAffection * 100}%`;
  $('relationship').title = `Your connection with Gabriel · ${value}/${story.maxAffection} affection`;
  $('relationship').setAttribute('aria-label', `Relationship with Gabriel: ${value} of ${story.maxAffection} affection`);
  if (animate) {
    $('relationship').classList.remove('pulse');
    void $('relationship').offsetWidth;
    $('relationship').classList.add('pulse');
  }
}

function showCharacter(node) {
  const characterId = node.character || (story.characters[node.speaker] ? node.speaker : null);
  $('character-wrap').hidden = !characterId || node.type === 'ending';
  if (!characterId) return;
  const character = story.characters[characterId];
  const expression = node.expression || 'smiling';
  const source = character.expressions[expression] || character.expressions.smiling;
  const image = $('character');
  if (image.getAttribute('src') !== source) {
    image.hidden = false;
    $('character-fallback').hidden = true;
    image.src = source;
  }
  image.alt = `${character.name}, ${expression}`;
}

function speakerFor(node) {
  if (node.type === 'choice') return { name: 'Your heart', detail: 'WHAT WILL YOU SAY?' };
  if (node.speaker === 'player') return { name: engine.state.playerName, detail: 'THAT’S YOU' };
  if (story.characters[node.speaker]) return story.characters[node.speaker];
  return { name: 'Your story', detail: 'A MOMENT TO REMEMBER' };
}

async function render() {
  const version = ++renderVersion;
  rendering = true;
  const node = engine.node;
  const chapter = engine.chapter;
  const isChoice = node.type === 'choice';
  const isEnding = node.type === 'ending';
  dialogue.cancel();
  $('choices').replaceChildren();
  $('choices').hidden = true;
  $('app').classList.toggle('choosing', isChoice);
  $('app').classList.toggle('ending-view', isEnding);
  $('dialogue-shell').hidden = isEnding;
  $('ending-card').hidden = !isEnding;
  $('chapter-number').textContent = `CHAPTER ${String(chapter.id).padStart(2, '0')}`;
  $('chapter-name').textContent = chapter.title;
  $('scene-caption').textContent = chapter.location;
  $('scene-count').textContent = `CHAPTER ${String(chapter.id).padStart(2, '0')} / SCENE ${String(node.scene).padStart(2, '0')}`;
  [...$('chapter-progress').children].forEach((element, index) => element.classList.toggle('active', index < chapter.id));
  changeBackground(chapter.background);
  showCharacter(node);
  updateRelationship();
  const speaker = speakerFor(node);
  $('speaker-name').textContent = speaker.name;
  $('speaker-detail').textContent = speaker.detail;
  $('dialogue-shell').classList.toggle('narration', node.type === 'narration' || isChoice);
  $('advance-hint').replaceChildren();
  $('advance-hint').append(document.createTextNode(isChoice ? 'CHOOSE YOUR RESPONSE ABOVE' : 'CLICK TO CONTINUE '));
  if (!isChoice) { const diamond = document.createElement('span'); diamond.textContent = '◇'; diamond.setAttribute('aria-hidden', 'true'); $('advance-hint').append(diamond); }
  const text = await engine.text();
  if (version !== renderVersion) return;
  rendering = false;
  if (isEnding) {
    $('ending-kicker').textContent = node.kicker;
    $('ending-title').textContent = node.title;
    $('ending-description').textContent = text;
    engine.record(engine.state.nodeId, 'The end', `${node.title} ${text}`, 'ending');
    persist();
    $('play-again-button').focus({ preventScroll: true });
    return;
  }
  dialogue.show(text, isChoice || settings.reducedMotion ? 0 : settings.textSpeed);
  // The accessible name exposes the full sentence while the visual text types in.
  $('dialogue-next').setAttribute('aria-label', `${speaker.name}: ${text}. ${isChoice ? 'Choose your response.' : 'Continue story.'}`);
  $('dialogue-next').disabled = isChoice;
  engine.record(engine.state.nodeId, isChoice ? 'Your thoughts' : speaker.name, text, node.type);
  if (isChoice) {
    node.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = 'choice-button';
      const number = document.createElement('small'); number.textContent = String(index + 1).padStart(2, '0');
      const label = document.createElement('span'); label.textContent = engine.interpolate(option.text);
      const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
      button.append(number, label, arrow);
      button.addEventListener('click', () => choose(option.id));
      $('choices').append(button);
    });
    $('choices').hidden = false;
  }
  persist();
}

function advance() {
  if (!engine || rendering || $('game-screen').hidden || document.querySelector('dialog[open]')) return;
  if (engine.node.type === 'choice' || engine.node.type === 'ending') return;
  if (dialogue.typing) { dialogue.finish(); return; }
  if (engine.advance()) void render();
}

function choose(optionId) {
  if (rendering || !engine || $('game-screen').hidden) return;
  if (engine.choose(optionId)) {
    [...$('choices').children].forEach(button => { button.disabled = true; });
    updateRelationship(true);
    void render();
  }
}

function enterGame(state) {
  engine = new StoryEngine(story, state);
  $('title-screen').hidden = true;
  $('game-screen').hidden = false;
  $('chapter-header').hidden = false;
  $('app').classList.add('playing');
  $('brand').setAttribute('aria-label', 'Return to title');
  $('dialogue-next').focus({ preventScroll: true });
  void render();
  if (settings.music) void audio.setEnabled(true);
}

function showTitle() {
  ++renderVersion;
  rendering = false;
  dialogue.cancel();
  if (engine) persist();
  $('game-screen').hidden = true;
  $('title-screen').hidden = false;
  $('chapter-header').hidden = true;
  $('app').classList.remove('playing', 'choosing', 'ending-view');
  changeBackground('beach');
  const saved = loadState(story);
  $('continue-button').hidden = !saved;
  $('save-description').textContent = saved ? `${saved.playerName}’s story · Chapter ${story.nodes[saved.nodeId].chapter} · Saved locally` : '';
  $('start-button').textContent = saved ? 'New Story ↗' : 'Start Story ↗';
}

function openNameDialog() {
  $('player-name').value = engine?.state.playerName || '';
  $('name-dialog').showModal();
  $('player-name').focus();
}

function requestRestart() { $('restart-dialog').showModal(); }

function applySettings() {
  $('app').classList.toggle('reduce-motion', settings.reducedMotion);
  $('text-speed').value = settings.textSpeed;
  $('speed-label').textContent = settings.textSpeed === 0 ? 'Instant' : settings.textSpeed <= 20 ? 'Brisk' : settings.textSpeed <= 40 ? 'Gentle' : 'Unhurried';
  $('music-toggle').checked = settings.music;
  $('motion-toggle').checked = settings.reducedMotion;
  $('sound-button').setAttribute('aria-pressed', String(settings.music));
  const label = `Turn ambient music ${settings.music ? 'off' : 'on'}`;
  $('sound-button').setAttribute('aria-label', label);
  $('sound-button').title = label;
}

async function toggleMusic(enabled) {
  await audio.setEnabled(enabled);
  settings.music = audio.enabled;
  writeSettings(settings);
  applySettings();
  if (enabled && !audio.enabled) toast('Audio is unavailable in this browser.');
}

function showHistory() {
  $('history-content').replaceChildren();
  for (const entry of engine.state.history) {
    const item = document.createElement('div'); item.className = `history-entry ${entry.type === 'choice' ? 'choice' : ''}`;
    const name = document.createElement('strong'); name.textContent = entry.speaker;
    const text = document.createElement('p'); text.textContent = entry.text;
    item.append(name, text); $('history-content').append(item);
  }
  $('history-dialog').showModal();
  $('history-content').scrollTop = $('history-content').scrollHeight;
}

function syncFullscreenControl() {
  const label = document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen';
  $('fullscreen-button').setAttribute('aria-label', label);
  $('fullscreen-button').title = label;
}

function bindEvents() {
  $('dialogue-next').addEventListener('click', advance);
  $('start-button').addEventListener('click', () => loadState(story) ? requestRestart() : openNameDialog());
  $('continue-button').addEventListener('click', () => { const state = loadState(story); if (state) enterGame(state); else { showTitle(); toast('That save could not be read. A new story is ready for you.'); } });
  $('name-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!$('player-name').value.trim()) { $('player-name').setCustomValidity('Please enter a name.'); $('player-name').reportValidity(); return; }
    $('name-dialog').close();
    enterGame(createState(cleanName($('player-name').value), story.start));
  });
  $('player-name').addEventListener('input', () => $('player-name').setCustomValidity(''));
  $('settings-button').addEventListener('click', () => $('settings-dialog').showModal());
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $('sound-button').addEventListener('click', () => void toggleMusic(!settings.music));
  $('music-toggle').addEventListener('change', event => void toggleMusic(event.target.checked));
  $('text-speed').addEventListener('input', event => {
    settings.textSpeed = Number(event.target.value); writeSettings(settings); applySettings();
    if (dialogue.typing) dialogue.finish();
  });
  $('motion-toggle').addEventListener('change', event => {
    settings.reducedMotion = event.target.checked; writeSettings(settings); applySettings();
    if (dialogue.typing) dialogue.finish();
  });
  $('history-button').addEventListener('click', showHistory);
  $('save-button').addEventListener('click', () => persist(true));
  $('restart-button').addEventListener('click', requestRestart);
  $('play-again-button').addEventListener('click', requestRestart);
  $('confirm-restart').addEventListener('click', () => { $('restart-dialog').close(); openNameDialog(); });
  $('ending-title-button').addEventListener('click', showTitle);
  $('return-title-button').addEventListener('click', () => { $('settings-dialog').close(); showTitle(); });
  $('brand').addEventListener('click', event => { event.preventDefault(); if (!$('game-screen').hidden) showTitle(); });
  $('fullscreen-button').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if ($('app').requestFullscreen) await $('app').requestFullscreen();
      else toast('Fullscreen is unavailable in this browser.');
    } catch { toast('Fullscreen is unavailable in this view.'); }
    finally { syncFullscreenControl(); }
  });
  document.addEventListener('fullscreenchange', syncFullscreenControl);
  $('character').addEventListener('error', () => {
    // A failed expression falls back to the default sprite, then an intentional silhouette.
    const image = $('character');
    const fallback = story.characters.gabriel.expressions.smiling;
    if (image.getAttribute('src') !== fallback) image.src = fallback;
    else { image.hidden = true; $('character-fallback').hidden = false; }
  });
  document.addEventListener('keydown', event => {
    if (event.repeat || !['Space', 'Enter'].includes(event.code) || event.altKey || event.ctrlKey || event.metaKey) return;
    if (document.querySelector('dialog[open]') || event.target.closest('button,input,a,select,textarea')) return;
    if (!$('game-screen').hidden) { event.preventDefault(); advance(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (engine) persist(); void audio.setEnabled(false); }
    else if (settings.music) void audio.setEnabled(true);
  });
}

try {
  story = await loadStory();
  applySettings();
  bindEvents();
  showTitle();
  // Decode the next environment and expressions before they enter the story.
  for (const path of [...Object.values(story.backgrounds), ...Object.values(story.characters.gabriel.expressions)]) {
    const image = new Image(); image.src = path;
  }
} catch (error) {
  console.error('The story could not start:', error);
  $('title-screen').hidden = true;
  $('load-error').hidden = false;
}
