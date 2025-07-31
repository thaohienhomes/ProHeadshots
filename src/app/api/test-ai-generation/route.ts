import { NextRequest, NextResponse } from 'next/server';
import { unifiedAI, UnifiedImageGenerationInput } from '@/utils/unifiedAI';
import { logger } from '@/utils/logger';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      provider, 
      requirements, 
      num_images = 1,
      image_size = 'portrait',
      test_mode = true
    } = body;

    // Validate input
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required.' },
        { status: 400 }
      );
    }

    console.log('🧪 AI Generation Test:', {
      prompt: prompt.substring(0, 100) + '...',
      provider,
      requirements,
      num_images,
      image_size
    });

    // Prepare unified generation input
    const generationInput: UnifiedImageGenerationInput = {
      prompt,
      provider: provider as 'fal' | 'leonardo' | undefined,
      requirements: requirements ? {
        quality: requirements.quality || 'standard',
        speed: requirements.speed || 'standard',
        budget: requirements.budget || 'medium',
        features: requirements.features || [],
      } : undefined,
      num_images,
      image_size: image_size as 'square' | 'portrait' | 'landscape',
      guidance_scale: 7,
      num_inference_steps: 30,
    };

    // Log generation attempt
    const startTime = Date.now();
    logger.info('Starting AI generation test', {
      prompt: prompt.substring(0, 50) + '...',
      provider: provider || 'auto',
      requirements,
      testMode: test_mode,
    }, 'AI_GENERATION_TEST_START');

    // Generate images using unified AI service
    const result = await unifiedAI.generateImages(generationInput);
    const processingTime = Date.now() - startTime;

    logger.info('AI generation test completed', {
      success: true,
      imageCount: result.images.length,
      provider: result.metadata.provider,
      processingTime,
      cost: result.metadata.cost,
      fallbackUsed: result.metadata.fallbackUsed,
    }, 'AI_GENERATION_TEST_SUCCESS');

    return NextResponse.json({
      success: true,
      images: result.images,
      metadata: {
        ...result.metadata,
        processingTime,
        testMode: test_mode,
        timestamp: new Date().toISOString(),
      },
      prompt,
      provider: provider || 'auto',
      actualProvider: result.metadata.provider,
      fallbackUsed: result.metadata.fallbackUsed,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error('AI generation test failed', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    }, 'AI_GENERATION_TEST_ERROR');

    console.error('❌ AI Generation Test Error:', error);

    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test AI service health
    const healthStatus = await unifiedAI.getSystemHealth();
    
    return NextResponse.json({
      message: 'AI Generation Test Endpoint',
      health: healthStatus,
      testInstructions: {
        method: 'POST',
        requiredFields: ['prompt'],
        optionalFields: ['provider', 'requirements', 'num_images', 'image_size'],
        exampleRequest: {
          prompt: 'professional headshot of a person in business attire',
          provider: 'fal', // or 'leonardo' or leave empty for auto-selection
          requirements: {
            quality: 'high',
            speed: 'standard',
            budget: 'medium'
          },
          num_images: 1,
          image_size: 'portrait'
        }
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      message: 'AI Generation Test Endpoint',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
