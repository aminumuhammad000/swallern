'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge, Button, EmotionalFeedback } from '@/components/ui';
import { TopicContract } from '@/lib/content/contract';
import { SwallernVisual } from '@/components/visuals/SwallernVisual';
import { SwallernCharacter } from '@/components/visuals/SwallernCharacter';
import { buildVisualRequirement } from '@/lib/visuals/requirements';
import { saveTopicProgress, getTopicProgress } from '@/lib/learning/progress';
import {
  ClassroomTheme,
  ClassroomThemeId,
  CLASSROOM_THEMES,
  loadSavedTheme,
  saveTheme,
  getSmartDefaultTheme,
} from '@/lib/learning/themes';
import { audioService, AudioState, AudioRate, ActiveSpeechWord } from '@/lib/learning/audio';
import { focusMusicManager } from '@/lib/learning/focusMusic';
import { soundManager } from '@/lib/learning/sounds';
import { ClassroomHeader } from './ClassroomHeader';
import { AudioControls } from './AudioControls';
import { CourseOutlineDrawer } from './CourseOutlineDrawer';
import { ClassroomNotesPanel } from '@/components/notes/ClassroomNotesPanel';
import { CelebrationLayer } from './CelebrationLayer';
import { ClassroomDecor } from './ClassroomDecor';
import { RoadmapStep } from './CourseRoadmap';

/* ========================================================================== */
/* Types                                                                       */
/* ========================================================================== */

interface LearningClassroomProps {
  topic: TopicContract;
  initialStep?: number;
}

export interface StepItem {
  id: string;
  type: 'intro' | 'explanation' | 'concepts' | 'section' | 'review-launch' | 'quiz' | 'completion';
  section: string;
  title: string;
  subtitle?: string;
  content?: string;
  takeaway?: string;
  quizQuestion?: {
    id: string;
    question: string;
    explanation: string;
    options: { id: string; option_text: string; is_correct: boolean }[];
  };
  quizIndex?: number;
  totalQuizQuestions?: number;
}

type CelebrationTrigger = 'none' | 'step' | 'lesson' | 'course';

const CALM_MODE_KEY = 'swallern_calm_mode_v1';

interface StepAudioData {
  chunks: string[];
  chunkMap: {
    title: number;
    summary?: number;
    quickAnswerLabel?: number;
    quickAnswerText?: number;
    paragraphs?: number[];
    takeawayLabel?: number;
    takeawayText?: number;
    concepts?: { title: number; desc: number }[];
    quizQuestion?: number;
    quizOptions?: number[];
    quizExplanation?: number;
  };
}

function getStepAudioData(step: StepItem, topic: TopicContract): StepAudioData {
  const chunks: string[] = [];
  const chunkMap: StepAudioData['chunkMap'] = {
    title: -1,
  };

  switch (step.type) {
    case 'intro': {
      chunkMap.title = chunks.length;
      chunks.push(topic.title);

      chunkMap.summary = chunks.length;
      chunks.push(topic.summary);

      if (topic.quick_answer && topic.quick_answer.trim()) {
        chunkMap.quickAnswerLabel = chunks.length;
        chunks.push('Quick Answer');

        chunkMap.quickAnswerText = chunks.length;
        chunks.push(topic.quick_answer.trim());
      }
      break;
    }

    case 'explanation': {
      chunkMap.title = chunks.length;
      chunks.push(step.title || 'Understanding the Foundation');

      const paras = (topic.explanation || '')
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      chunkMap.paragraphs = [];
      paras.forEach((p) => {
        chunkMap.paragraphs!.push(chunks.length);
        chunks.push(p);
      });
      break;
    }

    case 'concepts': {
      chunkMap.title = chunks.length;
      chunks.push(step.title || 'Key Concepts to Master');

      chunkMap.summary = chunks.length;
      chunks.push('Keep these core ideas in mind as we dive into each structured lesson.');

      chunkMap.concepts = [];
      (topic.key_concepts || []).forEach((kc) => {
        const titleIdx = chunks.length;
        chunks.push(kc.title);
        const descIdx = chunks.length;
        chunks.push(kc.description);
        chunkMap.concepts!.push({ title: titleIdx, desc: descIdx });
      });
      break;
    }

    case 'section': {
      chunkMap.title = chunks.length;
      chunks.push(step.title);

      const paras = (step.content || '')
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      chunkMap.paragraphs = [];
      paras.forEach((p) => {
        chunkMap.paragraphs!.push(chunks.length);
        chunks.push(p);
      });

      if (step.takeaway && step.takeaway.trim()) {
        chunkMap.takeawayLabel = chunks.length;
        chunks.push('Key Takeaway');

        chunkMap.takeawayText = chunks.length;
        chunks.push(step.takeaway.trim());
      }
      break;
    }

    case 'review-launch': {
      chunkMap.title = chunks.length;
      chunks.push(step.title);

      chunkMap.summary = chunks.length;
      chunks.push(
        step.content ||
          `You have reached the end of the lesson material for ${topic.title}. Ready to see what you remember?`
      );
      break;
    }

    case 'quiz': {
      chunkMap.title = chunks.length;
      chunks.push(`Review Question ${step.quizIndex} of ${step.totalQuizQuestions}`);

      if (step.quizQuestion) {
        chunkMap.quizQuestion = chunks.length;
        chunks.push(step.quizQuestion.question);

        chunkMap.quizOptions = [];
        step.quizQuestion.options.forEach((opt, optIdx) => {
          chunkMap.quizOptions!.push(chunks.length);
          chunks.push(`Option ${optIdx + 1}: ${opt.option_text}`);
        });

        if (step.quizQuestion.explanation) {
          chunkMap.quizExplanation = chunks.length;
          chunks.push(`Explanation: ${step.quizQuestion.explanation}`);
        }
      }
      break;
    }

    case 'completion': {
      chunkMap.title = chunks.length;
      chunks.push('Course Complete');
      chunkMap.summary = chunks.length;
      chunks.push(`Congratulations on completing the ${topic.title} course.`);
      break;
    }

    default: {
      chunkMap.title = chunks.length;
      chunks.push(step.title);
      if (step.content) {
        chunkMap.summary = chunks.length;
        chunks.push(step.content);
      }
      break;
    }
  }

  return { chunks, chunkMap };
}

interface HighlightedChunkTextProps {
  text: string;
  chunkIndex: number;
  activeChunkIndex: number;
  activeWord: ActiveSpeechWord | null;
  accentColor?: string;
  isDark?: boolean;
  style?: React.CSSProperties;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div';
}

function HighlightedChunkText({
  text,
  chunkIndex,
  activeChunkIndex,
  activeWord,
  accentColor = '#6366F1',
  isDark = false,
  style,
  className,
  as: Component = 'span',
}: HighlightedChunkTextProps) {
  const isChunkActive = chunkIndex >= 0 && activeChunkIndex === chunkIndex;

  if (!isChunkActive) {
    return (
      <Component style={style} className={className}>
        {text}
      </Component>
    );
  }

  const chunkWrapperStyle: React.CSSProperties = {
    ...style,
    backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.06)',
    borderRadius: '6px',
    padding: '2px 6px',
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
    transition: 'background-color 150ms ease',
  };

  if (activeWord && activeWord.chunkIndex === chunkIndex && activeWord.word) {
    const rawStart = activeWord.charIndex;
    const rawLen = activeWord.charLength > 0 ? activeWord.charLength : 1;
    const start = Math.max(0, Math.min(rawStart, text.length));
    const end = Math.min(start + rawLen, text.length);

    const before = text.slice(0, start);
    const word = text.slice(start, end);
    const after = text.slice(end);

    return (
      <Component style={chunkWrapperStyle} className={className}>
        {before}
        <mark
          style={{
            backgroundColor: accentColor,
            color: '#FFFFFF',
            borderRadius: '4px',
            padding: '1px 5px',
            margin: '0 -1px',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: `0 2px 8px ${accentColor}66`,
            boxDecorationBreak: 'clone',
            WebkitBoxDecorationBreak: 'clone',
            display: 'inline',
            transition: 'background-color 60ms ease',
          }}
        >
          {word}
        </mark>
        {after}
      </Component>
    );
  }

  return (
    <Component style={chunkWrapperStyle} className={className}>
      {text}
    </Component>
  );
}

/* ========================================================================== */
/* Component                                                                   */
/* ========================================================================== */

export const LearningClassroom: React.FC<LearningClassroomProps> = ({
  topic,
  initialStep = 0,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReviewRequested = searchParams.get('review') === 'true';

  /* ------------------------------------------------------------------ */
  /* Build structured step sequence                                       */
  /* ------------------------------------------------------------------ */
  const steps: StepItem[] = [];

  // Section 1: Getting Started
  steps.push({
    id: 'intro',
    type: 'intro',
    section: 'Getting Started',
    title: topic.title,
    subtitle: topic.quick_answer || topic.summary,
    content: topic.summary,
  });

  if (topic.explanation) {
    steps.push({
      id: 'explanation',
      type: 'explanation',
      section: 'Getting Started',
      title: 'Understanding the Core Principle',
      content: topic.explanation,
    });
  }

  if (topic.key_concepts && topic.key_concepts.length > 0) {
    steps.push({
      id: 'concepts',
      type: 'concepts',
      section: 'Getting Started',
      title: 'Key Concepts to Master',
    });
  }

  // Section 2: In-Depth Lessons
  if (topic.has_lesson && topic.lesson?.sections && topic.lesson.sections.length > 0) {
    topic.lesson.sections.forEach((sec, idx) => {
      steps.push({
        id: `section-${idx}`,
        type: 'section',
        section: 'Lesson Sections',
        title: sec.title || `Lesson ${idx + 1}`,
        content: sec.content,
        takeaway: sec.key_takeaway,
      });
    });
  }

  // Section 3: Course Review
  const quizQuestions = topic.has_quiz && topic.quiz?.questions ? topic.quiz.questions : [];

  steps.push({
    id: 'review-launch',
    type: 'review-launch',
    section: 'Course Review',
    title: 'Ready for Review',
    content: `You've reached the end of the lesson material for ${topic.title}. Ready to see what you remember?`,
  });

  quizQuestions.forEach((q, idx) => {
    steps.push({
      id: `quiz-${idx}`,
      type: 'quiz',
      section: 'Course Review',
      title: `Knowledge Check ${idx + 1}`,
      quizQuestion: q,
      quizIndex: idx + 1,
      totalQuizQuestions: quizQuestions.length,
    });
  });

  // Section 4: Completion
  steps.push({
    id: 'completion',
    type: 'completion',
    section: 'Completion',
    title: 'Course Complete',
  });

  const totalSteps = steps.length;

  /* ------------------------------------------------------------------ */
  /* State                                                              */
  /* ------------------------------------------------------------------ */
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [completedStepIndexes, setCompletedStepIndexes] = useState<number[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [quizScores, setQuizScores] = useState<Record<number, boolean>>({});

  // Confirm leave modal state
  const [showExitModal, setShowExitModal] = useState(false);

  /* ------------------------------------------------------------------ */
  /* Theme state                                                        */
  /* ------------------------------------------------------------------ */
  const [theme, setTheme] = useState<ClassroomTheme>(() => {
    const saved = loadSavedTheme();
    const id = saved ?? getSmartDefaultTheme(topic.category?.slug);
    return CLASSROOM_THEMES[id];
  });

  const handleThemeChange = useCallback((id: ClassroomThemeId) => {
    saveTheme(id);
    setTheme(CLASSROOM_THEMES[id]);
    focusMusicManager.syncWithTheme(id);
  }, []);

  /* ------------------------------------------------------------------ */
  /* Audio / Read-Aloud state                                           */
  /* ------------------------------------------------------------------ */
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [audioRate, setAudioRate] = useState<AudioRate>(1);
  const [activeChunkIndex, setActiveChunkIndex] = useState<number>(-1);
  const [activeWord, setActiveWord] = useState<ActiveSpeechWord | null>(null);
  const [isMuted, setIsMuted] = useState(() => soundManager.muted);

  useEffect(() => {
    const unsubState = audioService.subscribe(setAudioState);
    const unsubChunk = audioService.subscribeChunk(setActiveChunkIndex);
    const unsubWord = audioService.subscribeWord(setActiveWord);
    focusMusicManager.syncWithTheme(theme.id);
    return () => {
      unsubState();
      unsubChunk();
      unsubWord();
      audioService.stop();
      focusMusicManager.stop();
    };
  }, []);

  // Duck focus music volume during active speech synthesis
  useEffect(() => {
    focusMusicManager.setDucking(audioState === 'speaking');
  }, [audioState]);

  /* ------------------------------------------------------------------ */
  /* Accessibility: reduced-motion & calm mode                          */
  /* ------------------------------------------------------------------ */
  const [reducedMotion, setReducedMotion] = useState(false);
  const [calmMode, setCalmMode] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CALM_MODE_KEY);
      if (saved === 'true') setCalmMode(true);
    } catch {
      // ignore
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* UI drawers & Celebrations                                          */
  /* ------------------------------------------------------------------ */
  const [showOutline, setShowOutline] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteCount, setNoteCount] = useState(0);
  const [celebration, setCelebration] = useState<CelebrationTrigger>('none');
  const hasCelebratedCourse = useRef(false);

  /* ------------------------------------------------------------------ */
  /* Load saved progress accurately                                     */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const saved = getTopicProgress(topic.slug);
    if (saved) {
      setCompletedStepIndexes(saved.completedStepIndexes || []);

      // If user came with explicit ?review=true or is already completed, start at review or first step
      if (isReviewRequested) {
        const reviewLaunchIdx = steps.findIndex((s) => s.type === 'review-launch');
        if (reviewLaunchIdx !== -1) {
          setCurrentStepIndex(reviewLaunchIdx);
        } else {
          setCurrentStepIndex(0);
        }
      } else if (saved.isCompleted) {
        // If course is already completed and user opens it without review param, allow them to view completion or review
        if (initialStep > 0 && initialStep < totalSteps) {
          setCurrentStepIndex(initialStep);
        } else {
          // Default to completion overview for completed courses
          setCurrentStepIndex(totalSteps - 1);
        }
      } else if (initialStep === 0 && saved.currentStep > 0 && saved.currentStep < totalSteps) {
        // In-progress: resume exact step!
        setCurrentStepIndex(saved.currentStep);
      }
    }
  }, [topic.slug, initialStep, totalSteps, isReviewRequested]);

  // Fetch note count for this topic
  useEffect(() => {
    let cancelled = false;
    async function loadNoteCount() {
      try {
        const res = await fetch(`/api/user/notes?topic_slug=${encodeURIComponent(topic.slug)}`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          setNoteCount((data.notes ?? []).length);
        }
      } catch {
        // silent
      }
    }
    loadNoteCount();
    return () => { cancelled = true; };
  }, [topic.slug]);

  /* ------------------------------------------------------------------ */
  /* Advance step                                                       */
  /* ------------------------------------------------------------------ */
  const advanceStep = useCallback(
    (nextIdx: number) => {
      audioService.stop();

      const newCompleted = Array.from(new Set([...completedStepIndexes, currentStepIndex]));
      setCompletedStepIndexes(newCompleted);

      const clampedIdx = Math.min(totalSteps - 1, Math.max(0, nextIdx));
      setCurrentStepIndex(clampedIdx);
      setSelectedOptionId(null);
      setQuizState('idle');

      const isNowComplete = clampedIdx === totalSteps - 1;

      // Persist progress accurately
      saveTopicProgress({
        slug: topic.slug,
        topicId: topic.id,
        title: topic.title,
        summary: topic.summary,
        category: topic.category.name,
        currentStep: clampedIdx,
        totalSteps,
        completedStepIndexes: newCompleted,
        isCompleted: isNowComplete,
        estimatedMinutes: topic.lesson?.estimated_minutes || 5,
      });

      // Celebration handling
      if (isNowComplete) {
        if (!hasCelebratedCourse.current) {
          hasCelebratedCourse.current = true;
          soundManager.play('course_complete');
          setCelebration('course');
        }
      } else {
        soundManager.play('correct');
        if (!reducedMotion && !calmMode && newCompleted.length % 3 === 0) {
          setCelebration('step');
        }
      }
    },
    [completedStepIndexes, currentStepIndex, totalSteps, topic, reducedMotion, calmMode]
  );

  /* ------------------------------------------------------------------ */
  /* Quiz interaction                                                   */
  /* ------------------------------------------------------------------ */
  const handleQuizSelect = useCallback(
    (optId: string, isCorrect: boolean, quizIdx?: number) => {
      setSelectedOptionId(optId);

      if (isCorrect) {
        setQuizState('correct');
        soundManager.play('correct');
        if (quizIdx !== undefined) {
          setQuizScores((prev) => ({ ...prev, [quizIdx]: true }));
        }
        if (!reducedMotion && !calmMode) setCelebration('step');
      } else {
        setQuizState('incorrect');
        soundManager.play('incorrect');
      }
    },
    [reducedMotion, calmMode]
  );

  /* ------------------------------------------------------------------ */
  /* Safe Quit Course                                                   */
  /* ------------------------------------------------------------------ */
  const handleConfirmExit = () => {
    audioService.stop();
    focusMusicManager.stop();
    // Ensure current position is saved before leaving
    saveTopicProgress({
      slug: topic.slug,
      topicId: topic.id,
      title: topic.title,
      summary: topic.summary,
      category: topic.category.name,
      currentStep: currentStepIndex,
      totalSteps,
      completedStepIndexes,
      isCompleted: currentStepIndex === totalSteps - 1,
      estimatedMinutes: topic.lesson?.estimated_minutes || 5,
    });
    router.push(`/topics/${topic.slug}`);
  };

  /* ------------------------------------------------------------------ */
  /* Derived values                                                     */
  /* ------------------------------------------------------------------ */
  const currentStep = steps[currentStepIndex] || steps[0];
  const percentComplete = Math.round(((currentStepIndex + 1) / totalSteps) * 100);
  const isLastStep = currentStepIndex === totalSteps - 1;
  const dark = theme.id === 'space_observatory';
  const textPrimary = dark ? '#F1F5F9' : '#0F172A';
  const textSecondary = dark ? '#94A3B8' : '#475569';
  const borderColor = dark ? 'rgba(255,255,255,0.1)' : '#E2E8F0';

  /* ------------------------------------------------------------------ */
  /* Roadmap steps model                                                */
  /* ------------------------------------------------------------------ */
  const roadmapSteps: RoadmapStep[] = steps.map((s, idx) => ({
    id: s.id,
    title: s.title,
    type: s.type,
    section: s.section,
    index: idx,
    state: completedStepIndexes.includes(idx)
      ? 'completed'
      : idx === currentStepIndex
      ? 'current'
      : 'upcoming',
  }));

  /* ------------------------------------------------------------------ */
  /* Extract readable text chunks for TTS                               */
  /* ------------------------------------------------------------------ */
  const stepAudioData = useMemo(() => getStepAudioData(currentStep, topic), [currentStep, topic]);
  const currentChunks = stepAudioData.chunks;
  const chunkMap = stepAudioData.chunkMap;

  /* ------------------------------------------------------------------ */
  /* Card styles                                                        */
  /* ------------------------------------------------------------------ */
  const cardStyle: React.CSSProperties = {
    background: theme.cardBackground,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '20px',
    padding: '30px 28px',
    boxShadow: dark
      ? '0 4px 24px rgba(0,0,0,0.3)'
      : '0 2px 12px rgba(15,23,42,0.06)',
  };

  const takeawayStyle: React.CSSProperties = {
    marginTop: '22px',
    padding: '16px 20px',
    background: dark ? 'rgba(5,150,105,0.15)' : '#ECFDF5',
    borderLeft: '4px solid #059669',
    borderRadius: '0 14px 14px 0',
  };

  /* ========================================================================= */
  /* RENDER                                                                     */
  /* ========================================================================= */
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: theme.shellBackground,
        position: 'relative',
      }}
    >
      {/* Ambient background decor */}
      <ClassroomDecor theme={theme} reducedMotion={reducedMotion} calmMode={calmMode} />

      {/* Celebration Layer (Balloons & Confetti) */}
      <CelebrationLayer
        trigger={celebration}
        accent={theme.accent}
        calmMode={calmMode}
        reducedMotion={reducedMotion}
        onDone={() => setCelebration('none')}
      />

      {/* Course Roadmap Drawer */}
      <CourseOutlineDrawer
        isOpen={showOutline}
        onClose={() => setShowOutline(false)}
        steps={roadmapSteps}
        currentStepIndex={currentStepIndex}
        theme={theme}
        onSelectStep={(idx) => advanceStep(idx)}
      />

      {/* Dedicated Classroom Header */}
      <ClassroomHeader
        topicSlug={topic.slug}
        topicTitle={topic.title}
        categoryName={topic.category.name}
        currentStep={currentStepIndex + 1}
        totalSteps={totalSteps}
        percentComplete={percentComplete}
        theme={theme}
        audioState={audioState}
        isMuted={isMuted}
        showOutline={showOutline}
        showNotes={showNotes}
        noteCount={noteCount}
        calmMode={calmMode}
        onToggleOutline={() => setShowOutline((v) => !v)}
        onToggleNotes={() => setShowNotes((v) => !v)}
        onToggleAudio={() => {
          if (audioState === 'idle') {
            audioService.speakChunks(currentChunks);
          } else if (audioState === 'speaking') {
            audioService.pause();
          } else if (audioState === 'paused') {
            audioService.resume();
          }
        }}
        onToggleMute={() => {
          soundManager.toggle();
          setIsMuted(soundManager.muted);
        }}
        onToggleCalm={() => {
          const next = !calmMode;
          setCalmMode(next);
          try {
            localStorage.setItem(CALM_MODE_KEY, String(next));
          } catch {}
        }}
        onThemeChange={handleThemeChange}
        onExit={() => setShowExitModal(true)}
      />

      {/* Notes panel */}
      <ClassroomNotesPanel
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        topicSlug={topic.slug}
        topicTitle={topic.title}
        stepIndex={currentStepIndex}
        stepTitle={steps[currentStepIndex]?.title ?? ''}
        theme={theme}
      />

      {/* Quit Course Confirmation Modal */}
      {showExitModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            padding: '16px',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-modal-title"
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: dark ? '#1E293B' : '#FFFFFF',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: dark ? 'rgba(99,102,241,0.2)' : '#EEF2FF',
                color: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            </div>
            <h3 id="exit-modal-title" style={{ fontSize: '1.15rem', fontWeight: 800, color: textPrimary, marginBottom: '8px' }}>
              Leave this lesson?
            </h3>
            <p style={{ fontSize: '0.875rem', color: textSecondary, lineHeight: 1.5, marginBottom: '22px' }}>
              Your learning position at <strong>{currentStep.title}</strong> is safely saved so you can resume exactly here.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setShowExitModal(false)}
              >
                Stay in Lesson
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleConfirmExit}
              >
                Save & Exit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          padding: '24px 16px 64px 16px',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Read Aloud Controller */}
          {currentStep.type !== 'completion' && currentStep.type !== 'quiz' && (
            <AudioControls
              chunks={currentChunks}
              audioState={audioState}
              rate={audioRate}
              accent={theme.accent}
              dark={dark}
              onRateChange={setAudioRate}
            />
          )}

          {/* ============================================================ */}
          {/* STEP 1: INTRO                                                 */}
          {/* ============================================================ */}
          {currentStep.type === 'intro' && (
            <div style={cardStyle} className="swallern-anim-reveal">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <Badge variant="indigo" size="sm">Course Overview</Badge>
                <Badge variant="cyan" size="sm">{topic.difficulty || 'Beginner'}</Badge>
              </div>

              <HighlightedChunkText
                text={topic.title}
                chunkIndex={chunkMap.title}
                activeChunkIndex={activeChunkIndex}
                activeWord={activeWord}
                accentColor={theme.accent}
                isDark={dark}
                as="h1"
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: textPrimary,
                  marginBottom: '10px',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                }}
              />

              <HighlightedChunkText
                text={topic.summary}
                chunkIndex={chunkMap.summary ?? 1}
                activeChunkIndex={activeChunkIndex}
                activeWord={activeWord}
                accentColor={theme.accent}
                isDark={dark}
                as="p"
                style={{
                  fontSize: '0.9375rem',
                  color: textSecondary,
                  marginBottom: '20px',
                  lineHeight: 1.6,
                }}
              />

              <div style={{ margin: '0 -4px 20px -4px' }}>
                <SwallernVisual requirement={buildVisualRequirement(topic.title, topic.summary)} />
              </div>

              {topic.quick_answer && (
                <div
                  style={{
                    background: dark ? `${theme.accent}18` : '#EEF2FF',
                    borderLeft: `4px solid ${theme.accent}`,
                    borderRadius: '0 12px 12px 0',
                    padding: '16px 18px',
                    transition: 'all 200ms ease',
                    boxShadow:
                      activeChunkIndex === chunkMap.quickAnswerText ||
                      activeChunkIndex === chunkMap.quickAnswerLabel
                        ? `0 0 0 2px ${theme.accent}40`
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: theme.accent,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '4px',
                    }}
                  >
                    <HighlightedChunkText
                      text="Quick Answer"
                      chunkIndex={chunkMap.quickAnswerLabel ?? -1}
                      activeChunkIndex={activeChunkIndex}
                      activeWord={activeWord}
                      accentColor={theme.accent}
                      isDark={dark}
                    />
                  </div>
                  <HighlightedChunkText
                    text={topic.quick_answer}
                    chunkIndex={chunkMap.quickAnswerText ?? -1}
                    activeChunkIndex={activeChunkIndex}
                    activeWord={activeWord}
                    accentColor={theme.accent}
                    isDark={dark}
                    as="p"
                    style={{ margin: 0, fontSize: '0.90625rem', color: textPrimary, lineHeight: 1.55 }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: EXPLANATION                                           */}
          {/* ============================================================ */}
          {currentStep.type === 'explanation' && (
            <div style={cardStyle} className="swallern-anim-reveal">
              <Badge variant="purple" size="sm" style={{ marginBottom: '14px' }}>
                Core Principle
              </Badge>

              <HighlightedChunkText
                text="Understanding the Foundation"
                chunkIndex={chunkMap.title}
                activeChunkIndex={activeChunkIndex}
                activeWord={activeWord}
                accentColor={theme.accent}
                isDark={dark}
                as="h2"
                style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginBottom: '18px', letterSpacing: '-0.02em' }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {topic.explanation.split(/\n\n+/).map((para, idx) => (
                  <HighlightedChunkText
                    key={idx}
                    text={para}
                    chunkIndex={chunkMap.paragraphs ? chunkMap.paragraphs[idx] : idx + 1}
                    activeChunkIndex={activeChunkIndex}
                    activeWord={activeWord}
                    accentColor={theme.accent}
                    isDark={dark}
                    as="p"
                    style={{
                      fontSize: '0.9375rem',
                      color: textSecondary,
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: KEY CONCEPTS                                          */}
          {/* ============================================================ */}
          {currentStep.type === 'concepts' && (
            <div style={cardStyle} className="swallern-anim-reveal">
              <Badge variant="cyan" size="sm" style={{ marginBottom: '14px' }}>
                Framework
              </Badge>

              <HighlightedChunkText
                text="Key Concepts to Master"
                chunkIndex={chunkMap.title}
                activeChunkIndex={activeChunkIndex}
                activeWord={activeWord}
                accentColor={theme.accent}
                isDark={dark}
                as="h2"
                style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginBottom: '8px', letterSpacing: '-0.02em' }}
              />
              <HighlightedChunkText
                text="Keep these core ideas in mind as we dive into each structured lesson."
                chunkIndex={chunkMap.summary ?? 1}
                activeChunkIndex={activeChunkIndex}
                activeWord={activeWord}
                accentColor={theme.accent}
                isDark={dark}
                as="p"
                style={{ fontSize: '0.875rem', color: textSecondary, marginBottom: '22px' }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {topic.key_concepts.map((kc, idx) => {
                  const conceptMap = chunkMap.concepts ? chunkMap.concepts[idx] : undefined;
                  const isConceptActive =
                    conceptMap &&
                    (activeChunkIndex === conceptMap.title || activeChunkIndex === conceptMap.desc);
                  return (
                    <div
                      key={idx}
                      style={{
                        background: dark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                        border: `1px solid ${isConceptActive ? theme.accent : theme.cardBorder}`,
                        borderRadius: '14px',
                        padding: '16px 18px',
                        boxShadow: isConceptActive ? `0 0 0 2px ${theme.accent}30` : 'none',
                        transition: 'border-color 200ms ease, box-shadow 200ms ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: `${theme.accent}20`,
                            color: theme.accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {idx + 1}
                        </span>
                        <HighlightedChunkText
                          text={kc.title}
                          chunkIndex={conceptMap ? conceptMap.title : -1}
                          activeChunkIndex={activeChunkIndex}
                          activeWord={activeWord}
                          accentColor={theme.accent}
                          isDark={dark}
                          as="h3"
                          style={{ fontSize: '1rem', fontWeight: 700, color: textPrimary, margin: 0 }}
                        />
                      </div>
                      <div style={{ paddingLeft: '34px' }}>
                        <HighlightedChunkText
                          text={kc.description}
                          chunkIndex={conceptMap ? conceptMap.desc : -1}
                          activeChunkIndex={activeChunkIndex}
                          activeWord={activeWord}
                          accentColor={theme.accent}
                          isDark={dark}
                          as="p"
                          style={{ fontSize: '0.875rem', color: textSecondary, lineHeight: 1.55, margin: 0 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: SECTION LESSON                                        */}
          {/* ============================================================ */}
          {currentStep.type === 'section' && (
            <div style={cardStyle} className="swallern-anim-reveal">
              <Badge variant="indigo" size="sm" style={{ marginBottom: '14px' }}>
                Lesson Material
              </Badge>

              <HighlightedChunkText
                text={currentStep.title}
                chunkIndex={chunkMap.title}
                activeChunkIndex={activeChunkIndex}
                activeWord={activeWord}
                accentColor={theme.accent}
                isDark={dark}
                as="h2"
                style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginBottom: '16px', letterSpacing: '-0.02em' }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {currentStep.content?.split(/\n\n+/).map((para, idx) => (
                  <HighlightedChunkText
                    key={idx}
                    text={para}
                    chunkIndex={chunkMap.paragraphs ? chunkMap.paragraphs[idx] : idx + 1}
                    activeChunkIndex={activeChunkIndex}
                    activeWord={activeWord}
                    accentColor={theme.accent}
                    isDark={dark}
                    as="p"
                    style={{
                      fontSize: '0.9375rem',
                      color: textSecondary,
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  />
                ))}
              </div>

              {currentStep.takeaway && (
                <div
                  style={{
                    ...takeawayStyle,
                    boxShadow:
                      (chunkMap.takeawayText && activeChunkIndex === chunkMap.takeawayText) ||
                      (chunkMap.takeawayLabel && activeChunkIndex === chunkMap.takeawayLabel)
                        ? '0 0 0 2px rgba(5, 150, 105, 0.4)'
                        : 'none',
                    transition: 'box-shadow 200ms ease',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    <HighlightedChunkText
                      text="Key Takeaway"
                      chunkIndex={chunkMap.takeawayLabel ?? -1}
                      activeChunkIndex={activeChunkIndex}
                      activeWord={activeWord}
                      accentColor="#059669"
                      isDark={dark}
                    />
                  </div>
                  <HighlightedChunkText
                    text={currentStep.takeaway}
                    chunkIndex={chunkMap.takeawayText ?? -1}
                    activeChunkIndex={activeChunkIndex}
                    activeWord={activeWord}
                    accentColor="#059669"
                    isDark={dark}
                    as="p"
                    style={{ margin: 0, fontSize: '0.90625rem', color: textPrimary, fontWeight: 600, lineHeight: 1.5 }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 5: REVIEW LAUNCH (Milestone before final review)         */}
          {/* ============================================================ */}
          {currentStep.type === 'review-launch' && (
            <div
              style={{
                ...cardStyle,
                textAlign: 'center',
                padding: '40px 28px',
              }}
              className="swallern-anim-reveal"
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: dark ? `${theme.accent}25` : '#EEF2FF',
                  color: theme.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-2.34" />
                  <path d="M14 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
                </svg>
              </div>

              <Badge variant="indigo" size="sm" style={{ marginBottom: '14px' }}>
                Course Milestone
              </Badge>

              <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: textPrimary, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
                You&apos;ve reached the end of the lessons
              </h2>

              <p style={{ fontSize: '0.9375rem', color: textSecondary, maxWidth: '480px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
                {quizQuestions.length > 0
                  ? `Ready to see what you remember? Complete the ${quizQuestions.length} knowledge check questions to earn course completion.`
                  : 'Review the key takeaways and confirm your understanding to complete the course.'}
              </p>

              <Button
                variant="primary"
                size="lg"
                onClick={() => advanceStep(currentStepIndex + 1)}
                style={{
                  height: '46px',
                  padding: '0 28px',
                  borderRadius: '23px',
                  fontWeight: 800,
                  fontSize: '0.9375rem',
                  boxShadow: `0 4px 16px ${theme.accent}40`,
                }}
              >
                {quizQuestions.length > 0 ? 'Start Course Review →' : 'Complete Course →'}
              </Button>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 6: QUIZ / REVIEW QUESTION                                */}
          {/* ============================================================ */}
          {currentStep.type === 'quiz' && currentStep.quizQuestion && (
            <div style={cardStyle} className="swallern-anim-reveal">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Badge variant="indigo" size="sm">
                  Review Question {currentStep.quizIndex} of {currentStep.totalQuizQuestions}
                </Badge>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: textSecondary }}>
                  Knowledge Check
                </span>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: textPrimary, marginBottom: '20px', lineHeight: 1.4 }}>
                {currentStep.quizQuestion.question}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {currentStep.quizQuestion.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isAnswered = !!selectedOptionId;
                  const showCorrect = isAnswered && opt.is_correct;
                  const showWrong = isSelected && !opt.is_correct;

                  let optBg = dark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
                  let optBorder = borderColor;
                  let optColor = textPrimary;

                  if (showCorrect) {
                    optBg = dark ? 'rgba(5,150,105,0.18)' : '#F0FDF4';
                    optBorder = '#22C55E';
                    optColor = dark ? '#6EE7B7' : '#15803D';
                  } else if (showWrong) {
                    optBg = dark ? 'rgba(239,68,68,0.15)' : '#FEF2F2';
                    optBorder = '#EF4444';
                    optColor = dark ? '#FCA5A5' : '#B91C1C';
                  }

                  const isDisabled = !!selectedOptionId && !isSelected && quizState === 'correct';

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleQuizSelect(opt.id, opt.is_correct, currentStep.quizIndex)}
                      disabled={isDisabled}
                      style={{
                        textAlign: 'left',
                        padding: '14px 18px',
                        borderRadius: '14px',
                        background: optBg,
                        border: `1.5px solid ${optBorder}`,
                        color: optColor,
                        fontSize: '0.90625rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: isDisabled ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                        opacity: isDisabled ? 0.45 : 1,
                        lineHeight: 1.45,
                        outline: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: `1.5px solid ${optBorder}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '1px',
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                          }}
                        >
                          {showCorrect ? '✓' : showWrong ? '✕' : ''}
                        </span>
                        <span>{opt.option_text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {quizState === 'correct' && (
                <EmotionalFeedback
                  state="correct"
                  title="That's right!"
                  message={currentStep.quizQuestion.explanation || 'Great job understanding this concept.'}
                />
              )}

              {quizState === 'incorrect' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <EmotionalFeedback
                    state="incorrect"
                    title="Not quite. Let's think again."
                    message="Consider the core principle taught in the previous lesson sections, then try another answer."
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedOptionId(null);
                      setQuizState('idle');
                    }}
                    style={{ alignSelf: 'flex-start', color: '#6366F1', fontWeight: 700 }}
                  >
                    ↺ Try another answer
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 7: COURSE COMPLETION                                     */}
          {/* ============================================================ */}
          {currentStep.type === 'completion' && (
            <div
              style={{
                ...cardStyle,
                textAlign: 'center',
                border: `1px solid ${dark ? '#1E3A5F' : '#A7F3D0'}`,
                padding: '36px 28px',
              }}
              className="swallern-anim-reveal"
            >
              {/* Mascot celebration */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <SwallernCharacter
                  characterId="swallern_bear_v1"
                  expression="celebrating"
                  pose="celebrating"
                  size={120}
                />
              </div>

              <Badge variant="success" size="md" style={{ marginBottom: '14px' }}>
                🎉 Course Complete
              </Badge>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: textPrimary, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
                {topic.title}
              </h2>

              <p style={{ fontSize: '0.9375rem', color: textSecondary, marginBottom: '24px', lineHeight: 1.6 }}>
                Outstanding work! You explored and completed the full structured learning curriculum.
              </p>

              {/* Accomplishment Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                  marginBottom: '28px',
                }}
              >
                <div
                  style={{
                    backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '14px',
                    padding: '14px',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                    {totalSteps - 1} / {totalSteps - 1}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 600, marginTop: '2px' }}>
                    Steps Completed
                  </div>
                </div>

                {quizQuestions.length > 0 && (
                  <div
                    style={{
                      backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                      border: `1px solid ${borderColor}`,
                      borderRadius: '14px',
                      padding: '14px',
                    }}
                  >
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6366F1' }}>
                      {Object.keys(quizScores).length || quizQuestions.length} / {quizQuestions.length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 600, marginTop: '2px' }}>
                      Final Review Score
                    </div>
                  </div>
                )}
              </div>

              {/* Explored concepts summary */}
              {topic.key_concepts.length > 0 && (
                <div
                  style={{
                    background: dark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                    padding: '18px 20px',
                    borderRadius: '14px',
                    textAlign: 'left',
                    marginBottom: '28px',
                    border: `1px solid ${theme.cardBorder}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      color: theme.accent,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      marginBottom: '12px',
                    }}
                  >
                    What You Mastered
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {topic.key_concepts.map((kc, idx) => (
                      <div key={idx} style={{ fontSize: '0.875rem', color: textSecondary, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '3px' }}>
                          <circle cx="7" cy="7" r="7" fill="#DCFCE7"/>
                          <path d="M4 7L6.5 9.5L10 5" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ lineHeight: 1.45 }}>{kc.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                <Link href="/explore" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="md">
                    Explore Another Topic →
                  </Button>
                </Link>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    // Review course from beginning without resetting completion status
                    setCurrentStepIndex(0);
                  }}
                >
                  ↺ Review Course Again
                </Button>

                <Link href={`/topics/${topic.slug}`} style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="md">
                    Course Overview
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP NAVIGATION CONTROLS                                      */}
          {/* ============================================================ */}
          {!isLastStep && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => advanceStep(currentStepIndex - 1)}
                disabled={currentStepIndex === 0}
                style={{ height: '40px', padding: '0 18px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Previous
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => advanceStep(currentStepIndex + 1)}
                disabled={currentStep.type === 'quiz' && quizState !== 'correct'}
                style={{
                  height: '40px',
                  padding: '0 22px',
                  borderRadius: '20px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {currentStep.type === 'quiz' && quizState === 'idle'
                  ? 'Select answer to continue'
                  : currentStep.type === 'quiz' && quizState === 'incorrect'
                  ? 'Try again to continue'
                  : currentStep.type === 'review-launch'
                  ? 'Start Review →'
                  : 'Continue'}
                {!(currentStep.type === 'quiz' && quizState !== 'correct') && currentStep.type !== 'review-launch' && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </Button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
