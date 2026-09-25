'use client';

import React, { useState } from 'react';
import { VISUAL_MODES, VisualMode } from '@/lib/visuals/tokens';
import { CharacterExpression, CharacterPose, CANONICAL_CHARACTERS } from '@/lib/visuals/characters';
import { SwallernCharacter } from './SwallernCharacter';

export type UserVisualSelectionMode = 'auto' | VisualMode;

export interface VisualSelectionValue {
  mode: UserVisualSelectionMode;
  characterId: string;
  expression: CharacterExpression;
  pose: CharacterPose;
}

interface SwallernVisualSelectorProps {
  value?: VisualSelectionValue;
  onChange: (value: VisualSelectionValue) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const VISUAL_MODE_CARD_OPTIONS: Array<{
  key: UserVisualSelectionMode;
  label: string;
  tagline: string;
  description: string;
  icon: string;
}> = [
  {
    key: 'auto',
    label: 'Auto',
    tagline: 'Let Swallern choose',
    description: 'Swallern automatically selects the most appropriate visual treatment based on educational intent.',
    icon: '⚡',
  },
  {
    key: VISUAL_MODES.A_ILLUSTRATION.mode,
    label: 'Illustration',
    tagline: 'Swallern Illustration',
    description: 'Friendly educational artwork using the approved Swallern visual language and canonical mascot.',
    icon: '🎨',
  },
  {
    key: VISUAL_MODES.B_DIAGRAM.mode,
    label: 'Diagram',
    tagline: 'Educational Diagram',
    description: 'Best for processes, systems, comparisons, and structural relationships.',
    icon: '📊',
  },
  {
    key: VISUAL_MODES.C_REAL_WORLD.mode,
    label: 'Photo',
    tagline: 'Real-World Image',
    description: 'Best when photographic accuracy, geography, or real-world context matters.',
    icon: '📷',
  },
  {
    key: VISUAL_MODES.D_MAP.mode,
    label: 'Map',
    tagline: 'Map',
    description: 'Best for geographic, migration, and location-based concepts.',
    icon: '🗺️',
  },
  {
    key: VISUAL_MODES.E_ANIMATION.mode,
    label: 'Animation',
    tagline: 'Animation',
    description: 'Best for movement, transformation, or dynamic interactive concepts.',
    icon: '✨',
  },
];

const PREVIEW_EXPRESSIONS: Array<{ key: CharacterExpression; label: string }> = [
  { key: 'curious', label: 'Curious' },
  { key: 'happy', label: 'Happy' },
  { key: 'thinking', label: 'Thinking' },
  { key: 'excited', label: 'Excited' },
  { key: 'sleepy', label: 'Sleepy' },
];

const PREVIEW_POSES: Array<{ key: CharacterPose; label: string }> = [
  { key: 'standing', label: 'Standing' },
  { key: 'waving', label: 'Waving' },
  { key: 'thinking', label: 'Thinking' },
  { key: 'celebrating', label: 'Celebrating' },
  { key: 'reading', label: 'Reading' },
];

/**
 * Swallern Visual Selector Component
 * User-facing visual configuration section for Create Topic workflow.
 * Exposes canonical Swallern Bear preview without technical ID noise.
 */
export const SwallernVisualSelector: React.FC<SwallernVisualSelectorProps> = ({
  value = {
    mode: 'auto',
    characterId: 'swallern_bear_v1',
    expression: 'curious',
    pose: 'standing',
  },
  onChange,
  className = '',
  style = {},
}) => {
  const currentMode = value.mode || 'auto';
  const currentCharacterId = value.characterId || 'swallern_bear_v1';
  const currentExpression = value.expression || 'curious';
  const currentPose = value.pose || 'standing';

  const canonicalMascot = CANONICAL_CHARACTERS[currentCharacterId] || CANONICAL_CHARACTERS['swallern_bear_v1'];

  const handleSelectMode = (newMode: UserVisualSelectionMode) => {
    onChange({
      ...value,
      mode: newMode,
    });
  };

  const handleSelectExpression = (expr: CharacterExpression) => {
    onChange({
      ...value,
      expression: expr,
    });
  };

  const handleSelectPose = (pose: CharacterPose) => {
    onChange({
      ...value,
      pose,
    });
  };

  return (
    <div
      className={`swallern-visual-selector-section ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '2px solid #E2E8F0',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        ...style,
      }}
    >
      {/* Section Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>🎨</span>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Lesson Visual
          </h3>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4F46E5', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '10px' }}>
            Swallern Visual System v1
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.4 }}>
          Choose how knowledge in this lesson should be visually communicated. Default is <strong>Auto</strong>.
        </p>
      </div>

      {/* Responsive Visual Mode Cards */}
      <div
        role="radiogroup"
        aria-label="Lesson Visual Treatment Options"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
        }}
      >
        {VISUAL_MODE_CARD_OPTIONS.map((opt) => {
          const isSelected = currentMode === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelectMode(opt.key)}
              style={{
                backgroundColor: isSelected ? '#EEF2FF' : '#F8FAFC',
                border: isSelected ? '2px solid #4F46E5' : '1.5px solid #E2E8F0',
                borderRadius: '12px',
                padding: '10px 12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.12)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.2rem' }}>{opt.icon}</span>
                {isSelected && (
                  <span style={{ fontSize: '11px', color: '#4F46E5', fontWeight: 800 }}>✓</span>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? '#312E81' : '#0F172A' }}>
                {opt.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: isSelected ? '#4338CA' : '#64748B', fontWeight: 600 }}>
                {opt.tagline}
              </div>
            </button>
          );
        })}
      </div>

      {/* Swallern Illustration Character Configuration Area */}
      {currentMode === VISUAL_MODES.A_ILLUSTRATION.mode && (
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '14px',
            border: '1.5px dashed #CBD5E1',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'swallernPop 0.3s ease-out',
          }}
        >
          {/* Character Header Info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                Swallern Bear
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
                The canonical Swallern learning mascot.
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '3px 10px', borderRadius: '10px' }}>
              Canonical Character
            </span>
          </div>

          {/* Interactive Character Live Preview Canvas */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            {/* Mascot Visual */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} aria-hidden="true">
              <SwallernCharacter
                characterId={currentCharacterId}
                expression={currentExpression}
                pose={currentPose}
                size={110}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginTop: '6px' }}>
                {canonicalMascot.name} ({currentExpression}, {currentPose})
              </span>
            </div>

            {/* Expression & Pose State Selectors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
              {/* Expression Selector */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Expression
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {PREVIEW_EXPRESSIONS.map((exp) => (
                    <button
                      key={exp.key}
                      type="button"
                      onClick={() => handleSelectExpression(exp.key)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: currentExpression === exp.key ? '#3B82F6' : '#F1F5F9',
                        color: currentExpression === exp.key ? '#FFFFFF' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pose Selector */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Pose
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {PREVIEW_POSES.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handleSelectPose(p.key)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: currentPose === p.key ? '#0D9488' : '#F1F5F9',
                        color: currentPose === p.key ? '#FFFFFF' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
