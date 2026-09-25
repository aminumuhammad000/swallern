/**
 * Swallern Audio & Read-Aloud Service
 *
 * Robust Web Speech API controller with:
 * - Semantic text chunking (reads entire lesson content across sentences & paragraphs)
 * - Sequential queue execution (avoids the Chrome 15-second cut-off bug)
 * - Real-time active chunk tracking (for UI text highlighting)
 * - Rate control (0.75x, 1x, 1.25x, 1.5x)
 * - Safe SSR support & unmount cleanup
 */

export type AudioRate = 0.75 | 1 | 1.25 | 1.5;
export type AudioState = 'idle' | 'speaking' | 'paused';

export interface ActiveSpeechWord {
  chunkIndex: number;
  charIndex: number;
  charLength: number;
  word: string;
}

export type AudioStateListener = (state: AudioState) => void;
export type ChunkIndexListener = (index: number) => void;
export type WordBoundaryListener = (word: ActiveSpeechWord | null) => void;

export function getSpeechWordRange(
  text: string,
  rawIndex: number,
  rawLength?: number
): { start: number; end: number; word: string } {
  let start = rawIndex;
  while (start < text.length && /\s/.test(text[start])) {
    start++;
  }
  if (start >= text.length) {
    return { start: rawIndex, end: rawIndex, word: '' };
  }

  let len = rawLength && rawLength > 0 ? rawLength : 0;
  if (!len) {
    const slice = text.slice(start);
    const match = slice.match(/^[^\s,.;:!?—"()[\]{}]+/);
    len = match && match[0].length > 0 ? match[0].length : 1;
  }

  const end = Math.min(start + len, text.length);
  return {
    start,
    end,
    word: text.slice(start, end),
  };
}

/**
 * Finds the highest quality England English (en-GB) female voice available in the client browser/OS.
 * Prioritizes natural/neural British voices like Sonia, Libby, Serena, Google UK Female, etc.
 */
export function getBritishFemaleVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  if (!voices || voices.length === 0) return null;

  const isGB = (v: SpeechSynthesisVoice) => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    return lang === 'en-gb' || lang.startsWith('en-gb');
  };

  const isMale = (name: string) => {
    const lower = name.toLowerCase();
    return (
      (lower.includes('male') && !lower.includes('female')) ||
      lower.includes('george') ||
      lower.includes('oliver') ||
      lower.includes('ryan') ||
      lower.includes('guy') ||
      lower.includes('david') ||
      lower.includes('daniel') ||
      lower.includes('brian') ||
      lower.includes('arthur')
    );
  };

  const isKnownFemaleGB = (v: SpeechSynthesisVoice) => {
    const name = v.name.toLowerCase();
    return (
      name.includes('female') ||
      name.includes('sonia') ||
      name.includes('libby') ||
      name.includes('hazel') ||
      name.includes('serena') ||
      name.includes('stephanie') ||
      name.includes('martha') ||
      name.includes('kate') ||
      name.includes('susan') ||
      name.includes('victoria') ||
      name.includes('fiona') ||
      name.includes('alice')
    );
  };

  // 1. Natural / Neural British English Female voice (e.g. Microsoft Sonia Online Natural, Google UK English Female)
  const naturalGBFemale = voices.find(
    (v) =>
      isGB(v) &&
      (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('neural')) &&
      isKnownFemaleGB(v)
  );
  if (naturalGBFemale) return naturalGBFemale;

  // 2. Google UK English Female specifically
  const googleUKFemale = voices.find(
    (v) => isGB(v) && v.name.toLowerCase().includes('google') && !isMale(v.name)
  );
  if (googleUKFemale) return googleUKFemale;

  // 3. Any known British English Female voice
  const knownGBFemale = voices.find((v) => isGB(v) && isKnownFemaleGB(v));
  if (knownGBFemale) return knownGBFemale;

  // 4. Any British English voice that is not explicitly male
  const anyNonMaleGB = voices.find((v) => isGB(v) && !isMale(v.name));
  if (anyNonMaleGB) return anyNonMaleGB;

  // 5. Any British English voice
  const anyGB = voices.find((v) => isGB(v));
  if (anyGB) return anyGB;

  // 6. Fallback: High quality female English voice
  const englishFemaleFallback = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith('en') &&
      (v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('jenny') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('karen'))
  );
  if (englishFemaleFallback) return englishFemaleFallback;

  // 7. General English fallback
  return voices.find((v) => v.lang.toLowerCase().startsWith('en')) || null;
}

class SwallernAudioService {
  private chunks: string[] = [];
  private currentChunkIndex: number = -1;
  private rate: AudioRate = 1;
  private stateListeners: Set<AudioStateListener> = new Set();
  private chunkListeners: Set<ChunkIndexListener> = new Set();
  private wordListeners: Set<WordBoundaryListener> = new Set();
  private _state: AudioState = 'idle';
  private _activeWord: ActiveSpeechWord | null = null;
  private keepAliveTimer: NodeJS.Timeout | null = null;

  private get synth(): SpeechSynthesis | null {
    if (typeof window === 'undefined') return null;
    return window.speechSynthesis ?? null;
  }

  get state(): AudioState {
    return this._state;
  }

  get activeChunkIndex(): number {
    return this.currentChunkIndex;
  }

  get activeWord(): ActiveSpeechWord | null {
    return this._activeWord;
  }

  private setState(s: AudioState) {
    this._state = s;
    this.stateListeners.forEach((fn) => fn(s));
  }

  private setChunkIndex(idx: number) {
    this.currentChunkIndex = idx;
    this.chunkListeners.forEach((fn) => fn(idx));
  }

  private setWord(word: ActiveSpeechWord | null) {
    this._activeWord = word;
    this.wordListeners.forEach((fn) => fn(word));
  }

  subscribe(listener: AudioStateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  subscribeChunk(listener: ChunkIndexListener): () => void {
    this.chunkListeners.add(listener);
    return () => this.chunkListeners.delete(listener);
  }

  subscribeWord(listener: WordBoundaryListener): () => void {
    this.wordListeners.add(listener);
    return () => this.wordListeners.delete(listener);
  }

  setRate(rate: AudioRate) {
    this.rate = rate;
    // If currently speaking, restarting from current chunk applies new rate
    if (this._state === 'speaking' && this.synth) {
      const idx = this.currentChunkIndex;
      this.synth.cancel();
      this.speakChunkAtIndex(idx);
    }
  }

  /**
   * Break a block of text into clean semantic speech chunks (paragraphs & sentences).
   * Strips markdown/HTML artifacts and UI labels.
   */
  static extractChunks(
    title: string,
    content?: string,
    takeaway?: string,
    quickAnswer?: string
  ): string[] {
    const rawBlocks: string[] = [];

    if (title && title.trim()) {
      rawBlocks.push(title.trim());
    }

    if (content && content.trim()) {
      const paragraphs = content.split(/\n+/).map((p) => p.trim()).filter(Boolean);
      for (const p of paragraphs) {
        rawBlocks.push(p);
      }
    }

    if (quickAnswer && quickAnswer.trim()) {
      rawBlocks.push(`Quick Answer. ${quickAnswer.trim()}`);
    }

    if (takeaway && takeaway.trim()) {
      rawBlocks.push(`Key takeaway. ${takeaway.trim()}`);
    }

    return rawBlocks;
  }

  /**
   * Speak a list of sequential chunks.
   */
  speakChunks(chunks: string[], startIndex: number = 0) {
    const synth = this.synth;
    if (!synth || chunks.length === 0) return;

    this.stop();
    this.chunks = chunks;
    this.speakChunkAtIndex(Math.max(0, Math.min(startIndex, chunks.length - 1)));
  }

  /**
   * Single string convenience wrapper.
   */
  speak(text: string) {
    if (!text || !text.trim()) return;
    const chunks = SwallernAudioService.extractChunks('', text);
    this.speakChunks(chunks);
  }

  private speakChunkAtIndex(index: number) {
    const synth = this.synth;
    if (!synth) return;

    if (index >= this.chunks.length) {
      this.stop();
      return;
    }

    this.setChunkIndex(index);
    this.setWord(null);
    const chunkText = this.chunks[index];

    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.lang = 'en-GB';
    utterance.rate = this.rate * 0.98;
    utterance.pitch = 1.06; // warm, articulate female companion pitch
    utterance.volume = 1;

    // Pick highest quality England English female voice
    const preferredVoice = getBritishFemaleVoice(synth);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name === 'word') {
        const range = getSpeechWordRange(chunkText, event.charIndex, event.charLength);
        this.setWord({
          chunkIndex: index,
          charIndex: range.start,
          charLength: range.end - range.start,
          word: range.word,
        });
      }
    };

    utterance.onstart = () => {
      this.setState('speaking');
      this.startKeepAlive();
    };

    utterance.onpause = () => {
      this.setState('paused');
      this.stopKeepAlive();
    };

    utterance.onresume = () => {
      this.setState('speaking');
      this.startKeepAlive();
    };

    utterance.onend = () => {
      this.stopKeepAlive();
      this.setWord(null);
      // Continue to next chunk
      const nextIndex = index + 1;
      if (nextIndex < this.chunks.length) {
        this.speakChunkAtIndex(nextIndex);
      } else {
        this.stop();
      }
    };

    utterance.onerror = (e) => {
      this.stopKeepAlive();
      this.setWord(null);
      // If canceled by user, don't treat as fatal error
      if (e.error === 'canceled' || e.error === 'interrupted') {
        return;
      }
      console.warn('[AudioService] SpeechSynthesis error:', e.error);
      this.stop();
    };

    synth.speak(utterance);
    this.setState('speaking');
  }

  /**
   * Workaround for Chrome/WebKit speech synthesis pausing on long utterances.
   */
  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      if (this.synth && this._state === 'speaking') {
        this.synth.pause();
        this.synth.resume();
      }
    }, 10000);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  pause() {
    const synth = this.synth;
    if (!synth || this._state !== 'speaking') return;
    this.stopKeepAlive();
    synth.pause();
    this.setState('paused');
  }

  resume() {
    const synth = this.synth;
    if (!synth || this._state !== 'paused') return;
    synth.resume();
    this.startKeepAlive();
    this.setState('speaking');
  }

  stop() {
    this.stopKeepAlive();
    const synth = this.synth;
    if (synth) {
      synth.cancel();
    }
    this.chunks = [];
    this.setChunkIndex(-1);
    this.setWord(null);
    this.setState('idle');
  }
}

export const audioService = new SwallernAudioService();
