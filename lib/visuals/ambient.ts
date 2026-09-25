/**
 * Swallern Visual System v1 — Ambient Atmospheric Elements Registry
 * Section 11: Reusable background details, classroom accessories, and subtle environmental accents
 * that build warm atmosphere without competing with focal educational objects.
 */

import { VisualAsset } from './assets';
import { SWALLERN_VISUAL_STYLE_V1 } from './tokens';

export type AmbientElementType =
  | 'plant'
  | 'cloud'
  | 'star'
  | 'sun'
  | 'moon'
  | 'books'
  | 'lamp'
  | 'clock'
  | 'wall_note'
  | 'paper'
  | 'balloon'
  | 'bunting'
  | 'leaf'
  | 'flower'
  | 'desk_item';

export const CANONICAL_AMBIENT_ASSETS: VisualAsset[] = [
  {
    id: 'ambient_cloud_v1',
    version: '1.0',
    name: 'fluffy_cloud',
    displayName: 'Soft White Cloud',
    family: 'ambient',
    categoryIds: ['nature_environment', 'science', 'geography'],
    tags: ['cloud', 'sky', 'weather', 'ambient', 'atmosphere'],
    aliases: ['white cloud', 'fluffy cloud', 'cumulus cloud'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'illustration',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'simple',
    description: 'Puffy white cloud with soft rounded lobes and gentle blue shadow underside.',
    defaultColor: '#FFFFFF',
  },
  {
    id: 'ambient_star_v1',
    version: '1.0',
    name: 'glowing_star',
    displayName: 'Four-Point Twinkle Star',
    family: 'ambient',
    categoryIds: ['space', 'science', 'education'],
    tags: ['star', 'twinkle', 'sparkle', 'night', 'ambient'],
    aliases: ['twinkle star', 'four-point star', 'cosmic sparkle'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'illustration',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'simple',
    description: 'Crisp four-point golden twinkle star with soft radial glow aura.',
    defaultColor: '#F59E0B',
  },
  {
    id: 'ambient_sun_v1',
    version: '1.0',
    name: 'warm_sun',
    displayName: 'Radiant Morning Sun',
    family: 'ambient',
    categoryIds: ['nature_environment', 'science'],
    tags: ['sun', 'sunlight', 'solar', 'morning', 'warmth'],
    aliases: ['warm sun', 'radiant sun', 'yellow sun'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'illustration',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'simple',
    description: 'Warm golden circular sun with rounded radiant rays.',
    defaultColor: '#F59E0B',
  },
  {
    id: 'ambient_plant_v1',
    version: '1.0',
    name: 'potted_succulent',
    displayName: 'Desk Potted Succulent',
    family: 'ambient',
    categoryIds: ['nature_environment', 'education', 'everyday_life'],
    tags: ['plant', 'succulent', 'pot', 'desk', 'greenery'],
    aliases: ['desk plant', 'potted plant', 'indoor succulent'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'illustration',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'simple',
    description: 'Rounded terracotta pot containing a friendly emerald green succulent.',
    defaultColor: '#10B981',
  },
  {
    id: 'ambient_wall_note_v1',
    version: '1.0',
    name: 'sticky_wall_note',
    displayName: 'Yellow Sticky Note',
    family: 'ambient',
    categoryIds: ['education', 'business', 'everyday_life'],
    tags: ['note', 'sticky_note', 'reminder', 'paper', 'wall'],
    aliases: ['post-it note', 'sticky pad', 'memo paper'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'illustration',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'simple',
    description: 'Pastel yellow square sticky note with folded lower corner.',
    defaultColor: '#FEF08A',
  },
];
