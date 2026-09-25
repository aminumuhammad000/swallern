/**
 * Swallern Course Builder — Types & State Definitions
 * Multi-step guided workflow types and course model contracts.
 */

import { VisualSelectionValue } from '@/components/visuals/SwallernVisualSelector';

export type BuilderStep = 'basics' | 'structure' | 'lessons' | 'visuals' | 'review' | 'publish';

export interface BuilderStepConfig {
  id: BuilderStep;
  number: number;
  label: string;
  description: string;
}

export const BUILDER_STEPS: BuilderStepConfig[] = [
  { id: 'basics', number: 1, label: 'Basics', description: 'Title, category, difficulty & summary' },
  { id: 'structure', number: 2, label: 'Structure', description: 'Modules and lesson hierarchy' },
  { id: 'lessons', number: 3, label: 'Lessons', description: 'Content, key concepts & knowledge checks' },
  { id: 'visuals', number: 4, label: 'Visuals', description: 'Visual mode & mascot configuration' },
  { id: 'review', number: 5, label: 'Review', description: 'Bite-sized validation & structure check' },
  { id: 'publish', number: 6, label: 'Publish', description: 'Visibility & submission settings' },
];

export interface BuilderLessonData {
  id: string;
  title: string;
  content: string;
  key_concept?: string;
  visual: VisualSelectionValue;
  media?: Array<{
    type?: string;
    url?: string;
    asset_key?: string;
    credit?: string;
  }>;
  knowledge_check: {
    question: string;
    explanation?: string;
    options: Array<{
      text: string;
      is_correct: boolean;
    }>;
  };
}

export interface BuilderSectionData {
  id: string;
  title: string;
  summary?: string;
  lessons: BuilderLessonData[];
}

export interface BuilderCourseData {
  title: string;
  summary: string;
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  visibility: 'PRIVATE' | 'LINK_ONLY' | 'PUBLIC';
  sections: BuilderSectionData[];
  final_quiz: {
    title: string;
    passing_score: number;
    questions: Array<{
      question: string;
      explanation?: string;
      options: Array<{
        text: string;
        is_correct: boolean;
      }>;
    }>;
  };
  sources: Array<{
    id?: string;
    title: string;
    url: string;
    publisher?: string;
  }>;
}
