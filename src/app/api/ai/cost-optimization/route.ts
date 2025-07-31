import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { 
  costOptimizationManager,
  analyzeCosts,
  getResourceUsage,
  generateOptimizationRecommendations,
  getMostCostEffectiveModel,
  calculateGenerationCost,
  monitorBudgetUsage
} from '@/utils/costOptimization';
import { FalAIModelId } from '@/utils/falAI';
import { logger } from '@/utils/logger';
import getUser from '@/action/getUser';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const timeframe = searchParams.get('timeframe') as 'daily' | 'weekly' | 'monthly' || 'monthly';

    // Get user authentication
    const userData = await getUser();
    if (!userData || userData.length === 0) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = userData[0];

    // Check if user is admin for detailed cost analysis
    const isAdmin = user.role === 'admin';

    switch (action) {
      case 'analyze':
        return handleAnalyzeCosts(timeframe, user, isAdmin);
      
      case 'resources':
        return handleGetResourceUsage(user, isAdmin);
      
      case 'recommendations':
        return handleGetRecommendations(user, isAdmin);
      
      case 'budget':
        return handleBudgetMonitoring(user, isAdmin);
      
      case 'model-costs':
        return handleGetModelCosts(user);
      
      case 'calculate-cost':
        return handleCalculateCost(searchParams, user);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: analyze, resources, recommendations, budget, model-costs, or calculate-cost' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Error in cost optimization API', error as Error, 'COST_OPTIMIZATION_API');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;

    // Get user authentication
    const userData = await getUser();
    if (!userData || userData.length === 0) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = userData[0];

    // Only admins can modify cost optimization settings
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    switch (action) {
      case 'update-config':
        return handleUpdateConfig(config, user);
      
      case 'set-budget':
        return handleSetBudget(body.budgetLimits, user);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: update-config or set-budget' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Error in cost optimization POST API', error as Error, 'COST_OPTIMIZATION_API');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleAnalyzeCosts(timeframe: string, user: any, isAdmin: boolean): Promise<NextResponse> {
  try {
    const analysis = await analyzeCosts(timeframe as 'daily' | 'weekly' | 'monthly');

    // Filter sensitive data for non-admin users
    const response = isAdmin ? analysis : {
      totalCost: analysis.totalCost,
      costSavings: analysis.costSavings,
      recommendations: analysis.recommendations.slice(0, 3), // Limit recommendations
      projectedMonthlyCost: analysis.projectedMonthlyCost,
    };

    return NextResponse.json({
      success: true,
      analysis: response,
      timeframe,
      isAdmin,
    });

  } catch (error) {
    logger.error('Error analyzing costs', error as Error, 'COST_OPTIMIZATION_API');
    return NextResponse.json(
      { error: 'Failed to analyze costs' },
      { status: 500 }
    );
  }
}

async function handleGetResourceUsage(user: any, isAdmin: boolean): Promise<NextResponse> {
  try {
    const resourceUsage = await getResourceUsage();

    // Filter sensitive data for non-admin users
    const response = isAdmin ? resourceUsage : {
      cpu: { current: resourceUsage.cpu.current, limit: resourceUsage.cpu.limit },
      memory: { current: resourceUsage.memory.current, limit: resourceUsage.memory.limit },
      gpu: { current: resourceUsage.gpu.current, limit: resourceUsage.gpu.limit },
      storage: { 
        used: resourceUsage.storage.used, 
        total: resourceUsage.storage.total,
        usagePercentage: (resourceUsage.storage.used / resourceUsage.storage.total) * 100
      },
    };

    return NextResponse.json({
      success: true,
      resourceUsage: response,
      isAdmin,
    });

  } catch (error) {
    logger.error('Error getting resource usage', error as Error, 'COST_OPTIMIZATION_API');
    return NextResponse.json(
      { error: 'Failed to get resource usage' },
      { status: 500 }
    );
  }
}

async function handleGetRecommendations(user: any, isAdmin: boolean): Promise<NextResponse> {
  try {
    const recommendations = await generateOptimizationRecommendations();

    // Filter recommendations based on user role
    const filteredRecommendations = isAdmin 
      ? recommendations 
      : recommendations.filter(rec => rec.type !== 'resource_allocation').slice(0, 5);

    return NextResponse.json({
      success: true,
      recommendations: filteredRecommendations,
      total: recommendations.length,
      isAdmin,
    });

  } catch (error) {
    logger.error('Error getting recommendations', error as Error, 'COST_OPTIMIZATION_API');
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

async function handleBudgetMonitoring(user: any, isAdmin: boolean): Promise<NextResponse> {
  try {
    const budgetStatus = await monitorBudgetUsage();

    // Get user-specific budget info if not admin
    let userBudgetInfo = null;
    if (!isAdmin) {
      const supabase = await createClient();
      const { data: userGenerations } = await supabase
        .from('ai_generations')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const userMonthlyUsage = (userGenerations?.length || 0) * 1.5; // Estimate cost per generation

      userBudgetInfo = {
        monthlyUsage: userMonthlyUsage,
        generationsThisMonth: userGenerations?.length || 0,
        planType: user.planType,
      };
    }

    return NextResponse.json({
      success: true,
      budgetStatus: isAdmin ? budgetStatus : {
        status: budgetStatus.status,
        message: budgetStatus.message,
      },
      userBudgetInfo,
      isAdmin,
    });

  } catch (error) {
    logger.error('Error monitoring budget', error as Error, 'COST_OPTIMIZATION_API');
    return NextResponse.json(
      { error: 'Failed to monitor budget' },
      { status: 500 }
    );
  }
}

async function handleGetModelCosts(user: any): Promise<NextResponse> {
  try {
    const models: FalAIModelId[] = [
      'flux-dev', 'flux-pro', 'flux-pro-ultra', 'imagen4', 
      'recraft-v3', 'aura-sr', 'clarity-upscaler', 'flux-lora'
    ];

    const modelCosts = models.map(modelId => ({
      modelId,
      costPerGeneration: calculateGenerationCost(modelId, 1),
      costPer5Images: calculateGenerationCost(modelId, 5),
      costPer10Images: calculateGenerationCost(modelId, 10),
      recommendedFor: getModelRecommendation(modelId),
    }));

    // Get most cost-effective models
    const costEffectiveModels = {
      highQuality: getMostCostEffectiveModel(0.9, 'medium'),
      balanced: getMostCostEffectiveModel(0.8, 'medium'),
      budget: getMostCostEffectiveModel(0.7, 'fast'),
    };

    return NextResponse.json({
      success: true,
      modelCosts,
      costEffectiveModels,
      planType: user.planType,
    });

  } catch (error) {
    logger.error('Error getting model costs', error as Error, 'COST_OPTIMIZATION_API');
    return NextResponse.json(
      { error: 'Failed to get model costs' },
      { status: 500 }
    );
  }
}

async function handleCalculateCost(searchParams: URLSearchParams, user: any): Promise<NextResponse> {
  try {
    const modelId = searchParams.get('modelId') as FalAIModelId;
    const numImages = parseInt(searchParams.get('numImages') || '1');
    const imageSize = searchParams.get('imageSize');
    const steps = parseInt(searchParams.get('steps') || '28');

    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      );
    }

    const options = {
      image_size: imageSize,
      num_inference_steps: steps,
    };

    const cost = calculateGenerationCost(modelId, numImages, options);

    return NextResponse.json({
      success: true,
      cost,
      modelId,
      numImages,
      options,
      breakdown: {
        baseCost: calculateGenerationCost(modelId, numImages),
        optionMultipliers: cost / calculateGenerationCost(modelId, numImages),
      },
    });

  } catch (error) {
    logger.error('Error calculating cost', error as Error, 'COST_OPTIMIZATION_API');
    return NextResponse.json(
      { error: 'Failed to calculate cost' },
      { status: 500 }
    );
  }
}

async function handleUpdateConfig(config: any, user: any): Promise<NextResponse> {
  try {
    // In production, this would update the configuration in the database
    // For now, we'll just log the update
    logger.info('Cost optimization config updated', 'COST_OPTIMIZATION_API', { config, userId: user.id });

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      config,
    });

  } catch (error) {
    logger.error('Error updating config', error as Error, 'COST_OPTIMIZATION_API');
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

async function handleSetBudget(budgetLimits: any, user: any): Promise<NextResponse> {
  try {
    // In production, this would update budget limits in the database
    logger.info('Budget limits updated', 'COST_OPTIMIZATION_API', { budgetLimits, userId: user.id });

    return NextResponse.json({
      success: true,
      message: 'Budget limits updated successfully',
      budgetLimits,
    });

  } catch (error) {
    logger.error('Error setting budget', error as Error, 'COST_OPTIMIZATION_API');
    return NextResponse.json(
      { error: 'Failed to set budget limits' },
      { status: 500 }
    );
  }
}

function getModelRecommendation(modelId: FalAIModelId): string {
  const recommendations: Record<FalAIModelId, string> = {
    'flux-dev': 'Best for development and testing - fast and cost-effective',
    'flux-pro': 'Balanced quality and cost - good for most professional use cases',
    'flux-pro-ultra': 'Highest quality - best for premium professional headshots',
    'imagen4': 'Good balance of quality and speed',
    'recraft-v3': 'Creative and artistic styles',
    'aura-sr': 'Excellent for upscaling existing images',
    'clarity-upscaler': 'Professional upscaling with high quality',
    'flux-lora': 'Customizable with LoRA models',
    'flux-lora-training': 'Train custom LoRA models for personalized results',
  };

  return recommendations[modelId] || 'General purpose AI model';
}
