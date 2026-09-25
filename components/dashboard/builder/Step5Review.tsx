'use client';

import React from 'react';
import { BuilderCourseData } from './types';
import { validateSwallernCourse } from '@/lib/learning/validation';

interface Step5ReviewProps {
  data: BuilderCourseData;
  onOpenPreview: () => void;
}

/**
 * Step 5 — Course Validation & Review
 * Validates course against bite-sized limits and provides interactive preview trigger.
 */
export const Step5Review: React.FC<Step5ReviewProps> = ({ data, onOpenPreview }) => {
  const valResult = validateSwallernCourse(data);

  const sectionsCount = data.sections?.length || 0;
  const lessonsCount = data.sections?.reduce((sum, s) => sum + (s.lessons?.length || 0), 0) || 0;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Review Course
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.4 }}>
          Verify course structure and bite-sized learning compliance before publishing.
        </p>
      </div>

      {/* Summary Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {[
          { label: 'Modules', val: sectionsCount },
          { label: 'Lessons', val: lessonsCount },
          { label: 'Category', val: data.category || 'Science' },
          { label: 'Level', val: data.difficulty || 'BEGINNER' },
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '10px',
              padding: '10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>{item.val}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px', fontWeight: 600 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Compliance Checklist Box */}
      <div
        style={{
          backgroundColor: valResult.valid ? '#ECFDF5' : '#FEF2F2',
          border: `1.5px solid ${valResult.valid ? '#A7F3D0' : '#FECACA'}`,
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {valResult.valid ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: valResult.valid ? '#065F46' : '#991B1B', margin: 0 }}>
            {valResult.valid ? 'Course Passed All Swallern Learning Rules' : 'Bite-Sized Learning Violations Found'}
          </h3>
        </div>

        {valResult.valid ? (
          <div style={{ fontSize: '0.82rem', color: '#047857', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Course structure and hierarchy verified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>All lesson explanations within bite-sized limit (30 to 120 words)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Interactive knowledge checks configured</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Visual system requirements set</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {valResult.errors.map((err, idx) => (
              <div key={idx} style={{ fontSize: '0.8125rem', color: '#B91C1C', fontWeight: 600 }}>
                • {err.error}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Learner Experience Preview Trigger */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1.5px solid #E2E8F0',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
            Preview Learner Experience
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
            Test how learners will see and complete your course modules.
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPreview}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Open Preview</span>
        </button>
      </div>
    </div>
  );
};
