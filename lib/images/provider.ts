/**
 * Swallern Image Provider Abstraction & Factory Engine
 * Configurable via IMAGE_PROVIDER environment variable.
 */

import { ImageProvider, ImageGenerationRequest, ImageGenerationResponse, ImageProviderConfig } from './types';
import { IdeogramImageProvider } from './ideogram';

/**
 * Returns the currently active ImageProvider instance based on environment configuration.
 * Default provider is Ideogram.
 */
export function getImageProvider(): ImageProvider {
  const providerName = (process.env.IMAGE_PROVIDER || 'ideogram').toLowerCase().trim();

  switch (providerName) {
    case 'ideogram':
    default:
      return new IdeogramImageProvider();
  }
}

/**
 * Returns the current image generation service configuration.
 */
export function getImageProviderConfig(): ImageProviderConfig {
  const provider = getImageProvider();
  if (provider instanceof IdeogramImageProvider) {
    const isConfigured = provider.isConfigured();
    return {
      configured: isConfigured,
      providerName: provider.providerName,
      providerType: provider.providerType,
      modelName: process.env.IDEOGRAM_MODEL || 'V_2',
      ...(!isConfigured && { error: 'IDEOGRAM_API_KEY is not set.' }),
    };
  }

  return {
    configured: false,
    providerName: provider.providerName,
    providerType: provider.providerType,
    modelName: 'default',
    error: 'Unrecognized image provider configuration.',
  };
}

/**
 * Generates an educational image using the configured image provider.
 * Provider-agnostic abstraction for callers.
 */
export async function generateEducationalImage(
  req: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  const provider = getImageProvider();
  return provider.generateImage(req);
}
