/**
 * Swallern Image Generation Service Types & Provider Interface
 */

import { EducationalVisualBrief } from './brief';

export type ImageProviderType = 'ideogram' | string;

export interface ImageGenerationRequest {
  prompt: string;
  topicId?: string;
  lessonId?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:2';
  style?: 'educational_illustration' | 'diagram' | 'scientific_diagram' | 'infographic';
  negativePrompt?: string;
  visualBrief?: EducationalVisualBrief;
}

export interface ImageGenerationResponse {
  success: boolean;
  configured: boolean;
  imageUrl?: string;
  provider: string;
  model: string;
  prompt: string;
  visualBrief?: EducationalVisualBrief;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface ImageProviderConfig {
  configured: boolean;
  providerName: string;
  providerType: ImageProviderType;
  modelName: string;
  error?: string;
}

export interface ImageProvider {
  providerName: string;
  providerType: ImageProviderType;
  generateImage(req: ImageGenerationRequest): Promise<ImageGenerationResponse>;
}

export interface TopicAssetRecord {
  id: string;
  topic_id: string;
  lesson_id?: string | null;
  asset_type: 'IMAGE' | 'DIAGRAM' | 'INFOGRAPHIC';
  url: string;
  provider: string;
  model?: string | null;
  prompt: string;
  status: 'PENDING' | 'GENERATED' | 'FAILED';
  approval_state: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  visual_brief?: EducationalVisualBrief;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
