'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { TopicProgressState } from '@/lib/learning/progress';

/**
 * JourneyRoadmap
 * Transforms the flat lesson list into a visual milestone roadmap.
 *
 * States per milestone:
 *   completed  — user has finished this step
 *   current    — user is on this step (pulsed indicator)
 *   upcoming   — not yet reached
 *   destination — final milestone (star icon)
 */

export interface JourneyMilestone {
  index: number;       // 0-based step index in the learn flow
  title: string;
  description?: string;
  estimatedMinutes?: number;
  isQuiz?: boolean;
}

interface JourneyRoadmapProps {
  milestones: JourneyMilestone[];
  progress: TopicProgressState | null;
  topicSlug: string;
  /** Destination statement e.g. "By the end, you'll understand how AI learns." */
  destination: string;
  /** Whether to animate the progressive reveal on mount */
  animateReveal?: boolean;
}

type MilestoneState = 'completed' | 'current' | 'upcoming';

function getMilestoneState(
  milestone: JourneyMilestone,
  progress: TopicProgressState | null
): MilestoneState {
  if (!progress) return 'upcoming';
  if (progress.isCompleted) return 'completed';
  const completed = progress.completedStepIndexes || [];
  if (completed.includes(milestone.index)) return 'completed';
  if (progress.currentStep === milestone.index) return 'current';
  return 'upcoming';
}

// ─── Sub-component: single roadmap node ────────────────────────────────────

interface MilestoneNodeProps {
  milestone: JourneyMilestone;
  state: MilestoneState;
  isDestination: boolean;
  topicSlug: string;
  visible: boolean;
}

const MilestoneNode: React.FC<MilestoneNodeProps> = ({
  milestone,
  state,
  isDestination,
  topicSlug,
  visible,
}) => {
  const [expanded, setExpanded] = useState(false);

  const isCurrent = state === 'current';
  const isDone = state === 'completed';

  const nodeColor =
    isDestination
      ? '#F59E0B'
      : isDone
      ? '#10B981'
      : isCurrent
      ? '#3B82F6'
      : '#94A3B8';

  const nodeBg =
    isDestination
      ? '#FFFBEB'
      : isDone
      ? '#ECFDF5'
      : isCurrent
      ? '#EFF6FF'
      : '#F8FAFC';

  const dotIcon = isDestination
    ? '★'
    : isDone
    ? '✓'
    : isCurrent
    ? '●'
    : '○';

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-expanded={expanded}
        aria-label={`${milestone.title}${isDone ? ' — completed' : isCurrent ? ' — current' : ''}`}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 16px',
            borderRadius: '12px',
            border: `1.5px solid ${isCurrent ? '#BFDBFE' : isDestination ? '#FDE68A' : isDone ? '#A7F3D0' : '#E2E8F0'}`,
            background: nodeBg,
            transition: 'all 0.2s ease',
            boxShadow: isCurrent ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (!isCurrent) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px -4px rgba(15,23,42,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            if (!isCurrent) e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Node icon */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: nodeColor,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isDestination ? '14px' : '13px',
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: isCurrent
                ? `0 0 0 4px rgba(59,130,246,0.25), 0 0 0 8px rgba(59,130,246,0.08)`
                : 'none',
              animation: isCurrent ? 'swallernPulse 2s ease-in-out infinite' : 'none',
            }}
            aria-hidden="true"
          >
            {dotIcon}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: isCurrent ? 800 : isDone ? 700 : 600,
                color: isDestination ? '#92400E' : isDone ? '#065F46' : isCurrent ? '#1D4ED8' : '#374151',
                lineHeight: 1.3,
              }}
            >
              {isDestination ? 'Destination' : `${String(milestone.index + 1).padStart(2, '0')} — ${milestone.title}`}
            </div>
            {isDestination && (
              <div style={{ fontSize: '0.78rem', color: '#78350F', marginTop: '2px', fontStyle: 'italic' }}>
                {milestone.title}
              </div>
            )}
            {!isDestination && milestone.description && !expanded && (
              <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {milestone.description}
              </div>
            )}
          </div>

          {/* Right metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
            {isCurrent && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3B82F6', background: '#EFF6FF', borderRadius: '4px', padding: '1px 6px' }}>
                YOU ARE HERE
              </span>
            )}
            {milestone.isQuiz && (
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#7C3AED', background: '#F5F3FF', borderRadius: '4px', padding: '1px 6px' }}>
                Quiz
              </span>
            )}
            {milestone.estimatedMinutes && !isCurrent && !isDestination && (
              <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                ~{milestone.estimatedMinutes} min
              </span>
            )}
            {!isDestination && (
              <span style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '2px' }}>
                {expanded ? '▲' : '▾'}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Expandable milestone preview */}
      {expanded && !isDestination && (
        <div
          className="swallern-anim-reveal"
          style={{
            marginTop: '4px',
            marginLeft: '46px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '12px 14px',
          }}
        >
          {milestone.description && (
            <p style={{ fontSize: '0.82rem', color: '#374151', margin: '0 0 10px 0', lineHeight: 1.5 }}>
              {milestone.description}
            </p>
          )}
          <Link
            href={`/topics/${topicSlug}/learn?step=${milestone.index}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#3B82F6',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #BFDBFE',
              background: '#EFF6FF',
              transition: 'all 0.15s ease',
            }}
          >
            {isDone ? 'Revisit' : isCurrent ? 'Continue here' : 'Jump to lesson'} →
          </Link>
        </div>
      )}
    </div>
  );
};

// ─── Main roadmap ───────────────────────────────────────────────────────────

export const JourneyRoadmap: React.FC<JourneyRoadmapProps> = ({
  milestones,
  progress,
  topicSlug,
  destination,
  animateReveal = true,
}) => {
  const [visibleCount, setVisibleCount] = useState(animateReveal ? 0 : milestones.length + 1);

  const revealNext = useCallback(() => {
    setVisibleCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!animateReveal) return;
    // Stagger reveal: first node at 300ms, then every 120ms
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i <= milestones.length; i++) {
      timers.push(setTimeout(revealNext, 300 + i * 120));
    }
    return () => timers.forEach(clearTimeout);
  }, [animateReveal, milestones.length, revealNext]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* START marker */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '6px',
          opacity: visibleCount > 0 ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div style={{ width: '32px', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#E2E8F0',
              border: '2px solid #CBD5E1',
            }}
          />
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Start
        </span>
      </div>

      {milestones.map((milestone, i) => {
        const state = getMilestoneState(milestone, progress);
        const isLast = i === milestones.length - 1;

        return (
          <React.Fragment key={milestone.index}>
            {/* Connecting line before each node */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                marginBottom: '2px',
              }}
            >
              {/* Vertical line column */}
              <div style={{ width: '32px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                <div
                  style={{
                    width: '2px',
                    height: '12px',
                    background:
                      state === 'completed'
                        ? '#10B981'
                        : state === 'current'
                        ? '#3B82F6'
                        : '#E2E8F0',
                    borderRadius: '1px',
                    transition: 'background 0.3s ease',
                  }}
                />
              </div>
            </div>

            <MilestoneNode
              milestone={milestone}
              state={state}
              isDestination={false}
              topicSlug={topicSlug}
              visible={visibleCount > i}
            />

            {/* After last lesson, draw line to destination */}
            {isLast && (
              <div style={{ display: 'flex', gap: '14px', marginTop: '2px', marginBottom: '2px' }}>
                <div style={{ width: '32px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                  <div
                    style={{
                      width: '2px',
                      height: '12px',
                      background: progress?.isCompleted ? '#F59E0B' : '#E2E8F0',
                      borderRadius: '1px',
                    }}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Destination node */}
      <MilestoneNode
        milestone={{
          index: milestones.length,
          title: destination,
          description: undefined,
          estimatedMinutes: undefined,
        }}
        state={progress?.isCompleted ? 'completed' : 'upcoming'}
        isDestination
        topicSlug={topicSlug}
        visible={visibleCount > milestones.length}
      />
    </div>
  );
};
