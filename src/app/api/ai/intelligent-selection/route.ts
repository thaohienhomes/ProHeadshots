import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { selectBestModel, UserRequirements, ImageCharacteristics } from '@/utils/intelligentModelSelection';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requirements, imageCharacteristics, userId } = body;

    // Validate required fields
    if (!requirements) {
      return NextResponse.json(
        { error: 'Requirements are required' },
        { status: 400 }
      );
    }

    // Validate user authentication if userId provided
    let authenticatedUser = null;
    if (userId) {
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user || user.id !== userId) {
        return NextResponse.json(
          { error: 'Invalid user authentication' },
          { status: 401 }
        );
      }
      
      authenticatedUser = user;
    }

    // Get user plan information if authenticated
    let userPlan = 'basic';
    if (authenticatedUser) {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_type')
        .eq('id', authenticatedUser.id)
        .single();
      
      userPlan = profile?.plan_type || 'basic';
    }

    // Ensure requirements include user plan
    const enhancedRequirements: UserRequirements = {
      purpose: 'professional',
      quality: 'standard',
      speed: 'balanced',
      budget: 'medium',
      style: 'realistic',
      outputCount: 1,
      userPlan: userPlan as any,
      ...requirements,
    };

    // Validate requirements
    const validationError = validateRequirements(enhancedRequirements);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Get intelligent model selection
    const modelSelection = await selectBestModel(
      enhancedRequirements,
      imageCharacteristics,
      userId
    );

    // Log the selection for analytics
    logger.info('Intelligent model selection completed', {
      userId,
      primaryModel: modelSelection.primaryModel.modelId,
      confidence: modelSelection.primaryModel.confidence,
      requirements: enhancedRequirements,
    }, 'AI_MODEL_SELECTION');

    return NextResponse.json({
      success: true,
      selection: modelSelection,
      metadata: {
        timestamp: new Date().toISOString(),
        userPlan,
        selectionId: generateSelectionId(),
      },
    });

  } catch (error) {
    logger.error('Error in intelligent model selection API', error, 'AI_MODEL_SELECTION');
    
    return NextResponse.json(
      { 
        error: 'Internal server error during model selection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get user's recent model selections for analysis
    const supabase = await createClient();
    
    let query = supabase
      .from('ai_model_selections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: recentSelections, error } = await query;

    if (error) {
      throw error;
    }

    // Analyze selection patterns
    const analysis = analyzeSelectionPatterns(recentSelections || []);

    return NextResponse.json({
      success: true,
      recentSelections,
      analysis,
      metadata: {
        timestamp: new Date().toISOString(),
        totalSelections: recentSelections?.length || 0,
      },
    });

  } catch (error) {
    logger.error('Error fetching model selection history', error, 'AI_MODEL_SELECTION');
    
    return NextResponse.json(
      { 
        error: 'Error fetching selection history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Validate user requirements
 */
function validateRequirements(requirements: UserRequirements): string | null {
  const validPurposes = ['professional', 'creative', 'social', 'portfolio', 'corporate'];
  const validQualities = ['basic', 'standard', 'premium', 'ultra'];
  const validSpeeds = ['fast', 'balanced', 'quality'];
  const validBudgets = ['low', 'medium', 'high', 'unlimited'];
  const validStyles = ['realistic', 'artistic', 'professional', 'casual', 'creative'];
  const validPlans = ['basic', 'professional', 'executive'];

  if (!validPurposes.includes(requirements.purpose)) {
    return `Invalid purpose. Must be one of: ${validPurposes.join(', ')}`;
  }

  if (!validQualities.includes(requirements.quality)) {
    return `Invalid quality. Must be one of: ${validQualities.join(', ')}`;
  }

  if (!validSpeeds.includes(requirements.speed)) {
    return `Invalid speed. Must be one of: ${validSpeeds.join(', ')}`;
  }

  if (!validBudgets.includes(requirements.budget)) {
    return `Invalid budget. Must be one of: ${validBudgets.join(', ')}`;
  }

  if (!validStyles.includes(requirements.style)) {
    return `Invalid style. Must be one of: ${validStyles.join(', ')}`;
  }

  if (!validPlans.includes(requirements.userPlan)) {
    return `Invalid user plan. Must be one of: ${validPlans.join(', ')}`;
  }

  if (requirements.outputCount < 1 || requirements.outputCount > 20) {
    return 'Output count must be between 1 and 20';
  }

  return null;
}

/**
 * Analyze selection patterns for insights
 */
function analyzeSelectionPatterns(selections: any[]): any {
  if (selections.length === 0) {
    return {
      mostUsedModel: null,
      averageConfidence: 0,
      preferredQuality: null,
      preferredSpeed: null,
      totalCost: 0,
      totalTime: 0,
    };
  }

  // Count model usage
  const modelCounts = selections.reduce((acc, selection) => {
    acc[selection.selected_model] = (acc[selection.selected_model] || 0) + 1;
    return acc;
  }, {});

  const mostUsedModel = Object.entries(modelCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0];

  // Calculate averages
  const averageConfidence = selections.reduce((sum, s) => sum + (s.confidence || 0), 0) / selections.length;
  const totalCost = selections.reduce((sum, s) => sum + (s.estimated_cost || 0), 0);
  const totalTime = selections.reduce((sum, s) => sum + (s.estimated_time || 0), 0);

  // Analyze preferences
  const qualities = selections.map(s => s.requirements?.quality).filter(Boolean);
  const speeds = selections.map(s => s.requirements?.speed).filter(Boolean);

  const preferredQuality = getMostFrequent(qualities);
  const preferredSpeed = getMostFrequent(speeds);

  return {
    mostUsedModel,
    averageConfidence: Math.round(averageConfidence * 100) / 100,
    preferredQuality,
    preferredSpeed,
    totalCost: Math.round(totalCost * 100) / 100,
    totalTime: Math.round(totalTime),
    modelDistribution: modelCounts,
    selectionTrends: {
      recentQualityTrend: qualities.slice(-5),
      recentSpeedTrend: speeds.slice(-5),
    },
  };
}

/**
 * Get most frequent item in array
 */
function getMostFrequent(arr: string[]): string | null {
  if (arr.length === 0) return null;
  
  const counts = arr.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
}

/**
 * Generate unique selection ID
 */
function generateSelectionId(): string {
  return `sel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
