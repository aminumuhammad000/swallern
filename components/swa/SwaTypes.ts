import React from 'react';

/**
 * Swallern Swa Character System v2 — Core Types
 * Swa canonical 3D learning companion character types & state machine definitions.
 * Canonical Asset: /characters/swa/swa_v2.glb (Meshy_AI_Twinklefin_All_Animations.glb)
 */

/** Real GLTF embedded animation clip names */
export type SwaClipName = 'Running' | 'Walking' | 'restpose';

export const SWA_EMBEDDED_CLIPS: readonly SwaClipName[] = [
  'Running',
  'Walking',
  'restpose',
] as const;

export type SwaExpression =
  | 'neutral'
  | 'curious'
  | 'happy'
  | 'excited'
  | 'surprised'
  | 'confused'
  | 'thinking'
  | 'focused'
  | 'proud'
  | 'concerned'
  | 'celebrating'
  | 'sleepy';

export type SwaAnimation =
  | 'idle'
  | 'walk'
  | 'run'
  | 'rest'
  | 'curious'
  | 'thinking'
  | 'happy'
  | 'excited'
  | 'surprised'
  | 'confused'
  | 'focused'
  | 'point'
  | 'discover'
  | 'wave'
  | 'celebrate'
  | 'sleep';

/**
 * Educational Reactions
 * Event-driven temporary behavioral states triggered by learning milestones.
 */
export type SwaReaction =
  | 'welcome'
  | 'success'
  | 'incorrect'
  | 'discovery'
  | 'milestone'
  | 'lessonComplete'
  | 'courseComplete';

export interface SwaReactionConfig {
  expression: SwaExpression;
  animation: SwaAnimation;
  clip?: SwaClipName;
  durationMs: number;
  defaultSpeech?: string;
}

export const SWA_REACTIONS: Record<SwaReaction, SwaReactionConfig> = {
  welcome: {
    expression: 'happy',
    animation: 'wave',
    clip: 'restpose',
    durationMs: 2400,
    defaultSpeech: 'Welcome back! Ready to explore?',
  },
  success: {
    expression: 'happy',
    animation: 'happy',
    clip: 'Walking',
    durationMs: 2200,
    defaultSpeech: "That's exactly right!",
  },
  incorrect: {
    expression: 'concerned',
    animation: 'curious',
    clip: 'restpose',
    durationMs: 2200,
    defaultSpeech: "Close! Let's take another look.",
  },
  discovery: {
    expression: 'curious',
    animation: 'discover',
    clip: 'restpose',
    durationMs: 2500,
    defaultSpeech: 'Something interesting here...',
  },
  milestone: {
    expression: 'proud',
    animation: 'celebrate',
    clip: 'Walking',
    durationMs: 2800,
    defaultSpeech: 'Milestone reached! Great work.',
  },
  lessonComplete: {
    expression: 'celebrating',
    animation: 'celebrate',
    clip: 'Running',
    durationMs: 3200,
    defaultSpeech: 'Lesson complete! Well done.',
  },
  courseComplete: {
    expression: 'celebrating',
    animation: 'celebrate',
    clip: 'Running',
    durationMs: 4000,
    defaultSpeech: 'Course complete! You made it all the way!',
  },
};

export type SwaSize = 'small' | 'medium' | 'large' | 'xlarge' | number;

export const SWA_SIZE_MAP: Record<'small' | 'medium' | 'large' | 'xlarge', number> = {
  small: 130,
  medium: 180,
  large: 260,
  xlarge: 340,
};

export function resolveSwaSize(size?: SwaSize): number {
  if (typeof size === 'number') return size;
  if (!size) return SWA_SIZE_MAP.medium;
  return SWA_SIZE_MAP[size] ?? SWA_SIZE_MAP.medium;
}

/**
 * Learning state abstraction
 * Maps educational context directly to Swa expression and animation.
 */
export type SwaLearningState =
  | 'idle'
  | 'answering'
  | 'correct'
  | 'incorrect'
  | 'discovering'
  | 'milestone'
  | 'completing';

export function mapLearningStateToSwa(state: SwaLearningState): {
  expression: SwaExpression;
  animation: SwaAnimation;
} {
  switch (state) {
    case 'answering':
      return { expression: 'focused', animation: 'focused' };
    case 'correct':
      return { expression: 'happy', animation: 'happy' };
    case 'incorrect':
      return { expression: 'concerned', animation: 'curious' };
    case 'discovering':
      return { expression: 'curious', animation: 'discover' };
    case 'milestone':
      return { expression: 'proud', animation: 'celebrate' };
    case 'completing':
      return { expression: 'celebrating', animation: 'celebrate' };
    case 'idle':
    default:
      return { expression: 'neutral', animation: 'idle' };
  }
}

/**
 * Public Swa Component Props
 */
export interface SwaProps {
  /** Target facial/posture expression */
  expression?: SwaExpression;
  /** Logical animation intent */
  animation?: SwaAnimation;
  /** Transient educational reaction (overrides animation temporarily, then returns to baseline) */
  reaction?: SwaReaction | null;
  /** Callback fired when a reaction animation completes */
  onReactionComplete?: () => void;
  /** High-level learning state (auto-sets expression & animation if provided) */
  learningState?: SwaLearningState;
  /** Preset size or explicit pixel dimension */
  size?: SwaSize;
  /** Optional speech bubble text */
  speech?: string | null;
  /** Whether to show speech bubble automatically on mount */
  showSpeechOnMount?: boolean;
  /** Duration for speech bubble before auto-fading (ms) */
  speechDurationMs?: number;
  /** Whether to enable gentle bob/floating motion */
  float?: boolean;
  /** Whether Swa tracks mouse pointer with subtle head gaze (default false: Swa does not follow mouse) */
  interactive?: boolean;
  /** Whether to slowly rotate around Y axis */
  autoRotate?: boolean;
  /** Animation playback speed multiplier (default 1.0) */
  playbackSpeed?: number;
  /** Custom model URL (defaults to /characters/swa/swa_v2.glb) */
  modelUrl?: string;
  /** Camera framing distance multiplier */
  cameraDistance?: number;
  /** Camera framing height offset */
  cameraHeight?: number;
  /** 2D fallback image path in case WebGL is unavailable */
  fallbackImage?: string;
  /** Accessible label */
  alt?: string;
  /** Custom CSS classes */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Callback fired when 3D model finishes loading */
  onLoaded?: () => void;
  /** Callback fired if 3D model fails to load */
  onError?: (error: Error) => void;
}
