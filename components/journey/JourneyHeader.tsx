'use client';

import React from 'react';
import Link from 'next/link';
import type { TopicContract } from '@/lib/content/contract';
import type { TopicProgressState } from '@/lib/learning/progress';
import type { JourneyMilestone } from '@/components/journey/JourneyRoadmap';
import { SaveTopicButton } from '@/components/topic/SaveTopicButton';
import { Badge } from '@/components/ui';
import { JourneyTopMenu } from './JourneyTopMenu';

interface JourneyHeaderProps {
  topic: TopicContract;
  progress: TopicProgressState | null;
  milestones: JourneyMilestone[];
}

export const JourneyHeader: React.FC<JourneyHeaderProps> = ({
  topic,
  progress,
  milestones,
}) => {
  const completedCount = progress?.completedStepIndexes?.length ?? 0;
  const totalCount = milestones.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const currentStep = progress?.currentStep ?? 0;
  const isDone = progress?.isCompleted ?? false;

  const totalMinutes = milestones.reduce((sum, m) => sum + (m.estimatedMinutes ?? 2), 0);
  const remainingMinutes = Math.max(
    1,
    Math.round(totalMinutes * (1 - completedCount / (totalCount || 1)))
  );

  // SVG circular progress ring calculation (radius: 10, perimeter: 2 * PI * 10 = ~62.83)
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <header
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '760px',
        margin: '0 auto 6px auto',
        padding: '0 16px',
        zIndex: 20,
      }}
    >
      {/* ─── Apple-Inspired Navigation Bar ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 0 10px 0',
          gap: '12px',
        }}
      >
        {/* Left: Back to Topics pill */}
        <Link
          href="/explore"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#1E293B',
            textDecoration: 'none',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '6px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            transition: 'all 0.15s ease',
          }}
          className="swallern-press"
          aria-label="Back to topic library"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Topics</span>
        </Link>

        {/* Center: Apple-Style Compact Progress Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '5px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          {/* Micro Circular Progress Ring */}
          <div style={{ position: 'relative', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="12"
                cy="12"
                r={radius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="2.5"
              />
              <circle
                cx="12"
                cy="12"
                r={radius}
                fill="none"
                stroke={isDone ? '#10B981' : '#3B82F6'}
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
          </div>

          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isDone ? '#059669' : '#0F172A' }}>
            {percent}%
          </span>
          <span style={{ color: '#CBD5E1', fontSize: '0.75rem' }}>•</span>
          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B' }}>
            {isDone ? 'Mastered' : `Step ${Math.min(currentStep + 1, totalCount)} of ${totalCount}`}
          </span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="indigo" size="sm">
            {topic.category.name}
          </Badge>
          {topic.id && <SaveTopicButton topicId={topic.id} topicSlug={topic.slug} />}
          <JourneyTopMenu topicSlug={topic.slug} />
        </div>
      </div>

      {/* ─── Apple-Style Topic Header & Minimalist Progress Bar ─── */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
          padding: '12px 16px',
        }}
      >
        {/* Title & summary only — progress is shown in the top sticky header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {topic.title}
          </h1>
          <p
            style={{
              fontSize: '0.76rem',
              color: '#64748B',
              margin: 0,
              lineHeight: 1.45,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as any,
            }}
          >
            {topic.summary}
          </p>
        </div>
      </div>
    </header>
  );
};
