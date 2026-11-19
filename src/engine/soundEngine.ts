/**
 * Web Audio API Sound Effects & Optional Adventure Background Music Synthesizer for CodeSpark.
 * Zero external MP3 dependencies — works 100% reliably in any browser or sandbox.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled = true;
  private bgmEnabled = false;
  private volume = 0.5;
  private bgmTimer: number | null = null;
  private bgmStep = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public isBgmEnabled(): boolean {
    return this.bgmEnabled;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    if (enabled) {
      this.playButtonClick();
    }
  }

  public setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (enabled) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
  }

  private playTone(opts: {
    freq: number;
    endFreq?: number;
    type?: OscillatorType;
    duration: number;
    delay?: number;
    gain?: number;
  }) {
    if (!this.sfxEnabled && !this.bgmEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + (opts.delay || 0);
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(opts.freq, now);
    if (opts.endFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.endFreq), now + opts.duration);
    }

    const peak = (opts.gain ?? 0.2) * this.volume;
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(peak, now + 0.012);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + opts.duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + opts.duration + 0.02);
  }

  /** Crisp wooden snap when adding or connecting a block */
  public playBlockSnap() {
    if (!this.sfxEnabled) return;
    this.playTone({ freq: 340, endFreq: 560, type: 'triangle', duration: 0.085, gain: 0.28 });
    this.playTone({ freq: 680, endFreq: 780, type: 'sine', duration: 0.06, delay: 0.03, gain: 0.16 });
  }

  /** Soft wooden pluck when deleting a block */
  public playBlockDelete() {
    if (!this.sfxEnabled) return;
    this.playTone({ freq: 420, endFreq: 190, type: 'triangle', duration: 0.11, gain: 0.22 });
  }

  /** Crisp UI button click */
  public playButtonClick() {
    if (!this.sfxEnabled) return;
    this.playTone({ freq: 520, endFreq: 660, type: 'triangle', duration: 0.055, gain: 0.18 });
  }

  /** Parchment / wood tab switch sound */
  public playTabSwitch() {
    if (!this.sfxEnabled) return;
    this.playTone({ freq: 390, endFreq: 520, type: 'sine', duration: 0.07, gain: 0.16 });
    this.playTone({ freq: 585, endFreq: 640, type: 'triangle', duration: 0.06, delay: 0.04, gain: 0.14 });
  }

  /** Playful marimba hop each time Panda moves 1 square */
  public playStep() {
    if (!this.sfxEnabled) return;
    this.playTone({ freq: 290, endFreq: 440, type: 'triangle', duration: 0.09, gain: 0.26 });
    this.playTone({ freq: 580, endFreq: 520, type: 'sine', duration: 0.05, delay: 0.04, gain: 0.1 });
  }

  /** Quick playful turn chirp */
  public playTurn() {
    if (!this.sfxEnabled) return;
    this.playTone({ freq: 460, endFreq: 620, type: 'sine', duration: 0.08, gain: 0.18 });
  }

  /** Sparkling gem/orb collect chime */
  public playGemCollect() {
    if (!this.sfxEnabled) return;
    const notes = [659.25, 880, 1046.5, 1318.5]; // E5, A5, C6, E6
    notes.forEach((n, idx) => {
      this.playTone({
        freq: n,
        type: 'sine',
        duration: 0.18,
        delay: idx * 0.055,
        gain: 0.22,
      });
    });
  }

  /** Friendly cartoon bonk when hitting a wall/tree or syntax error */
  public playCrash() {
    if (!this.sfxEnabled) return;
    this.playTone({ freq: 210, endFreq: 85, type: 'sawtooth', duration: 0.22, gain: 0.2 });
    this.playTone({ freq: 140, endFreq: 65, type: 'triangle', duration: 0.24, delay: 0.08, gain: 0.22 });
  }

  /** Adventure victory fanfare with star chimes */
  public playVictory(stars: number = 3) {
    if (!this.sfxEnabled) return;
    const fanfare = [
      { f: 523.25, d: 0.12, t: 0 }, // C5
      { f: 659.25, d: 0.12, t: 0.11 }, // E5
      { f: 783.99, d: 0.14, t: 0.22 }, // G5
      { f: 1046.5, d: 0.36, t: 0.34 }, // C6
    ];
    fanfare.forEach((n) => {
      this.playTone({ freq: n.f, type: 'triangle', duration: n.d, delay: n.t, gain: 0.26 });
    });

    // Shimmering star chimes
    for (let i = 0; i < Math.min(3, Math.max(1, stars)); i++) {
      this.playTone({
        freq: 1318.5 + i * 220,
        type: 'sine',
        duration: 0.22,
        delay: 0.56 + i * 0.14,
        gain: 0.18,
      });
    }
  }

  /** Magical arpeggio when certificate unlocks */
  public playCertificateUnlock() {
    if (!this.sfxEnabled) return;
    const arp = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.5, 1567.98];
    arp.forEach((f, idx) => {
      this.playTone({ freq: f, type: 'sine', duration: 0.28, delay: idx * 0.08, gain: 0.2 });
    });
  }

  /** Cheerful, subtle pentatonic marimba forest loop */
  private startBgm() {
    this.stopBgm();
    this.ensureContext();
    // C major pentatonic gentle melody
    const melody = [
      523.25, 659.25, 783.99, 659.25,
      587.33, 659.25, 523.25, 0,
      440.0, 523.25, 659.25, 587.33,
      523.25, 392.0, 440.0, 0,
    ];
    const bass = [261.63, 0, 196.0, 0, 220.0, 0, 196.0, 0];

    const tick = () => {
      if (!this.bgmEnabled) return;
      const note = melody[this.bgmStep % melody.length];
      const bassNote = bass[this.bgmStep % bass.length];
      if (note > 0) {
        this.playTone({ freq: note, type: 'sine', duration: 0.26, gain: 0.065 });
      }
      if (bassNote > 0) {
        this.playTone({ freq: bassNote, type: 'triangle', duration: 0.34, gain: 0.045 });
      }
      this.bgmStep++;
      this.bgmTimer = window.setTimeout(tick, 340);
    };

    tick();
  }

  public stopBgm() {
    if (this.bgmTimer !== null) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const soundEngine = new SoundEngine();
