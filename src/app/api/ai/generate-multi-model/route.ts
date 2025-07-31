import { NextRequest, NextResponse } from 'next/server';
import { generateWithMultipleModels, getModelInfo, FalAIModelId } from '@/utils/falAI';
import { createClient } from '@/utils/supabase/server';
import getUser from '@/action/getUser';
import { selectBestModel, UserRequirements } from '@/utils/intelligentModelSelection';
import {
  getCachedGenerationResult,
  cacheGenerationResult,
  getCachedModelSelectionResult,
  cacheModelSelectionResult,
  GenerationCacheKey,
  ModelSelectionCacheKey
} from '@/utils/aiCache';

export async function POST(request: NextRequest) {
  try {
    const { prompt, models, options, useIntelligentSelection, requirements } = await request.json();

    // Validate input
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required.' },
        { status: 400 }
      );
    }

    // Validate models if not using intelligent selection
    if (!useIntelligentSelection && (!models || !Array.isArray(models))) {
      return NextResponse.json(
        { error: 'Models array is required when not using intelligent selection.' },
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
    
    // Check if user has completed payment
    if (!user.paymentStatus) {
      return NextResponse.json(
        { error: 'Payment required to use AI generation' },
        { status: 402 }
      );
    }

    let selectedModels: FalAIModelId[] = [];
    let intelligentSelectionUsed = false;
    let selectionConfidence = 0;

    // Use intelligent selection if requested
    if (useIntelligentSelection && requirements) {
      const enhancedRequirements: UserRequirements = {
        userPlan: user.planType as any,
        outputCount: 1,
        purpose: 'professional',
        quality: 'standard',
        speed: 'balanced',
        budget: 'medium',
        style: 'realistic',
        ...requirements,
      };

      // Check cache for model selection
      const selectionCacheKey: ModelSelectionCacheKey = {
        requirements: enhancedRequirements,
        userId: user.id,
      };

      let modelSelection = await getCachedModelSelectionResult(selectionCacheKey);

      if (!modelSelection) {
        // Generate new selection if not cached
        modelSelection = await selectBestModel(enhancedRequirements, undefined, user.id);

        // Cache the selection
        await cacheModelSelectionResult(
          selectionCacheKey,
          modelSelection,
          modelSelection.primaryModel.confidence
        );
      }

      // Use primary model and top alternatives based on plan
      const maxModels = user.planType === 'executive' ? 3 : user.planType === 'professional' ? 2 : 1;
      selectedModels = [
        modelSelection.primaryModel.modelId,
        ...modelSelection.alternativeModels.slice(0, maxModels - 1).map((alt: any) => alt.modelId)
      ];

      intelligentSelectionUsed = true;
      selectionConfidence = modelSelection.primaryModel.confidence;
    } else {
      // Use manually specified models
      const validModels = models.filter((model: string) =>
        ['flux-pro-ultra', 'flux-pro', 'flux-dev', 'aura-sr', 'clarity-upscaler'].includes(model)
      ) as FalAIModelId[];

      if (validModels.length === 0) {
        return NextResponse.json(
          { error: 'No valid models specified' },
          { status: 400 }
        );
      }

      // Limit number of models based on plan
      const maxModels = user.planType === 'executive' ? 5 : user.planType === 'professional' ? 3 : 2;
      selectedModels = validModels.slice(0, maxModels);
    }

    // Check cache for each model before generation
    const generationOptions = {
      num_images: 1,
      image_size: "portrait_4_3",
      guidance_scale: 3.5,
      num_inference_steps: 28,
      enable_safety_checker: true,
      ...options,
    };

    const results: Array<{ model: FalAIModelId; result: any; fromCache?: boolean }> = [];
    const modelsToGenerate: FalAIModelId[] = [];

    // Check cache for each model
    for (const modelId of selectedModels) {
      const cacheKey: GenerationCacheKey = {
        prompt,
        modelId,
        parameters: generationOptions,
        userId: user.id,
      };

      const cachedResult = await getCachedGenerationResult(cacheKey);

      if (cachedResult) {
        results.push({
          model: modelId,
          result: cachedResult,
          fromCache: true,
        });
      } else {
        modelsToGenerate.push(modelId);
      }
    }

    // Generate images for models not in cache
    if (modelsToGenerate.length > 0) {
      const generationResults = await generateWithMultipleModels(prompt, modelsToGenerate, generationOptions);

      // Cache new results and add to results array
      for (const { model, result } of generationResults) {
        if (!(result instanceof Error)) {
          // Cache the successful result
          const cacheKey: GenerationCacheKey = {
            prompt,
            modelId: model,
            parameters: generationOptions,
            userId: user.id,
          };

          await cacheGenerationResult(cacheKey, result, {
            generationTime: result.timings?.inference || 0,
            cost: 2.0, // Estimate - should be calculated based on model
            qualityScore: 0.8, // Could be calculated based on result analysis
          });
        }

        results.push({
          model,
          result,
          fromCache: false,
        });
      }
    }

    // Process results
    const processedResults = results.map(({ model, result, fromCache }) => {
      const modelInfo = getModelInfo(model);

      if (result instanceof Error) {
        return {
          model,
          modelInfo,
          success: false,
          error: result.message,
          fromCache: false,
        };
      }

      return {
        model,
        modelInfo,
        success: true,
        images: result.images,
        timings: result.timings,
        seed: result.seed,
        fromCache: fromCache || false,
      };
    });

    // Log generation for analytics
    const supabase = await createClient();
    await supabase
      .from('ai_generations')
      .insert({
        user_id: user.id,
        prompt,
        models: selectedModels,
        results: processedResults,
        intelligent_selection: intelligentSelectionUsed,
        selection_confidence: selectionConfidence,
        created_at: new Date().toISOString(),
      });

    // Calculate cache statistics
    const cacheStats = {
      totalRequests: selectedModels.length,
      cacheHits: results.filter(r => r.fromCache).length,
      cacheHitRate: results.length > 0 ? (results.filter(r => r.fromCache).length / results.length) * 100 : 0,
    };

    return NextResponse.json({
      success: true,
      prompt,
      models: selectedModels,
      results: processedResults,
      intelligentSelection: {
        used: intelligentSelectionUsed,
        confidence: selectionConfidence,
      },
      cacheStats,
      performance: {
        totalModels: selectedModels.length,
        cachedResults: cacheStats.cacheHits,
        newGenerations: cacheStats.totalRequests - cacheStats.cacheHits,
        cacheHitRate: Math.round(cacheStats.cacheHitRate * 100) / 100,
      },
    });

  } catch (error) {
    console.error('Error in multi-model generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get available models and their info
    const models: FalAIModelId[] = ['flux-pro-ultra', 'flux-pro', 'flux-dev', 'aura-sr', 'clarity-upscaler'];
    
    const modelInfos = models.map(model => ({
      id: model,
      ...getModelInfo(model),
    }));

    return NextResponse.json({
      success: true,
      models: modelInfos,
    });

  } catch (error) {
    console.error('Error getting model info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
