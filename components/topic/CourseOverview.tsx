'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button } from '@/components/ui';
import { TopicContract } from '@/lib/content/contract';
import { SaveTopicButton } from './SaveTopicButton';
import { SourceList } from './SourceList';
import { MediaSection } from './MediaSection';
import { RelatedTopics } from './RelatedTopics';
import { TopicTracker } from './TopicTracker';
import { TopicJsonLd } from './TopicJsonLd';
import { getTopicProgress, getProgressPercentage, TopicProgressState } from '@/lib/learning/progress';

interface CourseOverviewProps {
  topic: TopicContract;
}

export const CourseOverview: React.FC<CourseOverviewProps> = ({ topic }) => {
  const [progress, setProgress] = useState<TopicProgressState | null>(null);

  useEffect(() => {
    const p = getTopicProgress(topic.slug);
    if (p) setProgress(p);
  }, [topic.slug]);

  const percent = getProgressPercentage(progress);
  const isStarted = percent > 0;
  const currentStep = progress?.currentStep || 0;

  // Calculate outline steps count
  const sectionCount = topic.lesson?.sections?.length || 0;
  const quizCount = topic.quiz?.questions?.length || 0;
  const totalOutlineItems = 3 + sectionCount + quizCount; // Intro + Concepts + Explanation + sections + quizzes
  const estimatedTime = topic.lesson?.estimated_minutes || 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Session Tracker & JSON-LD */}
      {topic.id && <TopicTracker topicId={topic.id} />}
      <TopicJsonLd topic={topic} />

      {/* Top Breadcrumbs & Save Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <nav aria-label="Breadcrumb">
          <Link
            href="/explore"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#4F46E5',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← Back to Topic Library
          </Link>
        </nav>

        {topic.id && <SaveTopicButton topicId={topic.id} topicSlug={topic.slug} />}
      </div>

      {/* ============================================================== */}
      {/* COURSE HERO ORIENTATION CARD                                   */}
      {/* ============================================================== */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #EEF2FF 100%)',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
          <Badge variant="indigo" size="sm">
            {topic.category.name}
          </Badge>
          <Badge variant="neutral" size="sm">
            {totalOutlineItems} steps · ~{estimatedTime} min
          </Badge>

          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Verified Research
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: '#0F172A',
            lineHeight: 1.2,
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em',
          }}
        >
          {topic.title}
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: '#475569',
            lineHeight: 1.6,
            margin: '0 0 24px 0',
            maxWidth: '680px',
          }}
        >
          {topic.quick_answer || topic.summary}
        </p>

        {/* Progress bar if started */}
        {isStarted && (
          <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#4F46E5', marginBottom: '4px' }}>
              <span>{progress?.isCompleted ? '✓ Course Completed' : `Course Progress`}</span>
              <span>{percent}%</span>
            </div>
            <div style={{ height: '6px', background: '#E0E7FF', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${percent}%`,
                  background: 'linear-gradient(90deg, #6366F1 0%, #4F46E5 100%)',
                }}
              />
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div>
          <Link
            href={
              isStarted
                ? progress?.isCompleted
                  ? `/topics/${topic.slug}/learn?review=true`
                  : `/topics/${topic.slug}/learn?step=${currentStep}`
                : `/topics/${topic.slug}/learn`
            }
            style={{ textDecoration: 'none' }}
          >
            <Button
              variant="primary"
              size="lg"
              style={{
                height: '44px',
                padding: '0 24px',
                borderRadius: '22px',
                fontWeight: 700,
                fontSize: '0.9375rem',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
              }}
            >
              {isStarted
                ? progress?.isCompleted
                  ? 'Review Course →'
                  : `Resume Lesson (Step ${currentStep + 1}) →`
                : 'Start Learning Journey →'}
            </Button>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* WHAT YOU'LL LEARN                                              */}
      {/* ============================================================== */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '24px 28px',
        }}
      >
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>
          What You’ll Learn
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {topic.key_concepts.map((concept, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: '#4F46E5', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1 }}>✓</span>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{concept.title}</div>
                <div style={{ fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.4, marginTop: '2px' }}>
                  {concept.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* COURSE CONTENT OUTLINE                                         */}
      {/* ============================================================== */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '24px 28px',
        }}
      >
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>
          Course Content Outline
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Step 1: Introduction */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #F1F5F9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#94A3B8', width: '24px' }}>01</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>Introduction & Overview</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>1 min</span>
          </div>

          {/* Step 2: Explanation */}
          {topic.explanation && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #F1F5F9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#94A3B8', width: '24px' }}>02</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>Core Principles & Mechanism</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>2 min</span>
            </div>
          )}

          {/* Step 3+: Sections */}
          {topic.has_lesson &&
            topic.lesson?.sections.map((sec, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#94A3B8', width: '24px' }}>
                    0{idx + 3}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>{sec.title}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>1 min</span>
              </div>
            ))}

          {/* Step Knowledge Check */}
          {topic.has_quiz && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#F5F3FF',
                border: '1px solid #DDD6FE',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#6366F1', width: '24px' }}>✓</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4338CA' }}>
                  Interactive Knowledge Check ({quizCount} question{quizCount === 1 ? '' : 's'})
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#6366F1', fontWeight: 600 }}>Quiz</span>
            </div>
          )}
        </div>
      </div>

      {/* Grounded Sources & Media & Related */}
      <SourceList sources={topic.sources} />
      <MediaSection media={topic.media} />
      <RelatedTopics topics={topic.related_topics} />
    </div>
  );
};
