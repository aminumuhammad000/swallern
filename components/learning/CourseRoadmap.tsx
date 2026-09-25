'use client';

import React from 'react';
import { ClassroomTheme } from '@/lib/learning/themes';

export interface RoadmapStep {
  id: string;
  title: string;
  type: string;
  section: string;
  state: 'completed' | 'current' | 'upcoming';
  index: number;
}

interface CourseRoadmapProps {
  steps: RoadmapStep[];
  currentStepIndex: number;
  theme: ClassroomTheme;
  onSelectStep: (index: number) => void;
}

const isDark = (theme: ClassroomTheme) => theme.id === 'space_observatory';

export const CourseRoadmap: React.FC<CourseRoadmapProps> = ({
  steps,
  currentStepIndex,
  theme,
  onSelectStep,
}) => {
  const dark = isDark(theme);
  const textPrimary = dark ? '#F1F5F9' : '#0F172A';
  const textSecondary = dark ? '#94A3B8' : '#64748B';
  const borderColor = dark ? 'rgba(255,255,255,0.1)' : '#E2E8F0';

  // Group steps by section
  const sectionsMap = new Map<string, RoadmapStep[]>();
  steps.forEach((step) => {
    const list = sectionsMap.get(step.section) || [];
    list.push(step);
    sectionsMap.set(step.section, list);
  });

  const getStepIcon = (type: string, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    }

    switch (type) {
      case 'intro':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
      case 'explanation':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
            <line x1="9" y1="21" x2="15" y2="21" />
          </svg>
        );
      case 'concepts':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="12" cy="18" r="3" />
            <line x1="8.5" y1="7.5" x2="15.5" y2="7.5" />
            <line x1="7.5" y1="8.5" x2="10.5" y2="15.5" />
            <line x1="16.5" y1="8.5" x2="13.5" y2="15.5" />
          </svg>
        );
      case 'review-intro':
      case 'quiz':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-2.34" />
            <path d="M14 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
          </svg>
        );
      case 'completion':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      default:
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 12px' }}>
      {Array.from(sectionsMap.entries()).map(([sectionName, sectionSteps]) => (
        <div key={sectionName} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Section Label */}
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              color: dark ? '#818CF8' : '#6366F1',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              paddingLeft: '44px',
              marginBottom: '2px',
            }}
          >
            {sectionName}
          </div>

          {/* Section Steps with visual connector trail */}
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {sectionSteps.map((step, idx) => {
              const isCurrent = step.state === 'current';
              const isCompleted = step.state === 'completed';
              const isUpcoming = step.state === 'upcoming';
              const isLastInSection = idx === sectionSteps.length - 1;
              const isClickable = isCompleted || isCurrent;

              return (
                <div
                  key={step.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    position: 'relative',
                    minHeight: '48px',
                  }}
                >
                  {/* Connecting Line */}
                  {!isLastInSection && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '17px',
                        top: '28px',
                        bottom: '-6px',
                        width: '2px',
                        backgroundColor: isCompleted
                          ? '#059669'
                          : isCurrent
                          ? theme.accent
                          : dark
                          ? 'rgba(255,255,255,0.12)'
                          : '#E2E8F0',
                        zIndex: 1,
                        transition: 'background-color 250ms ease',
                      }}
                    />
                  )}

                  {/* Node Circle */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      backgroundColor: isCompleted
                        ? '#DCFCE7'
                        : isCurrent
                        ? theme.accent
                        : dark
                        ? 'rgba(255,255,255,0.06)'
                        : '#F1F5F9',
                      border: isCompleted
                        ? '2px solid #059669'
                        : isCurrent
                        ? `2px solid ${theme.accent}`
                        : `1.5px solid ${borderColor}`,
                      color: isCompleted
                        ? '#059669'
                        : isCurrent
                        ? '#FFFFFF'
                        : textSecondary,
                      zIndex: 2,
                      boxShadow: isCurrent ? `0 0 0 4px ${theme.accent}30` : 'none',
                      transition: 'all 200ms ease',
                    }}
                  >
                    {getStepIcon(step.type, isCompleted, isCurrent)}
                  </div>

                  {/* Step Body */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isClickable) onSelectStep(step.index);
                    }}
                    disabled={!isClickable}
                    style={{
                      flex: 1,
                      marginLeft: '12px',
                      textAlign: 'left',
                      background: isCurrent
                        ? dark
                          ? `${theme.accent}18`
                          : `${theme.accent}12`
                        : 'transparent',
                      border: isCurrent
                        ? `1px solid ${theme.accent}40`
                        : '1px solid transparent',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      cursor: isClickable ? 'pointer' : 'default',
                      outline: 'none',
                      transition: 'all 150ms ease',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: isCurrent ? 800 : isCompleted ? 600 : 500,
                          color: isCurrent
                            ? (dark ? '#FFFFFF' : '#0F172A')
                            : isCompleted
                            ? textPrimary
                            : textSecondary,
                          lineHeight: 1.3,
                        }}
                      >
                        {step.title}
                      </span>

                      {isCurrent && (
                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '6px',
                            backgroundColor: theme.accent,
                            color: '#FFFFFF',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            flexShrink: 0,
                          }}
                        >
                          Current
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '0.71875rem',
                        color: isCompleted
                          ? '#059669'
                          : isCurrent
                          ? (dark ? '#C7D2FE' : '#4F46E5')
                          : textSecondary,
                        fontWeight: 600,
                        marginTop: '2px',
                      }}
                    >
                      {isCompleted ? 'Completed ✓' : isCurrent ? 'In Progress' : 'Upcoming'}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
