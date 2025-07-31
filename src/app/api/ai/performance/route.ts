import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { 
  trackAIPerformance,
  getModelPerformanceStats,
  getAISystemPerformance,
  getSystemHealth,
  AIPerformanceMetrics
} from '@/utils/performanceMonitoring';
import { FalAIModelId } from '@/utils/falAI';
import { logger } from '@/utils/logger';
import getUser from '@/action/getUser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, metrics } = body;

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
      case 'track':
        return handleTrackPerformance(metrics, user);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: track' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Error in performance monitoring API', error as Error, 'PERFORMANCE_API');
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
    const modelId = searchParams.get('modelId') as FalAIModelId;
    const timeframe = searchParams.get('timeframe') as 'hour' | 'day' | 'week' | 'month' || 'day';

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
      case 'system':
        return handleGetSystemPerformance(timeframe, user);
      
      case 'model':
        return handleGetModelPerformance(modelId, timeframe, user);
      
      case 'health':
        return handleGetHealthStatus(user);
      
      case 'dashboard':
        return handleGetDashboardData(timeframe, user);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: system, model, health, or dashboard' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Error in performance monitoring GET API', error, 'PERFORMANCE_API');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleTrackPerformance(metrics: AIPerformanceMetrics, user: any): Promise<NextResponse> {
  try {
    // Validate metrics
    if (!metrics || !metrics.modelId || !metrics.timestamp) {
      return NextResponse.json(
        { error: 'Invalid metrics data' },
        { status: 400 }
      );
    }

    // Add user ID to metrics
    const enhancedMetrics: AIPerformanceMetrics = {
      ...metrics,
      userId: user.id,
    };

    await trackAIPerformance(enhancedMetrics);

    return NextResponse.json({
      success: true,
      message: 'Performance metrics tracked successfully',
    });

  } catch (error) {
    logger.error('Error tracking performance', error, 'PERFORMANCE_API');
    return NextResponse.json(
      { error: 'Failed to track performance metrics' },
      { status: 500 }
    );
  }
}

async function handleGetSystemPerformance(timeframe: string, user: any): Promise<NextResponse> {
  try {
    const isAdmin = user.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required for system performance data' },
        { status: 403 }
      );
    }

    const performance = await getAISystemPerformance(timeframe as 'hour' | 'day' | 'week' | 'month');

    return NextResponse.json({
      success: true,
      performance,
      timeframe,
    });

  } catch (error) {
    logger.error('Error getting system performance', error, 'PERFORMANCE_API');
    return NextResponse.json(
      { error: 'Failed to get system performance data' },
      { status: 500 }
    );
  }
}

async function handleGetModelPerformance(modelId: FalAIModelId, timeframe: string, user: any): Promise<NextResponse> {
  try {
    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      );
    }

    const stats = await getModelPerformanceStats(modelId, timeframe as 'hour' | 'day' | 'week' | 'month');

    return NextResponse.json({
      success: true,
      stats,
      modelId,
      timeframe,
    });

  } catch (error) {
    logger.error('Error getting model performance', error, 'PERFORMANCE_API');
    return NextResponse.json(
      { error: 'Failed to get model performance data' },
      { status: 500 }
    );
  }
}

async function handleGetHealthStatus(user: any): Promise<NextResponse> {
  try {
    const health = await getSystemHealth();

    return NextResponse.json({
      success: true,
      health,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Error getting health status', error, 'PERFORMANCE_API');
    return NextResponse.json(
      { error: 'Failed to get health status' },
      { status: 500 }
    );
  }
}

async function handleGetDashboardData(timeframe: string, user: any): Promise<NextResponse> {
  try {
    const isAdmin = user.role === 'admin';

    // Get system performance
    const systemPerformance = isAdmin 
      ? await getAISystemPerformance(timeframe as 'hour' | 'day' | 'week' | 'month')
      : null;

    // Get health status
    const health = await getSystemHealth();

    // Get user-specific performance if not admin
    let userPerformance = null;
    if (!isAdmin) {
      const supabase = await createClient();
      const startTime = getStartTime(timeframe as 'hour' | 'day' | 'week' | 'month');

      const { data: userMetrics } = await supabase
        .from('ai_performance_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', startTime.toISOString());

      if (userMetrics && userMetrics.length > 0) {
        const successfulMetrics = userMetrics.filter(m => m.success);
        const qualityScores = userMetrics.filter(m => m.quality_score).map(m => m.quality_score);

        userPerformance = {
          totalGenerations: userMetrics.length,
          successRate: (successfulMetrics.length / userMetrics.length) * 100,
          averageProcessingTime: userMetrics.reduce((sum, m) => sum + m.processing_time, 0) / userMetrics.length,
          totalCost: userMetrics.reduce((sum, m) => sum + m.cost, 0),
          averageQualityScore: qualityScores.length > 0 
            ? qualityScores.reduce((sum, s) => sum + s, 0) / qualityScores.length 
            : 0,
        };
      }
    }

    // Get recent alerts (admin only)
    let recentAlerts = [];
    if (isAdmin) {
      const supabase = await createClient();
      const { data: alerts } = await supabase
        .from('performance_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('triggered_at', { ascending: false })
        .limit(10);

      recentAlerts = alerts || [];
    }

    return NextResponse.json({
      success: true,
      dashboard: {
        systemPerformance,
        userPerformance,
        health,
        recentAlerts,
        isAdmin,
        timeframe,
      },
    });

  } catch (error) {
    logger.error('Error getting dashboard data', error, 'PERFORMANCE_API');
    return NextResponse.json(
      { error: 'Failed to get dashboard data' },
      { status: 500 }
    );
  }
}

function getStartTime(timeframe: 'hour' | 'day' | 'week' | 'month'): Date {
  const now = new Date();
  switch (timeframe) {
    case 'hour':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case 'day':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}
