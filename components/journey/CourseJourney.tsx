'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { TopicContract, LessonSectionData } from '@/lib/content/contract';
import { getTopicProgress, getProgressPercentage, TopicProgressState } from '@/lib/learning/progress';
import { getBirdDialogue, type BirdDialogueContext } from '@/lib/visuals/characters';
import { SwallernBird } from '@/components/journey/SwallernBird';
import { JourneyRoadmap, type JourneyMilestone } from '@/components/journey/JourneyRoadmap';
import { Badge } from '@/components/ui';

interface CourseJourneyProps {
  topic: TopicContract;
}

/**
 * Derives a destination statement from a topic's key_concepts array.
 * Falls back to the topic summary when concepts are sparse.
 */
function buildDestination(topic: TopicContract): string {
  if (topic.key_concepts.length >= 2) {
    const first = topic.key_concepts[0].title.toLowerCase();
    const last  = topic.key_concepts[topic.key_concepts.length - 1].title.toLowerCase();
    return `By the end, you'll understand ${first} — all the way through to ${last}.`;
  }
  if (topic.key_concepts.length === 1) {
    return `By the end, you'll understand ${topic.key_concepts[0].title.toLowerCase()}.`;
  }
  return topic.summary;
}

/**
 * Builds the ordered journey milestone list from the topic's content.
 * Mirrors the step ordering used by the learn page classroom.
 */
function buildMilestones(topic: TopicContract): JourneyMilestone[] {
  const milestones: JourneyMilestone[] = [];
  let idx = 0;

  // Step 0: Quick answer / intro
  milestones.push({
    index: idx++,
    title: 'Introduction & Overview',
    description: topic.quick_answer
      ? topic.quick_answer.slice(0, 120) + (topic.quick_answer.length > 120 ? '…' : '')
      : 'An overview of what this topic covers.',
    estimatedMinutes: 1,
  });

  // Step 1: Key concepts
  if (topic.key_concepts.length > 0) {
    milestones.push({
      index: idx++,
      title: 'Key Concepts',
      description: topic.key_concepts.map((c) => c.title).join(', '),
      estimatedMinutes: 2,
    });
  }

  // Step 2: Explanation
  if (topic.explanation) {
    milestones.push({
      index: idx++,
      title: 'Core Principles & How It Works',
      description: 'A deeper look at the mechanisms behind the topic.',
      estimatedMinutes: 2,
    });
  }

  // Lesson sections
  if (topic.has_lesson && topic.lesson?.sections) {
    topic.lesson.sections
      .slice()
      .sort((a: LessonSectionData, b: LessonSectionData) => a.order_index - b.order_index)
      .forEach((sec: LessonSectionData) => {
        milestones.push({
          index: idx++,
          title: sec.title,
          description: sec.key_takeaway || sec.content.slice(0, 120) + '…',
          estimatedMinutes: Math.ceil((topic.lesson?.estimated_minutes ?? 5) / (topic.lesson?.sections.length ?? 1)),
        });
      });
  }

  // Quiz
  if (topic.has_quiz && topic.quiz) {
    milestones.push({
      index: idx++,
      title: `Knowledge Check — ${topic.quiz.questions.length} question${topic.quiz.questions.length !== 1 ? 's' : ''}`,
      description: 'Test what you discovered.',
      estimatedMinutes: Math.ceil(topic.quiz.questions.length * 0.5),
      isQuiz: true,
    });
  }

  return milestones;
}

/**
 * Picks bird expression based on current progress state
 */
function getBirdExpression(progress: TopicProgressState | null) {
  if (!progress) return 'curious' as const;
  if (progress.isCompleted) return 'celebrating' as const;
  const pct = getProgressPercentage(progress);
  if (pct >= 75) return 'encouraging' as const;
  if (pct >= 40) return 'neutral' as const;
  return 'curious' as const;
}

/**
 * Picks dialogue context based on progress
 */
function getDialogueContext(progress: TopicProgressState | null): BirdDialogueContext {
  if (!progress) return 'course_intro';
  if (progress.isCompleted) return 'course_complete';
  const remaining = progress.totalSteps - progress.completedStepIndexes.length;
  if (remaining <= 2) return 'near_finish';
  return 'course_resume';
}

// ─── Main Component ─────────────────────────────────────────────────────────

export const CourseJourney: React.FC<CourseJourneyProps> = ({ topic }) => {
  const [progress, setProgress] = useState<TopicProgressState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const p = getTopicProgress(topic.slug);
    if (p) setProgress(p);
    setMounted(true);
  }, [topic.slug]);

  const milestones = useMemo(() => buildMilestones(topic), [topic]);
  const destination = useMemo(() => buildDestination(topic), [topic]);
  const percent = getProgressPercentage(progress);
  const isStarted = percent > 0;
  const isCompleted = progress?.isCompleted ?? false;
  const currentStep = progress?.currentStep ?? 0;

  const expression = getBirdExpression(progress);
  const dialogueContext = getDialogueContext(progress);
  // Seed by step so dialogue varies per lesson without being random
  const dialogue = mounted
    ? getBirdDialogue(dialogueContext, topic.slug.length)
    : null;

  const ctaHref = isCompleted
    ? `/topics/${topic.slug}/learn?review=true`
    : isStarted
    ? `/topics/${topic.slug}/learn?step=${currentStep}`
    : `/topics/${topic.slug}/learn`;

  const ctaLabel = isCompleted
    ? 'Review Journey'
    : isStarted
    ? 'Continue Journey'
    : 'Start Journey';

  const totalMinutes = milestones.reduce((s, m) => s + (m.estimatedMinutes ?? 1), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* ══════════════════════════════════════════════════════════════════
          HERO — Course identity + Mascot focal point
         ══════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: 'linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 55%, #F0FDFA 100%)',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          padding: 'clamp(24px, 5vw, 48px)',
          marginBottom: '16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative ambient orbs */}
        <div aria-hidden="true" style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '-20px', left: '20%', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) auto',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          {/* Left: course identity */}
          <div>
            {/* Category + badges */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '12px' }}>
              <Badge variant="indigo" size="sm">{topic.category.name}</Badge>
              {topic.difficulty && (
                <Badge
                  variant={topic.difficulty === 'BEGINNER' ? 'success' : topic.difficulty === 'ADVANCED' ? 'warning' : 'neutral'}
                  size="sm"
                >
                  {topic.difficulty.charAt(0) + topic.difficulty.slice(1).toLowerCase()}
                </Badge>
              )}
              <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Verified
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 900,
                color: '#0F172A',
                lineHeight: 1.15,
                margin: '0 0 14px 0',
                letterSpacing: '-0.03em',
              }}
            >
              {topic.title}
            </h1>

            {/* Destination statement */}
            <p
              style={{
                fontSize: '1rem',
                color: '#0D9488',
                fontWeight: 600,
                lineHeight: 1.5,
                margin: '0 0 20px 0',
                padding: '10px 14px',
                background: 'rgba(13,148,136,0.06)',
                borderLeft: '3px solid #0D9488',
                borderRadius: '0 8px 8px 0',
              }}
            >
              {destination}
            </p>

            {/* Course meta */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ~{totalMinutes} min
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                {milestones.length} step{milestones.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Progress (if started) */}
            {isStarted && (
              <div
                style={{ marginBottom: '20px', maxWidth: '380px' }}
                className="swallern-anim-reveal"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: isCompleted ? '#059669' : '#3B82F6', marginBottom: '5px' }}>
                  <span>{isCompleted ? '✓ Journey Complete' : `Step ${currentStep + 1} of ${milestones.length}`}</span>
                  <span>{percent}%</span>
                </div>
                <div style={{ height: '6px', background: '#E0E7FF', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${percent}%`,
                      background: isCompleted
                        ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                        : 'linear-gradient(90deg, #3B82F6 0%, #0D9488 100%)',
                      borderRadius: '3px',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Primary CTA */}
            <Link href={ctaHref} style={{ textDecoration: 'none' }}>
              <button
                className="swallern-press"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '46px',
                  padding: '0 28px',
                  borderRadius: '23px',
                  border: 'none',
                  background: isCompleted
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #3B82F6 0%, #0D9488 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  boxShadow: isCompleted
                    ? '0 4px 14px rgba(16,185,129,0.35)'
                    : '0 4px 14px rgba(59,130,246,0.35)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = isCompleted
                    ? '0 8px 20px rgba(16,185,129,0.4)'
                    : '0 8px 20px rgba(59,130,246,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isCompleted
                    ? '0 4px 14px rgba(16,185,129,0.35)'
                    : '0 4px 14px rgba(59,130,246,0.35)';
                }}
              >
                {ctaLabel}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </Link>

            {isCompleted && (
              <Link
                href="/explore"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  marginLeft: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#64748B',
                  textDecoration: 'none',
                }}
              >
                Explore something new →
              </Link>
            )}
          </div>

          {/* Right: Swallern Bird mascot */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0',
              flexShrink: 0,
            }}
          >
            <SwallernBird
              expression={expression}
              dialogue={mounted ? dialogue : null}
              size={clampBirdSize()}
              float={!isCompleted}
              celebrate={isCompleted}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          JOURNEY ROADMAP
         ══════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          padding: 'clamp(20px, 4vw, 32px)',
          marginBottom: '16px',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>
            Your Journey
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
            {isStarted
              ? isCompleted
                ? 'Every step completed. Well done.'
                : `Step ${currentStep + 1} of ${milestones.length} — keep going.`
              : `${milestones.length} steps to the destination.`}
          </p>
        </div>

        <JourneyRoadmap
          milestones={milestones}
          progress={progress}
          topicSlug={topic.slug}
          destination={destination}
          animateReveal={mounted}
        />
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          WHAT YOU'LL DISCOVER (key concepts as discovery cards)
         ══════════════════════════════════════════════════════════════════ */}
      {topic.key_concepts.length > 0 && (
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: 'clamp(20px, 4vw, 28px)',
            marginBottom: '16px',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0', letterSpacing: '-0.01em' }}>
            What You'll Discover
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {topic.key_concepts.map((concept, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  padding: '12px',
                  background: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #F1F5F9',
                }}
              >
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#EFF6FF',
                    color: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                  aria-hidden="true"
                >
                  {idx + 1}
                </span>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                    {concept.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.45 }}>
                    {concept.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          COMPACT COURSE DETAILS
         ══════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: '#F8FAFC',
          border: '1px solid #F1F5F9',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <DetailItem label="Category" value={topic.category.name} />
        <DetailItem label="Steps" value={String(milestones.length)} />
        <DetailItem label="Estimated Time" value={`~${totalMinutes} min`} />
        {topic.difficulty && <DetailItem label="Level" value={topic.difficulty.charAt(0) + topic.difficulty.slice(1).toLowerCase()} />}
        {topic.has_lesson && topic.has_quiz && <DetailItem label="Includes" value="Lesson + Quiz" />}
        {topic.last_reviewed_at && (
          <DetailItem
            label="Reviewed"
            value={new Date(topic.last_reviewed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          />
        )}
      </section>
    </div>
  );
};

// ─── Detail item helper ─────────────────────────────────────────────────────
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
        {value}
      </div>
    </div>
  );
}

// Responsive bird size: larger on desktop, compact on mobile
function clampBirdSize(): number {
  if (typeof window === 'undefined') return 160;
  return window.innerWidth < 640 ? 100 : window.innerWidth < 1024 ? 130 : 160;
}
