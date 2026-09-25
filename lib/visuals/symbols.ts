/**
 * Swallern Visual System v1 — Educational Symbols & Indicators Registry
 * Section 12: Semantic visual symbols used inside diagrams and illustrations
 * (distinct from application UI buttons/icons).
 */

import { VisualAsset } from './assets';
import { SWALLERN_VISUAL_STYLE_V1 } from './tokens';

export type EducationalSymbolType =
  | 'arrow'
  | 'check'
  | 'warning'
  | 'question'
  | 'idea'
  | 'search'
  | 'magnify'
  | 'connection'
  | 'location'
  | 'time'
  | 'success'
  | 'error'
  | 'growth'
  | 'direction'
  | 'comparison';

export const CANONICAL_SYMBOL_ASSETS: VisualAsset[] = [
  {
    id: 'symbol_flow_arrow_v1',
    version: '1.0',
    name: 'flow_arrow',
    displayName: 'Directional Flow Arrow',
    family: 'symbol',
    categoryIds: ['education', 'technology', 'science'],
    tags: ['arrow', 'direction', 'flow', 'pointer', 'next'],
    aliases: ['process arrow', 'flow vector', 'next arrow'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'illustration',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'simple',
    description: 'Rounded directional arrow badge indicating flow sequence in diagrams.',
    defaultColor: '#3B82F6',
  },
  {
    id: 'symbol_success_check_v1',
    version: '1.0',
    name: 'success_check',
    displayName: 'Verification Checkmark Badge',
    family: 'symbol',
    categoryIds: ['education', 'science'],
    tags: ['check', 'success', 'verified', 'correct', 'valid'],
    aliases: ['checkmark', 'tick', 'approved badge'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'illustration',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'simple',
    description: 'Emerald green circular badge with thick rounded white checkmark.',
    defaultColor: '#10B981',
  },
  {
    id: 'symbol_warning_alert_v1',
    version: '1.0',
    name: 'warning_alert',
    displayName: 'Attention Warning Badge',
    family: 'symbol',
    categoryIds: ['education', 'science', 'engineering'],
    tags: ['warning', 'alert', 'caution', 'notice', 'attention'],
    aliases: ['caution sign', 'alert triangle', 'warning badge'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'illustration',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'simple',
    description: 'Rounded amber triangle with bold exclamation mark for key educational callouts.',
    defaultColor: '#F59E0B',
  },
  {
    id: 'symbol_question_curiosity_v1',
    version: '1.0',
    name: 'question_curiosity',
    displayName: 'Curiosity Question Mark',
    family: 'symbol',
    categoryIds: ['education', 'psychology'],
    tags: ['question', 'curiosity', 'inquiry', 'mystery', 'why'],
    aliases: ['question mark', 'inquiry symbol', 'why badge'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'illustration',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'simple',
    description: 'Vibrant purple rounded question mark symbolizing inquiry and discovery.',
    defaultColor: '#8B5CF6',
  },
  {
    id: 'symbol_idea_spark_v1',
    version: '1.0',
    name: 'idea_spark',
    displayName: 'Insight Idea Spark',
    family: 'symbol',
    categoryIds: ['education', 'psychology', 'science'],
    tags: ['idea', 'spark', 'insight', 'eureka', 'lightbulb'],
    aliases: ['eureka spark', 'insight icon', 'idea badge'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'illustration',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'simple',
    description: 'Glowing yellow-gold insight spark indicating a breakthrough understanding.',
    defaultColor: '#F59E0B',
  },
];
