'use client';

import React from 'react';
import Image from 'next/image';
import type { BirdExpression } from '@/lib/visuals/characters';
import { Swa, SwaExpression, SwaAnimation } from '@/components/swa';

/**
 * SwallernBird v1
 * The canonical Swallern Course Journey companion component.
 *
 * Uses the Swa 3D GLB Character Engine by default with graceful
 * fallback to approved 2D render assets if WebGL is unavailable.
 *
 * Usage:
 *   <SwallernBird expression="curious" dialogue="Ready to see what's really going on here?" size={180} />
 */

export interface SwallernBirdProps {
  /** Visual expression state */
  expression?: BirdExpression;
  /** Short single-line dialogue (optional). If omitted, no bubble shown. */
  dialogue?: string | null;
  /** Pixel size for the bird image or 3D canvas (square) */
  size?: number;
  /** Additional CSS class on the outer wrapper */
  className?: string;
  /** Whether to float (gentle bob animation) */
  float?: boolean;
  /** Whether to show the celebration animation */
  celebrate?: boolean;
  /** Whether to render in full 3D using the Swa GLB engine (default: true) */
  use3D?: boolean;
  /** Transient educational reaction */
  reaction?: import('@/components/swa').SwaReaction | null;
  /** Accessible alt text */
  alt?: string;
}

const EXPRESSION_SRC: Record<BirdExpression, string> = {
  neutral:     '/mascot/swallern_bird_v1_neutral.jpg',
  happy:       '/mascot/swallern_bird_v1_neutral.jpg',
  curious:     '/mascot/swallern_bird_v1_curious.jpg',
  thinking:    '/mascot/swallern_bird_v1_curious.jpg',
  surprised:   '/mascot/swallern_bird_v1_curious.jpg',
  focused:     '/mascot/swallern_bird_v1_neutral.jpg',
  confused:    '/mascot/swallern_bird_v1_curious.jpg',
  proud:       '/mascot/swallern_bird_v1_celebrating.jpg',
  celebrating: '/mascot/swallern_bird_v1_celebrating.jpg',
  encouraging: '/mascot/swallern_bird_v1_curious.jpg',
};

const BIRD_TO_SWA_EXPRESSION: Record<BirdExpression, SwaExpression> = {
  neutral: 'neutral',
  happy: 'happy',
  curious: 'curious',
  thinking: 'thinking',
  surprised: 'surprised',
  focused: 'focused',
  confused: 'confused',
  proud: 'proud',
  celebrating: 'celebrating',
  encouraging: 'curious',
};

export const SwallernBird: React.FC<SwallernBirdProps> = ({
  expression = 'neutral',
  dialogue = null,
  size = 180,
  className = '',
  float = true,
  celebrate = false,
  use3D = true,
  reaction = null,
  alt = 'Swa — Swallern Course Journey Companion',
}) => {
  const swaExpression: SwaExpression = BIRD_TO_SWA_EXPRESSION[expression] || 'neutral';
  const swaAnimation: SwaAnimation = celebrate ? 'celebrate' : 'idle';
  const fallbackSrc = EXPRESSION_SRC[expression] || EXPRESSION_SRC.neutral;

  if (use3D) {
    return (
      <Swa
        expression={swaExpression}
        animation={swaAnimation}
        reaction={reaction}
        size={size}
        speech={dialogue}
        float={float}
        fallbackImage={fallbackSrc}
        alt={alt}
        className={className}
      />
    );
  }

  // 2D Static Fallback if explicit use3D=false
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <div
        className={celebrate ? 'swallern-anim-celebrate' : float ? 'swallern-bear-float' : ''}
        style={{ width: '100%', height: '100%' }}
      >
        <Image
          src={fallbackSrc}
          alt={alt}
          width={size}
          height={size}
          priority
          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};
