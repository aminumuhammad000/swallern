'use client';

import React from 'react';
import Link from 'next/link';
import { TopicThumbnail } from './TopicThumbnail';
import { TopicProgressState, getProgressPercentage } from '@/lib/learning/progress';

interface MyLearningJourneyProps {
  activeTopic: TopicProgressState | null;
  onExploreClick?: () => void;
}

export const MyLearningJourney: React.FC<MyLearningJourneyProps> = ({
  activeTopic,
  onExploreClick,
}) => {
  const percent = activeTopic ? getProgressPercentage(activeTopic) : 0;
  const currentStepNum = activeTopic ? (activeTopic.currentStep ?? 0) + 1 : 1;
  const totalSteps = activeTopic ? Math.max(activeTopic.totalSteps || 5, 5) : 5;
  const isFinished = activeTopic?.isCompleted ?? false;

  return (
    <section style={{ marginBottom: '2rem' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Continue Learning
          </h2>
          {activeTopic && (
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: isFinished ? '#059669' : '#2563EB',
                backgroundColor: isFinished ? '#ECFDF5' : '#EFF6FF',
                border: `1px solid ${isFinished ? '#A7F3D0' : '#BFDBFE'}`,
                padding: '2px 7px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {isFinished ? 'Completed' : `Lesson ${currentStepNum} of ${totalSteps}`}
            </span>
          )}
        </div>

        {activeTopic && (
          <Link
            href={`/topics/${activeTopic.slug}`}
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#2563EB',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Topic Overview</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </Link>
        )}
      </div>

      {activeTopic ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)',
            transition: 'border-color 0.15s ease',
          }}
        >
          {/* Left: Thumbnail & Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, flex: 1 }}>
            <div style={{ flexShrink: 0 }}>
              <TopicThumbnail
                category={activeTopic.category || activeTopic.slug}
                size="md"
              />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#2563EB',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '2px',
                }}
              >
                {activeTopic.category || 'Topic'}
              </div>

              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: '0 0 4px 0',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={activeTopic.title}
              >
                {activeTopic.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '320px', marginBottom: '4px' }}>
                <div
                  style={{
                    flex: 1,
                    height: '6px',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percent}%`,
                      backgroundColor: isFinished ? '#10B981' : '#3B82F6',
                      borderRadius: '9999px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  {percent}%
                </span>
              </div>

              <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500 }}>
                {isFinished
                  ? 'Ready to review concepts or retake quiz'
                  : `Resume at Step ${currentStepNum}: interactive section`}
              </div>
            </div>
          </div>

          {/* Right: Continue Action Button */}
          <div style={{ flexShrink: 0 }}>
            <Link
              href={`/topics/${activeTopic.slug}/learn?step=${activeTopic.currentStep || 0}`}
              style={{ textDecoration: 'none' }}
            >
              <button
                className="swallern-btn"
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{isFinished ? 'Review Course' : 'Continue'}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
            </Link>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px dashed #E2E8F0',
            padding: '1.75rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#EFF6FF',
              color: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
            Start something curious
          </h3>

          <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 14px 0', maxWidth: '400px', lineHeight: 1.45 }}>
            You have no active courses in progress. Explore our hand-crafted visual topics to begin your first 5-minute interactive lesson.
          </p>

          <Link href="/explore" style={{ textDecoration: 'none' }}>
            <button
              className="swallern-btn"
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.55rem 1.15rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Discover Courses</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </Link>
        </div>
      )}
    </section>
  );
};
