'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { JourneyMilestone } from '@/components/journey/JourneyRoadmap';
import type { TopicProgressState } from '@/lib/learning/progress';
import type { ClassroomThemeId } from '@/lib/learning/themes';
import {
  Swa,
  type SwaReaction,
  type SwaExpression,
  type SwaAnimation,
} from '@/components/swa';
import { JourneyLandmark } from './JourneyLandmark';
import { useRoadmapSwa } from './RoadmapSwaController';
import { SwaCompanionDialog } from './SwaCompanionDialog';

interface JourneyWorldMapProps {
  milestones: JourneyMilestone[];
  progress: TopicProgressState | null;
  activeMilestoneIndex?: number;
  topicSlug?: string;
  topicTitle?: string;
  destination: string;
  themeId: ClassroomThemeId;
  selectedMilestoneIndex: number | null;
  onSelectMilestone: (index: number) => void;
  swaReaction?: SwaReaction | null;
  swaSpeech?: string | null;
  swaExpression?: SwaExpression;
  swaAnimation?: SwaAnimation;
  onSwaReactionComplete?: () => void;
  /** Fires once when Swa's 3D model finishes loading */
  onSwaLoaded?: () => void;
}

interface NodePoint {
  index: number;
  x: number;
  y: number;
  isDestination: boolean;
  milestone: JourneyMilestone;
}

export const JourneyWorldMap: React.FC<JourneyWorldMapProps> = ({
  milestones,
  progress,
  activeMilestoneIndex,
  topicSlug,
  topicTitle,
  destination,
  themeId,
  selectedMilestoneIndex,
  onSelectMilestone,
  swaReaction = null,
  swaSpeech = null,
  swaExpression = 'neutral',
  swaAnimation = 'idle',
  onSwaReactionComplete,
  onSwaLoaded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const swaRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(440);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSwaTouch = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsChatOpen(prev => {
      const next = !prev;
      // When opening chat, scroll Swa into view so user can see the chat
      if (next) {
        setTimeout(() => {
          swaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 80);
      }
      return next;
    });
  }, []);

  // Measure container width responsively
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Determine current active step (using activeMilestoneIndex if provided, falling back to progress.currentStep)
  const currentStep = activeMilestoneIndex !== undefined ? activeMilestoneIndex : (progress?.currentStep ?? 0);
  const isAllComplete = progress?.isCompleted ?? false;
  const completedIndexes = useMemo(() => new Set(progress?.completedStepIndexes ?? []), [progress]);

  // Combine milestones with destination as the final milestone node
  const allNodes: JourneyMilestone[] = useMemo(() => {
    return [
      ...milestones,
      {
        index: milestones.length,
        title: destination,
        description: 'You have reached the final destination of this course!',
        estimatedMinutes: 2,
      },
    ];
  }, [milestones, destination]);

  // Layout parameters
  const rowHeight = containerWidth < 480 ? 130 : 150;
  const paddingTop = 50;
  const paddingBottom = 70;
  const totalHeight = paddingTop + (allNodes.length - 1) * rowHeight + paddingBottom;

  // Calculate coordinates for every node deterministically
  const nodePoints: NodePoint[] = useMemo(() => {
    const cx = containerWidth / 2;
    // Amplitude clamped responsively
    const maxAmplitude = Math.min(Math.max(containerWidth * 0.28, 65), 150);

    return allNodes.map((m, i) => {
      const isDestination = i === allNodes.length - 1;
      const isStart = i === 0;

      let x = cx;
      if (!isStart && !isDestination) {
        // Alternate between left and right in a sinuous wave
        const dir = i % 2 === 1 ? -1 : 1;
        x = cx + dir * maxAmplitude;
      }

      // Progression flows from top (Start) down to bottom (Destination Landmark)
      const y = paddingTop + i * rowHeight;
      return {
        index: i,
        x,
        y,
        isDestination,
        milestone: m,
      };
    });
  }, [allNodes, containerWidth, rowHeight, paddingTop]);

  // Living Swa companion controller following the roadmap stage-by-stage
  const swa = useRoadmapSwa({
    topicSlug: topicSlug || progress?.slug || 'topic',
    progress,
    milestones,
    nodePoints,
    containerWidth,
    isAllComplete,
    currentStep,
    selectedMilestoneIndex,
  });

  // Auto-scroll on mount to center active node in viewport smoothly
  const currentNodeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentNodeRef.current) {
        currentNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleMilestoneClick = (index: number) => {
    onSelectMilestone(index);
    const targetMilestone = allNodes[index];
    if (targetMilestone) {
      const isDone = isAllComplete || completedIndexes.has(index);
      const isCur = !isAllComplete && currentStep === index;
      const state = isDone ? 'completed' : isCur ? 'current' : 'upcoming';
      swa.reactToMilestone(targetMilestone, state);
    }
  };

  // Build SVG Bezier Path segments
  const pathSegments = useMemo(() => {
    const segments: { d: string; fromIdx: number; toIdx: number; isCompleted: boolean }[] = [];
    for (let i = 0; i < nodePoints.length - 1; i++) {
      const p1 = nodePoints[i];
      const p2 = nodePoints[i + 1];
      const midY = (p1.y + p2.y) / 2;
      const d = `M ${p1.x} ${p1.y} C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
      // Segment is completed if fromIdx is completed
      const isSegmentCompleted = isAllComplete || completedIndexes.has(p1.index);
      segments.push({
        d,
        fromIdx: i,
        toIdx: i + 1,
        isCompleted: isSegmentCompleted,
      });
    }
    return segments;
  }, [nodePoints, isAllComplete, completedIndexes]);

  // Footprint track marks along completed segments
  const footprints = useMemo(() => {
    const prints: { x: number; y: number; rot: number }[] = [];
    pathSegments.forEach((seg) => {
      if (seg.isCompleted) {
        const p1 = nodePoints[seg.fromIdx];
        const p2 = nodePoints[seg.toIdx];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
        prints.push({ x: midX - 6, y: midY - 6, rot: angle + 90 });
        prints.push({ x: midX + 6, y: midY + 4, rot: angle + 90 });
      }
    });
    return prints;
  }, [pathSegments, nodePoints]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '760px',
        margin: '0 auto',
        minHeight: `${totalHeight}px`,
        userSelect: 'none',
      }}
    >
      {/* ─── ACCESSIBLE SCREEN-READER NAVIGATION (Visually Hidden) ─── */}
      <nav
        aria-label="Course Journey Milestones"
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {allNodes.map((node) => {
            const isDone = isAllComplete || completedIndexes.has(node.index);
            const isCurrent = !isAllComplete && currentStep === node.index;
            return (
              <li key={node.index}>
                <button
                  type="button"
                  onClick={() => handleMilestoneClick(node.index)}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {node.title} — {isDone ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ─── SVG PATH & SPOTLIGHT CANVAS ─── */}
      <svg
        width={containerWidth}
        height={totalHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <defs>
          {/* Completed Segment Glow Gradient */}
          <linearGradient id="journeyCompletedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          {/* Upcoming Track Gradient */}
          <linearGradient id="journeyUpcomingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
        </defs>

        {/* 1. Broad Road Cushion Bed */}
        {pathSegments.map((seg, idx) => (
          <path
            key={`cushion-${idx}`}
            d={seg.d}
            fill="none"
            stroke="rgba(241, 245, 249, 0.85)"
            strokeWidth="28"
            strokeLinecap="round"
          />
        ))}

        {/* 2. Soft Outer Track Glow */}
        {pathSegments.map((seg, idx) => (
          <path
            key={`glow-${idx}`}
            d={seg.d}
            fill="none"
            stroke={seg.isCompleted ? 'rgba(16, 185, 129, 0.18)' : 'rgba(148, 163, 184, 0.12)'}
            strokeWidth="14"
            strokeLinecap="round"
          />
        ))}

        {/* 3. The Actual Journey Road Line */}
        {pathSegments.map((seg, idx) => (
          <path
            key={`line-${idx}`}
            d={seg.d}
            fill="none"
            stroke={seg.isCompleted ? 'url(#journeyCompletedGrad)' : 'url(#journeyUpcomingGrad)'}
            strokeWidth={seg.isCompleted ? 6 : 4}
            strokeDasharray={seg.isCompleted ? undefined : '8 8'}
            strokeLinecap="round"
          />
        ))}

        {/* 4. Footprint Trail Marks along Completed Segments */}
        {footprints.map((fp, i) => (
          <g key={`fp-${i}`} transform={`translate(${fp.x}, ${fp.y}) rotate(${fp.rot})`}>
            {/* Small footprint paw/claw mark */}
            <circle cx="0" cy="0" r="1.8" fill="rgba(13, 148, 136, 0.45)" />
            <circle cx="-2.2" cy="-2.5" r="1" fill="rgba(13, 148, 136, 0.4)" />
            <circle cx="2.2" cy="-2.5" r="1" fill="rgba(13, 148, 136, 0.4)" />
            <circle cx="0" cy="-3.5" r="1" fill="rgba(13, 148, 136, 0.4)" />
          </g>
        ))}
      </svg>

      {/* ─── ROADMAP MILESTONE NODES ─── */}
      {nodePoints.map((point) => {
        const isDestination = point.isDestination;
        const isDone = isAllComplete || completedIndexes.has(point.index);
        const isCurrent = !isAllComplete && currentStep === point.index;
        const isSelected = selectedMilestoneIndex === point.index;

        if (isDestination) {
          // Render Destination Landmark
          return (
            <div
              key={`dest-${point.index}`}
              ref={isAllComplete ? currentNodeRef : undefined}
              style={{
                position: 'absolute',
                left: `${point.x}px`,
                top: `${point.y}px`,
                transform: 'translate(-50%, -40px)',
                zIndex: 15,
              }}
            >
              <JourneyLandmark
                themeId={themeId}
                title={destination}
                isCompleted={isAllComplete}
                onClick={() => handleMilestoneClick(point.index)}
              />
            </div>
          );
        }

        // Calculate dynamic arrow angle along the roadmap to the next node
        const targetNextPoint = nodePoints[Math.min(point.index + 1, nodePoints.length - 1)];
        const arrowRotation =
          targetNextPoint && targetNextPoint !== point
            ? Math.atan2(targetNextPoint.y - point.y, targetNextPoint.x - point.x) * (180 / Math.PI) + 90
            : 180;

        return (
          <div
            key={`node-${point.index}`}
            ref={isCurrent ? currentNodeRef : undefined}
            style={{
              position: 'absolute',
              left: `${point.x}px`,
              top: `${point.y}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: isCurrent ? 25 : 12,
            }}
          >
            {/* Current Node Concentric Radar Waves */}
            {isCurrent && (
              <>
                <div
                  aria-hidden="true"
                  className="journey-radar-ring"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '64px',
                    height: '64px',
                    marginTop: '-32px',
                    marginLeft: '-32px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.35)',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  aria-hidden="true"
                  className="journey-radar-ring-delayed"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '64px',
                    height: '64px',
                    marginTop: '-32px',
                    marginLeft: '-32px',
                    borderRadius: '50%',
                    background: 'rgba(139, 92, 246, 0.25)',
                    pointerEvents: 'none',
                  }}
                />
              </>
            )}

            {/* Current Node "YOU ARE HERE" Floating Badge */}
            {isCurrent && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '10px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                  color: '#FFFFFF',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>YOU ARE HERE</span>
              </div>
            )}

            {/* Interactive Node Button */}
            <button
              type="button"
              onClick={() => handleMilestoneClick(point.index)}
              aria-label={`${point.milestone.title} — ${isDone ? 'Completed' : isCurrent ? 'Current step' : 'Upcoming'}`}
              className="swallern-press"
              style={{
                position: 'relative',
                width: isCurrent ? '56px' : '46px',
                height: isCurrent ? '56px' : '46px',
                borderRadius: '50%',
                background: isDone
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : isCurrent
                  ? 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)'
                  : '#F8FAFC',
                border: isDone
                  ? '3px solid #FFFFFF'
                  : isCurrent
                  ? '3px solid #FFFFFF'
                  : '2px solid #CBD5E1',
                boxShadow: isDone
                  ? '0 6px 16px rgba(16, 185, 129, 0.35), 0 0 0 2px #10B981'
                  : isCurrent
                  ? '0 8px 24px rgba(59, 130, 246, 0.45), 0 0 0 3px #3B82F6'
                  : 'none',
                color: isDone || isCurrent ? '#FFFFFF' : '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                outline: isSelected ? '3px solid #F59E0B' : 'none',
                outlineOffset: '3px',
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {isDone ? (
                // Completed Checkmark
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : isCurrent ? (
                // Current Arrow pointing along roadmap direction
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{
                    transform: `rotate(${arrowRotation}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.3s ease',
                  }}
                  aria-hidden="true"
                >
                  <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                </svg>
              ) : (
                // Locked Milestone Padlock Icon
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
            </button>

            {/* Compact Milestone Title Pill (Inspired by the speech bubbles in raodmap.png) */}
            <div
              onClick={() => handleMilestoneClick(point.index)}
              style={{
                position: 'absolute',
                top: isCurrent ? '62px' : '52px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#FFFFFF',
                border: isCurrent
                  ? '1.5px solid #BFDBFE'
                  : isDone
                  ? '1px solid #A7F3D0'
                  : '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '5px 12px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
                whiteSpace: 'nowrap',
                maxWidth: '180px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: isCurrent ? '#1D4ED8' : isDone ? '#065F46' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {!isDone && !isCurrent && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {point.milestone.title}
                </span>
              </span>
            </div>
          </div>
        );
      })}

      {/* ─── SWA COMPANION FOLLOWING THE ROADMAP STAGE BY STAGE ─── */}
      <div
        ref={swaRef}
        onClick={handleSwaTouch}
        role="button"
        tabIndex={0}
        aria-label={isChatOpen ? 'Close chat with Swa' : 'Chat with Swa'}
        aria-pressed={isChatOpen}
        className="swallern-press swa-interactive-touch"
        style={{
          position: 'absolute',
          left: `${swa.position.x}px`,
          top: `${swa.position.y}px`,
          transform: `translate(-50%, -50%) rotate(${swa.position.tilt}deg)`,
          zIndex: 35,
          cursor: 'pointer',
          pointerEvents: 'auto',
          transition: 'left 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.25s ease',
        }}
      >
        {/* Soft ground shadow beneath Swa */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '48px',
            height: '10px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15, 23, 42, 0.16) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />



        <Swa
          size={86}
          expression={isChatOpen ? 'focused' : swa.expression}
          animation={isChatOpen ? 'idle' : swa.animation}
          reaction={isChatOpen ? null : swa.reaction}
          speech={isChatOpen ? null : swa.speech}
          facing={swa.position.facing}
          onReactionComplete={onSwaReactionComplete}
          onLoaded={onSwaLoaded}
          float={false}
          interactive={true}
          speechDurationMs={4500}
          alt="Swa your journey companion at this stage"
        />
      </div>

      {/* ─── SWA CHAT — anchored beside Swa in the map ─── */}
      <SwaCompanionDialog
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        topicTitle={topicTitle || milestones[0]?.title || 'This Course'}
        topicSummary={destination}
        keyConcepts={milestones.map((m) => m.title)}
        currentMilestone={allNodes[currentStep] || null}
        completedCount={completedIndexes.size}
        totalCount={milestones.length}
        onTriggerDance={() => swa.triggerDance()}
        swaX={swa.position.x}
        swaY={swa.position.y}
        swaFacing={swa.position.facing}
        containerWidth={containerWidth}
      />

      {/* ─── FIXED CHAT FAB — bottom-right of screen ─── */}
      <button
        type="button"
        onClick={() => {
          setIsChatOpen(prev => {
            const next = !prev;
            if (next) {
              setTimeout(() => {
                swaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 80);
            }
            return next;
          });
        }}
        aria-label={isChatOpen ? 'Close Swa chat' : 'Chat with Swa'}
        className="swallern-press"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '20px',
          zIndex: 96,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: 'none',
          background: isChatOpen
            ? 'linear-gradient(135deg, #7C3AED, #4F46E5)'
            : 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isChatOpen
            ? '0 4px 20px rgba(124, 58, 237, 0.5), 0 0 0 3px rgba(139,92,246,0.25)'
            : '0 4px 16px rgba(139, 92, 246, 0.4)',
          transition: 'all 0.2s ease',
        }}
      >
        {isChatOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <span style={{ fontSize: '20px', lineHeight: 1 }}>✨</span>
        )}
      </button>

    </div>
  );
};
