/**
 * SwallernSoundManager
 *
 * Lightweight procedural Web Audio API sound generator for UI and classroom feedback.
 * Generates pleasant, rich synthesized tones with zero external file dependencies.
 * Respects user mute setting with localStorage persistence.
 * SSR-safe.
 */

export type SoundEvent =
  | 'correct'
  | 'incorrect'
  | 'button_press'
  | 'lesson_complete'
  | 'course_complete'
  | 'progress'
  | 'celebration';

const MUTE_STORAGE_KEY = 'swallern_sound_muted_v1';

class SwallernSoundManager {
  private ctx: AudioContext | null = null;
  private _muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(MUTE_STORAGE_KEY);
        this._muted = saved === 'true';
      } catch {
        // ignore
      }
    }
  }

  get muted(): boolean {
    return this._muted;
  }

  mute() {
    this._muted = true;
    this.persist();
  }

  unmute() {
    this._muted = false;
    this.persist();
  }

  toggle() {
    this._muted = !this._muted;
    this.persist();
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, String(this._muted));
    } catch {
      // ignore
    }
  }

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx || this.ctx.state === 'closed') {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private tone(
    frequency: number,
    duration: number,
    startTime: number,
    gainValue: number,
    ctx: AudioContext,
    type: OscillatorType = 'sine'
  ) {
    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startTime);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(gainValue, startTime + 0.012);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    } catch {
      // AudioContext state error guard
    }
  }

  play(event: SoundEvent) {
    if (this._muted) return;
    const ctx = this.getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (event) {
      case 'correct': {
        // Bright, crisp two-note chime (C5 -> E5)
        this.tone(523.25, 0.16, now, 0.22, ctx, 'sine');
        this.tone(659.25, 0.22, now + 0.1, 0.2, ctx, 'sine');
        break;
      }

      case 'incorrect': {
        // Soft, gentle two-note descending tone (F4 -> D4) - calm, not jarring
        this.tone(349.23, 0.18, now, 0.16, ctx, 'sine');
        this.tone(293.66, 0.24, now + 0.12, 0.14, ctx, 'sine');
        break;
      }

      case 'button_press': {
        // Very subtle micro-click
        this.tone(880, 0.04, now, 0.08, ctx, 'triangle');
        break;
      }

      case 'progress': {
        // Light ascending pulse
        this.tone(440, 0.12, now, 0.15, ctx, 'sine');
        this.tone(554.37, 0.15, now + 0.08, 0.15, ctx, 'sine');
        break;
      }

      case 'lesson_complete': {
        // Three-note ascending arpeggio (C5 -> E5 -> G5)
        this.tone(523.25, 0.18, now, 0.2, ctx, 'sine');
        this.tone(659.25, 0.18, now + 0.12, 0.2, ctx, 'sine');
        this.tone(783.99, 0.3, now + 0.24, 0.18, ctx, 'sine');
        break;
      }

      case 'course_complete':
      case 'celebration': {
        // Rich 5-note celebratory chord arpeggio (C5 -> E5 -> G5 -> C6 -> E6) with harmonic warmth
        this.tone(523.25, 0.2, now, 0.24, ctx, 'sine');
        this.tone(659.25, 0.2, now + 0.12, 0.22, ctx, 'sine');
        this.tone(783.99, 0.2, now + 0.24, 0.22, ctx, 'sine');
        this.tone(1046.5, 0.35, now + 0.36, 0.25, ctx, 'triangle');
        this.tone(1318.51, 0.45, now + 0.48, 0.2, ctx, 'sine');
        break;
      }
    }
  }
}

export const soundManager = new SwallernSoundManager();
