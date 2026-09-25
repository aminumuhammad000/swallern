/**
 * Swallern Educational Visual Brief Generator
 * Section 13 & 14 of Swallern Visual System v1:
 * Leverages the Visual Requirement Architecture & Pipeline to create formatted briefs.
 */

import { buildVisualRequirement, executeVisualPipeline, VisualRequirement } from '../visuals';

export interface EducationalVisualBrief {
  educationalPurpose: string;
  mainConcept: string;
  requiredVisualElements: string[];
  recommendedStyle: string;
  prohibitedElements: string[];
  formattedPrompt: string;
  visualRequirement?: VisualRequirement;
}

/**
 * Generates an evidence-based Educational Visual Brief for a topic using Swallern Visual System v1.
 */
export function generateEducationalVisualBrief(
  topicTitle: string,
  topicSummary?: string,
  keyConcepts?: Array<{ title: string; description: string }>
): EducationalVisualBrief {
  const title = topicTitle.trim();
  const summary = (topicSummary || '').trim();

  // 1. Build Semantic Visual Requirement
  const visualReq = buildVisualRequirement(title, summary);

  // 2. Execute Visual Pipeline
  const pipelineResult = executeVisualPipeline(visualReq);

  // 3. Extract Main Concept
  let mainConcept = summary || `Educational concepts surrounding ${title}`;
  if (keyConcepts && keyConcepts.length > 0) {
    const conceptTitles = keyConcepts.slice(0, 3).map((c) => c.title).join(', ');
    mainConcept = `${title}: ${conceptTitles}`;
  }

  const educationalPurpose = `Visually illustrate ${title} using Swallern Visual System v1 (${visualReq.type}) for structured learner comprehension.`;

  const requiredVisualElements: string[] = [
    `Canonical mascot (${visualReq.characterId || 'swallern_bear_v1'}) in ${visualReq.action || 'exploring'} pose`,
    `${visualReq.environment} environment canvas`,
    `High-contrast educational focal point: ${title}`,
    `Zero baked-in text in image content`,
  ];

  const recommendedStyle = `Swallern Visual System v1 soft vector geometry, rounded forms, clean silhouettes, friendly proportions`;
  const prohibitedElements = visualReq.prohibitedElements;

  return {
    educationalPurpose,
    mainConcept,
    requiredVisualElements,
    recommendedStyle,
    prohibitedElements,
    formattedPrompt: pipelineResult.prompt,
    visualRequirement: visualReq,
  };
}
