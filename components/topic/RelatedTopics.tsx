'use client';

import React from 'react';
import Link from 'next/link';
import type { RelatedTopicRef } from '@/lib/content/contract';

interface RelatedTopicsProps {
  topics: RelatedTopicRef[];
}

// Map category string to soft aesthetic colors
function getCategoryBadgeStyle(category?: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('science') || cat.includes('physics') || cat.includes('math')) {
    return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', dot: '#3B82F6' };
  }
  if (cat.includes('nature') || cat.includes('bio') || cat.includes('earth')) {
    return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', dot: '#10B981' };
  }
  if (cat.includes('tech') || cat.includes('ai') || cat.includes('code')) {
    return { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE', dot: '#8B5CF6' };
  }
  if (cat.includes('history') || cat.includes('art') || cat.includes('philosophy')) {
    return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', dot: '#F59E0B' };
  }
  return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0', dot: '#64748B' };
}

export const RelatedTopics: React.FC<RelatedTopicsProps> = ({ topics }) => {
  if (!topics || topics.length === 0) return null;

  return (
    <section
      aria-labelledby="related-expeditions-heading"
      style={{
        width: '100%',
        maxWidth: '760px',
        margin: '40px auto 20px auto',
        padding: '0 16px',
      }}
    >
      {/* ─── Section Header ─── */}
      <div style={{ marginBottom: '20px', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#4F46E5',
              background: '#EEF2FF',
              padding: '3px 10px',
              borderRadius: '999px',
              border: '1px solid #C7D2FE',
            }}
          >
            Next Horizons
          </span>
          <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
            {topics.length} connected {topics.length === 1 ? 'journey' : 'journeys'}
          </span>
        </div>

        <h2
          id="related-expeditions-heading"
          style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.45rem)',
            fontWeight: 900,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            margin: '0 0 6px 0',
            lineHeight: 1.25,
          }}
        >
          Continue Your Journey in Related Worlds
        </h2>
        <p
          style={{
            fontSize: '0.84rem',
            color: '#64748B',
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          Branch into connected discoveries to expand your mastery across interconnected fields.
        </p>
      </div>

      {/* ─── Professional Expedition Portal Cards Grid ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {topics.map((item) => {
          const badgeStyle = getCategoryBadgeStyle(item.category);

          return (
            <Link
              key={item.slug}
              href={`/topics/${item.slug}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                outline: 'none',
              }}
              className="swallern-press"
            >
              <article
                style={{
                  position: 'relative',
                  background: 'linear-gradient(150deg, #FFFFFF 0%, #F8FAFC 100%)',
                  borderRadius: '24px',
                  border: '1.5px solid rgba(226, 232, 240, 0.95)',
                  boxShadow: '0 8px 24px -6px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(99, 102, 241, 0.03)',
                  padding: '22px 20px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {/* Ambient watermark corner accent */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${badgeStyle.dot}14 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />

                <div>
                  {/* Card Header: Category Badge + Journey Pin */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: badgeStyle.text,
                        background: badgeStyle.bg,
                        border: `1px solid ${badgeStyle.border}`,
                        padding: '3px 10px',
                        borderRadius: '999px',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: badgeStyle.dot,
                        }}
                      />
                      {item.category || 'Topic'}
                    </span>

                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748B',
                      }}
                      aria-hidden="true"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: '0 0 8px 0',
                      lineHeight: 1.3,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {item.title}
                  </h3>

                  {/* Summary */}
                  {item.summary && (
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: '#475569',
                        lineHeight: 1.5,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.summary}
                    </p>
                  )}
                </div>

                {/* Card Footer: Action Indicator */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '18px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(241, 245, 249, 0.9)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#3B82F6',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>Embark on Journey</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#94A3B8',
                    }}
                  >
                    New World
                  </span>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
