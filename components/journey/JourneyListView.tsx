'use client';

import React from 'react';
import Link from 'next/link';
import type { JourneyMilestone } from '@/components/journey/JourneyRoadmap';
import type { TopicProgressState } from '@/lib/learning/progress';
import type { ClassroomThemeId } from '@/lib/learning/themes';

interface JourneyListViewProps {
  milestones: JourneyMilestone[];
  progress: TopicProgressState | null;
  activeMilestoneIndex?: number;
  destination: string;
  themeId: ClassroomThemeId;
  topicSlug: string;
  onSelectMilestone?: (index: number) => void;
}

export const JourneyListView: React.FC<JourneyListViewProps> = ({
  milestones,
  progress,
  activeMilestoneIndex,
  destination,
  themeId,
  topicSlug,
  onSelectMilestone,
}) => {
  const currentStep = activeMilestoneIndex !== undefined ? activeMilestoneIndex : (progress?.currentStep ?? 0);
  const isAllComplete = progress?.isCompleted ?? false;
  const completedIndexes = new Set(progress?.completedStepIndexes ?? []);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '760px',
        margin: '0 auto',
        padding: '0 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h2
          style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Curriculum Outline &amp; Milestones
        </h2>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#64748B',
            background: '#F1F5F9',
            padding: '4px 12px',
            borderRadius: '999px',
          }}
        >
          {milestones.length} Steps
        </span>
      </div>

      {/* Styled Ordered List of Milestones */}
      <ol
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {milestones.map((milestone, idx) => {
          const isDone = isAllComplete || completedIndexes.has(milestone.index);
          const isCurrent = !isAllComplete && currentStep === milestone.index;
          const href = `/topics/${topicSlug}/learn?step=${milestone.index}`;

          return (
            <li
              key={milestone.index}
              style={{
                position: 'relative',
                background: isCurrent
                  ? 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)'
                  : '#FFFFFF',
                borderRadius: '20px',
                border: isCurrent
                  ? '2px solid #3B82F6'
                  : isDone
                  ? '1.5px solid #A7F3D0'
                  : '1px solid #E2E8F0',
                boxShadow: isCurrent
                  ? '0 10px 25px -4px rgba(59, 130, 246, 0.15)'
                  : '0 4px 12px rgba(15, 23, 42, 0.04)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Step Status Pill / Number Circle */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: isDone
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : isCurrent
                    ? 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)'
                    : '#F1F5F9',
                  color: isDone || isCurrent ? '#FFFFFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  flexShrink: 0,
                  boxShadow: isDone
                    ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                    : isCurrent
                    ? '0 4px 14px rgba(59, 130, 246, 0.4)'
                    : 'none',
                }}
              >
                {isDone ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isCurrent ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
              </div>

              {/* Step Info Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: isDone ? '#059669' : isCurrent ? '#2563EB' : '#94A3B8',
                    }}
                  >
                    Step {idx + 1} {isDone ? '• Completed' : isCurrent ? '• In Progress' : '• Locked'}
                  </span>

                  {milestone.estimatedMinutes && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: '#64748B',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      ~{milestone.estimatedMinutes} min
                    </span>
                  )}
                </div>

                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: isDone || isCurrent ? '#0F172A' : '#64748B',
                    margin: '0 0 6px 0',
                    lineHeight: 1.3,
                  }}
                >
                  {milestone.title}
                </h3>

                {milestone.description && (
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: '#475569',
                      lineHeight: 1.45,
                      margin: '0 0 12px 0',
                    }}
                  >
                    {milestone.description}
                  </p>
                )}

                {/* Direct Action: Unlocked link vs Locked indicator */}
                {!isDone && !isCurrent ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '10px',
                      background: '#F1F5F9',
                      color: '#94A3B8',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'not-allowed',
                      userSelect: 'none',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Locked</span>
                  </div>
                ) : (
                  <Link href={href} style={{ textDecoration: 'none' }}>
                    <button
                      type="button"
                      onClick={() => onSelectMilestone?.(milestone.index)}
                      className="swallern-press"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: isDone
                          ? '#ECFDF5'
                          : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                        color: isDone ? '#059669' : '#FFFFFF',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: isCurrent ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                      }}
                    >
                      <span>{isDone ? 'Review Lesson' : 'Continue Here'}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </Link>
                )}
              </div>
            </li>
          );
        })}

        {/* Final Destination Landmark Item */}
        <li
          style={{
            position: 'relative',
            background: isAllComplete
              ? 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)'
              : 'linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)',
            borderRadius: '20px',
            border: isAllComplete ? '2px solid #10B981' : '1.5px solid #FCD34D',
            boxShadow: '0 8px 20px -4px rgba(245, 158, 11, 0.15)',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '16px',
              background: isAllComplete
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0,
              boxShadow: '0 6px 16px rgba(245, 158, 11, 0.3)',
            }}
          >
            ★
          </div>

          <div style={{ flex: 1 }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: isAllComplete ? '#059669' : '#D97706',
                display: 'block',
                marginBottom: '2px',
              }}
            >
              {isAllComplete ? '✓ Journey Goal Mastered' : 'Course Destination Landmark'}
            </span>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {destination}
            </h3>
          </div>
        </li>
      </ol>
    </div>
  );
};
