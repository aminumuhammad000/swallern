'use client';

import React from 'react';
import { BuilderCourseData } from './types';

interface Step6PublishProps {
  data: BuilderCourseData;
  onChange: (updated: Partial<BuilderCourseData>) => void;
  onSubmitForApproval: () => void;
  onSaveDraft: () => void;
  isSubmitting?: boolean;
}

/**
 * Step 6 — Publishing & Access Settings
 * Keeps publishing separate from creation; respects Ownership -> Approval -> Publication.
 */
export const Step6Publish: React.FC<Step6PublishProps> = ({
  data,
  onChange,
  onSubmitForApproval,
  onSaveDraft,
  isSubmitting = false,
}) => {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Ready to Publish?
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.4 }}>
          Choose visibility and submit your course for administrator review.
        </p>
      </div>

      {/* Visibility Selection Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1.5px solid #E2E8F0',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
          Select Access & Visibility
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            {
              key: 'PRIVATE',
              title: 'Private Draft',
              desc: 'Only you can view and edit this course.',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ),
            },
            {
              key: 'LINK_ONLY',
              title: 'Unlisted (Share via Link)',
              desc: 'Anyone with the direct link can access and take this course.',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              ),
            },
            {
              key: 'PUBLIC',
              title: 'Public Swallern Library',
              desc: 'Discoverable on Swallern landing page after admin approval.',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: isSelected ? '#2563EB' : '#64748B' }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: isSelected ? '#1E40AF' : '#0F172A' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin Review Policy Notice */}
      <div
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          padding: '1rem',
          fontSize: '0.8125rem',
          color: '#475569',
          lineHeight: 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          <strong>Publishing Workflow:</strong> Public courses are submitted to the Swallern moderation queue where admins verify research sources and evidence quality before appearing publicly.
        </div>
      </div>

      {/* Final Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          style={{
            flex: 1,
            height: '42px',
            borderRadius: '10px',
            border: '1px solid #CBD5E1',
            backgroundColor: '#FFFFFF',
            color: '#334155',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: isSubmitting ? 'default' : 'pointer',
          }}
        >
          Save as Private Draft
        </button>

        <button
          type="button"
          onClick={onSubmitForApproval}
          disabled={isSubmitting}
          style={{
            flex: 1,
            height: '42px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.875rem',
            cursor: isSubmitting ? 'default' : 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Course for Review →'}
        </button>
      </div>
    </div>
  );
};
