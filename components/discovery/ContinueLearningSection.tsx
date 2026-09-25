'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getInProgressTopics, TopicProgressState, getProgressPercentage } from '@/lib/learning/progress';

export const ContinueLearningSection: React.FC = () => {
  const [inProgressList, setInProgressList] = useState<TopicProgressState[]>([]);

  useEffect(() => {
    const list = getInProgressTopics().filter((t) => !t.isCompleted);
    setInProgressList(list);
  }, []);

  if (inProgressList.length === 0) {
    return null;
  }

  return (
    <div aria-label="Continue Learning">
      {/* Label row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '10px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#4F46E5',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: '#4F46E5',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Continue where you left off
        </span>
      </div>

      {/* Compact horizontal card strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {inProgressList.slice(0, 3).map((item) => {
          const percent = getProgressPercentage(item);

          return (
            <Link
              key={item.slug}
              href={`/topics/${item.slug}/learn`}
              style={{ textDecoration: 'none', flex: '1 1 auto', minWidth: '200px', maxWidth: '300px' }}
            >
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #C7D2FE',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 1px 4px rgba(79, 70, 229, 0.06)',
                  transition: 'border-color 150ms ease, box-shadow 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#818CF8';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(79, 70, 229, 0.12)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#C7D2FE';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(79, 70, 229, 0.06)';
                }}
              >
                {/* Progress ring / indicator */}
                <div
                  style={{
                    position: 'relative',
                    width: '32px',
                    height: '32px',
                    flexShrink: 0,
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="16" cy="16" r="12" fill="none" stroke="#EEF2FF" strokeWidth="3" />
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke="#6366F1"
                      strokeWidth="3"
                      strokeDasharray={`${(percent / 100) * 75.4} 75.4`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.5625rem',
                      fontWeight: 800,
                      color: '#4F46E5',
                      lineHeight: 1,
                    }}
                  >
                    {percent}%
                  </span>
                </div>

                {/* Title & continue arrow */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#0F172A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.3,
                      marginBottom: '2px',
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 500 }}>
                    Step {Math.min(item.currentStep + 1, item.totalSteps)} of {item.totalSteps}
                  </div>
                </div>

                {/* Arrow */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
