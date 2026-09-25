'use client';

import React from 'react';
import Link from 'next/link';
import { ClassroomTheme, ClassroomThemeId, CLASSROOM_THEMES } from '@/lib/learning/themes';
import { AudioState } from '@/lib/learning/audio';
import { FocusMusicControl } from './FocusMusicControl';

interface ClassroomHeaderProps {
  topicSlug: string;
  topicTitle: string;
  categoryName: string;
  currentStep: number;
  totalSteps: number;
  percentComplete: number;
  theme: ClassroomTheme;
  audioState: AudioState;
  isMuted: boolean;
  showOutline: boolean;
  showNotes: boolean;
  noteCount?: number;
  calmMode: boolean;
  onToggleOutline: () => void;
  onToggleNotes: () => void;
  onToggleAudio: () => void;
  onToggleMute: () => void;
  onToggleCalm: () => void;
  onThemeChange: (id: ClassroomThemeId) => void;
  onExit?: () => void;
}

const isDark = (theme: ClassroomTheme) => theme.id === 'space_observatory';

export const ClassroomHeader: React.FC<ClassroomHeaderProps> = ({
  topicSlug,
  topicTitle,
  categoryName,
  currentStep,
  totalSteps,
  percentComplete,
  theme,
  audioState,
  isMuted,
  showOutline,
  showNotes,
  noteCount,
  calmMode,
  onToggleOutline,
  onToggleNotes,
  onToggleAudio,
  onToggleMute,
  onThemeChange,
  onExit,
}) => {
  const dark = isDark(theme);
  const textPrimary = dark ? '#F1F5F9' : '#0F172A';
  const textSecondary = dark ? '#94A3B8' : '#64748B';
  const borderColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(226,232,240,0.9)';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: theme.headerBackground,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${borderColor}`,
      }}
    >
      <div
        style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '0 16px',
          height: '54px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* LEFT: Exit + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {/* Exit button */}
          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              aria-label="Exit classroom"
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: dark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                border: `1px solid ${borderColor}`,
                color: textSecondary,
                cursor: 'pointer',
                outline: 'none',
                transition: 'background 150ms ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : (
            <Link
              href={`/topics/${topicSlug}`}
              aria-label="Exit classroom"
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: dark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                border: `1px solid ${borderColor}`,
                textDecoration: 'none',
                color: textSecondary,
                transition: 'background 150ms ease',
              }}
            >
              {/* SVG back arrow */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}

          {/* Course breadcrumb */}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: textPrimary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2,
              }}
            >
              {topicTitle}
            </div>
            <div style={{ fontSize: '0.6875rem', color: textSecondary, fontWeight: 500, lineHeight: 1 }}>
              {categoryName} · Step {currentStep} of {totalSteps}
            </div>
          </div>
        </div>

        {/* CENTER: Progress bar */}
        <div
          style={{
            flex: '1 1 120px',
            maxWidth: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '5px',
              background: dark ? 'rgba(255,255,255,0.12)' : '#E2E8F0',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${percentComplete}%`,
                background: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accent}CC 100%)`,
                borderRadius: '3px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, color: theme.accent }}>
            {percentComplete}%
          </div>
        </div>

        {/* RIGHT: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Outline toggle */}
          <ControlButton
            dark={dark}
            active={showOutline}
            accent={theme.accent}
            label="Course outline"
            onClick={onToggleOutline}
          >
            {/* List icon */}
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <rect x="1" y="2.5" width="13" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="1" y="6.75" width="13" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="1" y="11" width="13" height="1.5" rx="0.75" fill="currentColor"/>
            </svg>
          </ControlButton>

          {/* Notes toggle */}
          <div style={{ position: 'relative' }}>
            <ControlButton
              dark={dark}
              active={showNotes}
              accent={theme.accent}
              label={showNotes ? 'Close notes' : 'My notes'}
              onClick={onToggleNotes}
            >
              {/* Pencil/note icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </ControlButton>
            {noteCount !== undefined && noteCount > 0 && (
              <span
                aria-label={`${noteCount} notes`}
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  minWidth: '14px',
                  height: '14px',
                  borderRadius: '9999px',
                  background: theme.accent,
                  color: '#FFFFFF',
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  pointerEvents: 'none',
                }}
              >
                {noteCount > 99 ? '99+' : noteCount}
              </span>
            )}
          </div>


          <ControlButton
            dark={dark}
            active={audioState !== 'idle'}
            accent={theme.accent}
            label={audioState === 'idle' ? 'Read aloud' : audioState === 'speaking' ? 'Pause reading' : 'Resume reading'}
            onClick={onToggleAudio}
          >
            {audioState === 'speaking' ? (
              // Pause icon
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="2" width="4" height="10" rx="1.5" fill="currentColor"/>
                <rect x="8" y="2" width="4" height="10" rx="1.5" fill="currentColor"/>
              </svg>
            ) : audioState === 'paused' ? (
              // Play icon
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 2L12 7L3 12V2Z" fill="currentColor"/>
              </svg>
            ) : (
              // Speaker icon
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2 5H5L9 2V13L5 10H2V5Z" fill="currentColor"/>
                <path d="M11.5 4.5C12.5 5.5 12.5 9.5 11.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </ControlButton>

          {/* Focus Background Music */}
          <FocusMusicControl dark={dark} theme={theme} />

          {/* Mute toggle */}
          <ControlButton
            dark={dark}
            active={!isMuted}
            accent={theme.accent}
            label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            onClick={onToggleMute}
          >
            {isMuted ? (
              // Muted icon
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2 5H5L9 2V13L5 10H2V5Z" fill="currentColor"/>
                <path d="M12 5L14 7M14 7L12 9M14 7L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              // Sound on icon
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2 5H5L9 2V13L5 10H2V5Z" fill="currentColor"/>
                <path d="M11 5C12.2 6 12.2 9 11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </ControlButton>

          {/* Theme picker (simple cycling) */}
          <ThemePicker dark={dark} theme={theme} onThemeChange={onThemeChange} />
        </div>
      </div>
    </header>
  );
};

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

interface ControlButtonProps {
  dark: boolean;
  active: boolean;
  accent: string;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

const ControlButton: React.FC<ControlButtonProps> = ({ dark, active, accent, label, onClick, children }) => {
  const bg = active
    ? dark ? `${accent}22` : `${accent}18`
    : dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9';
  const border = active
    ? `1px solid ${accent}55`
    : `1px solid ${dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0'}`;
  const color = active ? accent : dark ? '#94A3B8' : '#64748B';

  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '34px',
        height: '34px',
        borderRadius: '10px',
        background: bg,
        border,
        color,
        cursor: 'pointer',
        transition: 'all 150ms ease',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
};

const THEME_ORDER: ClassroomThemeId[] = [
  'classic_study',
  'nature_explorer',
  'science_lab',
  'library',
  'space_observatory',
  'minimal',
];

const THEME_DOTS: Record<ClassroomThemeId, string> = {
  classic_study: '#C9A96E',
  nature_explorer: '#16A34A',
  science_lab: '#4F46E5',
  library: '#92400E',
  space_observatory: '#38BDF8',
  minimal: '#94A3B8',
};

interface ThemePickerProps {
  dark: boolean;
  theme: ClassroomTheme;
  onThemeChange: (id: ClassroomThemeId) => void;
}

const ThemePicker: React.FC<ThemePickerProps> = ({ dark, theme, onThemeChange }) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (id: ClassroomThemeId) => {
    onThemeChange(id);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Theme: ${theme.label}. Click to change`}
        title={`Theme: ${theme.label}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          background: dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0'}`,
          cursor: 'pointer',
          gap: '4px',
        }}
      >
        {/* Palette icon */}
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="7.5" cy="7.5" r="5.5" stroke={dark ? '#94A3B8' : '#64748B'} strokeWidth="1.4"/>
          <circle cx="5" cy="6" r="1" fill="#6366F1"/>
          <circle cx="9" cy="5.5" r="1" fill="#059669"/>
          <circle cx="10" cy="9" r="1" fill="#DC2626"/>
          <circle cx="6.5" cy="10" r="1" fill="#D97706"/>
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '42px',
            right: 0,
            zIndex: 100,
            background: dark ? '#0F172A' : '#FFFFFF',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'}`,
            borderRadius: '14px',
            padding: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            minWidth: '170px',
          }}
        >
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: dark ? '#64748B' : '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '4px 8px 6px 8px',
            }}
          >
            Classroom Theme
          </div>
          {THEME_ORDER.map((id) => {
            const t = CLASSROOM_THEMES[id];
            const isActive = theme.id === id;
            return (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '9px',
                  background: isActive
                    ? dark ? 'rgba(255,255,255,0.08)' : '#F1F5F9'
                    : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: THEME_DOTS[id],
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: isActive ? 700 : 500, color: dark ? '#F1F5F9' : '#0F172A' }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: dark ? '#64748B' : '#94A3B8' }}>
                    {t.tagline}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Backdrop to close picker */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 90 }}
        />
      )}
    </div>
  );
};
