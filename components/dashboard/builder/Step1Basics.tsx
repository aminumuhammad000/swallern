'use client';

import React from 'react';
import { BuilderCourseData } from './types';
import { countWords, validateFieldWordCount } from '@/lib/learning/validation';

interface Step1BasicsProps {
  data: BuilderCourseData;
  onChange: (updated: Partial<BuilderCourseData>) => void;
}

export const Step1Basics: React.FC<Step1BasicsProps> = ({ data, onChange }) => {
  const titleCount = countWords(data.title);
  const summaryCount = countWords(data.summary);

  const titleVal = validateFieldWordCount(data.title, 'courseTitle');
  const summaryVal = validateFieldWordCount(data.summary, 'courseSummary');

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    fontSize: '0.875rem',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Course Basics
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.4 }}>
          Establish your course title, target subject, difficulty level, and concise overview.
        </p>
      </div>

      {/* Title Input */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <label style={labelStyle}>Course Title *</label>
          <span style={{ fontSize: '0.75rem', color: titleVal.valid ? '#059669' : '#D97706', fontWeight: 700 }}>
            {titleCount} / 12 words
          </span>
        </div>
        <input
          type="text"
          placeholder="e.g. How Bears Prepare for Winter"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          style={{
            ...inputStyle,
            borderColor: titleVal.valid || !data.title ? '#CBD5E1' : '#EF4444',
          }}
          required
        />
        {!titleVal.valid && data.title && (
          <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '4px', display: 'block' }}>
            {titleVal.message}
          </span>
        )}
      </div>

      {/* Category & Difficulty Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Subject Category *</label>
          <select
            value={data.category}
            onChange={(e) => onChange({ category: e.target.value })}
            style={inputStyle}
          >
            <option value="Science">Science</option>
            <option value="Biology">Biology</option>
            <option value="Technology">Technology</option>
            <option value="Space">Space</option>
            <option value="History">History</option>
            <option value="Nature & Environment">Nature & Environment</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Difficulty Level *</label>
          <select
            value={data.difficulty}
            onChange={(e) => onChange({ difficulty: e.target.value as any })}
            style={inputStyle}
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      {/* Summary Area */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <label style={labelStyle}>Short Description (Course Summary: 15–50 words) *</label>
          <span style={{ fontSize: '0.75rem', color: summaryVal.valid ? '#059669' : '#D97706', fontWeight: 700 }}>
            {summaryCount} / 50 words
          </span>
        </div>
        <textarea
          rows={3}
          placeholder="Concise 15-50 word course overview explaining what learners will discover..."
          value={data.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
          style={{
            ...inputStyle,
            height: 'auto',
            padding: '10px 12px',
            lineHeight: 1.5,
            borderColor: summaryVal.valid || !data.summary ? '#CBD5E1' : '#EF4444',
          }}
          required
        />
        {!summaryVal.valid && data.summary && (
          <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '4px', display: 'block' }}>
            {summaryVal.message}
          </span>
        )}
      </div>

      {/* Visibility Settings */}
      <div>
        <label style={labelStyle}>Visibility & Publishing Access</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
          {[
            {
              key: 'PRIVATE',
              label: 'Private',
              desc: 'Only you can view',
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ),
            },
            {
              key: 'LINK_ONLY',
              label: 'Link Only',
              desc: 'Anyone with secret link',
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              ),
            },
            {
              key: 'PUBLIC',
              label: 'Public',
              desc: 'Discoverable after admin approval',
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ),
            },
          ].map((item) => {
            const isSelected = data.visibility === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onChange({ visibility: item.key as any })}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, color: isSelected ? '#1E40AF' : '#0F172A' }}>
                  <span style={{ color: isSelected ? '#2563EB' : '#64748B' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', lineHeight: 1.3 }}>
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
