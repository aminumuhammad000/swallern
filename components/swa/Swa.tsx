'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  SwaProps,
  resolveSwaSize,
  mapLearningStateToSwa,
  SWA_REACTIONS,
} from './SwaTypes';
import { SwaScene } from './SwaScene';
import { isWebGLAvailable } from './SwaLoader';

export const Swa: React.FC<SwaProps> = ({
  expression: directExpression,
  animation: directAnimation,
  reaction = null,
  onReactionComplete,
  learningState,
  size = 'medium',
  speech = null,
  showSpeechOnMount = true,
  speechDurationMs = 5000,
  float = true,
  interactive = false,
  autoRotate = false,
  facing = 1,
  playbackSpeed = 1.0,
  showSkeletonHelper = false,
  modelUrl,
  cameraDistance,
  cameraHeight,
  fallbackImage = '/mascot/swallern_bird_v1_curious.jpg',
  alt = 'Swa — Swallern 3D Companion',
  className = '',
  style = {},
  onLoaded,
  onError,
}) => {
  // Resolve expression & animation from learningState if provided
  const mapped = learningState ? mapLearningStateToSwa(learningState) : null;
  const expression = mapped?.expression ?? directExpression ?? 'neutral';
  const animation = mapped?.animation ?? directAnimation ?? 'idle';

  // If a reaction is active and no custom speech was provided, use the reaction default speech
  const effectiveSpeech = speech ?? (reaction ? SWA_REACTIONS[reaction]?.defaultSpeech : null);

  const pixelSize = resolveSwaSize(size);

  const [isClient, setIsClient] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Speech bubble visibility
  const [speechVisible, setSpeechVisible] = useState(false);
  const [speechFading, setSpeechFading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setHasWebGL(isWebGLAvailable());

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Manage speech bubble timer
  useEffect(() => {
    if (!effectiveSpeech || !showSpeechOnMount) {
      setSpeechVisible(false);
      return;
    }

    const showTimer = setTimeout(() => setSpeechVisible(true), 400);
    const fadeTimer = setTimeout(() => setSpeechFading(true), speechDurationMs);
    const hideTimer = setTimeout(() => {
      setSpeechVisible(false);
      setSpeechFading(false);
    }, speechDurationMs + 500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [effectiveSpeech, showSpeechOnMount, speechDurationMs, reaction]);

  const handleLoaded = () => {
    setLoadState('loaded');
    onLoaded?.();
  };

  const handleError = (err: Error) => {
    setLoadState('error');
    onError?.(err);
  };

  return (
    <div
      className={`swa-container ${className}`}
      role="img"
      aria-label={alt}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        userSelect: 'none',
        ...style,
      }}
    >
      {/* ─── SPEECH BUBBLE ─── */}
      {effectiveSpeech && speechVisible && (
        <div
          aria-live="polite"
          style={{
            position: 'absolute',
            bottom: '100%',
            marginBottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#FFFFFF',
            border: '1.5px solid rgba(226, 232, 240, 0.95)',
            borderRadius: '16px',
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#0F172A',
            whiteSpace: 'nowrap',
            boxShadow: '0 10px 25px -4px rgba(15, 23, 42, 0.16)',
            zIndex: 30,
            opacity: speechFading ? 0 : 1,
            transition: 'opacity 0.35s ease',
            pointerEvents: 'none',
          }}
        >
          {effectiveSpeech}
          {/* Bubble Tail */}
          <span
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #FFFFFF',
            }}
          />
        </div>
      )}

      {/* ─── 3D WEBGL ENGINE OR 2D FALLBACK ─── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: facing === -1 ? 'scaleX(-1)' : undefined,
          transformOrigin: 'center center',
          transition: 'transform 0.25s ease',
        }}
      >
        {!isClient ? (
          // SSR Placeholder (same size, prevents layout shift)
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
            }}
          />
        ) : !hasWebGL || loadState === 'error' ? (
          // 2D Fallback if WebGL unavailable
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src={fallbackImage}
              alt={alt}
              width={pixelSize}
              height={pixelSize}
              priority
              style={{
                objectFit: 'contain',
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        ) : (
          // Real 3D Swa Engine
          <>
            {/* Calm Loading Spinner Placeholder until 3D initializes */}
            {loadState === 'loading' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: `${Math.round(pixelSize * 0.2)}px`,
                    height: `${Math.round(pixelSize * 0.2)}px`,
                    borderRadius: '50%',
                    border: '2px solid rgba(13, 148, 136, 0.2)',
                    borderTopColor: '#0D9488',
                    animation: 'swallernRotate 1s linear infinite',
                  }}
                />
              </div>
            )}

            <SwaScene
              expression={expression}
              animation={animation}
              reaction={reaction}
              float={float}
              autoRotate={autoRotate}
              reducedMotion={reducedMotion}
              playbackSpeed={playbackSpeed}
              showSkeletonHelper={showSkeletonHelper}
              modelUrl={modelUrl}
              cameraDistance={cameraDistance}
              cameraHeight={cameraHeight}
              onReactionComplete={onReactionComplete}
              onLoaded={handleLoaded}
              onError={handleError}
            />
          </>
        )}
      </div>
    </div>
  );
};
