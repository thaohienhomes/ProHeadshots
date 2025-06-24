import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { 
  qualityEnhancementPipeline,
  EnhancementOptions,
  QualityMetrics,
  EnhancementResult
} from '@/utils/qualityEnhancement';
import { logger } from '@/utils/logger';
import getUser from '@/action/getUser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, imageUrl, options, targetQuality, batchImages } = body;

    // Validate input
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Get user authentication
    const userData = await getUser();
    if (!userData || userData.length === 0) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = userData[0];

    // Check if user has completed payment
    if (!user.paymentStatus) {
      return NextResponse.json(
        { error: 'Payment required to use quality enhancement' },
        { status: 402 }
      );
    }

    switch (action) {
      case 'assess':
        return handleAssessQuality(imageUrl, user);
      
      case 'enhance':
        return handleEnhanceImage(imageUrl, options, user);
      
      case 'auto-enhance':
        return handleAutoEnhance(imageUrl, targetQuality, user);
      
      case 'batch-enhance':
        return handleBatchEnhance(batchImages, user);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: assess, enhance, auto-enhance, or batch-enhance' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Error in quality enhancement API', error, 'QUALITY_ENHANCEMENT_API');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Get user authentication
    const userData = await getUser();
    if (!userData || userData.length === 0) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = userData[0];

    switch (action) {
      case 'stats':
        return handleGetStats(user);
      
      case 'history':
        return handleGetHistory(user);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: stats or history' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Error in quality enhancement GET API', error, 'QUALITY_ENHANCEMENT_API');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleAssessQuality(imageUrl: string, user: any): Promise<NextResponse> {
  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Image URL is required' },
      { status: 400 }
    );
  }

  try {
    const startTime = Date.now();
    const quality = await qualityEnhancementPipeline.assessImageQuality(imageUrl);
    const processingTime = Date.now() - startTime;

    // Log assessment
    const supabase = await createClient();
    await supabase
      .from('quality_assessments')
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        quality_metrics: quality,
        processing_time: processingTime,
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      quality,
      processingTime,
      recommendations: quality.recommendations,
      issues: quality.issues,
    });

  } catch (error) {
    logger.error('Error assessing image quality', error, 'QUALITY_ENHANCEMENT_API');
    return NextResponse.json(
      { error: 'Failed to assess image quality' },
      { status: 500 }
    );
  }
}

async function handleEnhanceImage(imageUrl: string, options: EnhancementOptions, user: any): Promise<NextResponse> {
  if (!imageUrl || !options) {
    return NextResponse.json(
      { error: 'Image URL and enhancement options are required' },
      { status: 400 }
    );
  }

  try {
    // Check user plan limits
    const enhancementLimits = {
      basic: 5,
      professional: 20,
      executive: 100,
    };

    const userLimit = enhancementLimits[user.planType as keyof typeof enhancementLimits] || 5;

    // Check usage in current month
    const supabase = await createClient();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyUsage } = await supabase
      .from('quality_enhancements')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    if ((monthlyUsage?.length || 0) >= userLimit) {
      return NextResponse.json(
        { 
          error: 'Monthly enhancement limit reached',
          limit: userLimit,
          used: monthlyUsage?.length || 0,
        },
        { status: 429 }
      );
    }

    const result = await qualityEnhancementPipeline.enhanceImage(imageUrl, options);

    // Log enhancement
    await supabase
      .from('quality_enhancements')
      .insert({
        user_id: user.id,
        original_url: result.originalImage.url,
        enhanced_url: result.enhancedImage.url,
        original_quality: result.originalImage.quality,
        enhanced_quality: result.enhancedImage.quality,
        improvements: result.improvements,
        processing_time: result.processingTime,
        enhancements_applied: result.enhancementsApplied,
        enhancement_options: options,
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      result,
      usage: {
        used: (monthlyUsage?.length || 0) + 1,
        limit: userLimit,
        remaining: userLimit - (monthlyUsage?.length || 0) - 1,
      },
    });

  } catch (error) {
    logger.error('Error enhancing image', error, 'QUALITY_ENHANCEMENT_API');
    return NextResponse.json(
      { error: 'Failed to enhance image' },
      { status: 500 }
    );
  }
}

async function handleAutoEnhance(imageUrl: string, targetQuality: string, user: any): Promise<NextResponse> {
  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Image URL is required' },
      { status: 400 }
    );
  }

  const validTargets = ['good', 'excellent', 'professional'];
  if (targetQuality && !validTargets.includes(targetQuality)) {
    return NextResponse.json(
      { error: `Invalid target quality. Must be one of: ${validTargets.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const result = await qualityEnhancementPipeline.autoEnhance(
      imageUrl, 
      targetQuality as 'good' | 'excellent' | 'professional' || 'good'
    );

    // Log auto-enhancement
    const supabase = await createClient();
    await supabase
      .from('quality_enhancements')
      .insert({
        user_id: user.id,
        original_url: result.originalImage.url,
        enhanced_url: result.enhancedImage.url,
        original_quality: result.originalImage.quality,
        enhanced_quality: result.enhancedImage.quality,
        improvements: result.improvements,
        processing_time: result.processingTime,
        enhancements_applied: result.enhancementsApplied,
        enhancement_type: 'auto',
        target_quality: targetQuality || 'good',
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      result,
      autoEnhanced: true,
      targetQuality: targetQuality || 'good',
    });

  } catch (error) {
    logger.error('Error auto-enhancing image', error, 'QUALITY_ENHANCEMENT_API');
    return NextResponse.json(
      { error: 'Failed to auto-enhance image' },
      { status: 500 }
    );
  }
}

async function handleBatchEnhance(batchImages: Array<{ url: string; options: EnhancementOptions }>, user: any): Promise<NextResponse> {
  if (!batchImages || !Array.isArray(batchImages) || batchImages.length === 0) {
    return NextResponse.json(
      { error: 'Batch images array is required' },
      { status: 400 }
    );
  }

  // Limit batch size based on user plan
  const batchLimits = {
    basic: 3,
    professional: 10,
    executive: 25,
  };

  const userBatchLimit = batchLimits[user.planType as keyof typeof batchLimits] || 3;

  if (batchImages.length > userBatchLimit) {
    return NextResponse.json(
      { 
        error: 'Batch size exceeds limit',
        limit: userBatchLimit,
        requested: batchImages.length,
      },
      { status: 400 }
    );
  }

  try {
    const results = await qualityEnhancementPipeline.enhanceImageBatch(batchImages, 3);

    // Log batch enhancement
    const supabase = await createClient();
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      await supabase
        .from('quality_enhancements')
        .insert({
          user_id: user.id,
          batch_id: batchId,
          original_url: result.originalImage.url,
          enhanced_url: result.enhancedImage.url,
          original_quality: result.originalImage.quality,
          enhanced_quality: result.enhancedImage.quality,
          improvements: result.improvements,
          processing_time: result.processingTime,
          enhancements_applied: result.enhancementsApplied,
          enhancement_options: batchImages[i].options,
          enhancement_type: 'batch',
          created_at: new Date().toISOString(),
        });
    }

    const totalProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0);
    const averageImprovement = results.reduce((sum, r) => sum + r.improvements.overallImprovement, 0) / results.length;

    return NextResponse.json({
      success: true,
      results,
      batchId,
      summary: {
        totalImages: results.length,
        totalProcessingTime,
        averageImprovement: Math.round(averageImprovement * 1000) / 1000,
        successfulEnhancements: results.filter(r => r.improvements.overallImprovement > 0).length,
      },
    });

  } catch (error) {
    logger.error('Error batch enhancing images', error, 'QUALITY_ENHANCEMENT_API');
    return NextResponse.json(
      { error: 'Failed to batch enhance images' },
      { status: 500 }
    );
  }
}

async function handleGetStats(user: any): Promise<NextResponse> {
  try {
    const stats = await qualityEnhancementPipeline.getEnhancementStats();

    // Get user-specific stats
    const supabase = await createClient();
    const { data: userEnhancements } = await supabase
      .from('quality_enhancements')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const userStats = {
      totalEnhancements: userEnhancements?.length || 0,
      averageImprovement: userEnhancements?.length 
        ? userEnhancements.reduce((sum, e) => sum + (e.improvements?.overallImprovement || 0), 0) / userEnhancements.length
        : 0,
      totalProcessingTime: userEnhancements?.reduce((sum, e) => sum + (e.processing_time || 0), 0) || 0,
    };

    return NextResponse.json({
      success: true,
      globalStats: stats,
      userStats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Error getting enhancement stats', error, 'QUALITY_ENHANCEMENT_API');
    return NextResponse.json(
      { error: 'Failed to get enhancement stats' },
      { status: 500 }
    );
  }
}

async function handleGetHistory(user: any): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: history, error } = await supabase
      .from('quality_enhancements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      history: history || [],
      total: history?.length || 0,
    });

  } catch (error) {
    logger.error('Error getting enhancement history', error, 'QUALITY_ENHANCEMENT_API');
    return NextResponse.json(
      { error: 'Failed to get enhancement history' },
      { status: 500 }
    );
  }
}
