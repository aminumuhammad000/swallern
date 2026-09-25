'use client';

import React, { useState } from 'react';
import { SwallernCharacter } from '@/components/visuals/SwallernCharacter';

interface EncouragementBannerProps {
  userName: string;
}

export const EncouragementBanner: React.FC<EncouragementBannerProps> = ({ userName }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      style={{
        backgroundColor: '#EFF6FF',
        border: '1.5px solid #BFDBFE',
        borderRadius: '20px',
        padding: '1rem 1.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginTop: '1.5rem',
        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Mascot Avatar */}
        <div
          style={{
            flexShrink: 0,
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#DBEAFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <SwallernCharacter
            size={52}
            expression="happy"
            pose="reading"
          />
        </div>

        {/* Text */}
        <div>
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              color: '#1E40AF',
              marginBottom: '2px',
            }}
          >
            You&apos;re doing great, {userName}!
          </div>
          <div
            style={{
              fontSize: '0.78rem',
              color: '#3B82F6',
              fontWeight: 500,
            }}
          >
            Consistent daily curiosity builds lasting understanding. Keep exploring new ideas!
          </div>
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss banner"
        style={{
          background: 'none',
          border: 'none',
          color: '#60A5FA',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#1E40AF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#60A5FA';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};
