/**
 * Swallern Focus Background Music & Ambient Soundscape Engine
 *
 * Procedural Web Audio API soundscape synthesizer tailored to classroom themes.
 * Zero external audio files, zero network bandwidth, seamless infinite playback.
 * Features:
 * - 6 thematic soundscapes mapped to classroom themes (Library, Classic Study, Nature, Science, Space, Minimal)
 * - Automatic speech ducking (gently lowers music volume when reading aloud is active)
 * - Smooth fade-in and crossfade transitions
 * - Volume control with localStorage persistence
 * - Zero em-dashes in any user-facing label
 */

import { ClassroomThemeId } from './themes';

export type FocusTrackId =
  | 'library'
  | 'classic_study'
  | 'nature_explorer'
  | 'science_lab'
  | 'space_observatory'
  | 'minimal';

export interface FocusTrackInfo {
  id: FocusTrackId;
  label: string;
  themeId: ClassroomThemeId;
  tagline: string;
  badge: string;
  description: string;
}

export const FOCUS_TRACKS: Record<FocusTrackId, FocusTrackInfo> = {
  library: {
    id: 'library',
    label: 'Quiet Library',
    themeId: 'library',
    tagline: 'Soft acoustic chords and gentle rain against the window',
    badge: 'Library & Rain',
    description: 'Tranquil piano chords accompanied by soft rainfall hum, designed for deep reading immersion.',
  },
  classic_study: {
    id: 'classic_study',
    label: 'Cozy Study',
    themeId: 'classic_study',
    tagline: 'Warm lo-fi electric chords and comforting room drone',
    badge: 'Lo-Fi Study',
    description: 'Soothing Rhodes chords cycling smoothly with a warm analog presence.',
  },
  nature_explorer: {
    id: 'nature_explorer',
    label: 'Nature Forest',
    themeId: 'nature_explorer',
    tagline: 'Forest creek water, breeze, and pentatonic chimes',
    badge: 'Forest Creek',
    description: 'A gentle babbling creek and canopy breeze with soft organic chime pings.',
  },
  science_lab: {
    id: 'science_lab',
    label: 'Alpha Waves',
    themeId: 'science_lab',
    tagline: '10Hz alpha binaural beats and rhythmic focus drone',
    badge: '10Hz Alpha',
    description: 'Scientifically tuned 10Hz binaural frequencies paired with a deep steady focus drone.',
  },
  space_observatory: {
    id: 'space_observatory',
    label: 'Cosmic Ambient',
    themeId: 'space_observatory',
    tagline: 'Deep celestial drone and shimmering harmonic wash',
    badge: 'Cosmic Drone',
    description: 'A vast interstellar soundscape with resonant filtering and celestial chord washes.',
  },
  minimal: {
    id: 'minimal',
    label: 'Zen Serenity',
    themeId: 'minimal',
    tagline: 'Pure harmonic singing bowl frequencies',
    badge: 'Pure Tone',
    description: 'Ultra-clean 432Hz harmonic sine waves with a gentle breathing tempo.',
  },
};

export type FocusMusicState = 'playing' | 'stopped';

export interface FocusMusicListenerData {
  state: FocusMusicState;
  trackId: FocusTrackId;
  volume: number;
  isDucked: boolean;
}

export type FocusMusicListener = (data: FocusMusicListenerData) => void;

const MUSIC_ENABLED_KEY = 'swallern_focus_music_enabled_v1';
const MUSIC_TRACK_KEY = 'swallern_focus_music_track_v1';
const MUSIC_VOLUME_KEY = 'swallern_focus_music_volume_v1';

class SwallernFocusMusicManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private trackGain: GainNode | null = null;
  private activeGenerators: Array<() => void> = [];
  private sequenceTimer: NodeJS.Timeout | null = null;

  private _state: FocusMusicState = 'stopped';
  private _trackId: FocusTrackId = 'library';
  private _volume: number = 0.35;
  private _isDucked: boolean = false;
  private listeners: Set<FocusMusicListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedTrack = localStorage.getItem(MUSIC_TRACK_KEY) as FocusTrackId;
        if (savedTrack && FOCUS_TRACKS[savedTrack]) {
          this._trackId = savedTrack;
        }
        const savedVol = localStorage.getItem(MUSIC_VOLUME_KEY);
        if (savedVol) {
          const parsed = parseFloat(savedVol);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            this._volume = parsed;
          }
        }
      } catch {
        // ignore
      }
    }
  }

  get state(): FocusMusicState {
    return this._state;
  }

  get currentTrackId(): FocusTrackId {
    return this._trackId;
  }

  get currentTrack(): FocusTrackInfo {
    return FOCUS_TRACKS[this._trackId] || FOCUS_TRACKS.library;
  }

  get volume(): number {
    return this._volume;
  }

  get isDucked(): boolean {
    return this._isDucked;
  }

  subscribe(listener: FocusMusicListener): () => void {
    this.listeners.add(listener);
    // Initial emit
    listener(this.getData());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const data = this.getData();
    this.listeners.forEach((fn) => fn(data));
  }

  private getData(): FocusMusicListenerData {
    return {
      state: this._state,
      trackId: this._trackId,
      volume: this._volume,
      isDucked: this._isDucked,
    };
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

  private setupMasterGain(ctx: AudioContext): GainNode {
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.connect(ctx.destination);
    }
    this.updateMasterVolume();
    return this.masterGain;
  }

  private updateMasterVolume() {
    if (!this.masterGain || !this.ctx) return;
    const target = this._isDucked ? this._volume * 0.35 : this._volume;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(Math.max(0.0001, target), now + 0.4);
  }

  setVolume(vol: number) {
    this._volume = Math.max(0, Math.min(1, vol));
    this.updateMasterVolume();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(MUSIC_VOLUME_KEY, String(this._volume));
      } catch {}
    }
    this.notify();
  }

  setDucking(ducked: boolean) {
    if (this._isDucked === ducked) return;
    this._isDucked = ducked;
    this.updateMasterVolume();
    this.notify();
  }

  setTrack(trackId: FocusTrackId) {
    if (!FOCUS_TRACKS[trackId]) return;
    this._trackId = trackId;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(MUSIC_TRACK_KEY, trackId);
      } catch {}
    }
    if (this._state === 'playing') {
      this.stopGenerators();
      this.startTrack(trackId);
    }
    this.notify();
  }

  syncWithTheme(themeId: ClassroomThemeId) {
    const matchingTrack = (Object.keys(FOCUS_TRACKS) as FocusTrackId[]).find(
      (id) => FOCUS_TRACKS[id].themeId === themeId
    );
    if (matchingTrack && matchingTrack !== this._trackId) {
      this.setTrack(matchingTrack);
    }
  }

  toggle(preferredTrack?: FocusTrackId) {
    if (this._state === 'playing') {
      this.stop();
    } else {
      if (preferredTrack) {
        this._trackId = preferredTrack;
      }
      this.play(this._trackId);
    }
  }

  play(trackId?: FocusTrackId) {
    if (trackId && FOCUS_TRACKS[trackId]) {
      this._trackId = trackId;
    }

    const ctx = this.getCtx();
    if (!ctx) return;

    this.setupMasterGain(ctx);
    this.stopGenerators();

    this._state = 'playing';
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(MUSIC_ENABLED_KEY, 'true');
        localStorage.setItem(MUSIC_TRACK_KEY, this._trackId);
      } catch {}
    }

    this.startTrack(this._trackId);
    this.notify();
  }

  stop() {
    this.stopGenerators();
    this._state = 'stopped';
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(MUSIC_ENABLED_KEY, 'false');
      } catch {}
    }
    this.notify();
  }

  private stopGenerators() {
    if (this.sequenceTimer) {
      clearInterval(this.sequenceTimer);
      this.sequenceTimer = null;
    }
    this.activeGenerators.forEach((cleanup) => {
      try {
        cleanup();
      } catch {}
    });
    this.activeGenerators = [];

    if (this.trackGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.trackGain.gain.cancelScheduledValues(now);
        this.trackGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
      } catch {}
    }
  }

  private startTrack(trackId: FocusTrackId) {
    const ctx = this.getCtx();
    if (!ctx || !this.masterGain) return;

    this.trackGain = ctx.createGain();
    this.trackGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.trackGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);
    this.trackGain.connect(this.masterGain);

    switch (trackId) {
      case 'library':
        this.buildLibrarySoundscape(ctx, this.trackGain);
        break;
      case 'classic_study':
        this.buildClassicStudySoundscape(ctx, this.trackGain);
        break;
      case 'nature_explorer':
        this.buildNatureSoundscape(ctx, this.trackGain);
        break;
      case 'science_lab':
        this.buildScienceSoundscape(ctx, this.trackGain);
        break;
      case 'space_observatory':
        this.buildSpaceSoundscape(ctx, this.trackGain);
        break;
      case 'minimal':
        this.buildMinimalSoundscape(ctx, this.trackGain);
        break;
      default:
        this.buildLibrarySoundscape(ctx, this.trackGain);
    }
  }

  /**
   * Generates a repeating Pink Noise buffer for realistic rain, water, or wind textures.
   */
  private createPinkNoiseBuffer(ctx: AudioContext, seconds: number = 4): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    return buffer;
  }

  /* ------------------------------------------------------------------------ */
  /* 1. QUIET LIBRARY: Soft warm piano pads and gentle window rain              */
  /* ------------------------------------------------------------------------ */
  private buildLibrarySoundscape(ctx: AudioContext, destination: GainNode) {
    // 1. Soft Window Rain Texture
    const rainNoise = ctx.createBufferSource();
    rainNoise.buffer = this.createPinkNoiseBuffer(ctx, 4);
    rainNoise.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(650, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.08, ctx.currentTime);

    rainNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(destination);

    rainNoise.start();

    // 2. Tranquil Library Chord Progression (Fmaj7 -> Em7 -> Dm7 -> Cmaj7)
    const chords = [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [164.81, 196.00, 246.94, 293.66], // Em7
      [146.83, 174.61, 220.00, 261.63], // Dm7
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
    ];

    let chordStep = 0;
    const playNextChord = () => {
      if (this._state !== 'playing') return;
      const notes = chords[chordStep % chords.length];
      chordStep++;

      const now = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        f.type = 'lowpass';
        f.frequency.setValueAtTime(700, now);

        // Gentle swell and fade (7 second duration per chord)
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.045 / (notes.length * 0.8), now + 2.0);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 7.2);

        osc.connect(f);
        f.connect(g);
        g.connect(destination);

        osc.start(now);
        osc.stop(now + 7.3);
      });
    };

    playNextChord();
    this.sequenceTimer = setInterval(playNextChord, 6500);

    this.activeGenerators.push(() => {
      try {
        rainNoise.stop();
        rainNoise.disconnect();
      } catch {}
    });
  }

  /* ------------------------------------------------------------------------ */
  /* 2. COZY STUDY: Warm Rhodes-like electric piano chords and tape drone       */
  /* ------------------------------------------------------------------------ */
  private buildClassicStudySoundscape(ctx: AudioContext, destination: GainNode) {
    // 1. Warm Analog Low-Frequency Drone
    const droneOsc = ctx.createOscillator();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(65.41, ctx.currentTime); // C2

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(220, ctx.currentTime);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.06, ctx.currentTime);

    droneOsc.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(destination);
    droneOsc.start();

    // 2. Lo-Fi Study Chords (Cmaj9 -> Am9 -> Dm9 -> G13)
    const chords = [
      [130.81, 196.00, 246.94, 293.66, 329.63], // Cmaj9
      [110.00, 164.81, 220.00, 261.63, 329.63], // Am9
      [146.83, 220.00, 261.63, 329.63, 349.23], // Dm9
      [98.00, 146.83, 196.00, 246.94, 329.63],  // G13
    ];

    let chordStep = 0;
    const playStudyChord = () => {
      if (this._state !== 'playing') return;
      const notes = chords[chordStep % chords.length];
      chordStep++;
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Warm detuned sine/triangle blend
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq + (idx * 0.15 - 0.3), now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, now);

        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.038 / (notes.length * 0.75), now + 1.8);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 6.8);

        osc.connect(filter);
        filter.connect(g);
        g.connect(destination);

        osc.start(now);
        osc.stop(now + 7.0);
      });
    };

    playStudyChord();
    this.sequenceTimer = setInterval(playStudyChord, 6200);

    this.activeGenerators.push(() => {
      try {
        droneOsc.stop();
        droneOsc.disconnect();
      } catch {}
    });
  }

  /* ------------------------------------------------------------------------ */
  /* 3. NATURE EXPLORER: Flowing creek, breeze, and pentatonic chimes          */
  /* ------------------------------------------------------------------------ */
  private buildNatureSoundscape(ctx: AudioContext, destination: GainNode) {
    // 1. Flowing Creek Pink Noise Stream
    const streamSource = ctx.createBufferSource();
    streamSource.buffer = this.createPinkNoiseBuffer(ctx, 4);
    streamSource.loop = true;

    const streamFilter = ctx.createBiquadFilter();
    streamFilter.type = 'bandpass';
    streamFilter.frequency.setValueAtTime(750, ctx.currentTime);
    streamFilter.Q.setValueAtTime(0.9, ctx.currentTime);

    // LFO to make water bubble and flow dynamically
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.25, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(180, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(streamFilter.frequency);
    lfo.start();

    const streamGain = ctx.createGain();
    streamGain.gain.setValueAtTime(0.075, ctx.currentTime);

    streamSource.connect(streamFilter);
    streamFilter.connect(streamGain);
    streamGain.connect(destination);
    streamSource.start();

    // 2. Soft Forest Chimes (Pentatonic scale notes: G4, A4, C5, D5, E5)
    const chimePitches = [392.00, 440.00, 523.25, 587.33, 659.25];
    const playChime = () => {
      if (this._state !== 'playing') return;
      const now = ctx.currentTime;
      const pitch = chimePitches[Math.floor(Math.random() * chimePitches.length)];

      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.022, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(g);
      g.connect(destination);

      osc.start(now);
      osc.stop(now + 3.6);
    };

    this.sequenceTimer = setInterval(playChime, 3800);

    this.activeGenerators.push(() => {
      try {
        streamSource.stop();
        streamSource.disconnect();
        lfo.stop();
        lfo.disconnect();
      } catch {}
    });
  }

  /* ------------------------------------------------------------------------ */
  /* 4. SCIENCE LAB: 10Hz Alpha binaural beats and steady focus drone          */
  /* ------------------------------------------------------------------------ */
  private buildScienceSoundscape(ctx: AudioContext, destination: GainNode) {
    // Left ear: 216 Hz, Right ear: 226 Hz -> Brain perceives 10 Hz Alpha wave
    const baseFreq = 216;
    const diff = 10;

    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(baseFreq, ctx.currentTime);

    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(baseFreq + diff, ctx.currentTime);

    // Stereo panning
    const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    if (pannerLeft && pannerRight) {
      pannerLeft.pan.setValueAtTime(-0.8, ctx.currentTime);
      pannerRight.pan.setValueAtTime(0.8, ctx.currentTime);
    }

    const binauralGain = ctx.createGain();
    binauralGain.gain.setValueAtTime(0.045, ctx.currentTime);

    if (pannerLeft && pannerRight) {
      oscLeft.connect(pannerLeft);
      pannerLeft.connect(binauralGain);

      oscRight.connect(pannerRight);
      pannerRight.connect(binauralGain);
    } else {
      oscLeft.connect(binauralGain);
      oscRight.connect(binauralGain);
    }

    // Gentle sub drone (54 Hz)
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(54, ctx.currentTime);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.05, ctx.currentTime);

    subOsc.connect(subGain);
    subGain.connect(destination);

    binauralGain.connect(destination);

    oscLeft.start();
    oscRight.start();
    subOsc.start();

    this.activeGenerators.push(() => {
      try {
        oscLeft.stop();
        oscLeft.disconnect();
        oscRight.stop();
        oscRight.disconnect();
        subOsc.stop();
        subOsc.disconnect();
      } catch {}
    });
  }

  /* ------------------------------------------------------------------------ */
  /* 5. SPACE OBSERVATORY: Cosmic ambient drone with sweeping harmonics         */
  /* ------------------------------------------------------------------------ */
  private buildSpaceSoundscape(ctx: AudioContext, destination: GainNode) {
    // 1. Deep Root Drones (55Hz A1 & 110Hz A2)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(110.2, ctx.currentTime);

    const spaceFilter = ctx.createBiquadFilter();
    spaceFilter.type = 'lowpass';
    spaceFilter.frequency.setValueAtTime(260, ctx.currentTime);
    spaceFilter.Q.setValueAtTime(2.5, ctx.currentTime);

    // Slow sweep on filter frequency
    const filterLfo = ctx.createOscillator();
    filterLfo.type = 'sine';
    filterLfo.frequency.setValueAtTime(0.05, ctx.currentTime);

    const filterLfoGain = ctx.createGain();
    filterLfoGain.gain.setValueAtTime(160, ctx.currentTime);

    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(spaceFilter.frequency);
    filterLfo.start();

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.05, ctx.currentTime);

    osc1.connect(spaceFilter);
    osc2.connect(spaceFilter);
    spaceFilter.connect(droneGain);
    droneGain.connect(destination);

    osc1.start();
    osc2.start();

    // 2. High Shimmer Harmonics (A minor celestial fifths: 440, 659.25, 880)
    const shimmerPitches = [440.00, 554.37, 659.25, 880.00];
    const playShimmer = () => {
      if (this._state !== 'playing') return;
      const now = ctx.currentTime;
      const pitch = shimmerPitches[Math.floor(Math.random() * shimmerPitches.length)];

      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.02, now + 2.0);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 7.5);

      osc.connect(g);
      g.connect(destination);

      osc.start(now);
      osc.stop(now + 7.6);
    };

    this.sequenceTimer = setInterval(playShimmer, 4500);

    this.activeGenerators.push(() => {
      try {
        osc1.stop();
        osc1.disconnect();
        osc2.stop();
        osc2.disconnect();
        filterLfo.stop();
        filterLfo.disconnect();
      } catch {}
    });
  }

  /* ------------------------------------------------------------------------ */
  /* 6. MINIMAL: Zen singing bowl pure frequency wash                           */
  /* ------------------------------------------------------------------------ */
  private buildMinimalSoundscape(ctx: AudioContext, destination: GainNode) {
    // 432 Hz Pure Sine Tone & 648 Hz Harmonic Fifth with breathing envelope
    const rootOsc = ctx.createOscillator();
    rootOsc.type = 'sine';
    rootOsc.frequency.setValueAtTime(216, ctx.currentTime); // 432 / 2

    const fifthOsc = ctx.createOscillator();
    fifthOsc.type = 'sine';
    fifthOsc.frequency.setValueAtTime(324, ctx.currentTime);

    // Slow breath LFO: 5-second inhale, 5-second exhale
    const breathLfo = ctx.createOscillator();
    breathLfo.type = 'sine';
    breathLfo.frequency.setValueAtTime(0.1, ctx.currentTime);

    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0.02, ctx.currentTime);

    breathLfo.connect(breathGain.gain);

    const zenGain = ctx.createGain();
    zenGain.gain.setValueAtTime(0.04, ctx.currentTime);

    rootOsc.connect(zenGain);
    fifthOsc.connect(zenGain);
    zenGain.connect(destination);

    rootOsc.start();
    fifthOsc.start();
    breathLfo.start();

    this.activeGenerators.push(() => {
      try {
        rootOsc.stop();
        rootOsc.disconnect();
        fifthOsc.stop();
        fifthOsc.disconnect();
        breathLfo.stop();
        breathLfo.disconnect();
      } catch {}
    });
  }
}

export const focusMusicManager = new SwallernFocusMusicManager();
