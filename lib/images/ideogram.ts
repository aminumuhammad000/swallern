/**
 * Swallern Ideogram Image Generation Provider Implementation
 * Integrates with Ideogram API for high-quality educational image generation.
 */

import { ImageProvider, ImageGenerationRequest, ImageGenerationResponse, ImageProviderType } from './types';

export class IdeogramImageProvider implements ImageProvider {
  public providerName = 'Ideogram';
  public providerType: ImageProviderType = 'ideogram';

  private getApiKey(): string | undefined {
    return process.env.IDEOGRAM_API_KEY?.trim();
  }

  private getModel(): string {
    return process.env.IDEOGRAM_MODEL?.trim() || 'V_2';
  }

  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 0);
  }

  public async generateImage(req: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const apiKey = this.getApiKey();
    const model = this.getModel();

    if (!apiKey) {
      return {
        success: false,
        configured: false,
        provider: this.providerName,
        model,
        prompt: req.prompt,
        error: 'Ideogram API key is not configured. Set IDEOGRAM_API_KEY in environment variables.',
      };
    }

    try {
      // Map standard aspect ratio string to Ideogram format
      let aspect_ratio = 'ASPECT_16_9';
      if (req.aspectRatio === '1:1') aspect_ratio = 'ASPECT_1_1';
      else if (req.aspectRatio === '9:16') aspect_ratio = 'ASPECT_9_16';
      else if (req.aspectRatio === '4:3') aspect_ratio = 'ASPECT_4_3';
      else if (req.aspectRatio === '3:2') aspect_ratio = 'ASPECT_3_2';

      const payload = {
        image_request: {
          prompt: req.prompt,
          aspect_ratio,
          model,
          magic_prompt_option: 'AUTO',
        },
      };

      const response = await fetch('https://api.ideogram.ai/generate', {
        method: 'POST',
        headers: {
          'Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => 'Unknown error response');
        return {
          success: false,
          configured: true,
          provider: this.providerName,
          model,
          prompt: req.prompt,
          error: `Ideogram API HTTP ${response.status}: ${errText.slice(0, 200)}`,
        };
      }

      const json = await response.json();
      const firstImage = json?.data?.[0];
      const imageUrl = firstImage?.url;

      if (!imageUrl) {
        return {
          success: false,
          configured: true,
          provider: this.providerName,
          model,
          prompt: req.prompt,
          error: 'Ideogram API response did not contain a valid image URL.',
        };
      }

      return {
        success: true,
        configured: true,
        imageUrl,
        provider: this.providerName,
        model,
        prompt: req.prompt,
        metadata: {
          is_image_safe: firstImage?.is_image_safe ?? true,
          style: req.style || 'educational_illustration',
        },
      };
    } catch (err) {
      return {
        success: false,
        configured: true,
        provider: this.providerName,
        model,
        prompt: req.prompt,
        error: err instanceof Error ? err.message : 'Ideogram image generation network request failed',
      };
    }
  }
}
