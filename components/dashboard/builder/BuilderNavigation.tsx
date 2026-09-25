'use client';

import React, { useState } from 'react';
import { BUILDER_STEPS, BuilderStep } from './types';
import { DetailedStepError } from './stepValidation';

interface BuilderNavigationProps {
  currentStep: BuilderStep;
  savedStatusText?: string;
  isSubmitting?: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSaveDraft: () => void;
  canContinue?: boolean;
  stepErrors?: string[];
  detailedErrors?: DetailedStepError[];
  onJumpToError?: (error: DetailedStepError) => void;
  continueLabel?: string;
}

/**
 * Sticky Persistent Bottom Navigation Bar
 * Gives creator fixed controls without scrolling through an enormous page.
 * Includes interactive requirement checklist flyout so users always know exactly what's pending.
 */
export const BuilderNavigation: React.FC<BuilderNavigationProps> = ({
  currentStep,
  savedStatusText = 'Saved just now',
  isSubmitting = false,
  onBack,
  onContinue,
  onSaveDraft,
  canContinue = true,
  stepErrors = [],
  detailedErrors = [],
  onJumpToError,
  continueLabel,
}) => {
  const [showIssuesFlyout, setShowIssuesFlyout] = useState(false);
  const currentIndex = BUILDER_STEPS.findIndex((s) => s.id === currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === BUILDER_STEPS.length - 1;

  const nextLabel = continueLabel || (isLastStep ? 'Submit Course' : 'Continue');

  const errorCount = detailedErrors.length > 0 ? detailedErrors.length : stepErrors.length;

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 20,
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Issues Flyout Popover */}
      {showIssuesFlyout && !canContinue && errorCount > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '540px',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1.5px solid #FCA5A5',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: '1rem 1.25rem',
            zIndex: 30,
            maxHeight: '380px',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #FEE2E2', paddingBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#991B1B' }}>
                Requirements to Proceed ({errorCount})
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowIssuesFlyout(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Close checklist"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: '#64748B' }}>
            Review each requirement below. Click on any item to view or edit the lesson:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {detailedErrors.length > 0
              ? detailedErrors.map((err, idx) => (
                  <div
                    key={err.id || idx}
                    onClick={() => {
                      if (onJumpToError) {
                        onJumpToError(err);
                        setShowIssuesFlyout(false);
                      }
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '8px',
                      cursor: onJumpToError ? 'pointer' : 'default',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#B91C1C' }}>
                          {err.label}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#DC2626' }}>
                          {err.message}
                        </span>
                      </div>
                      {err.hint && (
                        <span style={{ fontSize: '0.72rem', color: '#7F1D1D', fontWeight: 500 }}>
                          Help: {err.hint}
                        </span>
                      )}
                    </div>

                    {onJumpToError && (
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#2563EB',
                          backgroundColor: '#EFF6FF',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        Fix now &rarr;
                      </span>
                    )}
                  </div>
                ))
              : stepErrors.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      fontSize: '0.78rem',
                      color: '#991B1B',
                      fontWeight: 600,
                    }}
                  >
                    {msg}
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* Left Action: Back */}
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep || isSubmitting}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '10px',
          border: '1px solid #CBD5E1',
          backgroundColor: '#FFFFFF',
          color: isFirstStep ? '#94A3B8' : '#334155',
          fontWeight: 700,
          fontSize: '0.85rem',
          cursor: isFirstStep || isSubmitting ? 'not-allowed' : 'pointer',
          opacity: isFirstStep ? 0.4 : 1,
          transition: 'all 0.15s ease',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>Back</span>
      </button>

      {/* Middle Status Indicator & Clickable Step Requirements Notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          <span style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>
            {savedStatusText}
          </span>
        </div>

        {!canContinue && errorCount > 0 && (
          <button
            type="button"
            onClick={() => setShowIssuesFlyout(!showIssuesFlyout)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: showIssuesFlyout ? '0 0 0 2px #FCA5A5' : 'none',
              transition: 'all 0.15s ease',
            }}
            title="Click to see what needs fixing"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Requirements pending ({errorCount})</span>
            <span style={{ fontSize: '0.68rem', backgroundColor: '#FEE2E2', padding: '1px 5px', borderRadius: '4px', textDecoration: 'underline' }}>
              View issues
            </span>
          </button>
        )}
      </div>

      {/* Right Actions: Save Draft & Continue */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid #CBD5E1',
            backgroundColor: '#F8FAFC',
            color: '#334155',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: isSubmitting ? 'default' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Save Draft
        </button>

        <button
          type="button"
          onClick={() => {
            if (!canContinue) {
              setShowIssuesFlyout(true);
            } else {
              onContinue();
            }
          }}
          disabled={isSubmitting}
          title={!canContinue ? 'Click to view pending requirements' : undefined}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 20px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: canContinue ? '#2563EB' : '#94A3B8',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: canContinue && !isSubmitting ? 'pointer' : 'pointer',
            opacity: canContinue ? 1 : 0.75,
            boxShadow: canContinue ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <span>{isSubmitting ? 'Processing...' : nextLabel}</span>
          {!isSubmitting && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

