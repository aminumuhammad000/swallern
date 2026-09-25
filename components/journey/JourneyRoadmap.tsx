'use client';

import React, { useState } from 'react';
import type { TopicProgressState } from '@/lib/learning/progress';
import type { ClassroomThemeId } from '@/lib/learning/themes';
import { JourneyWorldMap } from './JourneyWorldMap';
import { JourneyNodeSheet } from './JourneyNodeSheet';

import type { SwaReaction, SwaExpression, SwaAnimation } from '@/components/swa';

export interface JourneyMilestone {
  index: number;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  isQuiz?: boolean;
}

export interface JourneyRoadmapProps {
  milestones: JourneyMilestone[];
  progress: TopicProgressState | null;
  activeMilestoneIndex?: number;
  topicSlug: string;
  topicTitle?: string;
  destination: string;
  themeId?: ClassroomThemeId;
  swaReaction?: SwaReaction | null;
  swaSpeech?: string | null;
  swaExpression?: SwaExpression;
  swaAnimation?: SwaAnimation;
  onSwaReactionComplete?: () => void;
  onMilestoneInteracted?: (milestone: JourneyMilestone, state: 'completed' | 'current' | 'upcoming') => void;
  onSwaLoaded?: () => void;
  onSetCurrentStage?: (index: number) => void;
}

export const JourneyRoadmap: React.FC<JourneyRoadmapProps> = ({
  milestones,
  progress,
  activeMilestoneIndex,
  topicSlug,
  topicTitle,
  destination,
  themeId = 'classic_study',
  swaReaction = null,
  swaSpeech = null,
  swaExpression = 'neutral',
  swaAnimation = 'idle',
  onSwaReactionComplete,
  onMilestoneInteracted,
  onSwaLoaded,
  onSetCurrentStage,
}) => {
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number | null>(null);
  const effectiveCurrent = activeMilestoneIndex !== undefined ? activeMilestoneIndex : (progress?.currentStep ?? 0);

  const handleSelectMilestone = (index: number) => {
    setSelectedMilestoneIndex(index);

    // Identify milestone and state
    const isDestination = index >= milestones.length;
    const targetMilestone: JourneyMilestone = isDestination
      ? {
          index: milestones.length,
          title: destination,
          description: 'You have reached the final destination of this course!',
          estimatedMinutes: 2,
        }
      : milestones[index];

    let state: 'completed' | 'current' | 'upcoming' = 'upcoming';
    if (progress?.isCompleted || (progress?.completedStepIndexes?.includes(index) ?? false)) {
      state = 'completed';
    } else if (effectiveCurrent === index) {
      state = 'current';
    }

    onMilestoneInteracted?.(targetMilestone, state);
  };

  const handleCloseSheet = () => {
    setSelectedMilestoneIndex(null);
  };

  // Determine selected milestone and its state
  const selectedMilestone: JourneyMilestone | null =
    selectedMilestoneIndex !== null
      ? selectedMilestoneIndex >= milestones.length
        ? {
            index: milestones.length,
            title: destination,
            description: 'You have reached the final destination of this course!',
            estimatedMinutes: 2,
          }
        : milestones[selectedMilestoneIndex]
      : null;

  const selectedState: 'completed' | 'current' | 'upcoming' =
    selectedMilestoneIndex !== null
      ? progress?.isCompleted || (progress?.completedStepIndexes?.includes(selectedMilestoneIndex) ?? false)
        ? 'completed'
        : effectiveCurrent === selectedMilestoneIndex
        ? 'current'
        : 'upcoming'
      : 'upcoming';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* ─── Visual Learning World Map ─── */}
      <JourneyWorldMap
        milestones={milestones}
        progress={progress}
        activeMilestoneIndex={activeMilestoneIndex}
        topicSlug={topicSlug}
        topicTitle={topicTitle}
        destination={destination}
        themeId={themeId}
        selectedMilestoneIndex={selectedMilestoneIndex}
        onSelectMilestone={handleSelectMilestone}
        swaReaction={swaReaction}
        swaSpeech={swaSpeech}
        swaExpression={swaExpression}
        swaAnimation={swaAnimation}
        onSwaReactionComplete={onSwaReactionComplete}
        onSwaLoaded={onSwaLoaded}
      />

      {/* ─── Active Milestone Detail Sheet ─── */}
      <JourneyNodeSheet
        milestone={selectedMilestone}
        state={selectedState}
        topicSlug={topicSlug}
        isDestination={selectedMilestoneIndex !== null && selectedMilestoneIndex >= milestones.length}
        currentStep={effectiveCurrent}
        onSetCurrentStage={onSetCurrentStage}
        onClose={handleCloseSheet}
      />
    </div>
  );
};
