'use client';

import React, { useState, useEffect } from 'react';
import { AudioState, AudioRate, audioService } from '@/lib/learning/audio';
import {
  focusMusicManager,
  FOCUS_TRACKS,
  FocusMusicListenerData,
} from '@/lib/learning/focusMusic';

interface AudioControlsProps {
  text?: string;
  chunks?: string[];
  audioState: AudioState;
  rate: AudioRate;
  accent: string;
  dark: boolean;
  onRateChange: (rate: AudioRate) => void;
}

const RATES: AudioRate[] = [0.75, 1, 1.25, 1.5];
const RATE_LABELS: Record<AudioRate, string> = {
  0.75: '0.75×',
  1: '1×',
  1.25: '1.25×',
  1.5: '1.5×',
};

export const AudioControls: React.FC<AudioControlsProps> = ({
  text,
  chunks,
  audioState,
  rate,
  accent,
  dark,
  onRateChange,
}) => {
  const textSecondary = dark ? '#94A3B8' : '#64748B';
  const surfaceBg = dark ? 'rgba(255,255,255,0.06)' : '#F8FAFC';
  const borderColor = dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0';

  const [musicData, setMusicData] = useState<FocusMusicListenerData>(() => ({
    state: focusMusicManager.state,
    trackId: focusMusicManager.currentTrackId,
    volume: focusMusicManager.volume,
    isDucked: focusMusicManager.isDucked,
  }));

  useEffect(() => {
    const unsub = focusMusicManager.subscribe(setMusicData);
    return () => unsub();
  }, []);

  const handlePlayToggle = () => {
    if (audioState === 'idle') {
      if (chunks && chunks.length > 0) {
        audioService.speakChunks(chunks);
      } else if (text) {
        audioService.speak(text);
      }
    } else if (audioState === 'speaking') {
      audioService.pause();
    } else if (audioState === 'paused') {
      audioService.resume();
    }
  };

  const handleStop = () => {
    audioService.stop();
  };

  const handleRate = (r: AudioRate) => {
    audioService.setRate(r);
    onRateChange(r);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '12px',
        background: surfaceBg,
        border: `1px solid ${borderColor}`,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handlePlayToggle}
          aria-label={
            audioState === 'speaking'
              ? 'Pause reading'
              : audioState === 'paused'
              ? 'Resume reading'
              : 'Listen to this lesson'
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: '32px',
            padding: '0 14px',
            borderRadius: '9px',
            background: accent,
            border: 'none',
            color: '#FFFFFF',
            fontSize: '0.8125rem',
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'transform 100ms ease, opacity 150ms ease',
          }}
        >
          {audioState === 'speaking' ? (
            <>
              {/* Pause icon */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              <span>Pause</span>
            </>
          ) : audioState === 'paused' ? (
            <>
              {/* Play icon */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Resume</span>
            </>
          ) : (
            <>
              {/* Audio/Listen icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              <span>Listen</span>
            </>
          )}
        </button>

        {/* Stop Button (only when speaking or paused) */}
        {audioState !== 'idle' && (
          <button
            type="button"
            onClick={handleStop}
            aria-label="Stop reading"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '32px',
              padding: '0 10px',
              borderRadius: '9px',
              background: dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
              border: 'none',
              color: textSecondary,
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
            <span style={{ marginLeft: '4px' }}>Stop</span>
          </button>
        )}

        {/* Live reading status badge */}
        {audioState === 'speaking' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: dark ? `${accent}22` : `${accent}14`,
              color: dark ? '#A5B4FC' : accent,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: accent,
                display: 'inline-block',
                boxShadow: `0 0 6px ${accent}`,
              }}
            />
            <span>Reading section...</span>
          </div>
        )}
      </div>

      {/* Middle & Right action group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Focus Music Quick Toggle */}
        <button
          type="button"
          onClick={() => focusMusicManager.toggle()}
          aria-label={musicData.state === 'playing' ? 'Turn off focus music' : 'Turn on focus music'}
          title={musicData.state === 'playing' ? `Playing: ${FOCUS_TRACKS[musicData.trackId]?.badge || 'Focus Music'}` : 'Turn on focus music'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            height: '28px',
            padding: '0 10px',
            borderRadius: '8px',
            background: musicData.state === 'playing'
              ? dark ? `${accent}25` : `${accent}16`
              : dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
            border: musicData.state === 'playing'
              ? `1px solid ${accent}66`
              : `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
            color: musicData.state === 'playing' ? (dark ? '#A5B4FC' : accent) : textSecondary,
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 120ms ease',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span>
            {musicData.state === 'playing'
              ? (FOCUS_TRACKS[musicData.trackId]?.badge || 'Music On')
              : 'Focus Music'}
          </span>
        </button>

        {/* Speed Rate Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: textSecondary, marginRight: '4px' }}>
          Speed
        </span>
        {RATES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => handleRate(r)}
            aria-label={`Playback speed ${RATE_LABELS[r]}`}
            style={{
              padding: '3px 7px',
              borderRadius: '6px',
              border: rate === r ? `1px solid ${accent}` : '1px solid transparent',
              background: rate === r
                ? dark ? `${accent}30` : `${accent}18`
                : 'transparent',
              color: rate === r
                ? dark ? '#A5B4FC' : accent
                : textSecondary,
              fontSize: '0.6875rem',
              fontWeight: rate === r ? 800 : 500,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {RATE_LABELS[r]}
          </button>
        ))}
        </div>
      </div>
    </div>
  );
};
