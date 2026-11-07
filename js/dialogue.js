export class DialogueRenderer {
  constructor(element) { this.element = element; this.timer = null; this.fullText = ''; this.typing = false; }
  show(text, delay = 30) {
    this.cancel();
    this.fullText = text;
    this.element.textContent = '';
    if (delay === 0) { this.finish(); return; }
    const characters = Array.from(text);
    let count = 0;
    this.typing = true;
    this.timer = setInterval(() => {
      this.element.textContent = characters.slice(0, ++count).join('');
      if (count >= characters.length) this.finish();
    }, delay);
  }
  finish() { this.cancel(); this.element.textContent = this.fullText; }
  cancel() { clearInterval(this.timer); this.timer = null; this.typing = false; }
}
