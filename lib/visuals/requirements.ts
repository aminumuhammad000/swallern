/**
 * Swallern Visual System v1 — Visual Requirement Architecture
 * Section 13, 14, 24, & 25:
 * Converts educational intent into semantic visual requirements, decoupling
 * educational curriculum generation from raw image prompt engineering.
 * Preserves full backward compatibility with existing callers.
 */

import { VisualMode, VisualComplexity, SWALLERN_VISUAL_STYLE_V1, SwallernVisualStyle } from './tokens';
import { CharacterExpression, CharacterPose, EducationalAction } from './characters';
import { EnvironmentType } from './backgrounds';
import { AnimationVocabulary } from './tokens';

export type EducationalPurpose =
  | 'concept_explanation'
  | 'process_flow'
  | 'factual_real_world'
  | 'geographical_map'
  | 'interactive_motion'
  | 'explain'
  | 'diagram'
  | 'compare';

export interface VisualRequirement {
  type: VisualMode;
  visualMode?: VisualMode;
  purpose: EducationalPurpose;
  subject: string;
  concept?: string;
  category?: string;
  domain?: string;
  requiredAssets?: string[];
  optionalAssets?: string[];
  complexity?: VisualComplexity;
  characterId?: string;
  environment: EnvironmentType;
  action?: EducationalAction | CharacterPose;
  emotion?: CharacterExpression;
  style: SwallernVisualStyle;
  animation?: AnimationVocabulary;
  focalPoint: string;
  prohibitedElements: string[];
  domOverlayText?: string[]; // Section 12 rule: text rendered in React DOM, not baked into image
}

/**
 * Intelligent Mode Selector based on Educational Subject & Lesson Type
 */
export function selectVisualMode(
  subject: string,
  lessonType?: string,
  isCurrentEvent: boolean = false
): VisualMode {
  const lower = subject.toLowerCase();

  if (isCurrentEvent || lower.includes('president') || lower.includes('election') || lower.includes('news')) {
    return 'C_REAL_WORLD';
  }
  if (lower.includes('map') || lower.includes('geography') || lower.includes('migration') || lower.includes('route')) {
    return 'D_MAP';
  }
  if (lower.includes('process') || lower.includes('cycle') || lower.includes('diagram') || lower.includes('system') || lower.includes('anatomy')) {
    return 'B_DIAGRAM';
  }
  if (lower.includes('motion') || lower.includes('reaction') || lower.includes('orbit') || lower.includes('transformation')) {
    return 'E_ANIMATION';
  }

  return 'A_ILLUSTRATION';
}

/**
 * Validates a VisualRequirement instance
 */
export function validateVisualRequirement(req: VisualRequirement): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!req.subject && !req.concept) {
    errors.push('VisualRequirement must have a subject or concept');
  }

  if (req.style !== SWALLERN_VISUAL_STYLE_V1) {
    errors.push(`VisualRequirement must specify approved style '${SWALLERN_VISUAL_STYLE_V1}'`);
  }

  if (!req.focalPoint) {
    errors.push('VisualRequirement must specify a clear focalPoint');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Synthesizes a structured Visual Requirement from Educational Intent
 */
export function buildVisualRequirement(
  topicTitle: string,
  topicSummary?: string,
  options?: {
    lessonType?: string;
    isCurrentEvent?: boolean;
    characterId?: string;
    preferredMode?: VisualMode;
    category?: string;
    domain?: string;
    requiredAssets?: string[];
    optionalAssets?: string[];
    complexity?: VisualComplexity;
  }
): VisualRequirement {
  const title = topicTitle.trim();
  const lowerTitle = title.toLowerCase();
  const mode = options?.preferredMode || selectVisualMode(title, options?.lessonType, options?.isCurrentEvent);

  let environment: EnvironmentType = 'abstract';
  let action: EducationalAction | CharacterPose = 'exploring';
  let emotion: CharacterExpression = 'curious';
  let animation: AnimationVocabulary = 'float';
  let category = options?.category || 'education';

  if (lowerTitle.includes('bear') || lowerTitle.includes('wildlife') || lowerTitle.includes('katmai') || lowerTitle.includes('nature')) {
    environment = 'nature';
    category = 'nature_environment';
    action = lowerTitle.includes('hibernation') ? 'sleeping' : 'investigating';
    emotion = lowerTitle.includes('hibernation') ? 'sleepy' : 'curious';
    animation = lowerTitle.includes('hibernation') ? 'sleep' : 'bounce';
  } else if (lowerTitle.includes('space') || lowerTitle.includes('planet') || lowerTitle.includes('star') || lowerTitle.includes('galaxy')) {
    environment = 'space';
    category = 'space';
    action = 'observing';
    emotion = 'surprised';
    animation = 'float';
  } else if (lowerTitle.includes('ai') || lowerTitle.includes('tech') || lowerTitle.includes('code') || lowerTitle.includes('robot') || lowerTitle.includes('wifi') || lowerTitle.includes('internet')) {
    environment = 'laboratory';
    category = lowerTitle.includes('ai') ? 'artificial_intelligence' : 'technology';
    action = 'explaining';
    emotion = 'focused';
    animation = 'pulse';
  } else if (lowerTitle.includes('history') || lowerTitle.includes('ancient') || lowerTitle.includes('pyramid')) {
    environment = 'ancient_civilization';
    category = 'history';
    action = 'discovering';
    emotion = 'excited';
    animation = 'reveal';
  } else if (lowerTitle.includes('crop') || lowerTitle.includes('farm') || lowerTitle.includes('irrigation') || lowerTitle.includes('seed')) {
    environment = 'nature';
    category = 'agriculture';
    action = 'investigating';
    emotion = 'focused';
    animation = 'expand';
  } else if (lowerTitle.includes('bank') || lowerTitle.includes('money') || lowerTitle.includes('finance') || lowerTitle.includes('market')) {
    environment = 'classroom';
    category = 'finance_economics';
    action = 'explaining';
    emotion = 'focused';
    animation = 'highlight';
  }

  const focalPoint = `Clear central depiction of ${title} with high contrast against the ${environment} background`;

  // Standard Golden Rule prohibited elements
  const prohibitedElements = [
    'Baked-in text or spelling errors',
    'Complex realistic photorealism when illustration is requested',
    'Crowded scenes with competing focal points',
    'Drifting non-canonical character proportions',
    'Generic corporate stock art',
  ];

  return {
    type: mode,
    visualMode: mode,
    purpose: mode === 'B_DIAGRAM' ? 'process_flow' : mode === 'C_REAL_WORLD' ? 'factual_real_world' : mode === 'D_MAP' ? 'geographical_map' : 'concept_explanation',
    subject: title,
    concept: title,
    category,
    domain: options?.domain,
    requiredAssets: options?.requiredAssets,
    optionalAssets: options?.optionalAssets,
    complexity: options?.complexity || (mode === 'B_DIAGRAM' ? 'diagram' : 'moderate'),
    characterId: options?.characterId || 'swallern_bear_v1',
    environment,
    action,
    emotion,
    style: SWALLERN_VISUAL_STYLE_V1,
    animation,
    focalPoint,
    prohibitedElements,
    domOverlayText: [title],
  };
}
