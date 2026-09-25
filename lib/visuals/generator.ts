/**
 * Swallern Visual System v1 — Visual Asset Generator & Pipeline
 * Section 14, 15, 16, 25, & 26:
 * Pipeline for converting Visual Requirements into stable semantic asset IDs,
 * canonical prompts, and standard VisualAssetMetadata with full audit trail.
 */

import { VISUAL_SYSTEM_VERSION, SWALLERN_VISUAL_STYLE_V1, SWALLERN_COLOR_PALETTE } from './tokens';
import { VisualRequirement } from './requirements';
import { getCharacterSpec } from './characters';
import { getEnvironmentSpec } from './backgrounds';

export interface VisualAssetMetadata {
  asset_id: string;
  visual_style: string;
  visual_type: string;
  subject: string;
  category?: string;
  domain?: string;
  character_ids: string[];
  generation_source: 'swallern_generator';
  requirement: VisualRequirement;
  created_at: string;
  version: typeof VISUAL_SYSTEM_VERSION;
  generation_details?: {
    model?: string;
    prompt?: string;
    temperature?: number;
    reviewed_by?: string;
    approved_at?: string;
  };
}

/**
 * Generates a stable asset identifier (Section 15 & 25)
 * Example: swallern_bear_hibernation_001 or technology_networking_router_v1
 */
export function generateStableAssetId(subject: string, characterId?: string): string {
  const sanitizedSubject = subject
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30);
  
  const charPrefix = characterId || 'swallern_asset';
  const timestampShort = Date.now().toString().slice(-4);
  return `${charPrefix}_${sanitizedSubject}_${timestampShort}`;
}

/**
 * Generates a canonical hierarchical semantic asset identifier (Section 25)
 * Example: router_v1 or technology_networking_router_v1
 */
export function generateSemanticAssetId(
  name: string,
  category?: string,
  domain?: string,
  version: string = 'v1'
): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const cleanVer = version.startsWith('v') ? version : `v${version}`;
  
  if (category && domain) {
    const cleanCat = category.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const cleanDom = domain.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return `${cleanCat}_${cleanDom}_${cleanName}_${cleanVer}`;
  }
  
  return `${cleanName}_${cleanVer}`;
}

/**
 * Transforms a VisualRequirement into a canonical Swallern Visual System v1 prompt
 */
export function buildCanonicalVisualPrompt(req: VisualRequirement): string {
  const charSpec = req.characterId ? getCharacterSpec(req.characterId) : null;
  const envSpec = getEnvironmentSpec(req.environment);

  const charDesc = charSpec
    ? `Featuring ${charSpec.name} (${charSpec.description}) in a ${req.action || 'standing'} pose with a ${req.emotion || 'curious'} expression.`
    : '';

  const styleRules = `Style: Swallern Visual System v1. Soft vector geometry, rounded forms, clean silhouettes, friendly proportions, 1 dominant color family (${SWALLERN_COLOR_PALETTE.blue.name} or ${SWALLERN_COLOR_PALETTE.teal.name}) with subtle depth gradients.`;
  const envRules = `Background: ${envSpec.name} (${envSpec.description}), clean composition with controlled detail and clear empty space for overlay text.`;
  const textRule = `CRITICAL RULE: Absolutely NO text, words, letters, labels, or captions baked inside the image content.`;
  const prohibited = req.prohibitedElements.join(', ');

  return `High-quality educational ${req.type.toLowerCase().replace('_', ' ')} illustration of ${req.subject}. ${charDesc} ${envRules} Focal point: ${req.focalPoint}. ${styleRules} ${textRule} Avoid: ${prohibited}.`;
}

/**
 * Full Pipeline Execution (Requirement -> Metadata & Prompt)
 */
export function executeVisualPipeline(req: VisualRequirement): {
  assetId: string;
  prompt: string;
  metadata: VisualAssetMetadata;
} {
  const assetId = generateStableAssetId(req.subject, req.characterId);
  const prompt = buildCanonicalVisualPrompt(req);

  const metadata: VisualAssetMetadata = {
    asset_id: assetId,
    visual_style: SWALLERN_VISUAL_STYLE_V1,
    visual_type: req.type,
    subject: req.subject,
    category: req.category,
    domain: req.domain,
    character_ids: req.characterId ? [req.characterId] : [],
    generation_source: 'swallern_generator',
    requirement: req,
    created_at: new Date().toISOString(),
    version: VISUAL_SYSTEM_VERSION,
    generation_details: {
      model: 'swallern-visual-gen-v1',
      prompt,
    },
  };

  return { assetId, prompt, metadata };
}
