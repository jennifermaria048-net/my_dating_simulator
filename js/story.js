/** Dialogue providers only replace `response` nodes. Narration, choices and state stay deterministic. */
export class StaticDialogueProvider {
  async getResponse({ node }) { return node.text; }
}

export class StoryEngine {
  constructor(story, state, responseProvider = new StaticDialogueProvider()) {
    this.story = story;
    this.state = state;
    this.responseProvider = responseProvider;
    this.resolveConditions();
  }
  get node() { return this.story.nodes[this.state.nodeId]; }
  get chapter() { return this.story.chapters.find(chapter => chapter.id === this.node.chapter); }
  interpolate(text) { return String(text).replaceAll('{playerName}', this.state.playerName); }
  async text() {
    const node = this.node;
    if (node.type !== 'response') return this.interpolate(node.text);
    try {
      const generated = await this.responseProvider.getResponse({ node, playerName: this.state.playerName, relationship: { affection: this.state.affection, choices: { ...this.state.choices } }, chapter: this.chapter });
      return this.interpolate(typeof generated === 'string' && generated.trim() ? generated : node.text);
    } catch { return this.interpolate(node.text); }
  }
  resolveConditions() {
    let steps = 0;
    while (this.node?.type === 'condition') {
      if (++steps > 20) throw new Error('Circular story condition');
      this.state.nodeId = this.state.affection >= this.node.atLeast ? this.node.then : this.node.otherwise;
    }
    if (!this.node) throw new Error('Missing story node');
  }
  advance() {
    if (this.node.type === 'choice' || this.node.type === 'ending' || !this.node.next) return false;
    this.state.nodeId = this.node.next;
    this.resolveConditions();
    return true;
  }
  choose(optionId) {
    if (this.node.type !== 'choice') return false;
    const nodeId = this.state.nodeId;
    const option = this.node.options.find(option => option.id === optionId);
    if (!option || Object.hasOwn(this.state.choices, nodeId)) return false;
    this.state.choices[nodeId] = option.id;
    this.state.affection = Math.min(this.story.maxAffection, this.state.affection + option.affection);
    this.record(`choice:${nodeId}`, this.state.playerName, this.interpolate(option.text), 'choice');
    this.state.nodeId = option.next;
    this.resolveConditions();
    return true;
  }
  record(id, speaker, text, type = 'dialogue') {
    if (this.state.history.some(entry => entry.id === id)) return;
    this.state.history.push({ id, speaker, text, type, chapter: this.node.chapter });
    this.state.history = this.state.history.slice(-150);
  }
}

export async function loadStory() {
  const response = await fetch(new URL('../data/story.json', import.meta.url));
  if (!response.ok) throw new Error('Could not load story');
  return response.json();
}
