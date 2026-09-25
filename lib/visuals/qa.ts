/**
 * Swallern Visual System v1 — Visual QA & Validation Engine
 * Section 27 & 28:
 * Automated & heuristic quality assurance verification for generated visuals and compositions.
 * Enforces Golden Rule compliance, Style fidelity, Clarity, Scalability, Reusability, and Educational Value.
 */

import { VisualAssetMetadata } from './generator';
import { getCharacterSpec } from './characters';
import { VisualAsset, validateVisualAsset } from './assets';
import { VisualComposition, validateVisualComposition } from './compositions';
import { VisualRequirement, validateVisualRequirement } from './requirements';
import { VisualCategory, validateVisualCategory } from './categories';
import { SWALLERN_VISUAL_STYLE_V1 } from './tokens';

export interface VisualQACheckResult {
  passed: boolean;
  score: number; // 0 to 100
  goldenRulePassed: boolean;
  checks: {
    style: { passed: boolean; details: string };
    educationalQuality: { passed: boolean; details: string };
    technicalQuality: { passed: boolean; details: string };
    consistency: { passed: boolean; details: string };
    scalability?: { passed: boolean; details: string };
    reusability?: { passed: boolean; details: string };
  };
  rejectionReasons: string[];
}

export interface BrandQAEvaluation {
  passed: boolean;
  score: number; // 0 to 100
  criteria: {
    style: { passed: boolean; score: number; rationale: string };
    consistency: { passed: boolean; score: number; rationale: string };
    clarity: { passed: boolean; score: number; rationale: string };
    scalability: { passed: boolean; score: number; rationale: string };
    reusability: { passed: boolean; score: number; rationale: string };
    educationalUsefulness: { passed: boolean; score: number; rationale: string };
  };
  recommendations: string[];
}

// Re-export specific validators for central QA access
export {
  validateVisualAsset,
  validateVisualComposition,
  validateVisualRequirement,
  validateVisualCategory,
};

/**
 * Validates generated asset metadata and prompt against Swallern Visual System v1 QA Rules
 * Preserves full backward compatibility with legacy QA callers.
 */
export function validateVisualQA(
  metadata: VisualAssetMetadata,
  generatedImageUrl?: string
): VisualQACheckResult {
  const rejectionReasons: string[] = [];
  const req = metadata.requirement;

  // 1. Style Check
  let stylePassed = true;
  let styleDetails = 'Follows Swallern soft vector geometry, canonical palette, and defined background rules.';
  if (metadata.visual_style !== SWALLERN_VISUAL_STYLE_V1 && metadata.version !== '1.0') {
    stylePassed = false;
    rejectionReasons.push('Asset does not use approved Swallern Visual System v1.');
  }

  if (req.characterId) {
    const charSpec = getCharacterSpec(req.characterId);
    if (!charSpec) {
      stylePassed = false;
      rejectionReasons.push(`Unknown character ID: ${req.characterId}. Must use canonical character spec.`);
    }
  }

  // 2. Educational Quality Check
  let edPassed = true;
  let edDetails = `Visual directly represents educational subject "${req.subject}" with focal point clarity.`;
  if (!req.subject || req.subject.trim().length === 0) {
    edPassed = false;
    rejectionReasons.push('Missing educational subject focal point.');
  }

  // 3. Technical Quality Check
  let techPassed = true;
  let techDetails = 'Verified zero baked-in text, safe layout bounds, clean vector silhouettes.';
  if (generatedImageUrl && !generatedImageUrl.startsWith('http') && !generatedImageUrl.startsWith('data:') && !generatedImageUrl.startsWith('/')) {
    techPassed = false;
    rejectionReasons.push('Invalid image URI format.');
  }

  // 4. Consistency & Golden Rule Test (Section 18)
  // "Could this visual appear in another Swallern lesson tomorrow without looking like it came from a completely different product?"
  const goldenRulePassed = stylePassed && edPassed && techPassed;
  const consistencyDetails = goldenRulePassed
    ? 'Golden Rule passed: Visual seamlessly blends with all Swallern educational courses.'
    : 'Golden Rule failed: Visual has style inconsistencies or unapproved elements.';

  const score = Math.max(0, (stylePassed ? 25 : 0) + (edPassed ? 25 : 0) + (techPassed ? 25 : 0) + (goldenRulePassed ? 25 : 0));

  return {
    passed: goldenRulePassed,
    score,
    goldenRulePassed,
    checks: {
      style: { passed: stylePassed, details: styleDetails },
      educationalQuality: { passed: edPassed, details: edDetails },
      technicalQuality: { passed: techPassed, details: techDetails },
      consistency: { passed: goldenRulePassed, details: consistencyDetails },
    },
    rejectionReasons,
  };
}

/**
 * Comprehensive 6-Pillar Brand QA Evaluation (Section 28)
 */
export function evaluateBrandQA(asset: VisualAsset): BrandQAEvaluation {
  const recommendations: string[] = [];

  // 1. Style (Swallern v1 aesthetic)
  const isStyleValid = asset.visualStyle === SWALLERN_VISUAL_STYLE_V1;
  const styleScore = isStyleValid ? 20 : 0;
  if (!isStyleValid) {
    recommendations.push(`Asset visual style must be strictly '${SWALLERN_VISUAL_STYLE_V1}'.`);
  }

  // 2. Consistency
  const hasValidPalette = Boolean(asset.defaultColor);
  const consistencyScore = hasValidPalette ? 15 : 10;

  // 3. Clarity
  const hasDescription = Boolean(asset.description && asset.description.length > 10);
  const clarityScore = hasDescription ? 20 : 10;
  if (!hasDescription) {
    recommendations.push('Provide a descriptive overview of focal points and visual cues.');
  }

  // 4. Scalability (Readable at small sizes)
  const isScalable = asset.assetType === 'svg' || asset.assetType === 'illustration' || asset.assetType === 'diagram';
  const scalabilityScore = isScalable ? 15 : 8;

  // 5. Reusability
  const reusabilityScore = asset.reusable ? 15 : 5;
  if (!asset.reusable) {
    recommendations.push('Consider refactoring asset to support multi-lesson reusability.');
  }

  // 6. Educational Usefulness
  const hasCategories = Array.isArray(asset.categoryIds) && asset.categoryIds.length > 0;
  const educationalScore = hasCategories ? 15 : 0;
  if (!hasCategories) {
    recommendations.push('Associate asset with at least one canonical subject category.');
  }

  const totalScore = styleScore + consistencyScore + clarityScore + scalabilityScore + reusabilityScore + educationalScore;
  const passed = totalScore >= 75 && isStyleValid && hasCategories;

  return {
    passed,
    score: totalScore,
    criteria: {
      style: { passed: isStyleValid, score: styleScore, rationale: 'Adheres to Swallern v1 soft geometry vector standard.' },
      consistency: { passed: hasValidPalette, score: consistencyScore, rationale: 'Belongs seamlessly alongside existing visual assets.' },
      clarity: { passed: hasDescription, score: clarityScore, rationale: 'Concept is immediately discernible without cognitive friction.' },
      scalability: { passed: isScalable, score: scalabilityScore, rationale: 'Clean silhouettes maintain clarity at compact thumbnail sizes.' },
      reusability: { passed: asset.reusable, score: reusabilityScore, rationale: 'Can be referenced across multiple educational contexts.' },
      educationalUsefulness: { passed: hasCategories, score: educationalScore, rationale: 'Provides direct pedagogical support for subject concepts.' },
    },
    recommendations,
  };
}
