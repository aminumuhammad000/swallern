'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { SwallernCharacter } from '@/components/visuals/SwallernCharacter';
import { TopicProgressState } from '@/lib/learning/progress';

interface DashboardHeroProps {
  userName: string;
  activeTopic?: TopicProgressState | null;
  onExploreClick?: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  userName,
  activeTopic,
  onExploreClick,
}) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const continueHref = activeTopic
    ? `/topics/${activeTopic.slug}/learn?step=${activeTopic.currentStep || 0}`
    : '/explore';

  const continueLabel = activeTopic ? 'Continue Learning' : 'Explore Topics';

  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 55%, #3B82F6 100%)',
        borderRadius: '20px',
        padding: '1.5rem 1.75rem',
        color: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.25)',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '145px',
      }}
    >
      {/* Background organic curves */}
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '380px',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.18,
        }}
        viewBox="0 0 420 180"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0,180 C80,140 160,165 240,120 C320,75 360,110 420,70 L420,180 L0,180 Z"
          fill="#FFFFFF"
        />
        <path
          d="M60,180 C140,110 220,130 300,85 C380,40 400,60 420,30 L420,180 L60,180 Z"
          fill="#93C5FD"
          opacity="0.5"
        />
      </svg>

      {/* Left text and action */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '540px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            marginBottom: '8px',
          }}
        >
          <span>{greeting}, {userName}!</span>
        </div>

        <h1
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            lineHeight: 1.25,
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
          }}
        >
          Ready to learn something today?
        </h1>

        <p
          style={{
            fontSize: '0.84rem',
            lineHeight: 1.45,
            color: '#DBEAFE',
            margin: '0 0 16px 0',
            maxWidth: '460px',
            fontWeight: 500,
          }}
        >
          {activeTopic
            ? `Resume "${activeTopic.title}" at Step ${(activeTopic.currentStep ?? 0) + 1}.`
            : 'Explore bite-sized interactive lessons built for curious minds.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link href={continueHref} style={{ textDecoration: 'none' }}>
            <button
              className="swallern-btn"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1E40AF',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{continueLabel}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </Link>

          {onExploreClick && (
            <button
              onClick={onExploreClick}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '0.6rem 1.1rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Browse Library
            </button>
          )}
        </div>
      </div>

      {/* Right side Swallern Mascot */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingRight: '8px',
        }}
      >
        <div style={{ filter: 'drop-shadow(0 8px 12px rgba(15, 23, 42, 0.2))' }}>
          <SwallernCharacter
            size={110}
            expression="happy"
            pose="waving"
          />
        </div>
      </div>
    </div>
  );
};
