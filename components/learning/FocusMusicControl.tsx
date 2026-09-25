'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  focusMusicManager,
  FocusTrackId,
  FOCUS_TRACKS,
  FocusMusicListenerData,
} from '@/lib/learning/focusMusic';
import { ClassroomTheme } from '@/lib/learning/themes';

interface FocusMusicControlProps {
  dark: boolean;
  theme: ClassroomTheme;
}

export const FocusMusicControl: React.FC<FocusMusicControlProps> = ({ dark, theme }) => {
  const [data, setData] = useState<FocusMusicListenerData>(() => ({
    state: focusMusicManager.state,
    trackId: focusMusicManager.currentTrackId,
    volume: focusMusicManager.volume,
    isDucked: focusMusicManager.isDucked,
  }));
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = focusMusicManager.subscribe(setData);
    return () => unsub();
  }, []);

  // Close menu on click outside
  useEffect(() => {
    if (!open) return;
    const handleDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [open]);

  const isPlaying = data.state === 'playing';
  const currentTrack = FOCUS_TRACKS[data.trackId] || FOCUS_TRACKS.library;
  const accent = theme.accent;

  const handleToggle = () => {
    focusMusicManager.toggle();
  };

  const handleSelectTrack = (trackId: FocusTrackId) => {
    focusMusicManager.setTrack(trackId);
    if (!isPlaying) {
      focusMusicManager.play(trackId);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    focusMusicManager.setVolume(val);
  };

  const trackIds = Object.keys(FOCUS_TRACKS) as FocusTrackId[];

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Header Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={isPlaying ? `Focus music: ${currentTrack.label} (playing)` : 'Focus background music (off)'}
        title={isPlaying ? `Focus music: ${currentTrack.label}` : 'Focus background music'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isPlaying ? '6px' : '0',
          height: '34px',
          padding: isPlaying ? '0 10px 0 8px' : '0 8px',
          borderRadius: '10px',
          background: isPlaying
            ? dark ? `${accent}25` : `${accent}16`
            : dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
          border: isPlaying
            ? `1px solid ${accent}66`
            : `1px solid ${dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0'}`,
          color: isPlaying ? (dark ? '#A5B4FC' : accent) : dark ? '#94A3B8' : '#64748B',
          cursor: 'pointer',
          transition: 'all 150ms ease',
          outline: 'none',
        }}
      >
        {/* Music notes icon */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>

        {isPlaying && (
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {currentTrack.badge}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '280px',
            backgroundColor: dark ? '#1E293B' : '#FFFFFF',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'}`,
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
            zIndex: 120,
            animation: 'swallern-anim-dropdown 120ms ease-out',
          }}
        >
          {/* Top Title & On/Off Switch */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: dark ? '#F8FAFC' : '#0F172A' }}>
                Focus Music
              </div>
              <div style={{ fontSize: '0.6875rem', color: dark ? '#94A3B8' : '#64748B' }}>
                {isPlaying ? 'Ambient soundscape active' : 'Turn on for study focus'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggle}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '24px',
                width: '46px',
                borderRadius: '12px',
                padding: '2px',
                backgroundColor: isPlaying ? accent : dark ? '#334155' : '#CBD5E1',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 200ms ease',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  transform: isPlaying ? 'translateX(22px)' : 'translateX(0)',
                  transition: 'transform 200ms ease',
                }}
              />
            </button>
          </div>

          {/* Speech Ducking Indicator */}
          {isPlaying && data.isDucked && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: dark ? 'rgba(99,102,241,0.18)' : '#EEF2FF',
                color: dark ? '#A5B4FC' : '#4F46E5',
                fontSize: '0.6875rem',
                fontWeight: 600,
                marginBottom: '12px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: accent,
                  display: 'inline-block',
                }}
              />
              <span>Speech active: music softly lowered</span>
            </div>
          )}

          {/* Soundscapes List */}
          <div style={{ marginBottom: '14px' }}>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: dark ? '#94A3B8' : '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '6px',
              }}
            >
              Decoration Soundscapes
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {trackIds.map((tid) => {
                const trk = FOCUS_TRACKS[tid];
                const isSelected = data.trackId === tid;

                return (
                  <button
                    key={tid}
                    type="button"
                    onClick={() => handleSelectTrack(tid)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: isSelected
                        ? `1.5px solid ${accent}`
                        : `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'}`,
                      background: isSelected
                        ? dark ? `${accent}20` : `${accent}10`
                        : dark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                      color: isSelected
                        ? dark ? '#FFFFFF' : '#0F172A'
                        : dark ? '#CBD5E1' : '#475569',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: isSelected ? 800 : 600 }}>
                        {trk.label}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: dark ? '#94A3B8' : '#64748B' }}>
                        {trk.badge}
                      </div>
                    </div>

                    {isSelected && (
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: accent,
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Slider */}
          <div style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#F1F5F9'}`, paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: dark ? '#94A3B8' : '#64748B' }}>
                Music Volume
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: dark ? '#F8FAFC' : '#0F172A' }}>
                {Math.round(data.volume * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={data.volume}
              onChange={handleVolumeChange}
              style={{
                width: '100%',
                height: '5px',
                accentColor: accent,
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
