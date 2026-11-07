import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { StoryEngine } from '../js/story.js';
import { createState, saveState, loadState, cleanName, readSettings, SAVE_KEY } from '../js/gameState.js';

const story = JSON.parse(readFileSync(new URL('../data/story.json', import.meta.url)));
function storage() { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; }
function game(provider) { return new StoryEngine(story, createState('Robin', story.start), provider); }

test('story graph has valid chapters, links, scenes, response slots and reachable nodes', () => {
  const visited = new Set();
  function visit(id) {
    if (visited.has(id)) return;
    visited.add(id);
    const node = story.nodes[id]; assert.ok(node, `Missing ${id}`);
    const chapter = story.chapters.find(chapter => chapter.id === node.chapter);
    assert.ok(chapter); assert.ok(node.scene >= 1 && node.scene <= chapter.scenes);
    if (node.type === 'response') assert.ok(node.responseSlot);
    if (node.type === 'choice') {
      assert.equal(node.options.length, 3);
      assert.equal(new Set(node.options.map(option => option.id)).size, 3);
      node.options.forEach(option => { assert.ok(option.affection >= 0); visit(option.next); });
    }
    if (node.next) visit(node.next);
    if (node.type === 'condition') { visit(node.then); visit(node.otherwise); }
  }
  visit(story.start);
  assert.equal(visited.size, Object.keys(story.nodes).length, 'Unreachable story content');
});

test('all 27 choice combinations reach the correct ending, with exact affection and save/resume at each line', async () => {
  const endings = new Set();
  for (let first = 0; first < 3; first++) for (let second = 0; second < 3; second++) for (let third = 0; third < 3; third++) {
    let engine = game(); const picks = [first, second, third]; let choice = 0, score = 0, steps = 0;
    const saved = storage();
    while (engine.node.type !== 'ending') {
      assert.ok(++steps < 100, 'Story did not terminate');
      const text = await engine.text(); assert.ok(text); assert.ok(!text.includes('{playerName}'));
      assert.ok(saveState(engine.state, saved));
      const restored = loadState(story, saved); assert.ok(restored);
      engine = new StoryEngine(story, restored);
      if (engine.node.type === 'choice') {
        const before = engine.state.nodeId;
        assert.equal(engine.advance(), false, 'Choice cannot be skipped');
        assert.equal(engine.state.nodeId, before);
        assert.equal(engine.choose('invalid'), false);
        const option = engine.node.options[picks[choice++]];
        score += option.affection;
        assert.ok(engine.choose(option.id));
        assert.equal(engine.choose(option.id), false, 'Repeated click cannot award points twice');
      } else assert.ok(engine.advance());
    }
    assert.equal(choice, 3); assert.equal(engine.state.affection, score);
    assert.equal(engine.node.ending, score >= story.romanceThreshold ? 'romantic' : 'bittersweet');
    assert.equal(engine.advance(), false);
    assert.equal(Object.keys(engine.state.choices).length, 3);
    endings.add(engine.node.ending);
    saveState(engine.state, saved);
    assert.equal(new StoryEngine(story, loadState(story, saved)).node.ending, engine.node.ending);
  }
  assert.deepEqual([...endings].sort(), ['bittersweet', 'romantic']);
});

test('ending threshold includes exactly 22, with 21 remaining bittersweet', () => {
  for (const affection of [21, 22]) {
    const state = { ...createState('Robin', 'ending-branch'), affection };
    const engine = new StoryEngine(story, state);
    assert.equal(engine.state.nodeId, affection === 22 ? 'romantic-confession' : 'bittersweet-confession');
  }
});

test('corrupt, mismatched, invalid and inaccessible saves are ignored safely', () => {
  const saved = storage();
  for (const value of ['bad JSON', 'null', '{}', JSON.stringify({ ...createState('Robin', story.start), nodeId: 'missing' }), JSON.stringify({ ...createState('Robin', story.start), affection: 30 }), JSON.stringify({ ...createState('Robin', story.start), choices: { 'campus-choice': 'missing' } })]) {
    saved.setItem(SAVE_KEY, value); assert.equal(loadState(story, saved), null);
  }
  const blocked = { getItem() { throw new Error('Blocked'); }, setItem() { throw new Error('Full'); } };
  assert.equal(loadState(story, blocked), null);
  assert.equal(saveState(game().state, blocked), false);
  assert.equal(readSettings(blocked).textSpeed, 30);
});

test('player names interpolate as plain text and history is not duplicated on resume', async () => {
  const engine = game(); engine.state.nodeId = 'campus-warm';
  assert.match(await engine.text(), /Robin/);
  engine.record('campus-warm', 'Gabriel', 'Hello'); engine.record('campus-warm', 'Gabriel', 'Hello');
  assert.equal(engine.state.history.length, 1);
  assert.equal(cleanName('  <Robin>\n  '), 'Robin');
  assert.equal(cleanName('   '), 'Alex');
  assert.equal(cleanName('x'.repeat(100)).length, 24);
});

test('browser security restrictions on the localStorage getter do not stop the game', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
  try {
    assert.equal(loadState(story), null);
    assert.equal(saveState(game().state), false);
    assert.equal(readSettings().textSpeed, 30);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
});

test('future response provider can replace response slots and failure falls back to static text', async () => {
  const engine = game({ async getResponse(context) { assert.equal(context.node.responseSlot, 'campus.obviously'); assert.equal(context.playerName, 'Robin'); return 'Hello, {playerName}!'; } });
  engine.state.nodeId = 'campus-warm'; assert.equal(await engine.text(), 'Hello, Robin!');
  engine.state.nodeId = story.start; assert.equal(await engine.text(), story.nodes[story.start].text);
  engine.state.nodeId = 'campus-warm'; engine.responseProvider = { async getResponse() { throw new Error('Offline'); } };
  assert.equal(await engine.text(), engine.interpolate(engine.node.text));
  engine.responseProvider = { async getResponse() { return ''; } };
  assert.equal(await engine.text(), engine.interpolate(engine.node.text));
});

test('every configured illustration is present on disk', () => {
  for (const path of [...Object.values(story.backgrounds), ...Object.values(story.characters.gabriel.expressions)]) {
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `Missing asset ${path}`);
  }
});
