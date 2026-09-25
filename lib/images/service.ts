/**
 * Swallern Educational Image Service & Asset Storage Engine
 * Integrates Educational Visual Brief generation before image provider execution.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ImageGenerationResponse } from './types';
import { EducationalVisualBrief, generateEducationalVisualBrief } from './brief';

export { generateEducationalVisualBrief };

/**
 * Creates an Educational Visual Brief and formatted prompt.
 */
export function createEducationalPrompt(
  topicTitle: string,
  topicSummary?: string,
  keyConcepts?: Array<{ title: string; description: string }>
): { brief: EducationalVisualBrief; prompt: string } {
  const brief = generateEducationalVisualBrief(topicTitle, topicSummary, keyConcepts);
  return { brief, prompt: brief.formattedPrompt };
}

/**
 * Saves a generated image asset record along with its Educational Visual Brief.
 * Enforces approval_state = 'PENDING_REVIEW' so admin approval is required before public display.
 */
export async function saveGeneratedAsset(
  topicId: string,
  lessonId: string | null,
  genResult: ImageGenerationResponse,
  supabaseAdmin: SupabaseClient,
  visualBrief?: EducationalVisualBrief
): Promise<{ success: boolean; assetId?: string; error?: string }> {
  try {
    if (!genResult.success || !genResult.imageUrl) {
      return { success: false, error: genResult.error || 'No valid image URL to save' };
    }

    const briefToSave = visualBrief || genResult.visualBrief;

    const payload: Record<string, unknown> = {
      topic_id: topicId,
      lesson_id: lessonId || null,
      asset_type: 'IMAGE',
      url: genResult.imageUrl,
      provider: genResult.provider,
      model: genResult.model,
      prompt: genResult.prompt,
      status: 'GENERATED',
      approval_state: 'PENDING_REVIEW', // Admin approval required
      metadata: {
        ...(genResult.metadata || {}),
        ...(briefToSave ? { visual_brief: briefToSave } : {}),
      },
    };

    if (briefToSave) {
      try {
        payload.visual_brief = briefToSave;
      } catch {
        // Fall back gracefully to metadata storage
      }
    }

    const { data: asset, error } = await (supabaseAdmin.from('topic_assets') as any)
      .insert(payload)
      .select('id')
      .single();

    if (error || !asset) {
      return { success: false, error: error?.message || 'Failed to save topic asset record' };
    }

    return { success: true, assetId: asset.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Save generated asset failed',
    };
  }
}
