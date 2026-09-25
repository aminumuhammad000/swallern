'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import type { TopicContract, LessonSectionData } from '@/lib/content/contract';
import { getTopicProgress, saveTopicProgress, getProgressPercentage, type TopicProgressState } from '@/lib/learning/progress';
import { resolveTheme } from '@/lib/learning/themes';
import type { SwaReaction, SwaExpression, SwaAnimation } from '@/components/swa';
import { JourneyHeader } from './JourneyHeader';
import { JourneyRoadmap, type JourneyMilestone } from './JourneyRoadmap';
import { JourneyListView } from './JourneyListView';
import { JourneyResourcesDrawer } from './JourneyResourcesDrawer';
import { RelatedTopics } from '@/components/topic/RelatedTopics';

interface CourseJourneyProps {
  topic: TopicContract;
}

/**
 * Derives a destination statement from a topic's key_concepts array.
 * Falls back to the topic summary when concepts are sparse.
 */
function buildDestination(topic: TopicContract): string {
  if (topic.key_concepts && topic.key_concepts.length >= 2) {
    const first = topic.key_concepts[0].title.toLowerCase();
    const last = topic.key_concepts[topic.key_concepts.length - 1].title.toLowerCase();
    return `By the end, you'll understand ${first} — all the way through to ${last}.`;
  }
  if (topic.key_concepts && topic.key_concepts.length === 1) {
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

  // Step 1: Explanation (Core Principles) — matches classroom step 1
  if (topic.explanation) {
    milestones.push({
      index: idx++,
      title: 'Core Principles & How It Works',
      description: 'A deeper look at the mechanisms behind the topic.',
      estimatedMinutes: 2,
    });
  }

  // Step 2: Key concepts — matches classroom step 2
  if (topic.key_concepts && topic.key_concepts.length > 0) {
    milestones.push({
      index: idx++,
      title: 'Key Concepts',
      description: topic.key_concepts.map((c) => c.title).join(', '),
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
          estimatedMinutes: Math.ceil(
            (topic.lesson?.estimated_minutes ?? 5) / (topic.lesson?.sections.length ?? 1)
          ),
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
 * Maps learner's classroom step to the corresponding journey milestone index.
 */
export function mapProgressToMilestoneIndex(
  progress: TopicProgressState | null,
  milestones: JourneyMilestone[],
  topic: TopicContract
): number {
  if (!progress) return 0;
  if (progress.isCompleted) return Math.max(0, milestones.length); // Destination landmark

  const rawStep = progress.currentStep ?? 0;

  // Calculate where lesson sections end and review/quiz starts
  let preQuizStepCount = 1; // intro
  if (topic.explanation) preQuizStepCount++;
  if (topic.key_concepts && topic.key_concepts.length > 0) preQuizStepCount++;
  if (topic.has_lesson && topic.lesson?.sections) {
    preQuizStepCount += topic.lesson.sections.length;
  }

  // If learner is on review launch or any quiz question
  if (rawStep >= preQuizStepCount) {
    const quizIdx = milestones.findIndex((m) => m.isQuiz);
    if (quizIdx !== -1) {
      return quizIdx;
    }
  }

  return Math.min(Math.max(0, rawStep), Math.max(0, milestones.length - 1));
}

export const CourseJourney: React.FC<CourseJourneyProps> = ({ topic }) => {
  // Synchronous initial progress from local storage so Swa immediately perches at the learner's stage
  const [progress, setProgress] = useState<TopicProgressState | null>(() => {
    if (typeof window !== 'undefined') {
      return getTopicProgress(topic.slug);
    }
    return null;
  });
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Swa companion reactive state
  const [swaReaction, setSwaReaction] = useState<SwaReaction | null>(null);
  const [swaSpeech, setSwaSpeech] = useState<string | null>(null);
  const [swaExpression, setSwaExpression] = useState<SwaExpression>('neutral');
  const [swaAnimation, setSwaAnimation] = useState<SwaAnimation>('idle');

  const milestones = useMemo(() => buildMilestones(topic), [topic]);
  const activeMilestoneIndex = useMemo(() => {
    return mapProgressToMilestoneIndex(progress, milestones, topic);
  }, [progress, milestones, topic]);

  useEffect(() => {
    const p = getTopicProgress(topic.slug);
    if (p) setProgress(p);
    setMounted(true);

    const activeIdx = mapProgressToMilestoneIndex(p, milestones, topic);

    // Initial contextual welcome message
    if (p?.isCompleted) {
      setSwaExpression('proud');
      setSwaAnimation('celebrate');
      setSwaSpeech("You've mastered this course! Ready to review?");
    } else if (activeIdx > 0) {
      setSwaExpression('curious');
      setSwaAnimation('curious');
      setSwaSpeech(`Welcome back! Ready for Step ${activeIdx + 1}?`);
    } else {
      setSwaExpression('happy');
      setSwaAnimation('wave');
      setSwaSpeech('Ready to explore this world with me?');
    }
  }, [topic.slug, milestones, topic]);

  // Loading gate: wait for Swa 3D model to be ready
  const [isSwaReady, setIsSwaReady] = useState(false);
  useEffect(() => {
    // Safety fallback: reveal after 3.5s if network is slow or 3D unavailable
    const timer = setTimeout(() => setIsSwaReady(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  const destination = useMemo(() => buildDestination(topic), [topic]);
  const resolvedTheme = useMemo(
    () => resolveTheme(topic.category?.slug, topic.slug),
    [topic.category?.slug, topic.slug]
  );

  const percent = getProgressPercentage(progress);
  const isStarted = percent > 0;
  const isCompleted = progress?.isCompleted ?? false;
  const currentStep = progress?.currentStep ?? 0;

  // Handler when user decides to go back to an earlier stage
  const handleSetCurrentStage = useCallback(
    (milestoneIndex: number) => {
      const targetClassroomStep = milestoneIndex;
      saveTopicProgress({
        slug: topic.slug,
        topicId: topic.id,
        title: topic.title,
        summary: topic.summary,
        category: topic.category?.name,
        currentStep: targetClassroomStep,
        totalSteps: progress?.totalSteps || milestones.length,
        completedStepIndexes: progress?.completedStepIndexes || [],
        isCompleted: false,
      }).then((updated) => {
        setProgress(updated);
      });
    },
    [topic, progress, milestones.length]
  );

  // Swa reaction handler when learner taps a milestone node
  const handleMilestoneInteracted = (
    milestone: JourneyMilestone,
    state: 'completed' | 'current' | 'upcoming'
  ) => {
    if (state === 'completed') {
      setSwaExpression('happy');
      setSwaAnimation('happy');
      setSwaReaction('success');
      setSwaSpeech(`You already conquered: ${milestone.title}`);
    } else if (state === 'current') {
      setSwaExpression('focused');
      setSwaAnimation('point');
      setSwaReaction('discovery');
      setSwaSpeech(`That's our next stop: ${milestone.title}!`);
    } else {
      setSwaExpression('curious');
      setSwaAnimation('curious');
      setSwaSpeech(`Upcoming landmark: ${milestone.title}`);
    }
  };

  const handleSwaReactionComplete = () => {
    setSwaReaction(null);
  };

  // Target CTA action
  const ctaHref = isCompleted
    ? `/topics/${topic.slug}/learn?review=true`
    : isStarted
    ? `/topics/${topic.slug}/learn?step=${currentStep}`
    : `/topics/${topic.slug}/learn`;

  const ctaLabel = isCompleted
    ? 'Review Journey'
    : isStarted
    ? `Continue Journey (Step ${activeMilestoneIndex + 1})`
    : 'Start Journey';

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 40%, #F5F3FF 100%)',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '90px', // Space for bottom navigation
      }}
    >
      {/* ─── SWA INITIALIZATION LOADING GATE ─── */}
      {!isSwaReady && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 60%, #F5F3FF 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          {/* Animated Swa companion badge */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              boxShadow: '0 10px 25px -4px rgba(139, 92, 246, 0.45)',
            }}
          >
            ✨
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              Getting Swa ready...
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Preparing your journey through {topic.title}
            </div>
          </div>
        </div>
      )}

      {/* ─── 1. TOP PROGRESS HEADER (Apple Minimalist) ─── */}
      <JourneyHeader
        topic={topic}
        progress={progress}
        milestones={milestones}
      />

      {/* ─── VIEW TOGGLE: MAP vs OUTLINE LIST ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '14px',
          zIndex: 10,
        }}
      >
        <div
          role="tablist"
          aria-label="Roadmap View Options"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            padding: '4px',
            borderRadius: '999px',
            border: '1.5px solid rgba(226, 232, 240, 0.9)',
            display: 'inline-flex',
            gap: '4px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'map'}
            onClick={() => setViewMode('map')}
            className="swallern-press"
            style={{
              padding: '7px 18px',
              borderRadius: '999px',
              border: 'none',
              background:
                viewMode === 'map'
                  ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                  : 'transparent',
              color: viewMode === 'map' ? '#FFFFFF' : '#64748B',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: viewMode === 'map' ? '0 2px 8px rgba(59, 130, 246, 0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="6" cy="19" r="3" />
              <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
              <circle cx="18" cy="5" r="3" />
            </svg>
            <span>Journey Map</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            className="swallern-press"
            style={{
              padding: '7px 18px',
              borderRadius: '999px',
              border: 'none',
              background:
                viewMode === 'list'
                  ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                  : 'transparent',
              color: viewMode === 'list' ? '#FFFFFF' : '#64748B',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: viewMode === 'list' ? '0 2px 8px rgba(59, 130, 246, 0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>Curriculum List</span>
          </button>
        </div>
      </div>

      {/* ─── 2. VISUAL JOURNEY WORLD ROADMAP OR OUTLINE LIST ─── */}
      <main
        style={{
          flex: 1,
          width: '100%',
          position: 'relative',
          padding: '10px 0 30px 0',
        }}
      >
        {viewMode === 'map' ? (
          <JourneyRoadmap
            milestones={milestones}
            progress={progress}
            activeMilestoneIndex={activeMilestoneIndex}
            topicSlug={topic.slug}
            topicTitle={topic.title}
            destination={destination}
            themeId={resolvedTheme.id}
            swaReaction={swaReaction}
            swaSpeech={swaSpeech}
            swaExpression={swaExpression}
            swaAnimation={swaAnimation}
            onSwaReactionComplete={handleSwaReactionComplete}
            onMilestoneInteracted={handleMilestoneInteracted}
            onSwaLoaded={() => setIsSwaReady(true)}
            onSetCurrentStage={handleSetCurrentStage}
          />
        ) : (
          <JourneyListView
            milestones={milestones}
            progress={progress}
            activeMilestoneIndex={activeMilestoneIndex}
            destination={destination}
            themeId={resolvedTheme.id}
            topicSlug={topic.slug}
            onSelectMilestone={(idx) => {
              const target = milestones[idx] || { index: idx, title: destination };
              const st = isCompleted || progress?.completedStepIndexes?.includes(idx) ? 'completed' : activeMilestoneIndex === idx ? 'current' : 'upcoming';
              handleMilestoneInteracted(target, st);
            }}
          />
        )}

        {/* ─── 3. NEXT HORIZONS / RELATED EXPEDITIONS ─── */}
        {topic.related_topics && topic.related_topics.length > 0 && (
          <RelatedTopics topics={topic.related_topics} />
        )}

        {/* ─── 4. TOPIC CITATIONS & SOURCES DRAWER ─── */}
        <JourneyResourcesDrawer topic={topic} />
      </main>

      {/* ─── 4. STICKY FLOATING QUICK ACTION BUTTON ─── */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 45,
          width: 'calc(100% - 32px)',
          maxWidth: '380px',
        }}
      >
        <Link href={ctaHref} style={{ textDecoration: 'none' }}>
          <button
            type="button"
            className="swallern-press"
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '26px',
              border: 'none',
              background: isCompleted
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #3B82F6 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.96rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: isCompleted
                ? '0 10px 25px -4px rgba(16, 185, 129, 0.45)'
                : '0 10px 25px -4px rgba(59, 130, 246, 0.45)',
              cursor: 'pointer',
            }}
          >
            <span>{isCompleted ? '↺' : isStarted ? '▶' : '🚀'}</span>
            <span>{ctaLabel}</span>
          </button>
        </Link>
      </div>
    </div>
  );
};

