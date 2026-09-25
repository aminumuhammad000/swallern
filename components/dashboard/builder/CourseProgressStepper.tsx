'use client';

import React from 'react';
import { BUILDER_STEPS, BuilderStep } from './types';

interface CourseProgressStepperProps {
  currentStep: BuilderStep;
  completedSteps: Set<BuilderStep>;
  onSelectStep: (step: BuilderStep) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Professional Compact Progress Stepper Component
 * Restrained height, clear visual state highlighting completed vs current vs upcoming steps.
 */
export const CourseProgressStepper: React.FC<CourseProgressStepperProps> = ({
  currentStep,
  completedSteps,
  onSelectStep,
  className = '',
  style = {},
}) => {
  const currentIndex = BUILDER_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav
      aria-label="Course Builder Progress"
      className={`swallern-builder-stepper ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1.25rem',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        overflowX: 'auto',
        ...style,
      }}
    >
      {BUILDER_STEPS.map((step, idx) => {
        const isCurrent = step.id === currentStep;
        const isCompleted = completedSteps.has(step.id) || idx < currentIndex;
        const isClickable = isCompleted || idx === currentIndex;

        return (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => isClickable && onSelectStep(step.id)}
              disabled={!isClickable}
              aria-current={isCurrent ? 'step' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '8px',
                cursor: isClickable ? 'pointer' : 'default',
                opacity: isClickable ? 1 : 0.45,
                transition: 'all 0.15s ease',
              }}
            >
              {/* Step Badge */}
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: isCurrent ? '#2563EB' : isCompleted ? '#10B981' : '#E2E8F0',
                  color: isCurrent || isCompleted ? '#FFFFFF' : '#64748B',
                  flexShrink: 0,
                }}
              >
                {isCompleted && !isCurrent ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>

              {/* Step Title */}
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                  color: isCurrent ? '#2563EB' : isCompleted ? '#0F172A' : '#64748B',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </button>

            {/* Subtle Connecting Line */}
            {idx < BUILDER_STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: idx < currentIndex ? '#10B981' : '#E2E8F0',
                  margin: '0 6px',
                  minWidth: '16px',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
