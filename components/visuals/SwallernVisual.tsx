'use client';

import React from 'react';
import { VisualRequirement } from '@/lib/visuals/requirements';
import { VisualAssetMetadata } from '@/lib/visuals/generator';
import { SwallernCharacter } from './SwallernCharacter';
import { SwallernDiagram } from './SwallernDiagram';
import { getEnvironmentSpec } from '@/lib/visuals/backgrounds';

interface SwallernVisualProps {
  requirement?: VisualRequirement;
  metadata?: VisualAssetMetadata;
  imageUrl?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Swallern Visual Component | Swallern Visual System v1
 * Multi-mode educational renderer supporting Illustration (A), Diagram (B),
 * Real-World Photo (C), Map (D), and Animation (E).
 * Guarantees zero text inside generated images by rendering overlays as clean React DOM elements.
 */
export const SwallernVisual: React.FC<SwallernVisualProps> = ({
  requirement,
  metadata,
  imageUrl,
  alt = 'Swallern Educational Visual',
  className = '',
  style = {},
}) => {
  const req = requirement || metadata?.requirement;
  const mode = req?.type || 'A_ILLUSTRATION';
  const envSpec = req ? getEnvironmentSpec(req.environment) : null;

  // 1. If an explicit real image URL is supplied
  if (imageUrl) {
    return (
      <div
        className={`swallern-visual-container ${className}`}
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          background: '#F8FAFC',
          ...style,
        }}
      >
        <img
          src={imageUrl}
          alt={alt}
          style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
        />
        {req?.domOverlayText && req.domOverlayText.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              right: '12px',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '8px 14px',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '0.8125rem',
              fontWeight: 700,
            }}
          >
            {req.domOverlayText.join(' • ')}
          </div>
        )}
      </div>
    );
  }

  // 2. Mode B: Educational Diagram
  if (mode === 'B_DIAGRAM') {
    return <SwallernDiagram title={req?.subject || 'Educational Diagram'} className={className} style={style} />;
  }

  // 3. Modes A, C, D, E: Swallern Canonical Vector Canvas with Character & Background
  // Note: The card container is static and grounded; only the mascot has subtle movement.
  return (
    <div
      className={`swallern-visual-card ${className}`}
      style={{
        position: 'relative',
        background: envSpec?.palette[0] || 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
        border: '1.5px solid var(--color-neutral-light)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        minHeight: '220px',
        ...style,
      }}
    >
      {/* Visual Badge Mode */}
      <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
        <span style={{ fontSize: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
          {mode.replace('_', ' ')}
        </span>
      </div>

      {/* Canonical Mascot Illustration: Only the bear mascot bobs gently, the card remains solid */}
      <div
        className="swallern-bear-float"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SwallernCharacter
          characterId={req?.characterId || 'swallern_bear_v1'}
          expression={req?.emotion || 'curious'}
          pose={req?.action as any || 'exploring'}
          size={110}
        />
      </div>

      {/* Clean DOM Overlay Text */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-dark)' }}>
          {req?.subject || 'Swallern Learning Experience'}
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-gray)', marginTop: '4px' }}>
          {envSpec ? `${envSpec.name} Environment` : 'Swallern Visual System v1'}
        </div>
      </div>
    </div>
  );
};
