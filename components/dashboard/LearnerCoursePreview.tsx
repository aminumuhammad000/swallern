'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { countWords, SWALLERN_CONTENT_LIMITS } from '@/lib/learning/validation';
import { SwallernVisual } from '@/components/visuals/SwallernVisual';
import { buildVisualRequirement } from '@/lib/visuals/requirements';

export interface CoursePreviewProps {
  courseData: {
    title: string;
    summary: string;
    category?: string;
    difficulty?: string;
    visibility?: string;
    learning_objective?: string;
    sections: Array<{
      id?: string;
      title: string;
      summary?: string;
      lessons: Array<{
        id?: string;
        title: string;
        content: string;
        key_concept?: string;
        visual?: {
          mode?: string;
          characterId?: string;
          character?: string;
          expression?: string;
          pose?: string;
        };
        visual_requirement?: any;
        media?: Array<{
          type?: string;
          url?: string;
          asset_key?: string;
          credit?: string;
          source_url?: string;
        }>;
        knowledge_check?: {
          question: string;
          explanation?: string;
          options: Array<{
            text?: string;
            option_text?: string;
            is_correct: boolean;
          }>;
        };
      }>;
    }>;
    final_quiz?: {
      title?: string;
      passing_score?: number;
      questions: Array<{
        question: string;
        explanation?: string;
        options: Array<{
          text?: string;
          option_text?: string;
          is_correct: boolean;
        }>;
      }>;
    };
    quiz?: {
      title?: string;
      passing_score?: number;
      questions: Array<{
        question: string;
        explanation?: string;
        options: Array<{
          text?: string;
          option_text?: string;
          is_correct: boolean;
        }>;
      }>;
    };
    sources?: Array<{
      id?: string;
      title: string;
      url: string;
      publisher?: string;
    }>;
  };
  onClose: () => void;
  onSubmitCourse?: () => void;
  submitLabel?: string;
}

type PreviewViewMode = 'lesson' | 'quiz' | 'sources' | 'overview';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export function LearnerCoursePreview({
  courseData,
  onClose,
  onSubmitCourse,
  submitLabel = 'Submit Course for Review',
}: CoursePreviewProps) {
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [viewMode, setViewMode] = useState<PreviewViewMode>('lesson');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');

  // Knowledge check interactive state: lessonKey -> selectedOptionIndex
  const [selectedKcOptions, setSelectedKcOptions] = useState<Record<string, number>>({});
  
  // Final Quiz interactive state: questionIndex -> selectedOptionIndex
  const [selectedQuizOptions, setSelectedQuizOptions] = useState<Record<number, number>>({});

  const sections = courseData.sections || [];
  const currentSection = sections[activeSectionIdx] || sections[0];
  const currentLesson = currentSection?.lessons?.[activeLessonIdx] || currentSection?.lessons?.[0];

  const finalQuiz = courseData.final_quiz || courseData.quiz;
  const quizQuestions = finalQuiz?.questions || [];
  const sources = courseData.sources || [];

  // Calculate total lessons
  const totalLessons = useMemo(() => {
    return sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0);
  }, [sections]);

  // Calculate global lesson index (1-indexed)
  const currentGlobalLessonNumber = useMemo(() => {
    let count = 0;
    for (let s = 0; s < sections.length; s++) {
      if (s < activeSectionIdx) {
        count += sections[s].lessons?.length || 0;
      } else if (s === activeSectionIdx) {
        count += activeLessonIdx + 1;
        break;
      }
    }
    return count || 1;
  }, [sections, activeSectionIdx, activeLessonIdx]);

  const lessonKey = `${activeSectionIdx}-${activeLessonIdx}`;
  const selectedOptionIdx = selectedKcOptions[lessonKey];

  // Completed lessons tracking
  const completedKeys = useMemo(() => new Set(Object.keys(selectedKcOptions)), [selectedKcOptions]);
  const completedCount = completedKeys.size;
  const progressPercent = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

  // Final Quiz Score
  const quizScoreData = useMemo(() => {
    if (!quizQuestions.length) return { answered: 0, correct: 0, percent: 0, passed: false };
    let correct = 0;
    let answered = 0;
    quizQuestions.forEach((q, qIdx) => {
      const selected = selectedQuizOptions[qIdx];
      if (selected !== undefined) {
        answered++;
        const opt = q.options[selected];
        if (opt && opt.is_correct) correct++;
      }
    });
    const percent = Math.round((correct / quizQuestions.length) * 100);
    const passingScore = finalQuiz?.passing_score || 80;
    return {
      answered,
      correct,
      percent,
      passed: answered === quizQuestions.length && percent >= passingScore,
    };
  }, [quizQuestions, selectedQuizOptions, finalQuiz]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Navigate to Next Lesson
  const handleNextLesson = () => {
    const currentSecLessons = currentSection?.lessons || [];
    if (activeLessonIdx < currentSecLessons.length - 1) {
      setActiveLessonIdx(activeLessonIdx + 1);
    } else if (activeSectionIdx < sections.length - 1) {
      setActiveSectionIdx(activeSectionIdx + 1);
      setActiveLessonIdx(0);
    } else if (quizQuestions.length > 0) {
      setViewMode('quiz');
    }
  };

  // Navigate to Previous Lesson
  const handlePrevLesson = () => {
    if (activeLessonIdx > 0) {
      setActiveLessonIdx(activeLessonIdx - 1);
    } else if (activeSectionIdx > 0) {
      const prevSec = sections[activeSectionIdx - 1];
      setActiveSectionIdx(activeSectionIdx - 1);
      setActiveLessonIdx((prevSec.lessons?.length || 1) - 1);
    }
  };

  const isFirstLesson = activeSectionIdx === 0 && activeLessonIdx === 0;
  const isLastLesson =
    activeSectionIdx === sections.length - 1 &&
    activeLessonIdx === (sections[sections.length - 1]?.lessons?.length || 1) - 1;

  // Responsive device container styling
  const getDeviceContainerStyle = (): React.CSSProperties => {
    if (deviceMode === 'mobile') {
      return {
        width: '390px',
        height: '780px',
        maxHeight: '85vh',
        borderRadius: '36px',
        border: '10px solid #1E293B',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      };
    }
    if (deviceMode === 'tablet') {
      return {
        width: '768px',
        height: '88vh',
        borderRadius: '24px',
        border: '6px solid #1E293B',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
      };
    }
    return {
      width: '100%',
      maxWidth: '1120px',
      height: '92vh',
      borderRadius: '20px',
      border: '1.5px solid #334155',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45)',
    };
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: 'var(--font-plus-jakarta), sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          ...getDeviceContainerStyle(),
        }}
      >
        {/* ───────────────────────────────────────────────────────────── */}
        {/* TOP PREVIEW HEADER & DEVICE SIMULATOR BAR                     */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: '#1E1B4B',
            background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          {/* Left: Badge & Course Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '8px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span style={{ fontSize: '0.75rem' }}>✨</span>
              <span>Learner Experience Preview</span>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#E2E8F0', fontWeight: 700, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {courseData.title}
              </span>
              {courseData.category && (
                <span style={{ fontSize: '0.7rem', color: '#A5B4FC', backgroundColor: 'rgba(99, 102, 241, 0.2)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  {courseData.category}
                </span>
              )}
            </div>
          </div>

          {/* Center: Device Simulation Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              padding: '2px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            {[
              {
                id: 'desktop',
                label: 'Desktop',
                icon: (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                ),
              },
              {
                id: 'tablet',
                label: 'Tablet',
                icon: (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                ),
              },
              {
                id: 'mobile',
                label: 'Mobile',
                icon: (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                ),
              },
            ].map((dev) => {
              const active = deviceMode === dev.id;
              return (
                <button
                  key={dev.id}
                  type="button"
                  onClick={() => setDeviceMode(dev.id as DeviceMode)}
                  title={`Preview on ${dev.label}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: active ? '#4F46E5' : 'transparent',
                    color: active ? '#FFFFFF' : '#94A3B8',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {dev.icon}
                  <span style={{ display: deviceMode === 'mobile' ? 'none' : 'inline' }}>{dev.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Progress Pill & Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.7rem', color: '#A5B4FC', fontWeight: 700 }}>
                  Lesson {currentGlobalLessonNumber} of {totalLessons}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{progressPercent}% Complete</span>
              </div>
              <div style={{ width: '80px', height: '6px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#10B981', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <button
              onClick={onClose}
              title="Close Preview (Esc)"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#E2E8F0',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                cursor: 'pointer',
                lineHeight: 1,
                transition: 'all 0.15s ease',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* VIEW NAVIGATION TABS (Lessons, Final Quiz, Sources)           */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: '#0F172A',
            borderBottom: '1px solid #1E293B',
            padding: '0.4rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            overflowX: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setViewMode('lesson')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'lesson' ? '#3B82F6' : 'transparent',
                color: viewMode === 'lesson' ? '#FFFFFF' : '#94A3B8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>Lesson Material</span>
            </button>

            {quizQuestions.length > 0 && (
              <button
                type="button"
                onClick={() => setViewMode('quiz')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'quiz' ? '#8B5CF6' : 'transparent',
                  color: viewMode === 'quiz' ? '#FFFFFF' : '#94A3B8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Final Quiz ({quizQuestions.length})</span>
                {quizScoreData.passed && <span style={{ fontSize: '0.7rem' }}>✓</span>}
              </button>
            )}

            {sources.length > 0 && (
              <button
                type="button"
                onClick={() => setViewMode('sources')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'sources' ? '#10B981' : 'transparent',
                  color: viewMode === 'sources' ? '#FFFFFF' : '#94A3B8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>Citations & Sources ({sources.length})</span>
              </button>
            )}
          </div>

          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
            Simulated Classroom Environment
          </span>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* MAIN BODY: SIDEBAR + CONTENT CANVAS                           */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: deviceMode === 'mobile' ? '1fr' : '280px 1fr',
            overflow: 'hidden',
            backgroundColor: '#F8FAFC',
          }}
        >
          {/* Left Course Curriculum Sidebar (Visible on Desktop / Tablet) */}
          {deviceMode !== 'mobile' && (
            <div
              className="swallern-scrollbar"
              style={{
                backgroundColor: '#FFFFFF',
                borderRight: '1px solid #E2E8F0',
                padding: '1.25rem 1rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {/* Course Identity Card */}
              <div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: '#4F46E5',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {courseData.category || 'General Science'} · {courseData.difficulty || 'BEGINNER'}
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '4px 0 6px', lineHeight: 1.3 }}>
                  {courseData.title}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                  {courseData.summary}
                </p>
              </div>

              {/* Modules Outline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Course Modules ({sections.length})
                </div>

                {sections.map((sec, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      backgroundColor: sIdx === activeSectionIdx && viewMode === 'lesson' ? '#F8FAFC' : 'transparent',
                      borderRadius: '10px',
                      padding: '8px',
                      border: sIdx === activeSectionIdx && viewMode === 'lesson' ? '1px solid #E2E8F0' : '1px solid transparent',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: sIdx === activeSectionIdx && viewMode === 'lesson' ? '#2563EB' : '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sIdx + 1}. {sec.title}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>
                        {sec.lessons?.length || 0} les
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingLeft: '4px' }}>
                      {sec.lessons?.map((les, lIdx) => {
                        const isActive = sIdx === activeSectionIdx && lIdx === activeLessonIdx && viewMode === 'lesson';
                        const currentKey = `${sIdx}-${lIdx}`;
                        const isCompleted = selectedKcOptions[currentKey] !== undefined;

                        return (
                          <button
                            key={lIdx}
                            type="button"
                            onClick={() => {
                              setActiveSectionIdx(sIdx);
                              setActiveLessonIdx(lIdx);
                              setViewMode('lesson');
                            }}
                            style={{
                              textAlign: 'left',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                              color: isActive ? '#2563EB' : '#64748B',
                              fontWeight: isActive ? 800 : 600,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.12s ease',
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {lIdx + 1}. {les.title}
                            </span>
                            {isCompleted ? (
                              <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 800 }}>✓</span>
                            ) : (
                              <span style={{ color: '#CBD5E1', fontSize: '0.7rem' }}>•</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Quick Links */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {quizQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setViewMode('quiz')}
                    style={{
                      textAlign: 'left',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: viewMode === 'quiz' ? '#F5F3FF' : 'transparent',
                      color: viewMode === 'quiz' ? '#7C3AED' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>🎯 Final Quiz Exam</span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{quizQuestions.length} Qs</span>
                  </button>
                )}

                {sources.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setViewMode('sources')}
                    style={{
                      textAlign: 'left',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: viewMode === 'sources' ? '#ECFDF5' : 'transparent',
                      color: viewMode === 'sources' ? '#059669' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>📚 Sources & Research</span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{sources.length}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Right Main Interactive Content Canvas */}
          <div
            className="swallern-scrollbar"
            style={{
              padding: deviceMode === 'mobile' ? '1.25rem 1rem' : '2rem 2.5rem',
              overflowY: 'auto',
              backgroundColor: '#F8FAFC',
              color: '#0F172A',
            }}
          >
            {/* ────────── VIEW 1: LESSON MATERIAL ────────── */}
            {viewMode === 'lesson' && currentLesson && (
              <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Lesson Header with Breadcrumb & Metadata */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Module {activeSectionIdx + 1} · Lesson {activeLessonIdx + 1} of {currentSection?.lessons?.length || 1}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                      ⏱️ ~1 min bite-sized study
                    </span>
                  </div>

                  <h1 style={{ fontSize: deviceMode === 'mobile' ? '1.35rem' : '1.75rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px', lineHeight: 1.3 }}>
                    {currentLesson.title}
                  </h1>

                  {/* Word Count Indicator Meter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#059669',
                        backgroundColor: '#ECFDF5',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        border: '1px solid #A7F3D0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{countWords(currentLesson.content)} / {SWALLERN_CONTENT_LIMITS.lessonExplanation.maxWords} words (Bite-Sized)</span>
                    </span>
                  </div>
                </div>

                {/* Swallern Visual Renderer (Mascot & Visual Engine) */}
                {(() => {
                  const modeSetting = currentLesson.visual?.mode;
                  const prefMode = modeSetting && modeSetting !== 'auto' ? (modeSetting as any) : undefined;
                  const charId = currentLesson.visual?.characterId || currentLesson.visual?.character || 'swallern_bear_v1';
                  const req =
                    currentLesson.visual_requirement ||
                    buildVisualRequirement(currentLesson.title, currentLesson.content, {
                      preferredMode: prefMode,
                      characterId: charId,
                    });
                  if (currentLesson.visual?.expression) req.emotion = currentLesson.visual.expression as any;
                  if (currentLesson.visual?.pose) req.action = currentLesson.visual.pose as any;

                  return (
                    <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <SwallernVisual requirement={req} />
                    </div>
                  );
                })()}

                {/* Lesson Body Content Card */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '18px',
                    padding: '1.5rem',
                    border: '1.5px solid #E2E8F0',
                    fontSize: '1rem',
                    lineHeight: 1.75,
                    color: '#1E293B',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
                  }}
                >
                  {currentLesson.content}
                </div>

                {/* Key Concept Box */}
                {currentLesson.key_concept && (
                  <div
                    style={{
                      backgroundColor: '#EEF2FF',
                      border: '1.5px solid #C7D2FE',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>💡</span>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4338CA', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Key Takeaway
                      </h4>
                      <p style={{ fontSize: '0.92rem', color: '#1E1B4B', margin: 0, fontWeight: 700, lineHeight: 1.5 }}>
                        {currentLesson.key_concept}
                      </p>
                    </div>
                  </div>
                )}

                {/* Media Display (Images & Animated GIFs) */}
                {currentLesson.media && currentLesson.media.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {currentLesson.media.map((m, mIdx) => {
                      const isGif = (m.type || '').toLowerCase().includes('gif') || (m.url || '').toLowerCase().endsWith('.gif');
                      return (
                        <div
                          key={mIdx}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            border: '1.5px solid #E2E8F0',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          }}
                        >
                          {m.url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={m.url}
                              alt="Lesson Media"
                              style={{ width: '100%', maxHeight: '360px', objectFit: 'cover', display: 'block' }}
                            />
                          ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#F1F5F9', color: '#64748B', fontWeight: 700, fontSize: '0.88rem' }}>
                              🖼️ Media Asset: [{m.asset_key || `media_${mIdx + 1}`}] ({isGif ? 'Animated GIF' : 'Image'})
                            </div>
                          )}

                          {m.credit && (
                            <div style={{ padding: '8px 14px', backgroundColor: '#F8FAFC', fontSize: '0.72rem', color: '#64748B', fontWeight: 500, borderTop: '1px solid #F1F5F9' }}>
                              Photo / Media Credit: {m.credit}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Interactive Knowledge Check Card */}
                {currentLesson.knowledge_check && (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '1.5rem',
                      border: '2px solid #E2E8F0',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🎯 Interactive Knowledge Check</span>
                      </div>
                      {selectedOptionIdx !== undefined && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...selectedKcOptions };
                            delete updated[lessonKey];
                            setSelectedKcOptions(updated);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748B',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Reset Choice
                        </button>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem', lineHeight: 1.4 }}>
                      {currentLesson.knowledge_check.question}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {currentLesson.knowledge_check.options?.map((opt, oIdx) => {
                        const isSelected = selectedOptionIdx === oIdx;
                        const isCorrect = opt.is_correct;

                        let optionBg = '#F8FAFC';
                        let optionBorder = '#E2E8F0';
                        let optionColor = '#0F172A';

                        if (selectedOptionIdx !== undefined) {
                          if (isCorrect) {
                            optionBg = '#ECFDF5';
                            optionBorder = '#10B981';
                            optionColor = '#065F46';
                          } else if (isSelected) {
                            optionBg = '#FEF2F2';
                            optionBorder = '#EF4444';
                            optionColor = '#991B1B';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => {
                              setSelectedKcOptions({
                                ...selectedKcOptions,
                                [lessonKey]: oIdx,
                              });
                            }}
                            style={{
                              textAlign: 'left',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              border: `2px solid ${optionBorder}`,
                              backgroundColor: optionBg,
                              color: optionColor,
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>{opt.text || opt.option_text}</span>
                            {selectedOptionIdx !== undefined && isCorrect && (
                              <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 800 }}>✓ Correct</span>
                            )}
                            {selectedOptionIdx !== undefined && isSelected && !isCorrect && (
                              <span style={{ color: '#DC2626', fontSize: '0.8rem', fontWeight: 800 }}>✗ Incorrect</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selectedOptionIdx !== undefined && currentLesson.knowledge_check.explanation && (
                      <div
                        style={{
                          marginTop: '1rem',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          backgroundColor: '#EEF2FF',
                          border: '1px solid #C7D2FE',
                          color: '#312E81',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          lineHeight: 1.5,
                        }}
                      >
                        💡 <strong>Explanation:</strong> {currentLesson.knowledge_check.explanation}
                      </div>
                    )}
                  </div>
                )}

                {/* Lesson Navigation Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '1rem',
                    borderTop: '1px solid #E2E8F0',
                    gap: '12px',
                  }}
                >
                  <button
                    type="button"
                    onClick={handlePrevLesson}
                    disabled={isFirstLesson}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      color: isFirstLesson ? '#94A3B8' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: isFirstLesson ? 'default' : 'pointer',
                      opacity: isFirstLesson ? 0.5 : 1,
                    }}
                  >
                    <span>← Previous Lesson</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextLesson}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#2563EB',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    <span>{isLastLesson && quizQuestions.length > 0 ? 'Take Final Quiz Exam →' : 'Next Lesson →'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ────────── VIEW 2: FINAL QUIZ EXAM SIMULATOR ────────── */}
            {viewMode === 'quiz' && (
              <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      End-of-Course Evaluation
                    </span>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 0' }}>
                      {finalQuiz?.title || 'Comprehensive Course Quiz'}
                    </h1>
                  </div>

                  <div
                    style={{
                      padding: '8px 14px',
                      borderRadius: '12px',
                      backgroundColor: quizScoreData.passed ? '#ECFDF5' : '#F1F5F9',
                      border: `1.5px solid ${quizScoreData.passed ? '#A7F3D0' : '#CBD5E1'}`,
                      textAlign: 'right',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      Passing Grade: {finalQuiz?.passing_score || 80}%
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: quizScoreData.passed ? '#059669' : '#0F172A' }}>
                      Score: {quizScoreData.correct}/{quizQuestions.length} ({quizScoreData.percent}%)
                    </div>
                  </div>
                </div>

                {quizQuestions.length === 0 ? (
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px dashed #CBD5E1', padding: '3rem 2rem', textAlign: 'center' }}>
                    <p style={{ color: '#64748B', fontWeight: 600, margin: 0 }}>No final quiz questions configured in this course.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {quizQuestions.map((q, qIdx) => {
                      const selectedOpt = selectedQuizOptions[qIdx];
                      return (
                        <div
                          key={qIdx}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            border: '1.5px solid #E2E8F0',
                            padding: '1.25rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          }}
                        >
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Question {qIdx + 1} of {quizQuestions.length}
                          </div>
                          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', margin: '0 0 12px', lineHeight: 1.4 }}>
                            {q.question}
                          </h3>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {q.options.map((opt, oIdx) => {
                              const isSelected = selectedOpt === oIdx;
                              const isCorrect = opt.is_correct;

                              let bg = '#F8FAFC';
                              let border = '#E2E8F0';
                              let color = '#0F172A';

                              if (selectedOpt !== undefined) {
                                if (isCorrect) {
                                  bg = '#ECFDF5';
                                  border = '#10B981';
                                  color = '#065F46';
                                } else if (isSelected) {
                                  bg = '#FEF2F2';
                                  border = '#EF4444';
                                  color = '#991B1B';
                                }
                              }

                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => setSelectedQuizOptions({ ...selectedQuizOptions, [qIdx]: oIdx })}
                                  style={{
                                    textAlign: 'left',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: `1.5px solid ${border}`,
                                    backgroundColor: bg,
                                    color: color,
                                    fontWeight: 700,
                                    fontSize: '0.84rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <span>{opt.text || opt.option_text}</span>
                                  {selectedOpt !== undefined && isCorrect && <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 800 }}>✓ Correct</span>}
                                  {selectedOpt !== undefined && isSelected && !isCorrect && <span style={{ color: '#DC2626', fontSize: '0.75rem', fontWeight: 800 }}>✗ Incorrect</span>}
                                </button>
                              );
                            })}
                          </div>

                          {selectedOpt !== undefined && q.explanation && (
                            <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#F5F3FF', color: '#5B21B6', fontSize: '0.8rem', fontWeight: 600 }}>
                              💡 <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ────────── VIEW 3: CITATIONS & SOURCES ────────── */}
            {viewMode === 'sources' && (
              <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Scientific Rigor & Evidence
                  </span>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 0' }}>
                    Research Citations & Sources
                  </h1>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0' }}>
                    Every Swallern bite-sized course is backed by primary scientific research, public domain databases, and peer-reviewed journals.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sources.map((src, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '14px',
                        border: '1.5px solid #E2E8F0',
                        padding: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                            {src.publisher || 'Verified Source'}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
                          {src.title}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', wordBreak: 'break-all' }}>
                          {src.url}
                        </div>
                      </div>

                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            border: '1px solid #BFDBFE',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span>Visit Source</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* BOTTOM ACTIONS BAR                                            */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: '#0F172A',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#CBD5E1',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '6px 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>← Exit Preview</span>
          </button>

          {onSubmitCourse && (
            <button
              type="button"
              onClick={onSubmitCourse}
              style={{
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                padding: '7px 18px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{submitLabel}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
