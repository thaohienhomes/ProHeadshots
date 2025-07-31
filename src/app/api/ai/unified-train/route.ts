// Unified AI model training endpoint that supports both fal.ai and Leonardo AI
// Maintains backward compatibility while adding hybrid provider support

import { NextRequest, NextResponse } from 'next/server';
import { unifiedAI, UnifiedTrainingInput } from '@/utils/unifiedAI';
import { createClient } from '@/utils/supabase/server';
import getUser from '@/action/getUser';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      images, 
      name, 
      trigger_word, 
      description, 
      provider,
      options = {} 
    } = body;

    // Validate input
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'Images array is required and must not be empty.' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Model name is required.' },
        { status: 400 }
      );
    }

    if (!trigger_word) {
      return NextResponse.json(
        { error: 'Trigger word is required.' },
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

    // Check user's training quota/permissions
    const supabase = await createClient();
    
    // Get user's current training count for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyTraining, error: trainingError } = await supabase
      .from('ai_model_training')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    if (trainingError) {
      logger.error('Error checking training quota', trainingError, 'UNIFIED_TRAINING_QUOTA_ERROR');
      return NextResponse.json(
        { error: 'Failed to check training quota' },
        { status: 500 }
      );
    }

    // Check training limits based on user plan (this should be configurable)
    const trainingLimits = {
      basic: 1,
      professional: 5,
      executive: 10,
    };

    const userPlan = user.plan || 'basic';
    const monthlyLimit = trainingLimits[userPlan as keyof typeof trainingLimits] || 1;
    const currentCount = monthlyTraining?.length || 0;

    if (currentCount >= monthlyLimit) {
      return NextResponse.json(
        { 
          error: 'Training limit exceeded',
          message: `You have reached your monthly training limit of ${monthlyLimit} models for the ${userPlan} plan.`,
          currentCount,
          limit: monthlyLimit,
        },
        { status: 403 }
      );
    }

    // Prepare unified training input
    const unifiedInput: UnifiedTrainingInput = {
      images,
      name,
      trigger_word,
      description: description || `Custom AI model for ${name}`,
      provider: provider as 'fal' | 'leonardo' | undefined,
    };

    // Start training using unified AI service
    const startTime = Date.now();
    logger.info('Starting unified AI model training', {
      userId: user.id,
      modelName: name,
      triggerWord: trigger_word,
      imageCount: images.length,
      requestedProvider: provider,
    }, 'UNIFIED_AI_TRAINING_START');

    const trainingId = await unifiedAI.trainModel(unifiedInput);
    const processingTime = Date.now() - startTime;

    // Log training initiation in database
    const { data: trainingRecord, error: insertError } = await supabase
      .from('ai_model_training')
      .insert({
        user_id: user.id,
        training_id: trainingId,
        model_name: name,
        trigger_word,
        description: unifiedInput.description,
        provider: provider || 'auto', // 'auto' means unified service chose
        image_count: images.length,
        status: 'training',
        processing_time: processingTime,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      logger.error('Error logging training record', insertError, 'UNIFIED_TRAINING_LOG_ERROR');
      // Don't fail the request, just log the error
    }

    logger.info('Unified AI model training initiated', {
      userId: user.id,
      trainingId,
      modelName: name,
      processingTime,
      recordId: trainingRecord?.id,
    }, 'UNIFIED_AI_TRAINING_INITIATED');

    return NextResponse.json({
      success: true,
      trainingId,
      modelName: name,
      triggerWord: trigger_word,
      status: 'training',
      metadata: {
        imageCount: images.length,
        processingTime,
        provider: provider || 'auto',
        estimatedCompletionTime: '10-30 minutes',
        recordId: trainingRecord?.id,
      },
      usage: {
        used: currentCount + 1,
        limit: monthlyLimit,
        remaining: monthlyLimit - currentCount - 1,
        plan: userPlan,
      },
    });

  } catch (error) {
    logger.error('Error in unified AI training', error, 'UNIFIED_AI_TRAINING_ERROR');
    
    return NextResponse.json(
      { 
        error: 'Training failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        provider: 'unified'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trainingId = searchParams.get('trainingId');
    const userId = searchParams.get('userId');

    // Get user data for authentication
    const userData = await getUser();
    if (!userData || userData.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = userData[0];
    const supabase = await createClient();

    if (trainingId) {
      // Get specific training status
      const { data: trainingRecord, error } = await supabase
        .from('ai_model_training')
        .select('*')
        .eq('training_id', trainingId)
        .eq('user_id', user.id)
        .single();

      if (error || !trainingRecord) {
        return NextResponse.json(
          { error: 'Training record not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        training: trainingRecord,
      });
    }

    // Get user's training history
    const { data: trainingHistory, error: historyError } = await supabase
      .from('ai_model_training')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (historyError) {
      logger.error('Error getting training history', historyError, 'UNIFIED_TRAINING_HISTORY_ERROR');
      return NextResponse.json(
        { error: 'Failed to get training history' },
        { status: 500 }
      );
    }

    // Get current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyTraining = trainingHistory?.filter(
      t => new Date(t.created_at) >= startOfMonth
    ) || [];

    const trainingLimits = {
      basic: 1,
      professional: 5,
      executive: 10,
    };

    const userPlan = user.plan || 'basic';
    const monthlyLimit = trainingLimits[userPlan as keyof typeof trainingLimits] || 1;

    return NextResponse.json({
      success: true,
      trainingHistory: trainingHistory || [],
      usage: {
        used: monthlyTraining.length,
        limit: monthlyLimit,
        remaining: monthlyLimit - monthlyTraining.length,
        plan: userPlan,
      },
      statistics: {
        totalTrainings: trainingHistory?.length || 0,
        monthlyTrainings: monthlyTraining.length,
        successfulTrainings: trainingHistory?.filter(t => t.status === 'completed').length || 0,
        failedTrainings: trainingHistory?.filter(t => t.status === 'failed').length || 0,
      },
    });

  } catch (error) {
    logger.error('Error getting training status', error, 'UNIFIED_TRAINING_STATUS_ERROR');
    
    return NextResponse.json(
      { error: 'Failed to get training status' },
      { status: 500 }
    );
  }
}
