'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Swa,
  SwaAnimation,
  SwaExpression,
  SwaReaction,
  SwaSize,
  SWA_EMBEDDED_CLIPS,
  SWA_REACTIONS,
} from '@/components/swa';

export default function SwaLabPage() {
  // Active settings
  const [animation, setAnimation] = useState<SwaAnimation>('idle');
  const [expression, setExpression] = useState<SwaExpression>('curious');
  const [activeReaction, setActiveReaction] = useState<SwaReaction | null>(null);
  const [size, setSize] = useState<SwaSize>('large');
  const [float, setFloat] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [speech, setSpeech] = useState<string>('Hello! I am Swa v2, your learning companion.');
  const [showSpeech, setShowSpeech] = useState(true);

  // Trigger transient reaction
  const handleTriggerReaction = (reaction: SwaReaction) => {
    setActiveReaction(reaction);
    const config = SWA_REACTIONS[reaction];
    if (config?.defaultSpeech) {
      setSpeech(config.defaultSpeech);
      setShowSpeech(true);
    }
  };

  const expressions: SwaExpression[] = [
    'neutral',
    'curious',
    'happy',
    'excited',
    'surprised',
    'confused',
    'thinking',
    'focused',
    'proud',
    'concerned',
    'celebrating',
    'sleepy',
  ];

  const reactions: SwaReaction[] = [
    'welcome',
    'success',
    'incorrect',
    'discovery',
    'milestone',
    'lessonComplete',
    'courseComplete',
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* ─── HEADER ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: '#EEF2FF',
                color: '#4F46E5',
                padding: '3px 10px',
                borderRadius: '999px',
              }}
            >
              Development Lab
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#ECFDF5',
                color: '#059669',
                padding: '3px 10px',
                borderRadius: '999px',
              }}
            >
              swa_v2.glb Active
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Swa v2 Character Engine Lab
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Interactive testbed for Swallern&apos;s canonical 3D learning companion. Inspect real
            GLTF animations, procedural micro-motions, and educational reactions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href="/login"
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#334155',
              textDecoration: 'none',
            }}
          >
            View in Login Page →
          </Link>
        </div>
      </div>

      {/* ─── MAIN GRID ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        {/* ─── LEFT: 3D VIEWPORT & STAGE ─── */}
        <div
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, #F1F5F9 0%, #E2E8F0 100%)',
            borderRadius: '24px',
            border: '1px solid #CBD5E1',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '520px',
            position: 'relative',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 10px 25px -5px rgba(0,0,0,0.05)',
          }}
        >
          {/* Active Status Badge */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#475569',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.6)',
              }}
            >
              Anim: <strong style={{ color: '#0F172A' }}>{activeReaction ? `[Reaction: ${activeReaction}]` : animation}</strong>
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#475569',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.6)',
              }}
            >
              Expr: <strong style={{ color: '#0F172A' }}>{expression}</strong>
            </div>
          </div>

          {/* Swa 3D Canvas */}
          <Swa
            expression={expression}
            animation={animation}
            reaction={activeReaction}
            onReactionComplete={() => setActiveReaction(null)}
            size={size}
            speech={showSpeech ? speech : null}
            float={float}
            autoRotate={autoRotate}
            playbackSpeed={playbackSpeed}
            showSpeechOnMount={true}
            alt="Swa v2 Character"
          />

          {/* Viewport Quick Controls */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              display: 'flex',
              gap: '8px',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              padding: '6px 12px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            }}
          >
            <button
              type="button"
              onClick={() => setFloat(!float)}
              style={{
                background: float ? '#0F172A' : '#F1F5F9',
                color: float ? '#FFFFFF' : '#475569',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {float ? 'Float On' : 'Float Off'}
            </button>

            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              style={{
                background: autoRotate ? '#0F172A' : '#F1F5F9',
                color: autoRotate ? '#FFFFFF' : '#475569',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {autoRotate ? 'Rotating' : 'Auto Rotate'}
            </button>

            <button
              type="button"
              onClick={() => setShowSpeech(!showSpeech)}
              style={{
                background: showSpeech ? '#0F172A' : '#F1F5F9',
                color: showSpeech ? '#FFFFFF' : '#475569',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Speech
            </button>
          </div>
        </div>

        {/* ─── RIGHT: CONTROL PANEL ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Real GLTF Embedded Animation Clips */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Embedded GLTF Skeletal Clips
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                Meshy_AI_Twinklefin
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveReaction(null);
                  setAnimation('walk');
                }}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  background: animation === 'walk' && !activeReaction ? '#4F46E5' : '#F8FAFC',
                  color: animation === 'walk' && !activeReaction ? '#FFFFFF' : '#1E293B',
                  border: '1px solid',
                  borderColor: animation === 'walk' && !activeReaction ? '#4F46E5' : '#E2E8F0',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Walking (1.07s)
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveReaction(null);
                  setAnimation('run');
                }}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  background: animation === 'run' && !activeReaction ? '#4F46E5' : '#F8FAFC',
                  color: animation === 'run' && !activeReaction ? '#FFFFFF' : '#1E293B',
                  border: '1px solid',
                  borderColor: animation === 'run' && !activeReaction ? '#4F46E5' : '#E2E8F0',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Running (0.70s)
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveReaction(null);
                  setAnimation('rest');
                }}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  background: animation === 'rest' && !activeReaction ? '#4F46E5' : '#F8FAFC',
                  color: animation === 'rest' && !activeReaction ? '#FFFFFF' : '#1E293B',
                  border: '1px solid',
                  borderColor: animation === 'rest' && !activeReaction ? '#4F46E5' : '#E2E8F0',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Restpose (0.07s)
              </button>
            </div>

            {/* Playback speed */}
            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', width: '90px' }}>
                Speed: {playbackSpeed}x
              </span>
              <input
                type="range"
                min="0.25"
                max="2.0"
                step="0.25"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: '#4F46E5' }}
              />
            </div>
          </div>

          {/* 2. Educational Learning Reactions */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Learning Reactions (State Machine)
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                Auto-returns to idle
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 12px 0' }}>
              Fires transient multi-second companion responses to learner milestones:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {reactions.map((r) => {
                const isActive = activeReaction === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleTriggerReaction(r)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: isActive ? '#059669' : '#F1F5F9',
                      color: isActive ? '#FFFFFF' : '#334155',
                      border: '1px solid',
                      borderColor: isActive ? '#059669' : '#E2E8F0',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    ⚡ {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Procedural Expressions */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '18px 20px',
            }}
          >
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 12px 0' }}>
              Procedural Postures & Expressions
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {expressions.map((expr) => {
                const isSelected = expression === expr;
                return (
                  <button
                    key={expr}
                    type="button"
                    onClick={() => setExpression(expr)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      background: isSelected ? '#3B82F6' : '#F8FAFC',
                      color: isSelected ? '#FFFFFF' : '#334155',
                      border: '1px solid',
                      borderColor: isSelected ? '#3B82F6' : '#E2E8F0',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                    }}
                  >
                    {expr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Speech Bubble Editor */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '18px 20px',
            }}
          >
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0' }}>
              Companion Dialogue / Speech
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={speech}
                onChange={(e) => setSpeech(e.target.value)}
                placeholder="Enter speech text..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowSpeech(!showSpeech)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {showSpeech ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* 5. Model Architecture & Diagnostics */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '16px 20px',
              fontSize: '0.78rem',
              color: '#475569',
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
              Canonical Asset Specifications
            </div>
            <div>• Path: <code>/public/characters/swa/swa_v2.glb</code> (15.7 MB)</div>
            <div>• Origin: <code>Meshy_AI_Twinklefin_All_Animations.glb</code></div>
            <div>• Mesh: <code>output_unwrapped</code> (BakedMaterial)</div>
            <div>• Armature: Mixamo Humanoid Standard (30 bones)</div>
            <div>• Clips: <code>Running (0.7s)</code>, <code>Walking (1.07s)</code>, <code>restpose (0.07s)</code></div>
            <div>• Micro-motions: Sinusoidal breath, 5.2s nodding cycle, wing flex</div>
          </div>
        </div>
      </div>
    </div>
  );
}
