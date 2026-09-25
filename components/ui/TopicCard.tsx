'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from './Badge';
import { getTopicProgress, getProgressPercentage, TopicProgressState } from '@/lib/learning/progress';

export interface TopicCardProps {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  category?: string;
  difficulty?: string;
  estimatedMinutes?: number;
  featured?: boolean;
  score?: number;
  imageUrl?: string;
  className?: string;
}

const getCategoryTheme = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('physic') || cat.includes('astronomy') || cat.includes('space') || cat.includes('astrophysics')) {
    return { bg: '#EFF6FF', text: '#2563EB', border: '#DBEAFE', dot: '#3B82F6' };
  }
  if (cat.includes('nature') || cat.includes('biology') || cat.includes('ecology') || cat.includes('environment')) {
    return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', dot: '#10B981' };
  }
  if (cat.includes('tech') || cat.includes('computer') || cat.includes('code') || cat.includes('ai') || cat.includes('digital')) {
    return { bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4', dot: '#14B8A6' };
  }
  if (cat.includes('history') || cat.includes('civilization') || cat.includes('ancient') || cat.includes('culture')) {
    return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', dot: '#F59E0B' };
  }
  if (cat.includes('neuro') || cat.includes('psych') || cat.includes('mind') || cat.includes('brain') || cat.includes('philosophy')) {
    return { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE', dot: '#8B5CF6' };
  }
  if (cat.includes('math') || cat.includes('logic')) {
    return { bg: '#FFF1F2', text: '#E11D48', border: '#FECDD3', dot: '#F43F5E' };
  }
  return { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE', dot: '#6366F1' };
};

export const TopicCard: React.FC<TopicCardProps> = ({
  slug,
  title,
  summary,
  category = 'General Science',
  difficulty = 'Beginner',
  estimatedMinutes = 5,
  featured = false,
  score,
  className = '',
}) => {
  const [progress, setProgress] = useState<TopicProgressState | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const p = getTopicProgress(slug);
    if (p) setProgress(p);
  }, [slug]);

  const percent = getProgressPercentage(progress);
  const isStarted = percent > 0;
  const theme = getCategoryTheme(category);

  return (
    <Link
      href={`/topics/${slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={className}
        style={{
          padding: '20px 20px 18px 20px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          borderRadius: '16px',
          background: featured
            ? 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)'
            : '#FFFFFF',
          border: isHovered
            ? '1px solid rgba(99, 102, 241, 0.45)'
            : featured
            ? '1px solid rgba(99, 102, 241, 0.35)'
            : '1px solid #E2E8F0',
          boxShadow: isHovered
            ? '0 12px 28px -6px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)'
            : '0 1px 3px rgba(15, 23, 42, 0.03), 0 4px 10px -2px rgba(15, 23, 42, 0.02)',
          transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'all 220ms cubic-bezier(0.16, 1, 0.3, 1)',
          WebkitFontSmoothing: 'antialiased',
          cursor: 'pointer',
        }}
      >
        <div>
          {/* Top Chips Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '20px',
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                color: theme.text,
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.01em',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: theme.dot,
                  flexShrink: 0,
                }}
              />
              {category}
            </div>

            {score !== undefined ? (
              <Badge variant="purple" size="sm" style={{ fontWeight: 600 }}>
                Score {score}/100
              </Badge>
            ) : (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#64748B',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.7 }}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ~{estimatedMinutes} min
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '1.0625rem',
              fontWeight: 700,
              color: isHovered ? '#4F46E5' : '#0F172A',
              marginBottom: '8px',
              lineHeight: 1.35,
              letterSpacing: '-0.015em',
              transition: 'color 180ms ease',
            }}
          >
            {title}
          </h3>

          {/* Summary */}
          <p
            style={{
              fontSize: '0.84375rem',
              color: '#64748B',
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: 0,
              fontWeight: 400,
            }}
          >
            {summary}
          </p>

          {/* Progress bar if started */}
          {isStarted && (
            <div style={{ marginTop: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.72rem',
                  color: '#4F46E5',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
              >
                <span>{progress?.isCompleted ? '✓ Completed' : 'In Progress'}</span>
                <span>{percent}%</span>
              </div>
              <div style={{ height: '4px', background: '#EEF2FF', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${percent}%`,
                    background: 'linear-gradient(90deg, #6366F1 0%, #4F46E5 100%)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer info row */}
        <div
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '0.8125rem',
              color: isHovered ? '#4338CA' : '#4F46E5',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'color 180ms ease',
            }}
          >
            {isStarted ? (progress?.isCompleted ? 'Review Topic' : 'Continue Learning') : 'Start Learning'}
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
                transition: 'transform 180ms ease',
              }}
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </span>

          <span
            style={{
              fontSize: '0.72rem',
              color: '#64748B',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#ECFDF5',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            Verified
          </span>
        </div>
      </div>
    </Link>
  );
};
