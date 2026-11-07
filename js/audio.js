/** Original ambient score, synthesized locally. No audio downloads or external services. */
export class AmbientAudio {
  constructor() { this.context = null; this.timer = null; this.enabled = false; this.step = 0; }
  async setEnabled(enabled) {
    if (!enabled) {
      this.enabled = false;
      clearTimeout(this.timer);
      if (this.context?.state === 'running') await this.context.suspend();
      return;
    }
    try {
      const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContext) return;
      this.context ??= new AudioContext();
      await this.context.resume();
      if (this.enabled) return;
      this.enabled = true;
      this.playChord();
    } catch { this.enabled = false; }
  }
  playChord() {
    if (!this.enabled) return;
    const chords = [[220,261.63,329.63,493.88],[174.61,220,261.63,349.23],[196,246.94,293.66,440],[164.81,220,246.94,329.63]];
    const notes = chords[this.step++ % chords.length];
    notes.forEach((frequency, index) => {
      const start = this.context.currentTime + index * .2;
      const tone = this.context.createOscillator();
      const gain = this.context.createGain();
      tone.type = 'sine'; tone.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(.018, start + 1.3);
      gain.gain.exponentialRampToValueAtTime(.0001, start + 7);
      tone.connect(gain); gain.connect(this.context.destination);
      tone.start(start); tone.stop(start + 7.1);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); };
    });
    this.timer = setTimeout(() => this.playChord(), 5500);
  }
}
