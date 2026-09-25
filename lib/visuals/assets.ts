/**
 * Swallern Visual System v1 — Master Asset Schemas & Types
 * Defines the core strongly-typed VisualAsset model, lifecycle statuses,
 * asset families, compatibility definitions, and generation metadata.
 */

import { SWALLERN_VISUAL_STYLE_V1, SwallernVisualStyle, VisualComplexity } from './tokens';
import { isValidCategoryId } from './categories';

export type VisualAssetFamily =
  | 'character'
  | 'mascot'
  | 'object'
  | 'concept'
  | 'environment'
  | 'diagram'
  | 'background'
  | 'ambient'
  | 'symbol';

export type VisualAssetType =
  | 'illustration'
  | 'svg'
  | 'raster'
  | 'diagram'
  | 'animation';

export type VisualAssetSource =
  | 'swallern_generated'
  | 'user_uploaded'
  | 'external_provider'
  | 'curated_builtin';

export type VisualAssetStatus =
  | 'planned'
  | 'generated'
  | 'review'
  | 'approved'
  | 'active'
  | 'deprecated';

export interface VisualGenerationMetadata {
  generationPrompt?: string;
  generationModel?: string;
  generationVersion?: string;
  generatedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  provider?: string;
  license?: string;
  attribution?: string;
}

/**
 * Master Visual Asset Specification
 */
export interface VisualAsset {
  /** Semantic versioned unique ID (e.g. 'laptop_v1', 'swallern_bear_v1', 'router_v1') */
  id: string;

  /** Semantic version string (e.g. '1.0', 'v1') */
  version: string;

  /** Internal canonical name */
  name: string;

  /** Human-readable display label */
  displayName: string;

  /** Foundational asset family */
  family: VisualAssetFamily;

  /** Associated category IDs (supports multi-category membership) */
  categoryIds: string[];

  /** Associated domain IDs */
  domainIds?: string[];

  /** Searchable semantic tags */
  tags: string[];

  /** Semantic aliases for enhanced query discovery */
  aliases?: string[];

  /** Strictly locked to approved Swallern visual style */
  visualStyle: SwallernVisualStyle;

  /** Asset medium / output format */
  assetType: VisualAssetType;

  /** Provenance of asset */
  source: VisualAssetSource;

  /** Lifecycle stage */
  status: VisualAssetStatus;

  /** Explicit reusability flag */
  reusable: boolean;

  /** Visual complexity classification */
  complexity?: VisualComplexity;

  /** IDs of compatible assets/families for composition assembly */
  compatibleWith?: string[];

  /** Short description explaining educational use and visual features */
  description?: string;

  /** Default or primary hex color */
  defaultColor?: string;

  /** Provenance & Generation Audit Metadata */
  generationMetadata?: VisualGenerationMetadata;

  /** Extended family-specific attributes */
  metadata?: Record<string, unknown>;
}

/**
 * Validates a VisualAsset instance according to Swallern Visual System rules
 */
export function validateVisualAsset(asset: VisualAsset): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!asset.id || typeof asset.id !== 'string' || asset.id.trim().length === 0) {
    errors.push('Asset must have a non-empty string id');
  }

  // Check versioning convention
  if (!asset.version) {
    errors.push('Asset must declare an explicit version');
  }

  if (!asset.name || !asset.displayName) {
    errors.push('Asset must have both name and displayName');
  }

  const validFamilies: VisualAssetFamily[] = [
    'character',
    'mascot',
    'object',
    'concept',
    'environment',
    'diagram',
    'background',
    'ambient',
    'symbol',
  ];
  if (!validFamilies.includes(asset.family)) {
    errors.push(`Invalid asset family: ${asset.family}`);
  }

  const validStatuses: VisualAssetStatus[] = [
    'planned',
    'generated',
    'review',
    'approved',
    'active',
    'deprecated',
  ];
  if (!validStatuses.includes(asset.status)) {
    errors.push(`Invalid asset status: ${asset.status}`);
  }

  if (asset.visualStyle !== SWALLERN_VISUAL_STYLE_V1) {
    errors.push(`Asset must use approved visual style '${SWALLERN_VISUAL_STYLE_V1}'`);
  }

  if (!Array.isArray(asset.categoryIds) || asset.categoryIds.length === 0) {
    errors.push('Asset must belong to at least 1 categoryId');
  } else {
    for (const catId of asset.categoryIds) {
      if (!isValidCategoryId(catId)) {
        errors.push(`Category ID '${catId}' is not registered in MASTER_VISUAL_CATEGORIES`);
      }
    }
  }

  if (!Array.isArray(asset.tags) || asset.tags.length === 0) {
    errors.push('Asset must have at least 1 semantic tag');
  }

  if (typeof asset.reusable !== 'boolean') {
    errors.push('Asset must declare boolean reusable field');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
