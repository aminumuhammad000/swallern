'use client';

import React, { useState } from 'react';
import type { TopicContract } from '@/lib/content/contract';
import { SourceList } from '@/components/topic/SourceList';
import { MediaSection } from '@/components/topic/MediaSection';

interface JourneyResourcesDrawerProps {
  topic: TopicContract;
}

export const JourneyResourcesDrawer: React.FC<JourneyResourcesDrawerProps> = ({ topic }) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasSources = (topic.sources?.length ?? 0) > 0;
  const hasMedia = (topic.media?.length ?? 0) > 0;

  if (!hasSources && !hasMedia) return null;

  return (
    <section
      aria-label="Course Resources and Sources"
      style={{
        width: '100%',
        maxWidth: '760px',
        margin: '32px auto 80px auto',
        padding: '0 16px',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden',
          transition: 'all 0.25s ease',
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: '#EFF6FF',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Topic Resources & Verified Sources
              </h4>
              <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Citations, scientific media, and related discoveries
              </p>
            </div>
          </div>

          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div
            style={{
              padding: '0 22px 24px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            {hasSources && <SourceList sources={topic.sources} />}
            {hasMedia && <MediaSection media={topic.media} />}
          </div>
        )}
      </div>
    </section>
  );
};
