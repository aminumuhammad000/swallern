/**
 * Swallern Visual System v1 — Background Environment Library
 * Section 10: Reusable, calm backgrounds that support educational focus without visual noise.
 * Preserves backward compatibility with legacy SWALLERN_BACKGROUNDS.
 */

import { VisualAsset } from './assets';
import { SWALLERN_VISUAL_STYLE_V1 } from './tokens';

export type EnvironmentType =
  | 'classroom'
  | 'library'
  | 'laboratory'
  | 'nature'
  | 'mountains'
  | 'forest'
  | 'city'
  | 'museum'
  | 'ancient_civilization'
  | 'space'
  | 'ocean'
  | 'abstract';

export interface BackgroundEnvironmentSpec {
  environmentId: EnvironmentType;
  name: string;
  description: string;
  lightingStyle: string;
  palette: string[];
  safeOverlayArea: 'top' | 'bottom' | 'center' | 'left' | 'right';
}

export const SWALLERN_BACKGROUNDS: Record<EnvironmentType, BackgroundEnvironmentSpec> = {
  classroom: {
    environmentId: 'classroom',
    name: 'Classroom',
    description: 'Clean modern educational classroom with wooden desk, soft wall tint, and blackboard background',
    lightingStyle: 'Bright overhead daylight, warm soft shadows',
    palette: ['#F8FAFC', '#E2E8F0', '#064E3B', '#8B4513'],
    safeOverlayArea: 'top',
  },
  library: {
    environmentId: 'library',
    name: 'Library Archive',
    description: 'Warm cozy library environment with organized bookshelves and soft ambient lamps',
    lightingStyle: 'Warm golden reading light',
    palette: ['#FEF3C7', '#D97706', '#78350F', '#1E293B'],
    safeOverlayArea: 'bottom',
  },
  laboratory: {
    environmentId: 'laboratory',
    name: 'Science Lab',
    description: 'Ultra-clean white and cyan research facility with glassware and safety equipment',
    lightingStyle: 'Crisp sterile daylight',
    palette: ['#ECFEFF', '#06B6D4', '#0284C7', '#0F172A'],
    safeOverlayArea: 'top',
  },
  nature: {
    environmentId: 'nature',
    name: 'Brooks River / Wildlife Habitat',
    description: 'Natural river meadow with pine trees, clear blue water, and soft hill silhouettes',
    lightingStyle: 'Natural morning sunlight',
    palette: ['#F0FDF4', '#10B981', '#059669', '#1E3A8A'],
    safeOverlayArea: 'top',
  },
  mountains: {
    environmentId: 'mountains',
    name: 'Mountain Vista',
    description: 'Majestic rounded alpine mountains under vast crisp blue sky',
    lightingStyle: 'Bright high-altitude sun',
    palette: ['#EFF6FF', '#3B82F6', '#1E40AF', '#0F172A'],
    safeOverlayArea: 'bottom',
  },
  forest: {
    environmentId: 'forest',
    name: 'Enchanted Forest',
    description: 'Soft lush canopy with dappled sunlight beams between tall friendly trees',
    lightingStyle: 'Dappled sunlight filtering through leaves',
    palette: ['#ECFDF5', '#059669', '#064E3B', '#F59E0B'],
    safeOverlayArea: 'top',
  },
  city: {
    environmentId: 'city',
    name: 'Modern Skyline',
    description: 'Clean vector city buildings with solar panels and parks',
    lightingStyle: 'Sunset amber glow',
    palette: ['#FFF7ED', '#F97316', '#C2410C', '#0F172A'],
    safeOverlayArea: 'top',
  },
  museum: {
    environmentId: 'museum',
    name: 'History Museum',
    description: 'Spacious gallery hall with spotlighted display cases',
    lightingStyle: 'Targeted spotlight illumination',
    palette: ['#FAFAF9', '#78716C', '#292524', '#D97706'],
    safeOverlayArea: 'bottom',
  },
  ancient_civilization: {
    environmentId: 'ancient_civilization',
    name: 'Ancient Monument',
    description: 'Sandstone ruins, columns, and desert horizon under soft golden sky',
    lightingStyle: 'Warm desert golden hour',
    palette: ['#FFFBEB', '#F59E0B', '#B45309', '#78350F'],
    safeOverlayArea: 'top',
  },
  space: {
    environmentId: 'space',
    name: 'Cosmic Deep Space',
    description: 'Deep navy background with glowing purple nebula and distant stars',
    lightingStyle: 'High-contrast bioluminescent starlight',
    palette: ['#0F172A', '#581C87', '#3B82F6', '#FACC15'],
    safeOverlayArea: 'center',
  },
  ocean: {
    environmentId: 'ocean',
    name: 'Marine Ecosystem',
    description: 'Sunlit underwater ocean scene with gentle rays and coral silhouettes',
    lightingStyle: 'Sub-surface aquatic light rays',
    palette: ['#F0F9FF', '#0284C7', '#0369A1', '#0C4A6E'],
    safeOverlayArea: 'top',
  },
  abstract: {
    environmentId: 'abstract',
    name: 'Abstract Learning Canvas',
    description: 'Minimalist glassmorphism canvas with soft floating gradient blobs',
    lightingStyle: 'Soft ambient glow',
    palette: ['#FFFFFF', '#EEF2FF', '#E0E7FF', '#6366F1'],
    safeOverlayArea: 'center',
  },
};

export function getEnvironmentSpec(environmentId: EnvironmentType): BackgroundEnvironmentSpec {
  return SWALLERN_BACKGROUNDS[environmentId] || SWALLERN_BACKGROUNDS.abstract;
}

/**
 * Master Canonical Background Visual Assets
 */
export const CANONICAL_BACKGROUND_ASSETS: VisualAsset[] = [
  {
    id: 'bg_plain_canvas_v1',
    version: '1.0',
    name: 'plain_canvas',
    displayName: 'Neutral Clean Canvas',
    family: 'background',
    categoryIds: ['education', 'everyday_life'],
    tags: ['background', 'clean', 'plain', 'white', 'canvas', 'minimal'],
    aliases: ['white background', 'plain background', 'clean canvas'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'illustration',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'simple',
    description: 'Neutral ultra-clean canvas (#F8FAFC) allowing visual assets to pop.',
    defaultColor: '#F8FAFC',
  },
  {
    id: 'bg_soft_gradient_v1',
    version: '1.0',
    name: 'soft_gradient',
    displayName: 'Subtle Soft Sky Gradient',
    family: 'background',
    categoryIds: ['education', 'arts_design'],
    tags: ['background', 'gradient', 'sky', 'pastel', 'soft'],
    aliases: ['sky gradient', 'pastel gradient', 'blue gradient'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'illustration',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'simple',
    description: 'Soft vertical gradient transitioning smoothly from pale blue (#EFF6FF) to crisp canvas (#F8FAFC).',
    defaultColor: '#EFF6FF',
  },
  {
    id: 'bg_classroom_v1',
    version: '1.0',
    name: 'classroom_background',
    displayName: 'Classroom Backdrop',
    family: 'background',
    categoryIds: ['education'],
    domainIds: ['classroom_learning'],
    tags: ['background', 'classroom', 'school', 'blackboard', 'study'],
    aliases: ['classroom bg', 'school backdrop'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'illustration',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'simple',
    description: 'Soft classroom backdrop with understated wooden trims and slate backdrop.',
    defaultColor: '#F8FAFC',
  },
  {
    id: 'bg_tech_grid_v1',
    version: '1.0',
    name: 'tech_grid',
    displayName: 'Subtle Tech Grid Backdrop',
    family: 'background',
    categoryIds: ['technology', 'engineering'],
    domainIds: ['software', 'networking'],
    tags: ['background', 'grid', 'tech', 'digital', 'blueprint'],
    aliases: ['blueprint grid', 'matrix grid', 'tech canvas'],
    visualStyle: SWALLERN_VISUAL_STYLE_V1,
    assetType: 'illustration',
    source: 'curated_builtin',
    status: 'active',
    reusable: true,
    complexity: 'simple',
    description: 'High-clarity light grid with subtle cyan coordinate intersections.',
    defaultColor: '#EFF6FF',
  },
];
