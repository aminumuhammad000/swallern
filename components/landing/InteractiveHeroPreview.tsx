'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SwallernVisual } from '@/components/visuals/SwallernVisual';
import { EmotionalFeedback } from '@/components/ui/EmotionalFeedback';
import { buildVisualRequirement } from '@/lib/visuals/requirements';

export const InteractiveHeroPreview: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const options = [
    { text: 'It runs out of nuclear fuel to counteract core gravity', correct: true },
    { text: 'It collides with atmospheric oxygen gas layers', correct: false },
    { text: 'Solar radiation pushes the surface away', correct: false },
  ];

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #C7D2FE',
        borderRadius: '16px',
        boxShadow: '0 12px 32px -8px rgba(79, 70, 229, 0.12)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Window Bar */}
      <div
        style={{
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginLeft: '6px' }}>
            Swallern Bite-Sized Reader
          </span>
        </div>

        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: '10px' }}>
          Step 2 of 4
        </div>
      </div>

      {/* Main Body Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#4F46E5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Astrophysics • Lesson 2
          </span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 6px 0', lineHeight: 1.3 }}>
            Why do black holes form?
          </h3>
          <p style={{ fontSize: '0.84375rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
            When a massive star exhausts its nuclear fuel, inward gravity overpowers outward pressure, collapsing the core.
          </p>
        </div>

        {/* Visual Element */}
        <div style={{ minHeight: '140px' }}>
          <SwallernVisual
            requirement={buildVisualRequirement('Hawking Radiation & Black Hole Physics', 'Gravitational attraction so dense light cannot escape')}
          />
        </div>

        {/* Interactive Knowledge Check Simulation */}
        <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
            Quick Check: What causes a star to collapse into a black hole?
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 500,
                    border: isSelected ? (opt.correct ? '1.5px solid #10B981' : '1.5px solid #EF4444') : '1px solid #CBD5E1',
                    background: isSelected ? (opt.correct ? '#ECFDF5' : '#FEF2F2') : '#FFFFFF',
                    color: isSelected ? (opt.correct ? '#065F46' : '#991B1B') : '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{opt.text}</span>
                  {isSelected && opt.correct && (
                    <span style={{ fontWeight: 800, color: '#10B981', marginLeft: '6px' }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedOption === 0 && (
            <div style={{ marginTop: '10px' }}>
              <EmotionalFeedback
                state="correct"
                title="You've got it."
                message="Nice! Nuclear fuel exhaustion causes gravitational collapse."
                mascotSize={44}
              />
            </div>
          )}

          {selectedOption !== null && selectedOption !== 0 && (
            <div style={{ marginTop: '10px' }}>
              <EmotionalFeedback
                state="incorrect"
                title="Not quite. Let’s look at it again."
                message="Think about what counteracts gravity during a star's lifecycle."
                mascotSize={44}
              />
            </div>
          )}
        </div>

        {/* Progress Bar Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
          <div style={{ flex: 1, marginRight: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#4F46E5', fontWeight: 700, marginBottom: '2px' }}>
              <span>Lesson Progress</span>
              <span>50%</span>
            </div>
            <div style={{ height: '4px', background: '#EEF2FF', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '50%', background: '#4F46E5' }} />
            </div>
          </div>

          <Link href="/topics/hawking-radiation-black-holes" style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#FFFFFF',
                background: '#4F46E5',
                padding: '6px 12px',
                borderRadius: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Try Lesson</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
