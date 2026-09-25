'use client';

import React from 'react';
import { ClassroomTheme } from '@/lib/learning/themes';
import { CourseRoadmap, RoadmapStep } from './CourseRoadmap';

interface CourseOutlineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  steps: RoadmapStep[];
  currentStepIndex: number;
  theme: ClassroomTheme;
  onSelectStep: (index: number) => void;
}

const isDark = (theme: ClassroomTheme) => theme.id === 'space_observatory';

export const CourseOutlineDrawer: React.FC<CourseOutlineDrawerProps> = ({
  isOpen,
  onClose,
  steps,
  currentStepIndex,
  theme,
  onSelectStep,
}) => {
  const dark = isDark(theme);
  const textPrimary = dark ? '#F1F5F9' : '#0F172A';
  const textSecondary = dark ? '#94A3B8' : '#64748B';
  const borderColor = dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0';
  const drawerBg = dark ? '#0F172A' : '#FFFFFF';

  const completedCount = steps.filter((s) => s.state === 'completed').length;
  const totalCount = steps.length;
  const percent = Math.round((completedCount / (totalCount || 1)) * 100);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            transition: 'opacity 200ms ease',
          }}
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Course Learning Roadmap"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 70,
          width: '380px',
          maxWidth: '92vw',
          background: drawerBg,
          borderLeft: `1px solid ${borderColor}`,
          boxShadow: '-10px 0 40px rgba(0,0,0,0.18)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px',
            borderBottom: `1px solid ${borderColor}`,
            background: dark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: textPrimary, letterSpacing: '-0.01em' }}>
                Course Roadmap
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  backgroundColor: dark ? `${theme.accent}25` : '#EEF2FF',
                  color: dark ? '#A5B4FC' : '#4F46E5',
                }}
              >
                {percent}% Done
              </span>
            </div>
            <div style={{ fontSize: '0.78125rem', color: textSecondary, marginTop: '3px' }}>
              {completedCount} of {totalCount} checkpoints completed
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close roadmap"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: dark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
              border: `1px solid ${borderColor}`,
              color: textSecondary,
              cursor: 'pointer',
              outline: 'none',
              transition: 'background-color 150ms ease, color 150ms ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Roadmap Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <CourseRoadmap
            steps={steps}
            currentStepIndex={currentStepIndex}
            theme={theme}
            onSelectStep={(idx) => {
              onSelectStep(idx);
              onClose();
            }}
          />
        </div>
      </div>
    </>
  );
};
