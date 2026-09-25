'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { JourneyMilestone } from '@/components/journey/JourneyRoadmap';

interface JourneyNodeSheetProps {
  milestone: JourneyMilestone | null;
  state: 'completed' | 'current' | 'upcoming';
  topicSlug: string;
  isDestination?: boolean;
  currentStep?: number;
  onSetCurrentStage?: (index: number) => void;
  onClose: () => void;
}

export const JourneyNodeSheet: React.FC<JourneyNodeSheetProps> = ({
  milestone,
  state,
  topicSlug,
  isDestination = false,
  currentStep = 0,
  onSetCurrentStage,
  onClose,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!milestone) return null;

  const isDone = state === 'completed';
  const isCurrent = state === 'current';
  const isLocked = !isDone && !isCurrent;

  // For locked milestones, redirect user strictly to their current unlocked step
  const href = isLocked
    ? `/topics/${topicSlug}/learn?step=${currentStep}`
    : `/topics/${topicSlug}/learn?step=${milestone.index}`;

  const buttonText = isDone
    ? 'Review This Step'
    : isCurrent
    ? 'Continue Learning'
    : `Go to Current Step (${currentStep + 1})`;

  const statusLabel = isDestination
    ? isDone
      ? 'Course Destination (Achieved)'
      : 'Course Destination (Locked)'
    : isDone
    ? 'Step Completed'
    : isCurrent
    ? 'Current Stop'
    : 'Locked Milestone';

  const badgeColor = isDestination
    ? isDone
      ? { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' }
      : { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' }
    : isDone
    ? { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' }
    : isCurrent
    ? { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' }
    : { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' };

  return (
    <>
      {/* Backdrop for click outside */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(3px)',
          zIndex: 80,
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Floating Bottom Sheet on Mobile / Centered Card on Desktop */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="journey-sheet-title"
        className="journey-sheet-enter"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '480px',
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.08)',
          padding: '24px',
          zIndex: 90,
        }}
      >
        {/* Grab bar */}
        <div
          aria-hidden="true"
          style={{
            width: '40px',
            height: '4px',
            background: '#CBD5E1',
            borderRadius: '2px',
            margin: '0 auto 16px auto',
          }}
        />

        {/* Header row: Status badge + Close button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: badgeColor.text,
                background: badgeColor.bg,
                border: `1px solid ${badgeColor.border}`,
                padding: '3px 10px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {statusLabel}
            </span>

            {milestone.estimatedMinutes && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#64748B',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                ~{milestone.estimatedMinutes} min
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close milestone details"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Milestone Title */}
        <h3
          id="journey-sheet-title"
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 8px 0',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
          }}
        >
          {milestone.title}
        </h3>

        {/* Milestone Description / Takeaway */}
        {milestone.description && (
          <p
            style={{
              fontSize: '0.875rem',
              color: '#475569',
              lineHeight: 1.5,
              margin: '0 0 20px 0',
            }}
          >
            {milestone.description}
          </p>
        )}

        {/* Locked Notice Banner */}
        {isLocked && (
          <div
            style={{
              background: '#F8FAFC',
              border: '1.5px dashed #CBD5E1',
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
              color: '#64748B',
              fontSize: '0.82rem',
              lineHeight: 1.45,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>
              This step is locked. Complete previous lessons up to <strong>Step {currentStep + 1}</strong> first to unlock your journey forward!
            </span>
          </div>
        )}

        {/* Action Button — compact */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href={href} style={{ textDecoration: 'none' }}>
            <button
              type="button"
              className="swallern-press"
              style={{
                height: '36px',
                padding: '0 18px',
                background: isDone
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : isLocked
                  ? 'linear-gradient(135deg, #64748B 0%, #475569 100%)'
                  : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                boxShadow: isDone
                  ? '0 4px 12px -2px rgba(16, 185, 129, 0.35)'
                  : isLocked
                  ? '0 4px 12px -2px rgba(71, 85, 105, 0.25)'
                  : '0 4px 12px -2px rgba(59, 130, 246, 0.35)',
              }}
            >
              <span>{buttonText}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </Link>

          {isDone && milestone.index < currentStep && onSetCurrentStage && (
            <button
              type="button"
              onClick={() => {
                onSetCurrentStage(milestone.index);
                onClose();
              }}
              className="swallern-press"
              style={{
                height: '36px',
                padding: '0 14px',
                background: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>↺ Go back to this stage</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
