'use client';

import React from 'react';
import { CharacterExpression, CharacterPose, getCharacterSpec } from '@/lib/visuals/characters';
import { Swa, SwaExpression } from '@/components/swa';

interface SwallernCharacterProps {
  characterId?: string;
  expression?: CharacterExpression;
  pose?: CharacterPose;
  size?: number; // Size in pixels
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Swallern Character Component — Swallern Visual System v1
 * Renders canonical mascot:
 * - Swallern Bear v1 with soft vector geometry and blue backpack
 * - Swallern Bird / Swa v2 with 3D WebGL engine
 */
export const SwallernCharacter: React.FC<SwallernCharacterProps> = ({
  characterId = 'swallern_bear_v1',
  expression = 'curious',
  pose = 'standing',
  size = 140,
  className = '',
  style = {},
}) => {
  // If Swa / Swallern Bird is requested, render using 3D Swa engine
  if (
    characterId === 'swallern_bird_v1' ||
    characterId === 'swa_v2' ||
    characterId === 'swa'
  ) {
    const swaExpression: SwaExpression =
      expression === 'sleepy' ? 'sleepy' :
      expression === 'celebrating' ? 'celebrating' :
      expression === 'proud' ? 'proud' :
      expression === 'focused' ? 'focused' :
      expression === 'thinking' ? 'thinking' :
      expression === 'confused' ? 'confused' :
      expression === 'surprised' ? 'surprised' :
      expression === 'excited' ? 'excited' :
      expression === 'happy' ? 'happy' :
      expression === 'curious' ? 'curious' : 'neutral';

    return (
      <Swa
        expression={swaExpression}
        animation={pose === 'celebrating' ? 'celebrate' : pose === 'walking' ? 'walk' : 'idle'}
        size={size}
        className={className}
        style={style}
      />
    );
  }

  const spec = getCharacterSpec(characterId);

  // Expression-based eye adjustments
  let eyeSparkle = true;
  let mouthPath = "M 52,68 Q 60,76 68,68"; // Happy curve
  if (expression === 'surprised' || expression === 'excited') {
    mouthPath = "M 54,66 A 6,6 0 1,0 66,66 Z"; // Open circle
  } else if (expression === 'confused' || expression === 'thinking') {
    mouthPath = "M 52,70 Q 60,66 68,70"; // Slight wave
  } else if (expression === 'sleepy') {
    eyeSparkle = false;
    mouthPath = "M 54,68 Q 60,70 66,68";
  }

  // Pose-based tilt/arm position
  let rotation = 0;
  if (pose === 'walking' || pose === 'thinking') rotation = -3;
  if (pose === 'celebrating' || pose === 'waving') rotation = 4;

  return (
    <div
      className={`swallern-character-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        ...style,
      }}
      title={`${spec.name} - ${expression} (${pose})`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Background Aura */}
        <circle cx="60" cy="60" r="54" fill="#EFF6FF" opacity="0.6" />

        {/* Backpack (Blue) */}
        <rect x="22" y="44" width="22" height="34" rx="8" fill="#3B82F6" />
        <rect x="25" y="52" width="16" height="12" rx="4" fill="#2563EB" />
        <circle cx="33" cy="58" r="2" fill="#F59E0B" />

        {/* Ears */}
        <circle cx="38" cy="28" r="12" fill="#8B4513" />
        <circle cx="38" cy="28" r="7" fill="#D2B48C" />
        <circle cx="82" cy="28" r="12" fill="#8B4513" />
        <circle cx="82" cy="28" r="7" fill="#D2B48C" />

        {/* Bear Head */}
        <circle cx="60" cy="46" r="28" fill="#8B4513" />

        {/* Snout */}
        <ellipse cx="60" cy="58" rx="14" ry="11" fill="#D2B48C" />

        {/* Nose */}
        <ellipse cx="60" cy="53" rx="5" ry="4" fill="#3F1D0B" />

        {/* Eyes */}
        {expression === 'sleepy' ? (
          <>
            <path d="M 44,44 Q 48,48 52,44" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 68,44 Q 72,48 76,44" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="48" cy="43" r="4.5" fill="#0F172A" />
            <circle cx="72" cy="43" r="4.5" fill="#0F172A" />
            {eyeSparkle && (
              <>
                <circle cx="49.5" cy="41.5" r="1.5" fill="#FFFFFF" />
                <circle cx="73.5" cy="41.5" r="1.5" fill="#FFFFFF" />
              </>
            )}
          </>
        )}

        {/* Mouth */}
        <path d={mouthPath} stroke="#3F1D0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Torso / Body */}
        <path
          d="M 38,70 C 38,62 82,62 82,70 L 88,100 C 88,106 32,106 32,100 Z"
          fill="#8B4513"
        />

        {/* Belly Patch */}
        <ellipse cx="60" cy="85" rx="16" ry="12" fill="#D2B48C" opacity="0.8" />

        {/* Arms */}
        {pose === 'celebrating' || pose === 'waving' ? (
          <>
            <path d="M 34,70 Q 20,52 24,42" stroke="#8B4513" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M 86,70 Q 100,52 96,42" stroke="#8B4513" strokeWidth="9" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <path d="M 34,72 Q 26,85 34,96" stroke="#8B4513" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M 86,72 Q 94,85 86,96" stroke="#8B4513" strokeWidth="8" strokeLinecap="round" fill="none" />
          </>
        )}
      </svg>
    </div>
  );
};
