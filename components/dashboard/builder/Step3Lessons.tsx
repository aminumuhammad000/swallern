'use client';

import React, { useState, useEffect } from 'react';
import { BuilderCourseData, BuilderLessonData } from './types';
import { countWords, validateFieldWordCount } from '@/lib/learning/validation';
import { getLessonValidation } from './stepValidation';
import { SwallernVisualSelector } from '@/components/visuals/SwallernVisualSelector';

interface Step3LessonsProps {
  data: BuilderCourseData;
  onChange: (updated: Partial<BuilderCourseData>) => void;
  jumpToSectionIdx?: number;
  jumpToLessonIdx?: number;
}

/**
 * Step 3 — Focused Master-Detail Lesson Editor
 * Desktop: Left course outline sidebar with real-time error badges,
 * Right focused active lesson editor with instant live feedback indicators.
 */
export const Step3Lessons: React.FC<Step3LessonsProps> = ({
  data,
  onChange,
  jumpToSectionIdx,
  jumpToLessonIdx,
}) => {
  const [activeSecIdx, setActiveSecIdx] = useState(0);
  const [activeLesIdx, setActiveLesIdx] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (jumpToSectionIdx !== undefined) setActiveSecIdx(jumpToSectionIdx);
    if (jumpToLessonIdx !== undefined) setActiveLesIdx(jumpToLessonIdx);
  }, [jumpToSectionIdx, jumpToLessonIdx]);

  const sections = data.sections || [];
  const currentSec = sections[activeSecIdx] || sections[0];
  const currentLes = currentSec?.lessons?.[activeLesIdx] || currentSec?.lessons?.[0];

  if (!currentLes) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
        No lessons available. Please add lessons in Step 2 (Structure).
      </div>
    );
  }

  const updateCurrentLesson = (patch: Partial<BuilderLessonData>) => {
    const updatedSections = sections.map((sec, sIdx) => {
      if (sIdx === activeSecIdx) {
        const lessons = sec.lessons.map((les, lIdx) => {
          if (lIdx === activeLesIdx) {
            return { ...les, ...patch };
          }
          return les;
        });
        return { ...sec, lessons };
      }
      return sec;
    });
    onChange({ sections: updatedSections });
  };

  // Active lesson validation
  const activeLesErrors = getLessonValidation(currentLes, activeSecIdx, activeLesIdx);
  const titleVal = validateFieldWordCount(currentLes.title, 'lessonTitle');
  const titleWords = countWords(currentLes.title);

  const expWords = countWords(currentLes.content);
  const expVal = validateFieldWordCount(currentLes.content, 'lessonExplanation');

  const kcQuestion = currentLes.knowledge_check?.question || '';
  const qWords = countWords(kcQuestion);
  const qVal = validateFieldWordCount(kcQuestion, 'quizQuestion');

  const kcConcept = currentLes.key_concept || '';
  const kcConceptWords = countWords(kcConcept);
  const kcConceptVal = kcConcept.trim() ? validateFieldWordCount(kcConcept, 'keyConcept') : { valid: true, message: '' };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1.5px solid #CBD5E1',
    fontSize: '0.875rem',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '4px',
    display: 'block',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '1.25rem', minHeight: '520px' }}>
      {/* Left Sidebar: Course Outline Tree with Instant Error Badges */}
      <div
        className="swallern-scrollbar"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1.5px solid #E2E8F0',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto',
          maxHeight: '660px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Course Lessons
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
            {sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0)} Total
          </span>
        </div>

        {sections.map((sec, sIdx) => (
          <div key={sec.id || sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', padding: '2px 4px' }}>
              Module {sIdx + 1}: {sec.title}
            </div>

            {sec.lessons.map((les, lIdx) => {
              const isActive = sIdx === activeSecIdx && lIdx === activeLesIdx;
              const errors = getLessonValidation(les, sIdx, lIdx);
              const isValid = errors.length === 0;

              return (
                <button
                  key={les.id || lIdx}
                  type="button"
                  onClick={() => {
                    setActiveSecIdx(sIdx);
                    setActiveLesIdx(lIdx);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: isActive ? '1.5px solid #2563EB' : isValid ? '1px solid #E2E8F0' : '1px solid #FECACA',
                    backgroundColor: isActive ? '#EFF6FF' : isValid ? '#FFFFFF' : '#FEF2F2',
                    color: isActive ? '#1E40AF' : isValid ? '#334155' : '#991B1B',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {lIdx + 1}. {les.title || 'Untitled Lesson'}
                  </span>

                  {isValid ? (
                    <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }} title="All requirements met">
                      ✓
                    </span>
                  ) : (
                    <span
                      style={{
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        flexShrink: 0,
                      }}
                      title={`${errors.length} pending issue${errors.length > 1 ? 's' : ''}`}
                    >
                      ⚠️ {errors.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Right Column: Active Lesson Content Editor */}
      <div
        className="swallern-scrollbar"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1.5px solid #E2E8F0',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          maxHeight: '660px',
          overflowY: 'auto',
        }}
      >
        {/* Active Lesson Header with Live Errors Summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Module {activeSecIdx + 1} · Lesson {activeLesIdx + 1} of {currentSec?.lessons?.length || 1}
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 0' }}>
              {currentLes.title ? currentLes.title : 'Edit Lesson Details'}
            </h3>
          </div>

          {activeLesErrors.length === 0 ? (
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>✓</span> Lesson Requirements Met
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', padding: '4px 10px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>⚠️</span> {activeLesErrors.length} Requirement{activeLesErrors.length > 1 ? 's' : ''} Pending
            </span>
          )}
        </div>

        {/* Lesson Title Input */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={labelStyle}>
              Lesson Title *
            </label>
            <span style={{ fontSize: '0.72rem', color: titleVal.valid ? '#059669' : '#DC2626', fontWeight: 700 }}>
              {titleWords} / 12 words
            </span>
          </div>
          <input
            type="text"
            placeholder="e.g. Building Fat Reserves"
            value={currentLes.title}
            onChange={(e) => updateCurrentLesson({ title: e.target.value })}
            style={{
              ...inputStyle,
              borderColor: titleVal.valid || !currentLes.title ? '#CBD5E1' : '#EF4444',
            }}
          />
          {!titleVal.valid && currentLes.title && (
            <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block', fontWeight: 600 }}>
              ⚠️ {titleVal.message}
            </span>
          )}
        </div>

        {/* Lesson Explanation (Bite-Sized: 30-120 words) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={labelStyle}>
              Bite-Sized Explanation (30–120 words) *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: expVal.valid ? '#059669' : '#DC2626',
                  backgroundColor: expVal.valid ? '#ECFDF5' : '#FEF2F2',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                {expWords} / 120 words {expWords < 30 ? `(Need ${30 - expWords} more)` : expWords > 120 ? `(${expWords - 120} over max)` : '✓'}
              </span>
            </div>
          </div>
          <textarea
            rows={5}
            placeholder="Write clear, bite-sized explanation (30 to 120 words)..."
            value={currentLes.content}
            onChange={(e) => updateCurrentLesson({ content: e.target.value })}
            style={{
              ...inputStyle,
              height: 'auto',
              padding: '10px 12px',
              lineHeight: 1.6,
              borderColor: expVal.valid || !currentLes.content ? '#CBD5E1' : '#EF4444',
            }}
          />
          {!expVal.valid && currentLes.content && (
            <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block', fontWeight: 600 }}>
              ⚠️ {expVal.message}
            </span>
          )}
        </div>

        {/* Key Concept Takeaway */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={labelStyle}>Key Concept (Takeaway: 5–30 words)</label>
            {kcConcept.trim() && (
              <span style={{ fontSize: '0.72rem', color: kcConceptVal.valid ? '#059669' : '#DC2626', fontWeight: 700 }}>
                {kcConceptWords} / 30 words
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="e.g. Hyperphagia is a biological state that drives non-stop pre-hibernation weight gain."
            value={currentLes.key_concept || ''}
            onChange={(e) => updateCurrentLesson({ key_concept: e.target.value })}
            style={{
              ...inputStyle,
              borderColor: kcConceptVal.valid ? '#CBD5E1' : '#EF4444',
            }}
          />
          {!kcConceptVal.valid && (
            <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block', fontWeight: 600 }}>
              ⚠️ {kcConceptVal.message}
            </span>
          )}
        </div>

        {/* Interactive Knowledge Check Section with Live Validation */}
        <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1.5px solid #E2E8F0', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, color: '#D97706', marginBottom: '10px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span>Interactive Knowledge Check *</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Question */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={labelStyle}>Question (5–25 words) *</label>
                <span style={{ fontSize: '0.72rem', color: qVal.valid ? '#059669' : '#DC2626', fontWeight: 700 }}>
                  {qWords} / 25 words
                </span>
              </div>
              <input
                type="text"
                placeholder="e.g. What biological state triggers bears to eat non-stop in autumn?"
                value={currentLes.knowledge_check?.question || ''}
                onChange={(e) =>
                  updateCurrentLesson({
                    knowledge_check: {
                      ...(currentLes.knowledge_check || { options: [] }),
                      question: e.target.value,
                    },
                  })
                }
                style={{
                  ...inputStyle,
                  borderColor: qVal.valid || !kcQuestion ? '#CBD5E1' : '#EF4444',
                }}
              />
              {!qVal.valid && kcQuestion && (
                <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  ⚠️ {qVal.message}
                </span>
              )}
            </div>

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ ...labelStyle, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>✓ Option A (Correct Answer) *</span>
                </label>
                <input
                  type="text"
                  placeholder="Correct answer text..."
                  value={currentLes.knowledge_check?.options?.[0]?.text || ''}
                  onChange={(e) => {
                    const opts = [...(currentLes.knowledge_check?.options || [])];
                    opts[0] = { text: e.target.value, is_correct: true };
                    updateCurrentLesson({
                      knowledge_check: {
                        ...(currentLes.knowledge_check || { question: '' }),
                        options: opts,
                      },
                    });
                  }}
                  style={{
                    ...inputStyle,
                    borderColor: currentLes.knowledge_check?.options?.[0]?.text ? '#10B981' : '#CBD5E1',
                  }}
                />
              </div>

              <div>
                <label style={{ ...labelStyle, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>✗ Option B (Distractor) *</span>
                </label>
                <input
                  type="text"
                  placeholder="Incorrect distractor text..."
                  value={currentLes.knowledge_check?.options?.[1]?.text || ''}
                  onChange={(e) => {
                    const opts = [...(currentLes.knowledge_check?.options || [])];
                    opts[1] = { text: e.target.value, is_correct: false };
                    updateCurrentLesson({
                      knowledge_check: {
                        ...(currentLes.knowledge_check || { question: '' }),
                        options: opts,
                      },
                    });
                  }}
                  style={{
                    ...inputStyle,
                    borderColor: currentLes.knowledge_check?.options?.[1]?.text ? '#CBD5E1' : '#CBD5E1',
                  }}
                />
              </div>
            </div>

            {/* Optional Explanation */}
            <div>
              <label style={labelStyle}>Answer Explanation (Optional)</label>
              <input
                type="text"
                placeholder="Explain why Option A is correct..."
                value={currentLes.knowledge_check?.explanation || ''}
                onChange={(e) =>
                  updateCurrentLesson({
                    knowledge_check: {
                      ...(currentLes.knowledge_check || { question: '', options: [] }),
                      explanation: e.target.value,
                    },
                  })
                }
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Visual Settings */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563EB',
              fontWeight: 800,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: showAdvanced ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.15s ease',
              }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span>{showAdvanced ? 'Hide Mascot & Visual Settings' : 'Configure Mascot & Visual Engine Settings'}</span>
          </button>

          {showAdvanced && (
            <div style={{ marginTop: '10px' }}>
              <SwallernVisualSelector
                value={currentLes.visual}
                onChange={(val) => updateCurrentLesson({ visual: val })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
