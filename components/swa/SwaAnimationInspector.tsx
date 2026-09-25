'use client';

import React, { useState } from 'react';
import { Swa } from './Swa';
import { SwaAnimation, SwaExpression } from './SwaTypes';

interface SwaAnimationInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwaAnimationInspector: React.FC<SwaAnimationInspectorProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeAnimation, setActiveAnimation] = useState<SwaAnimation>('run');
  const [activeExpression, setActiveExpression] = useState<SwaExpression>('neutral');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showSkeletonHelper, setShowSkeletonHelper] = useState<boolean>(true);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [showBonesList, setShowBonesList] = useState<boolean>(false);

  if (!isOpen) return null;

  const realClips = [
    { name: 'Running', logical: 'run' as SwaAnimation, duration: '0.67s', tracks: 56, desc: 'Full-body run: legs pumping, arms swinging, torso balancing' },
    { name: 'Walking', logical: 'walk' as SwaAnimation, duration: '1.04s', tracks: 56, desc: 'Full-body stride: steady cadence, arm swing, head bobbing' },
    { name: 'restpose', logical: 'rest' as SwaAnimation, duration: '0.08s', tracks: 56, desc: 'Rest bind pose' },
  ];

  const skeletonBones = [
    'mixamorig:Hips (Root)',
    'mixamorig:Spine',
    'mixamorig:Spine1',
    'mixamorig:Spine2',
    'mixamorig:Neck',
    'mixamorig:Head',
    'mixamorig:HeadTop_End',
    'headfront',
    'mixamorig:LeftShoulder',
    'mixamorig:LeftArm',
    'mixamorig:LeftForeArm',
    'mixamorig:LeftHand',
    'mixamorig:LeftHandMiddle4',
    'mixamorig:RightShoulder',
    'mixamorig:RightArm',
    'mixamorig:RightForeArm',
    'mixamorig:RightHand',
    'mixamorig:RightHandMiddle4',
    'mixamorig:LeftUpLeg',
    'mixamorig:LeftLeg',
    'mixamorig:LeftFoot',
    'mixamorig:LeftToeBase',
    'mixamorig:LeftToe_End',
    'mixamorig:RightUpLeg',
    'mixamorig:RightLeg',
    'mixamorig:RightFoot',
    'mixamorig:RightToeBase',
    'mixamorig:RightToe_End',
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0F172A',
          color: '#F8FAFC',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  background: '#0284C7',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                Rig Inspector
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Meshy_AI_Twinklefin_All_Animations.glb
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Swa 3D Rig &amp; Skeleton Animation Inspector
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#FFFFFF',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) 340px',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Left: 3D Viewport with Live Model */}
          <div
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(ellipse at center, #1E293B 0%, #0F172A 100%)',
              position: 'relative',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Top Viewport Overlay */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                right: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  fontSize: '0.78rem',
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <span>Skeleton: <strong style={{ color: '#38BDF8' }}>Armature (28 Bones ✓)</strong></span>
                <span>Active Clip: <strong style={{ color: '#4ADE80' }}>{activeAnimation}</strong></span>
              </div>
            </div>

            {/* Swa 3D Canvas */}
            <div style={{ width: '280px', height: '280px', position: 'relative' }}>
              <Swa
                size={280}
                animation={activeAnimation}
                expression={activeExpression}
                float={false}
                autoRotate={false}
                playbackSpeed={playbackSpeed}
                showSkeletonHelper={showSkeletonHelper}
                facing={facing}
                cameraDistance={1.05}
                cameraHeight={0.88}
                alt="Swa Live Rig Inspector"
              />
            </div>

            {/* Quick Viewport Toggles */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowSkeletonHelper(!showSkeletonHelper)}
                style={{
                  background: showSkeletonHelper ? '#0284C7' : 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {showSkeletonHelper ? '🦴 Skeleton Helper: ON' : '🦴 Skeleton Helper: OFF'}
              </button>

              <button
                type="button"
                onClick={() => setFacing(facing === 1 ? -1 : 1)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Flip Facing ({facing === 1 ? 'Right →' : '← Left'})
              </button>
            </div>
          </div>

          {/* Right: Controls & Bone Diagnostics */}
          <div
            style={{
              padding: '24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* 1. Real Animation Clips */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8', marginBottom: '8px', letterSpacing: '0.05em' }}>
                Canonical GLB Animation Clips (3)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {realClips.map((clip) => {
                  const isActive = activeAnimation === clip.logical;
                  return (
                    <div
                      key={clip.name}
                      style={{
                        background: isActive ? 'rgba(2, 132, 199, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid',
                        borderColor: isActive ? '#0284C7' : 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                          {clip.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                          {clip.duration} • {clip.tracks} channels
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveAnimation(clip.logical)}
                        style={{
                          background: isActive ? '#0284C7' : 'rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {isActive ? 'Playing ▶' : 'Play'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Playback Speed */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8' }}>
                  Playback Speed
                </span>
                <span style={{ fontSize: '0.78rem', color: '#38BDF8', fontWeight: 700 }}>
                  {playbackSpeed}x {playbackSpeed <= 0.25 ? '(Slow-Mo Rig Flex)' : ''}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#0284C7' }}
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                {[0.25, 0.5, 1.0, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPlaybackSpeed(s)}
                    style={{
                      flex: 1,
                      padding: '4px 0',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      background: playbackSpeed === s ? '#0284C7' : 'rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Skeleton Hierarchy */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '8px 0',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onClick={() => setShowBonesList(!showBonesList)}
              >
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#E2E8F0' }}>
                  Bone Hierarchy ({skeletonBones.length} joints)
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  {showBonesList ? 'Hide ▲' : 'Show ▼'}
                </span>
              </div>

              {showBonesList && (
                <div
                  style={{
                    maxHeight: '140px',
                    overflowY: 'auto',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.72rem',
                    color: '#94A3B8',
                    fontFamily: 'monospace',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  {skeletonBones.map((b) => (
                    <div key={b}>• {b}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmation Note */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '0.75rem',
                color: '#A7F3D0',
                lineHeight: 1.4,
              }}
            >
              ✓ <strong>Rigged Character Verified</strong>: Three.js AnimationMixer is driving individual bones (hips, legs, spine, arms, and head). World movement on the roadmap is strictly decoupled.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
