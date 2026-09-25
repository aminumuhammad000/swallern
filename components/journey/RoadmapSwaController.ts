'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { SwaReaction, SwaExpression, SwaAnimation } from '@/components/swa';
import type { JourneyMilestone } from '@/components/journey/JourneyRoadmap';
import type { TopicProgressState } from '@/lib/learning/progress';

export type RoadmapSwaState =
  | 'idle'
  | 'watching'
  | 'curious'
  | 'happy'
  | 'excited'
  | 'celebrating'
  | 'lookingAtNext'
  | 'turning'
  | 'movingToNext'
  | 'arriving'
  | 'encouraging'
  | 'sitting'
  | 'tired'
  | 'lookingFar';

export interface SwaPosition {
  x: number;
  y: number;
  facing: 1 | -1;
  tilt: number;
}

export interface UseRoadmapSwaProps {
  topicSlug: string;
  progress: TopicProgressState | null;
  milestones: JourneyMilestone[];
  nodePoints: Array<{ index: number; x: number; y: number; isDestination: boolean; milestone: JourneyMilestone }>;
  containerWidth: number;
  isAllComplete: boolean;
  currentStep: number;
  selectedMilestoneIndex?: number | null;
}

/**
 * Calculates Swa's stationary resting position alongside a roadmap node.
 * Swa perches alongside the node so as never to cover buttons or text labels.
 */
export function getSwaRestPosition(
  point: { x: number; y: number },
  containerWidth: number
): SwaPosition {
  const cx = containerWidth / 2;
  const isRightSide = point.x > cx + 10;
  const isLeftSide = point.x < cx - 10;
  const offsetDistance = containerWidth < 420 ? 68 : 84;

  let swaX: number;
  let facing: 1 | -1;

  if (isRightSide) {
    swaX = point.x - offsetDistance;
    facing = 1;
  } else if (isLeftSide) {
    swaX = point.x + offsetDistance;
    facing = -1;
  } else {
    swaX = point.x + (containerWidth < 420 ? 60 : 75);
    facing = -1;
  }

  return { x: swaX, y: point.y - 14, facing, tilt: 0 };
}

/**
 * Cubic Bezier point & tangent calculation (kept for reference / future use)
 */
export function cubicBezier(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
): { x: number; y: number; dx: number; dy: number } {
  const invT = 1 - t;
  const invT2 = invT * invT;
  const invT3 = invT2 * invT;
  const t2 = t * t;
  const t3 = t2 * t;

  const x = invT3 * p0.x + 3 * invT2 * t * p1.x + 3 * invT * t2 * p2.x + t3 * p3.x;
  const y = invT3 * p0.y + 3 * invT2 * t * p1.y + 3 * invT * t2 * p2.y + t3 * p3.y;
  const dx = 3 * invT2 * (p1.x - p0.x) + 6 * invT * t * (p2.x - p1.x) + 3 * t2 * (p3.x - p2.x);
  const dy = 3 * invT2 * (p1.y - p0.y) + 6 * invT * t * (p2.y - p1.y) + 3 * t2 * (p3.y - p2.y);

  return { x, y, dx, dy };
}

/**
 * Hook managing Swa's behavioral state machine on the roadmap.
 * Swa stays contextual and rests at the learner's current stage when they return.
 * If the user decides to go back or inspect earlier milestones, Swa accompanies them.
 */
export function useRoadmapSwa({
  topicSlug,
  progress,
  milestones,
  nodePoints,
  containerWidth,
  isAllComplete,
  currentStep,
  selectedMilestoneIndex,
}: UseRoadmapSwaProps) {
  // Determine active milestone index based on progress
  const activeMilestoneIndex = isAllComplete
    ? Math.max(0, nodePoints.length - 1)
    : Math.min(Math.max(0, currentStep), Math.max(0, nodePoints.length - 1));

  // If learner selected an earlier milestone to inspect/go back to:
  const effectiveTargetIndex =
    selectedMilestoneIndex !== null && selectedMilestoneIndex !== undefined
      ? Math.min(Math.max(0, selectedMilestoneIndex), Math.max(0, nodePoints.length - 1))
      : activeMilestoneIndex;

  const targetPoint = nodePoints[effectiveTargetIndex] || nodePoints[0];

  const [swaState, setSwaState] = useState<RoadmapSwaState>('idle');
  const [position, setPosition] = useState<SwaPosition>(() => {
    if (targetPoint && containerWidth > 0) {
      return getSwaRestPosition(targetPoint, containerWidth);
    }
    return { x: 0, y: 0, facing: 1, tilt: 0 };
  });
  const [expression, setExpression] = useState<SwaExpression>('neutral');
  const [animation, setAnimation] = useState<SwaAnimation>('idle');
  const [reaction, setReaction] = useState<SwaReaction | null>(null);
  const [speech, setSpeech] = useState<string | null>(null);

  const activeStepRef = useRef<number>(effectiveTargetIndex);
  const initializedRef = useRef<boolean>(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // ─── Helper to schedule return to idle ───
  const scheduleIdle = useCallback((delayMs: number) => {
    const t = setTimeout(() => {
      setSwaState('idle');
      setAnimation('idle');
      setReaction(null);
      setSpeech(null);
      setExpression('neutral');
    }, delayMs);
    timeoutsRef.current.push(t);
  }, []);

  // ─── MOVE SWA BETWEEN NODES (smooth travel state) ───
  const runToStep = useCallback(
    (fromIndex: number, toIndex: number, onArrival?: () => void) => {
      const fromPoint = nodePoints[Math.min(fromIndex, Math.max(0, nodePoints.length - 1))];
      const toPoint = nodePoints[Math.min(toIndex, Math.max(0, nodePoints.length - 1))];
      if (!fromPoint || !toPoint) return;

      const pStart = getSwaRestPosition(fromPoint, containerWidth);
      const pEnd = getSwaRestPosition(toPoint, containerWidth);

      // Face direction of movement
      const facing = toPoint.x > fromPoint.x ? 1 : toPoint.x < fromPoint.x ? -1 : pEnd.facing;

      setSwaState('movingToNext');
      setAnimation('run');
      setExpression('neutral');
      setPosition({ ...pStart, facing });

      const moveTimer = setTimeout(() => {
        // Arrived at destination node: stop immediately and stand idle
        setPosition(pEnd);
        setSwaState('idle');
        setAnimation('idle');
        setExpression('neutral');
        setSpeech(null);
        onArrival?.();
      }, 550);
      timeoutsRef.current.push(moveTimer);
    },
    [nodePoints, containerWidth]
  );

  // ─── INITIALIZATION & STAGE TRACKING ───
  useEffect(() => {
    if (!targetPoint || containerWidth <= 0) return;

    if (!initializedRef.current) {
      initializedRef.current = true;
      activeStepRef.current = effectiveTargetIndex;

      // Always place Swa directly at learner's current stage on mount (never reset to 0)
      const restPos = getSwaRestPosition(targetPoint, containerWidth);
      setPosition(restPos);
      setSwaState('idle');
      setAnimation('idle');
      setExpression('neutral');

      if (typeof window !== 'undefined') {
        localStorage.setItem(`swallern_last_stage_${topicSlug}`, String(effectiveTargetIndex));
      }
      return;
    }

    if (effectiveTargetIndex !== activeStepRef.current) {
      const prev = activeStepRef.current;
      activeStepRef.current = effectiveTargetIndex;
      runToStep(prev, effectiveTargetIndex);
    } else {
      // Container resize: update resting position
      const restPos = getSwaRestPosition(targetPoint, containerWidth);
      setPosition(restPos);
    }
  }, [
    targetPoint,
    containerWidth,
    effectiveTargetIndex,
    topicSlug,
    runToStep,
  ]);


  // ─── 5. INTERACTIVE NODE REACTION ───
  const reactToMilestone = useCallback(
    (milestone: JourneyMilestone, nodeState: 'completed' | 'current' | 'upcoming') => {
      clearAllTimers();

      if (nodeState === 'completed') {
        setSwaState('happy');
        setExpression('happy');
        setAnimation('happy');
        setReaction('success');
        setSpeech(`You conquered: ${milestone.title} ✓`);
      } else if (nodeState === 'current') {
        // Swa points at the milestone — scouting/pointing pose
        setSwaState('lookingAtNext');
        setExpression('focused');
        setAnimation('point');
        setReaction('discovery');
        setSpeech(`That's our next stop!`);
      } else {
        // Upcoming — Swa shades eyes to look far (curious pose)
        setSwaState('lookingFar');
        setExpression('curious');
        setAnimation('curious');
        setSpeech(`Complete Step ${currentStep + 1} first!`);
      }

      scheduleIdle(3500);
    },
    [clearAllTimers, currentStep, scheduleIdle]
  );

  // ─── 6. DANCE ───
  const triggerDance = useCallback(() => {
    clearAllTimers();
    setSwaState('celebrating');
    setExpression('celebrating');
    setAnimation('celebrate');
    setReaction('success');
    setSpeech('Woohoo! 🎉');
    scheduleIdle(3500);
  }, [clearAllTimers, scheduleIdle]);

  return {
    swaState,
    position,
    expression,
    animation,
    reaction,
    speech,
    reactToMilestone,
    runToStep,
    runToNextStep: runToStep,
    triggerDance,
  };
}
