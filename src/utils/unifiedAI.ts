// Unified AI service for ProHeadshots
// Provides intelligent routing between Replicate and RunPod with automatic fallback

import * as ReplicateAI from './replicateAI';
import * as RunPodAI from './runpodAI';
import { logger } from './logger';

export type AIProvider = 'replicate' | 'runpod';

export interface ProviderStatus {
  provider: AIProvider;
  online: boolean;
  responseTime?: number;
  lastChecked: Date;
  errorCount: number;
}

export interface UnifiedAIConfig {
  primaryProvider: AIProvider;
  fallbackEnabled: boolean;
  healthCheckInterval: number; // in milliseconds
  maxRetries: number;
  timeoutMs: number;
}

export interface GenerationRequirements {
  quality: 'basic' | 'standard' | 'premium';
  speed: 'fast' | 'standard' | 'slow';
  budget: 'low' | 'medium' | 'high';
  features?: string[]; // e.g., ['lora', 'upscaling', 'video']
}

export interface UnifiedImageGenerationInput {
  prompt: string;
  requirements?: GenerationRequirements;
  num_images?: number;
  image_size?: string;
  seed?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  negative_prompt?: string;
  lora_path?: string;
  lora_scale?: number;
  provider?: AIProvider; // Force specific provider
}

export interface UnifiedImageGenerationResult {
  images: Array<{
    url: string;
    width: number;
    height: number;
    provider: AIProvider;
  }>;
  metadata: {
    provider: AIProvider;
    model: string;
    processingTime: number;
    cost: number;
    fallbackUsed: boolean;
  };
}

export interface UnifiedTrainingInput {
  images: string[];
  name: string;
  trigger_word: string;
  description?: string;
  provider?: AIProvider; // Force specific provider
}

class UnifiedAIService {
  private config: UnifiedAIConfig;
  private providerStatus: Map<AIProvider, ProviderStatus>;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(config: Partial<UnifiedAIConfig> = {}) {
    this.config = {
      primaryProvider: 'fal',
      fallbackEnabled: true,
      healthCheckInterval: 60000, // 1 minute
      maxRetries: 3,
      timeoutMs: 30000, // 30 seconds
      ...config,
    };

    this.providerStatus = new Map();
    this.initializeProviderStatus();
    this.startHealthChecking();
  }

  private initializeProviderStatus() {
    const providers: AIProvider[] = ['fal', 'leonardo'];
    providers.forEach(provider => {
      this.providerStatus.set(provider, {
        provider,
        online: true, // Assume online initially
        lastChecked: new Date(),
        errorCount: 0,
      });
    });
  }

  private startHealthChecking() {
    // Skip health checking during build time
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
      logger.info('Skipping health checks during build time', {}, 'UNIFIED_AI');
      return;
    }

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(() => {
      this.checkAllProvidersHealth();
    }, this.config.healthCheckInterval);

    // Initial health check (only if not during build)
    if (typeof window !== 'undefined' || process.env.VERCEL_ENV) {
      this.checkAllProvidersHealth();
    }
  }

  private async checkProviderHealth(provider: AIProvider): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      let isHealthy = false;
      
      if (provider === 'fal') {
        // Check fal.ai health by trying to get user info or a simple API call
        isHealthy = await this.testFalAIHealth();
      } else if (provider === 'leonardo') {
        // Check Leonardo AI health
        isHealthy = await LeonardoAI.healthCheck();
      }

      const responseTime = Date.now() - startTime;
      const status = this.providerStatus.get(provider)!;
      
      this.providerStatus.set(provider, {
        ...status,
        online: isHealthy,
        responseTime,
        lastChecked: new Date(),
        errorCount: isHealthy ? 0 : status.errorCount + 1,
      });

      return isHealthy;
    } catch (error) {
      const status = this.providerStatus.get(provider)!;
      this.providerStatus.set(provider, {
        ...status,
        online: false,
        lastChecked: new Date(),
        errorCount: status.errorCount + 1,
      });

      logger.error(`Health check failed for ${provider}`, { error }, 'UNIFIED_AI_HEALTH');
      return false;
    }
  }

  private async testFalAIHealth(): Promise<boolean> {
    try {
      // Simple test to check if fal.ai is responsive
      // We'll use a lightweight operation
      const testResult = await FalAI.getModelInfo('flux-dev');
      return !!testResult;
    } catch (error) {
      return false;
    }
  }

  private async checkAllProvidersHealth() {
    const providers: AIProvider[] = ['fal', 'leonardo'];
    await Promise.all(providers.map(provider => this.checkProviderHealth(provider)));
  }

  public getProviderStatus(provider?: AIProvider): ProviderStatus | Map<AIProvider, ProviderStatus> {
    if (provider) {
      return this.providerStatus.get(provider)!;
    }
    return this.providerStatus;
  }

  private selectBestProvider(requirements?: GenerationRequirements, forceProvider?: AIProvider): AIProvider {
    if (forceProvider) {
      return forceProvider;
    }

    // Check if primary provider is online
    const primaryStatus = this.providerStatus.get(this.config.primaryProvider);
    if (primaryStatus?.online) {
      return this.config.primaryProvider;
    }

    // If primary is down and fallback is enabled, try secondary
    if (this.config.fallbackEnabled) {
      const secondaryProvider = this.config.primaryProvider === 'fal' ? 'leonardo' : 'fal';
      const secondaryStatus = this.providerStatus.get(secondaryProvider);
      
      if (secondaryStatus?.online) {
        logger.info(`Falling back to ${secondaryProvider} provider`, {
          primaryProvider: this.config.primaryProvider,
          primaryStatus: primaryStatus?.online,
        }, 'UNIFIED_AI_FALLBACK');
        
        return secondaryProvider;
      }
    }

    // If both are down or fallback disabled, still try primary
    logger.warn('All providers appear to be down, attempting primary anyway', {
      primaryProvider: this.config.primaryProvider,
      fallbackEnabled: this.config.fallbackEnabled,
    }, 'UNIFIED_AI_WARNING');
    
    return this.config.primaryProvider;
  }

  private async executeWithFallback<T>(
    operation: (provider: AIProvider) => Promise<T>,
    requirements?: GenerationRequirements,
    forceProvider?: AIProvider
  ): Promise<T> {
    const selectedProvider = this.selectBestProvider(requirements, forceProvider);
    let lastError: Error | null = null;

    // Try primary provider
    try {
      return await operation(selectedProvider);
    } catch (error) {
      lastError = error as Error;
      logger.error(`Operation failed with ${selectedProvider}`, { error }, 'UNIFIED_AI_ERROR');
      
      // Update provider status
      const status = this.providerStatus.get(selectedProvider)!;
      this.providerStatus.set(selectedProvider, {
        ...status,
        errorCount: status.errorCount + 1,
        online: status.errorCount > 3 ? false : status.online,
      });
    }

    // Try fallback if enabled and not forced to specific provider
    if (this.config.fallbackEnabled && !forceProvider) {
      const fallbackProvider = selectedProvider === 'fal' ? 'leonardo' : 'fal';
      const fallbackStatus = this.providerStatus.get(fallbackProvider);
      
      if (fallbackStatus?.online) {
        try {
          logger.info(`Attempting fallback to ${fallbackProvider}`, {
            originalProvider: selectedProvider,
            error: lastError?.message,
          }, 'UNIFIED_AI_FALLBACK');
          
          return await operation(fallbackProvider);
        } catch (fallbackError) {
          logger.error(`Fallback also failed with ${fallbackProvider}`, { 
            fallbackError,
            originalError: lastError,
          }, 'UNIFIED_AI_FALLBACK_FAILED');
          
          // Update fallback provider status
          const fallbackStatus = this.providerStatus.get(fallbackProvider)!;
          this.providerStatus.set(fallbackProvider, {
            ...fallbackStatus,
            errorCount: fallbackStatus.errorCount + 1,
            online: fallbackStatus.errorCount > 3 ? false : fallbackStatus.online,
          });
        }
      }
    }

    // If we get here, both providers failed
    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
  }

  public async generateImages(input: UnifiedImageGenerationInput): Promise<UnifiedImageGenerationResult> {
    const startTime = Date.now();
    let fallbackUsed = false;
    
    const operation = async (provider: AIProvider) => {
      if (provider === 'fal') {
        const result = await FalAI.generateImages({
          prompt: input.prompt,
          model: this.selectFalModel(input.requirements),
          num_images: input.num_images,
          image_size: input.image_size,
          seed: input.seed,
          guidance_scale: input.guidance_scale,
          num_inference_steps: input.num_inference_steps,
          lora_path: input.lora_path,
          lora_scale: input.lora_scale,
        });

        return {
          images: result.images.map(img => ({
            url: img.url,
            width: img.width,
            height: img.height,
            provider: 'fal' as AIProvider,
          })),
          metadata: {
            provider: 'fal' as AIProvider,
            model: this.selectFalModel(input.requirements),
            processingTime: Date.now() - startTime,
            cost: this.estimateFalCost(input.num_images || 1),
            fallbackUsed,
          },
        };
      } else {
        const leonardoInput: LeonardoAI.LeonardoAIImageGenerationInput = {
          prompt: input.prompt,
          model: this.selectLeonardoModel(input.requirements),
          num_images: input.num_images,
          width: this.parseImageSize(input.image_size).width,
          height: this.parseImageSize(input.image_size).height,
          seed: input.seed,
          guidance_scale: input.guidance_scale ? Math.round(input.guidance_scale) : undefined, // Leonardo requires integer
          num_inference_steps: input.num_inference_steps,
          negative_prompt: input.negative_prompt,
        };

        const result = await LeonardoAI.generateImages(leonardoInput);
        
        // Wait for completion and get URLs
        const imageUrls = await LeonardoAI.waitForGeneration(result.sdGenerationJob.generationId);
        
        return {
          images: imageUrls.map(url => ({
            url,
            width: leonardoInput.width || 768,
            height: leonardoInput.height || 768,
            provider: 'leonardo' as AIProvider,
          })),
          metadata: {
            provider: 'leonardo' as AIProvider,
            model: leonardoInput.model || 'leonardo-phoenix',
            processingTime: Date.now() - startTime,
            cost: result.sdGenerationJob.apiCreditCost,
            fallbackUsed,
          },
        };
      }
    };

    const selectedProvider = this.selectBestProvider(input.requirements, input.provider);
    if (selectedProvider !== (input.provider || this.config.primaryProvider)) {
      fallbackUsed = true;
    }

    return this.executeWithFallback(operation, input.requirements, input.provider);
  }

  public async trainModel(input: UnifiedTrainingInput): Promise<string> {
    const operation = async (provider: AIProvider) => {
      if (provider === 'fal') {
        return await FalAI.trainModel({
          images: input.images,
          trigger_word: input.trigger_word,
          is_subject: true,
          is_style: false,
          steps: 1000,
          learning_rate: 0.0004,
          batch_size: 1,
          resolution: 512,
        });
      } else {
        return await LeonardoAI.trainModel({
          images: input.images,
          name: input.name,
          description: input.description,
          instance_prompt: `photo of ${input.trigger_word} person`,
          modelType: 'PORTRAIT',
          resolution: 768,
        });
      }
    };

    return this.executeWithFallback(operation, undefined, input.provider);
  }

  public async uploadFile(file: File, provider?: AIProvider): Promise<string> {
    const selectedProvider = this.selectBestProvider(undefined, provider);

    const operation = async (provider: AIProvider) => {
      if (provider === 'fal') {
        return await FalAI.uploadFile(file);
      } else {
        return await LeonardoAI.uploadFile(file);
      }
    };

    return this.executeWithFallback(operation, undefined, provider);
  }

  public async generateVideo(imageUrl: string, provider?: AIProvider): Promise<any> {
    const operation = async (provider: AIProvider) => {
      if (provider === 'fal') {
        // fal.ai video generation (if available)
        throw new Error('Video generation not yet implemented for fal.ai');
      } else {
        // Convert URL to image ID for Leonardo
        const imageId = await this.urlToLeonardoImageId(imageUrl);
        return await LeonardoAI.generateVideo(imageId);
      }
    };

    return this.executeWithFallback(operation, undefined, provider);
  }

  public async tryOnClothes(personImage: string, clothingImage: string, provider?: AIProvider): Promise<UnifiedImageGenerationResult> {
    const startTime = Date.now();

    const operation = async (provider: AIProvider) => {
      if (provider === 'fal') {
        // fal.ai try-on (if available)
        throw new Error('Try-on clothes not yet implemented for fal.ai');
      } else {
        const personImageId = await this.urlToLeonardoImageId(personImage);
        const clothingImageId = await this.urlToLeonardoImageId(clothingImage);

        const result = await LeonardoAI.tryOnClothes(personImageId, clothingImageId);
        const imageUrls = await LeonardoAI.waitForGeneration(result.sdGenerationJob.generationId);

        return {
          images: imageUrls.map(url => ({
            url,
            width: 768,
            height: 768,
            provider: 'leonardo' as AIProvider,
          })),
          metadata: {
            provider: 'leonardo' as AIProvider,
            model: 'leonardo-phoenix',
            processingTime: Date.now() - startTime,
            cost: result.sdGenerationJob.apiCreditCost,
            fallbackUsed: false,
          },
        };
      }
    };

    return this.executeWithFallback(operation, undefined, provider);
  }

  // Helper methods
  private selectFalModel(requirements?: GenerationRequirements): FalAI.FalAIModelId {
    if (!requirements) return 'flux-dev';

    if (requirements.quality === 'premium') {
      return 'flux-pro-ultra';
    } else if (requirements.quality === 'standard') {
      return 'flux-pro';
    } else {
      return 'flux-dev';
    }
  }

  private selectLeonardoModel(requirements?: GenerationRequirements): LeonardoAI.LeonardoAIModelId {
    if (!requirements) return 'leonardo-phoenix';

    if (requirements.quality === 'premium') {
      return 'photoreal';
    } else if (requirements.quality === 'standard') {
      return 'leonardo-phoenix';
    } else {
      return 'dreamshaper-v7';
    }
  }

  private parseImageSize(imageSize?: string): { width: number; height: number } {
    if (!imageSize) return { width: 768, height: 768 };

    const sizeMap: Record<string, { width: number; height: number }> = {
      'square': { width: 768, height: 768 },
      'square_hd': { width: 1024, height: 1024 },
      'portrait': { width: 768, height: 1024 },
      'landscape': { width: 1024, height: 768 },
    };

    return sizeMap[imageSize] || { width: 768, height: 768 };
  }

  private estimateFalCost(numImages: number): number {
    // Rough estimate - actual costs may vary
    return numImages * 0.01;
  }

  private async urlToLeonardoImageId(imageUrl: string): Promise<string> {
    // This would need to upload the image to Leonardo and return the ID
    // For now, we'll assume the URL is already a Leonardo image ID
    // In a real implementation, you'd fetch the image and upload it
    return imageUrl;
  }

  public getSystemHealth(): {
    overall: 'healthy' | 'degraded' | 'down';
    providers: Record<AIProvider, ProviderStatus>;
    recommendations: string[];
  } {
    const providers = Object.fromEntries(this.providerStatus) as Record<AIProvider, ProviderStatus>;
    const onlineProviders = Object.values(providers).filter(p => p.online).length;

    let overall: 'healthy' | 'degraded' | 'down';
    const recommendations: string[] = [];

    if (onlineProviders === 2) {
      overall = 'healthy';
    } else if (onlineProviders === 1) {
      overall = 'degraded';
      recommendations.push('One AI provider is down. Service is running on backup provider.');
    } else {
      overall = 'down';
      recommendations.push('All AI providers are down. Please check API keys and network connectivity.');
    }

    // Add specific recommendations
    Object.entries(providers).forEach(([provider, status]) => {
      if (!status.online) {
        recommendations.push(`${provider} provider is offline. Last error count: ${status.errorCount}`);
      }
      if (status.responseTime && status.responseTime > 10000) {
        recommendations.push(`${provider} provider is responding slowly (${status.responseTime}ms)`);
      }
    });

    return {
      overall,
      providers,
      recommendations,
    };
  }

  public destroy() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }
}

// Export singleton instance
export const unifiedAI = new UnifiedAIService();

// Export class for custom instances
export { UnifiedAIService };
