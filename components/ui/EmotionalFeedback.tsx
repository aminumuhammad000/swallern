'use client';

import React from 'react';
import { SwallernCharacter } from '@/components/visuals/SwallernCharacter';
import { CharacterExpression, CharacterPose } from '@/lib/visuals/characters';

export type EmotionalState =
  | 'curiosity'
  | 'anticipation'
  | 'focus'
  | 'understanding'
  | 'correct'
  | 'incorrect'
  | 'encouragement'
  | 'completion'
  | 'discovery'
  | 'celebration';

interface EmotionalFeedbackProps {
  state: EmotionalState;
  title?: string;
  message?: string;
  showMascot?: boolean;
  mascotSize?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const EMOTIONAL_CONFIGS: Record<
  EmotionalState,
  {
    defaultTitle: string;
    defaultMessage: string;
    expression: CharacterExpression;
    pose: CharacterPose;
    bg: string;
    borderColor: string;
    textColor: string;
    badgeVariant: string;
  }
> = {
  curiosity: {
    defaultTitle: 'Curious Mind',
    defaultMessage: 'Let’s explore what makes this concept so fascinating.',
    expression: 'curious',
    pose: 'discovering',
    bg: '#EFF6FF',
    borderColor: '#BFDBFE',
    textColor: '#1E40AF',
    badgeVariant: 'indigo',
  },
  anticipation: {
    defaultTitle: 'Ready to Discover',
    defaultMessage: 'Here comes a pivotal concept in this lesson.',
    expression: 'curious',
    pose: 'pointing',
    bg: '#F5F3FF',
    borderColor: '#DDD6FE',
    textColor: '#5B21B6',
    badgeVariant: 'purple',
  },
  focus: {
    defaultTitle: 'Core Concept',
    defaultMessage: 'Take a moment to absorb this key detail.',
    expression: 'focused',
    pose: 'thinking',
    bg: '#F8FAFC',
    borderColor: '#E2E8F0',
    textColor: '#334155',
    badgeVariant: 'neutral',
  },
  understanding: {
    defaultTitle: 'Clear & Crisp',
    defaultMessage: 'Everything connects when we break it into simple steps.',
    expression: 'curious',
    pose: 'pointing',
    bg: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#065F46',
    badgeVariant: 'success',
  },
  correct: {
    defaultTitle: "You've got it.",
    defaultMessage: 'Nice — that makes sense.',
    expression: 'excited',
    pose: 'celebrating',
    bg: '#F0FDF4',
    borderColor: '#86EFAC',
    textColor: '#166534',
    badgeVariant: 'success',
  },
  incorrect: {
    defaultTitle: 'Not quite. Let’s look at it again.',
    defaultMessage: 'Think about how the core principles fit together.',
    expression: 'confused',
    pose: 'thinking',
    bg: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#92400E',
    badgeVariant: 'warning',
  },
  encouragement: {
    defaultTitle: 'Keep Going',
    defaultMessage: 'You are making steady progress step by step.',
    expression: 'excited',
    pose: 'waving',
    bg: '#EEF2FF',
    borderColor: '#C7D2FE',
    textColor: '#3730A3',
    badgeVariant: 'indigo',
  },
  completion: {
    defaultTitle: 'Lesson Mastered',
    defaultMessage: 'Great job! You have understood all concepts in this lesson.',
    expression: 'excited',
    pose: 'celebrating',
    bg: '#F0FDF4',
    borderColor: '#BBF7D0',
    textColor: '#15803D',
    badgeVariant: 'success',
  },
  discovery: {
    defaultTitle: 'New Discovery!',
    defaultMessage: 'You unlocked a new idea in your learning journey.',
    expression: 'surprised',
    pose: 'discovering',
    bg: '#ECFEFF',
    borderColor: '#A5F3FC',
    textColor: '#155E75',
    badgeVariant: 'cyan',
  },
  celebration: {
    defaultTitle: 'Course Complete! 🎉',
    defaultMessage: 'You explored and mastered this topic from start to finish.',
    expression: 'excited',
    pose: 'celebrating',
    bg: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
    borderColor: '#818CF8',
    textColor: '#312E81',
    badgeVariant: 'indigo',
  },
};

export const EmotionalFeedback: React.FC<EmotionalFeedbackProps> = ({
  state,
  title,
  message,
  showMascot = true,
  mascotSize = 64,
  className = '',
  style = {},
  children,
}) => {
  const config = EMOTIONAL_CONFIGS[state] || EMOTIONAL_CONFIGS.curiosity;

  return (
    <div
      className={`swallern-emotional-feedback ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 20px',
        borderRadius: '12px',
        background: config.bg,
        border: `1px solid ${config.borderColor}`,
        color: config.textColor,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
    >
      {showMascot && (
        <div style={{ flexShrink: 0 }}>
          <SwallernCharacter
            characterId="swallern_bear_v1"
            expression={config.expression}
            pose={config.pose}
            size={mascotSize}
          />
        </div>
      )}

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '2px', color: config.textColor }}>
          {title || config.defaultTitle}
        </div>
        <div style={{ fontSize: '0.84375rem', lineHeight: 1.5, opacity: 0.9, margin: 0 }}>
          {message || config.defaultMessage}
        </div>
        {children && <div style={{ marginTop: '10px' }}>{children}</div>}
      </div>
    </div>
  );
};
