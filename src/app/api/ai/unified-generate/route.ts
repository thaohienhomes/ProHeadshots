// Unified AI generation endpoint that supports both fal.ai and Leonardo AI
// Maintains backward compatibility while adding hybrid provider support

import { NextRequest, NextResponse } from 'next/server';
import { unifiedAI, UnifiedImageGenerationInput, GenerationRequirements } from '@/utils/unifiedAI';
import { createClient } from '@/utils/supabase/server';
import getUser from '@/action/getUser';
import { logger } from '@/utils/logger';
import { 
  getCachedGenerationResult, 
  cacheGenerationResult, 
  GenerationCacheKey 
} from '@/utils/aiCache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      provider, 
      requirements, 
      options = {},
      useCache = true 
    } = body;

    // Validate input
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required.' },
        { status: 400 }
      );
    }

    // Get user data for authentication
    const userData = await getUser();
    if (!userData || userData.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = userData[0];

    // Parse requirements
    const generationRequirements: GenerationRequirements | undefined = requirements ? {
      quality: requirements.quality || 'standard',
      speed: requirements.speed || 'standard',
      budget: requirements.budget || 'medium',
      features: requirements.features || [],
    } : undefined;

    // Prepare unified input
    const unifiedInput: UnifiedImageGenerationInput = {
      prompt,
      requirements: generationRequirements,
      provider: provider as 'fal' | 'leonardo' | undefined,
      num_images: options.num_images || 1,
      image_size: options.image_size || 'square_hd',
      seed: options.seed,
      guidance_scale: options.guidance_scale,
      num_inference_steps: options.num_inference_steps,
      negative_prompt: options.negative_prompt,
      lora_path: options.lora_path,
      lora_scale: options.lora_scale,
    };

    // Check cache if enabled
    let cachedResult = null;
    if (useCache) {
      const cacheKey: GenerationCacheKey = {
        prompt,
        modelId: 'unified', // Special key for unified generations
        parameters: unifiedInput,
        userId: user.id,
      };

      cachedResult = await getCachedGenerationResult(cacheKey);
      if (cachedResult) {
        logger.info('Returning cached unified generation result', {
          userId: user.id,
          prompt: prompt.substring(0, 100),
          provider: cachedResult.metadata?.provider,
        }, 'UNIFIED_AI_CACHE_HIT');

        return NextResponse.json({
          success: true,
          result: cachedResult.result,
          metadata: {
            ...cachedResult.metadata,
            fromCache: true,
            cacheTimestamp: cachedResult.timestamp,
          },
        });
      }
    }

    // Generate using unified AI service
    const startTime = Date.now();
    const result = await unifiedAI.generateImages(unifiedInput);
    const totalTime = Date.now() - startTime;

    // Cache the result if caching is enabled
    if (useCache) {
      const cacheKey: GenerationCacheKey = {
        prompt,
        modelId: 'unified',
        parameters: unifiedInput,
        userId: user.id,
      };

      await cacheGenerationResult(cacheKey, result, {
        generationTime: totalTime,
        cost: result.metadata.cost,
        qualityScore: 0.8, // Could be calculated based on result analysis
      });
    }

    // Log generation for analytics
    const supabase = await createClient();
    await supabase
      .from('ai_generations')
      .insert({
        user_id: user.id,
        prompt,
        provider: result.metadata.provider,
        model: result.metadata.model,
        num_images: unifiedInput.num_images,
        processing_time: totalTime,
        cost: result.metadata.cost,
        fallback_used: result.metadata.fallbackUsed,
        requirements: generationRequirements,
        created_at: new Date().toISOString(),
      });

    logger.info('Unified AI generation completed', {
      userId: user.id,
      provider: result.metadata.provider,
      model: result.metadata.model,
      processingTime: totalTime,
      fallbackUsed: result.metadata.fallbackUsed,
      numImages: result.images.length,
    }, 'UNIFIED_AI_GENERATION');

    return NextResponse.json({
      success: true,
      result,
      metadata: {
        ...result.metadata,
        totalProcessingTime: totalTime,
        fromCache: false,
      },
    });

  } catch (error) {
    logger.error('Error in unified AI generation', error, 'UNIFIED_AI_ERROR');
    
    return NextResponse.json(
      { 
        error: 'Generation failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        provider: 'unified'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get system health and available providers
    const systemHealth = unifiedAI.getSystemHealth();
    const providerStatus = unifiedAI.getProviderStatus() as Map<'fal' | 'leonardo', any>;
    
    // Convert Map to object for JSON response
    const providers = Object.fromEntries(providerStatus);

    return NextResponse.json({
      success: true,
      systemHealth,
      providers,
      capabilities: {
        imageGeneration: true,
        modelTraining: true,
        videoGeneration: true,
        tryOnClothes: true,
        automaticFailover: true,
        intelligentRouting: true,
      },
      supportedRequirements: {
        quality: ['basic', 'standard', 'premium'],
        speed: ['fast', 'standard', 'slow'],
        budget: ['low', 'medium', 'high'],
        features: ['lora', 'upscaling', 'video', 'try-on'],
      },
    });

  } catch (error) {
    logger.error('Error getting unified AI status', error, 'UNIFIED_AI_STATUS_ERROR');
    
    return NextResponse.json(
      { error: 'Failed to get system status' },
      { status: 500 }
    );
  }
}
