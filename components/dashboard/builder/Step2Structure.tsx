'use client';

import React, { useState } from 'react';
import { BuilderCourseData, BuilderLessonData, BuilderSectionData } from './types';

interface Step2StructureProps {
  data: BuilderCourseData;
  onChange: (updated: Partial<BuilderCourseData>) => void;
}

/**
 * Compact Course Outline Hierarchy Editor (Step 2)
 * Replaces giant cards with clean, compact rows, indentation, and contextual inline actions.
 */
export const Step2Structure: React.FC<Step2StructureProps> = ({ data, onChange }) => {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  const sections = data.sections || [];

  const handleAddSection = () => {
    const newSecId = `sec_${Date.now()}`;
    const newSec: BuilderSectionData = {
      id: newSecId,
      title: `Module ${sections.length + 1}`,
      lessons: [
        {
          id: `les_${Date.now()}`,
          title: 'Lesson 1',
          content: 'Write concise 30-120 word lesson explanation here...',
          key_concept: 'Key concept takeaway...',
          visual: {
            mode: 'auto',
            characterId: 'swallern_bear_v1',
            expression: 'curious',
            pose: 'standing',
          },
          knowledge_check: {
            question: 'What is the main takeaway?',
            options: [
              { text: 'Correct Answer', is_correct: true },
              { text: 'Incorrect Option', is_correct: false },
            ],
          },
        },
      ],
    };
    onChange({ sections: [...sections, newSec] });
    setEditingSectionId(newSecId);
  };

  const handleAddLesson = (sectionId: string) => {
    const updated = sections.map((sec) => {
      if (sec.id === sectionId) {
        const newLes: BuilderLessonData = {
          id: `les_${Date.now()}`,
          title: `Lesson ${sec.lessons.length + 1}`,
          content: 'Write concise 30-120 word lesson explanation here...',
          key_concept: 'Key concept takeaway...',
          visual: {
            mode: 'auto',
            characterId: 'swallern_bear_v1',
            expression: 'curious',
            pose: 'standing',
          },
          knowledge_check: {
            question: 'Interactive check question?',
            options: [
              { text: 'Option A', is_correct: true },
              { text: 'Option B', is_correct: false },
            ],
          },
        };
        return { ...sec, lessons: [...sec.lessons, newLes] };
      }
      return sec;
    });
    onChange({ sections: updated });
  };

  const handleRemoveSection = (sectionId: string) => {
    if (sections.length <= 1) return;
    onChange({ sections: sections.filter((s) => s.id !== sectionId) });
  };

  const handleRemoveLesson = (sectionId: string, lessonId: string) => {
    const updated = sections.map((sec) => {
      if (sec.id === sectionId) {
        if (sec.lessons.length <= 1) return sec;
        return { ...sec, lessons: sec.lessons.filter((l) => l.id !== lessonId) };
      }
      return sec;
    });
    onChange({ sections: updated });
  };

  const handleRenameSection = (sectionId: string, newTitle: string) => {
    const updated = sections.map((s) => (s.id === sectionId ? { ...s, title: newTitle } : s));
    onChange({ sections: updated });
  };

  const handleRenameLesson = (sectionId: string, lessonId: string, newTitle: string) => {
    const updated = sections.map((sec) => {
      if (sec.id === sectionId) {
        const lessons = sec.lessons.map((l) => (l.id === lessonId ? { ...l, title: newTitle } : l));
        return { ...sec, lessons };
      }
      return sec;
    });
    onChange({ sections: updated });
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Course Structure & Hierarchy
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.4 }}>
          Organize your course into bite-sized modules and lessons.
        </p>
      </div>

      {/* Course Outline Rows */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1.5px solid #E2E8F0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {sections.map((sec, sIdx) => (
          <div
            key={sec.id || sIdx}
            style={{
              borderBottom: sIdx < sections.length - 1 ? '1px solid #E2E8F0' : 'none',
              padding: '12px 16px',
              backgroundColor: sIdx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
            }}
          >
            {/* Section Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#4F46E5', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '6px' }}>
                  Module {sIdx + 1}
                </span>

                {editingSectionId === sec.id ? (
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => handleRenameSection(sec.id, e.target.value)}
                    onBlur={() => setEditingSectionId(null)}
                    autoFocus
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      border: '1px solid #4F46E5',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <span
                    onClick={() => setEditingSectionId(sec.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}
                    title="Click to rename module"
                  >
                    <span>{sec.title}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleAddLesson(sec.id)}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#2563EB',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add Lesson</span>
                </button>
                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(sec.id)}
                    style={{
                      fontSize: '0.78rem',
                      color: '#DC2626',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                    title="Delete Module"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Lesson Rows (Indented) */}
            <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sec.lessons.map((les, lIdx) => (
                <div
                  key={les.id || lIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                    <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 700 }}>
                      Lesson {lIdx + 1}:
                    </span>

                    {editingLessonId === les.id ? (
                      <input
                        type="text"
                        value={les.title}
                        onChange={(e) => handleRenameLesson(sec.id, les.id, e.target.value)}
                        onBlur={() => setEditingLessonId(null)}
                        autoFocus
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: '#0F172A',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid #2563EB',
                          outline: 'none',
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => setEditingLessonId(les.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}
                        title="Click to rename lesson"
                      >
                        <span>{les.title}</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </span>
                    )}
                  </div>

                  {sec.lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLesson(sec.id, les.id)}
                      style={{
                        fontSize: '0.75rem',
                        color: '#94A3B8',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                      title="Remove Lesson"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Module Trigger */}
      <button
        type="button"
        onClick={handleAddSection}
        style={{
          padding: '10px 16px',
          borderRadius: '10px',
          border: '2px dashed #CBD5E1',
          backgroundColor: '#FFFFFF',
          color: '#4F46E5',
          fontWeight: 800,
          fontSize: '0.875rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        + Add New Course Module
      </button>
    </div>
  );
};
