/**
 * Swallern Visual System v1 — Master Composition Architecture & Schemas
 * Section 21 & 22: Compositions reference reusable assets rather than duplicating them,
 * assembling multi-asset educational scenes, diagrams, explainers, and comparisons.
 */

import { VisualComplexity } from './tokens';
import { isValidCategoryId } from './categories';

export type VisualCompositionType =
  | 'scene'
  | 'diagram'
  | 'comparison'
  | 'process'
  | 'explainer';

export type VisualCompositionStatus =
  | 'planned'
  | 'draft'
  | 'approved'
  | 'active'
  | 'deprecated';

export interface VisualCompositionItem {
  assetId: string;
  role?: 'focal' | 'supporting' | 'background' | 'indicator' | 'connector';
  position?: {
    x: number; // percentage 0-100 or coordinate
    y: number;
  };
  scale?: number;
  zIndex?: number;
  label?: string;
  animation?: string;
  stateOverride?: Record<string, unknown>;
}

export interface VisualCompositionLayout {
  type: 'flow_horizontal' | 'flow_vertical' | 'radial_cycle' | 'grid_matrix' | 'freeform_scene' | 'side_by_side';
  direction?: 'ltr' | 'rtl' | 'ttb' | 'btt';
  alignment?: 'center' | 'top' | 'bottom' | 'space-between';
  spacing?: 'compact' | 'normal' | 'relaxed';
  backgroundId?: string;
  overlayText?: string[];
}

export interface VisualComposition {
  id: string;
  version: string;
  name: string;
  title: string;
  type: VisualCompositionType;
  complexity: VisualComplexity;
  assets: VisualCompositionItem[];
  layout?: VisualCompositionLayout;
  categoryIds: string[];
  domainIds?: string[];
  tags: string[];
  status: VisualCompositionStatus;
  reusable: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Standard Reference Compositions Demonstrating Multi-Asset Reusability
 */
export const CANONICAL_COMPOSITIONS: VisualComposition[] = [
  {
    id: 'how_wifi_works_v1',
    version: '1.0',
    name: 'how_wifi_works',
    title: 'How Wi-Fi Works: Device to Router to Internet',
    type: 'process',
    complexity: 'complex',
    categoryIds: ['technology', 'education'],
    domainIds: ['networking', 'internet'],
    tags: ['wifi', 'wireless', 'internet', 'network', 'router', 'laptop', 'transmission'],
    status: 'approved',
    reusable: true,
    description: 'Explains how a laptop transmits data packets via radio signals to a Wi-Fi router, connecting out to cloud servers.',
    layout: {
      type: 'flow_horizontal',
      direction: 'ltr',
      alignment: 'center',
      backgroundId: 'bg_plain_canvas_v1',
      overlayText: ['Laptop requests webpage', 'Wi-Fi signals carry data', 'Router forwards to Internet'],
    },
    assets: [
      { assetId: 'laptop_v1', role: 'focal', position: { x: 15, y: 50 }, scale: 1.0, zIndex: 2, label: 'Client Device' },
      { assetId: 'symbol_flow_arrow_v1', role: 'connector', position: { x: 35, y: 50 }, scale: 0.8, zIndex: 1, label: 'Radio Waves' },
      { assetId: 'router_v1', role: 'focal', position: { x: 50, y: 50 }, scale: 1.1, zIndex: 3, label: 'Wi-Fi Router' },
      { assetId: 'symbol_flow_arrow_v1', role: 'connector', position: { x: 65, y: 50 }, scale: 0.8, zIndex: 1, label: 'Fiber Link' },
      { assetId: 'server_v1', role: 'supporting', position: { x: 85, y: 50 }, scale: 1.0, zIndex: 2, label: 'Cloud Server' },
      { assetId: 'concept_network_nodes_v1', role: 'background', position: { x: 50, y: 20 }, scale: 0.7, zIndex: 0 },
    ],
  },
  {
    id: 'plant_growth_cycle_v1',
    version: '1.0',
    name: 'plant_growth_cycle',
    title: 'Plant Germination and Growth Cycle',
    type: 'diagram',
    complexity: 'diagram',
    categoryIds: ['agriculture', 'nature_environment', 'science'],
    domainIds: ['crops', 'botany', 'soil'],
    tags: ['plant', 'growth', 'seed', 'soil', 'water', 'sun', 'cycle'],
    status: 'approved',
    reusable: true,
    description: 'Diagram demonstrating the biological transformation of a seed in fertile soil into a mature crop.',
    layout: {
      type: 'radial_cycle',
      alignment: 'center',
      backgroundId: 'bg_plain_canvas_v1',
      overlayText: ['1. Seed in Soil', '2. Water & Sunlight', '3. Root Growth', '4. Mature Plant'],
    },
    assets: [
      { assetId: 'seed_v1', role: 'focal', position: { x: 20, y: 70 }, scale: 0.9, zIndex: 2, label: 'Seed' },
      { assetId: 'soil_v1', role: 'supporting', position: { x: 50, y: 85 }, scale: 1.2, zIndex: 1, label: 'Soil Bed' },
      { assetId: 'watering_can_v1', role: 'supporting', position: { x: 30, y: 30 }, scale: 0.9, zIndex: 2, label: 'Hydration' },
      { assetId: 'ambient_sun_v1', role: 'supporting', position: { x: 75, y: 20 }, scale: 1.0, zIndex: 1, label: 'Sunlight' },
      { assetId: 'concept_growth_stages_v1', role: 'focal', position: { x: 50, y: 50 }, scale: 1.0, zIndex: 3, label: 'Progressive Stages' },
    ],
  },
  {
    id: 'banking_transaction_flow_v1',
    version: '1.0',
    name: 'banking_transaction_flow',
    title: 'How Banking & Digital Payments Flow',
    type: 'process',
    complexity: 'complex',
    categoryIds: ['finance_economics', 'business'],
    domainIds: ['banking', 'sales_commerce'],
    tags: ['banking', 'money', 'transaction', 'payment', 'card', 'bank', 'economy'],
    status: 'approved',
    reusable: true,
    description: 'Shows payment authorization flow from consumer payment card, to merchant bank, to central settlement.',
    layout: {
      type: 'flow_horizontal',
      direction: 'ltr',
      alignment: 'center',
      backgroundId: 'bg_plain_canvas_v1',
      overlayText: ['Customer Card Payment', 'Bank Authorization', 'Merchant Settlement'],
    },
    assets: [
      { assetId: 'credit_card_v1', role: 'focal', position: { x: 15, y: 50 }, scale: 1.0, zIndex: 2, label: 'Cardholder' },
      { assetId: 'symbol_flow_arrow_v1', role: 'connector', position: { x: 35, y: 50 }, scale: 0.8, zIndex: 1, label: 'Encrypted Request' },
      { assetId: 'bank_building_v1', role: 'focal', position: { x: 50, y: 50 }, scale: 1.1, zIndex: 3, label: 'Issuing Bank' },
      { assetId: 'symbol_flow_arrow_v1', role: 'connector', position: { x: 65, y: 50 }, scale: 0.8, zIndex: 1, label: 'Cleared Funds' },
      { assetId: 'money_coins_v1', role: 'supporting', position: { x: 85, y: 50 }, scale: 1.0, zIndex: 2, label: 'Settled Balance' },
    ],
  },
];

/**
 * Validates a VisualComposition instance
 */
export function validateVisualComposition(
  composition: VisualComposition,
  knownAssetIds?: Set<string>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!composition.id || typeof composition.id !== 'string') {
    errors.push('Composition must have a valid string id');
  }

  if (!composition.version) {
    errors.push('Composition must declare an explicit version');
  }

  if (!composition.name || !composition.title) {
    errors.push('Composition must have both name and title');
  }

  if (!Array.isArray(composition.assets) || composition.assets.length === 0) {
    errors.push('Composition must reference at least 1 visual asset');
  } else if (knownAssetIds) {
    for (const item of composition.assets) {
      if (!knownAssetIds.has(item.assetId)) {
        errors.push(`Composition references unknown asset ID: '${item.assetId}'`);
      }
    }
  }

  if (!Array.isArray(composition.categoryIds) || composition.categoryIds.length === 0) {
    errors.push('Composition must belong to at least 1 categoryId');
  } else {
    for (const catId of composition.categoryIds) {
      if (!isValidCategoryId(catId)) {
        errors.push(`Composition category ID '${catId}' is not registered in MASTER_VISUAL_CATEGORIES`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
