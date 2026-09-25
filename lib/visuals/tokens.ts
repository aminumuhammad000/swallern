/**
 * Swallern Visual System v1 — Core Tokens & Design Constants
 * Establishes formal semantic color tokens, visual personality guidelines,
 * mode definitions, composition rules, complexity levels, and animation vocabulary.
 */

export const VISUAL_SYSTEM_VERSION = '1.0';
export const SWALLERN_VISUAL_STYLE_V1 = 'swallern_v1' as const;
export type SwallernVisualStyle = typeof SWALLERN_VISUAL_STYLE_V1;

export interface VisualColorToken {
  name: string;
  hex: string;
  usage: string;
}

/**
 * Core Swallern Color System Tokens
 */
export const SWALLERN_COLOR_PALETTE = {
  blue: { name: 'Swallern Blue', hex: '#3B82F6', usage: 'Primary accent, active states, mascot backpack' },
  teal: { name: 'Teal', hex: '#0D9488', usage: 'Science, nature, evidence badges' },
  green: { name: 'Green', hex: '#10B981', usage: 'Success, correct quiz answers, progress' },
  yellow: { name: 'Yellow', hex: '#F59E0B', usage: 'Curiosity, highlights, energy' },
  orange: { name: 'Orange', hex: '#F97316', usage: 'Warmth, warnings, focal points' },
  purple: { name: 'Purple', hex: '#8B5CF6', usage: 'Deep concepts, space, abstract thinking' },
  navy: { name: 'Navy', hex: '#0F172A', usage: 'Dark text, high-contrast dark cards' },
  bgLight: { name: 'Neutral Light BG', hex: '#F8FAFC', usage: 'Clean background canvas' },
  textDark: { name: 'Neutral Dark Text', hex: '#0F172A', usage: 'Primary typography' },
} as const;

/**
 * Visual Complexity Classification (Section 39)
 */
export type VisualComplexity =
  | 'simple'     // Single object or simple concept
  | 'moderate'   // Character + Object or dual relationship
  | 'complex'    // Multi-object scene with atmosphere
  | 'diagram'    // Structured process, cycle, or flow
  | 'scene';     // Full environment with characters and ambient elements

/**
 * Visual Personality Characteristics
 */
export const SWALLERN_PERSONALITY_TRAITS = [
  'Curious',
  'Intelligent',
  'Friendly',
  'Playful',
  'Clear',
  'Modern',
  'Encouraging',
  'Approachable',
  'Educational, not childish',
] as const;

/**
 * Approved Visual Modes (Section 9 of Visual System Spec)
 */
export type VisualMode = 
  | 'A_ILLUSTRATION'  // Best for concepts, explanations, introductions
  | 'B_DIAGRAM'       // Best for processes, systems, anatomy, scientific relationships
  | 'C_REAL_WORLD'    // Best for current events, real people, historical locations
  | 'D_MAP'           // Best for geography, migration, regional comparisons
  | 'E_ANIMATION';    // Best for processes, transformations, movement

export interface VisualModeDefinition {
  mode: VisualMode;
  name: string;
  description: string;
  bestFor: string[];
}

export const VISUAL_MODES: Record<VisualMode, VisualModeDefinition> = {
  A_ILLUSTRATION: {
    mode: 'A_ILLUSTRATION',
    name: 'Swallern Illustration',
    description: 'Rounded forms, soft geometry, friendly proportions, clean silhouettes',
    bestFor: ['concepts', 'explanations', 'introductions', 'emotional moments', 'abstract ideas'],
  },
  B_DIAGRAM: {
    mode: 'B_DIAGRAM',
    name: 'Educational Diagram',
    description: 'High-contrast textbook structure, clear node relationships, process flows',
    bestFor: ['processes', 'systems', 'anatomy', 'scientific relationships', 'timelines', 'comparisons'],
  },
  C_REAL_WORLD: {
    mode: 'C_REAL_WORLD',
    name: 'Real-World Photography',
    description: 'High-clarity factual photography for real-world accuracy',
    bestFor: ['real people', 'current events', 'geography', 'historical locations', 'animals'],
  },
  D_MAP: {
    mode: 'D_MAP',
    name: 'Educational Map',
    description: 'Clean cartographic layouts, migration paths, geographical context',
    bestFor: ['geography', 'migration', 'historical events', 'locations', 'regional comparisons'],
  },
  E_ANIMATION: {
    mode: 'E_ANIMATION',
    name: 'Interactive Animation',
    description: 'Subtle, smooth motion reinforcing educational transformations',
    bestFor: ['processes', 'transformations', 'movement', 'reactions', 'memorable concepts'],
  },
};

/**
 * Animation Vocabulary (Section 10 of Visual System Spec)
 */
export type AnimationVocabulary =
  | 'bounce'
  | 'pop'
  | 'wave'
  | 'blink'
  | 'celebrate'
  | 'shake'
  | 'point'
  | 'float'
  | 'walk'
  | 'sleep'
  | 'reveal'
  | 'expand'
  | 'highlight'
  | 'pulse'
  | 'rotate';

export const ANIMATION_VOCABULARY_LIST: AnimationVocabulary[] = [
  'bounce',
  'pop',
  'wave',
  'blink',
  'celebrate',
  'shake',
  'point',
  'float',
  'walk',
  'sleep',
  'reveal',
  'expand',
  'highlight',
  'pulse',
  'rotate',
];

/**
 * Composition Rule Check: Ensure 1 dominant color family + 1-3 supporting colors
 */
export function validatePaletteUsage(colors: string[]): { isValid: boolean; reason?: string } {
  if (colors.length < 1) {
    return { isValid: false, reason: 'At least 1 dominant color family is required' };
  }
  if (colors.length > 4) {
    return { isValid: false, reason: 'Max 1 dominant + 3 supporting colors allowed to maintain visual harmony' };
  }
  return { isValid: true };
}
