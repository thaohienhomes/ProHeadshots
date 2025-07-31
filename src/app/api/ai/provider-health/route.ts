// Provider health monitoring API endpoint
// Provides real-time health status and metrics for AI providers

import { NextRequest, NextResponse } from 'next/server';
import { healthMonitor } from '@/utils/providerHealthMonitoring';
import { unifiedAI } from '@/utils/unifiedAI';
import { logger } from '@/utils/logger';
import getUser from '@/action/getUser';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') as 'fal' | 'leonardo' | null;
    const detailed = searchParams.get('detailed') === 'true';
    const history = searchParams.get('history') === 'true';

    // Get user for authentication (optional for health checks)
    const userData = await getUser();
    const isAuthenticated = userData && userData.length > 0;

    if (provider) {
      // Get specific provider metrics
      const metrics = healthMonitor.getProviderMetrics(provider);
      if (!metrics) {
        return NextResponse.json(
          { error: `Provider '${provider}' not found` },
          { status: 404 }
        );
      }

      const response: any = {
        success: true,
        provider,
        metrics,
      };

      if (history && isAuthenticated) {
        response.history = healthMonitor.getProviderHistory(provider);
      }

      return NextResponse.json(response);
    }

    // Get system-wide health
    const systemHealth = healthMonitor.getSystemHealth();
    const allMetrics = healthMonitor.getAllMetrics();
    const healthSummary = healthMonitor.getHealthSummary();

    const response: any = {
      success: true,
      systemHealth,
      providers: allMetrics,
      summary: healthSummary,
    };

    if (detailed && isAuthenticated) {
      response.unifiedAIStatus = unifiedAI.getSystemHealth();
      response.recommendations = systemHealth.recommendations;
    }

    if (history && isAuthenticated) {
      response.history = {
        fal: healthMonitor.getProviderHistory('fal'),
        leonardo: healthMonitor.getProviderHistory('leonardo'),
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Error getting provider health', error, 'PROVIDER_HEALTH_API');
    
    return NextResponse.json(
      { error: 'Failed to get provider health status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await getUser();
    if (!userData || userData.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, provider } = body;

    switch (action) {
      case 'force-check':
        await healthMonitor.forceHealthCheck(provider);
        logger.info('Forced health check completed', { 
          provider: provider || 'all',
          userId: userData[0].id 
        }, 'PROVIDER_HEALTH_FORCE_CHECK');
        
        return NextResponse.json({
          success: true,
          message: `Health check completed for ${provider || 'all providers'}`,
          timestamp: new Date().toISOString(),
        });

      case 'reset-metrics':
        healthMonitor.resetMetrics(provider);
        logger.info('Health metrics reset', { 
          provider: provider || 'all',
          userId: userData[0].id 
        }, 'PROVIDER_HEALTH_RESET');
        
        return NextResponse.json({
          success: true,
          message: `Metrics reset for ${provider || 'all providers'}`,
          timestamp: new Date().toISOString(),
        });

      case 'start-monitoring':
        healthMonitor.startMonitoring();
        logger.info('Health monitoring started', { 
          userId: userData[0].id 
        }, 'PROVIDER_HEALTH_START');
        
        return NextResponse.json({
          success: true,
          message: 'Health monitoring started',
          timestamp: new Date().toISOString(),
        });

      case 'stop-monitoring':
        healthMonitor.stopMonitoring();
        logger.info('Health monitoring stopped', { 
          userId: userData[0].id 
        }, 'PROVIDER_HEALTH_STOP');
        
        return NextResponse.json({
          success: true,
          message: 'Health monitoring stopped',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: force-check, reset-metrics, start-monitoring, or stop-monitoring' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Error in provider health action', error, 'PROVIDER_HEALTH_ACTION_ERROR');
    
    return NextResponse.json(
      { error: 'Failed to execute health action' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userData = await getUser();
    if (!userData || userData.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { provider, status } = body;

    if (!provider || !['fal', 'leonardo'].includes(provider)) {
      return NextResponse.json(
        { error: 'Valid provider is required (fal or leonardo)' },
        { status: 400 }
      );
    }

    if (!status || !['online', 'offline', 'degraded'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (online, offline, or degraded)' },
        { status: 400 }
      );
    }

    // This would manually override provider status (for maintenance, etc.)
    // For now, we'll just log the request since the health monitor manages status automatically
    logger.info('Manual provider status override requested', {
      provider,
      requestedStatus: status,
      userId: userData[0].id,
    }, 'PROVIDER_HEALTH_OVERRIDE');

    return NextResponse.json({
      success: true,
      message: `Status override logged for ${provider}`,
      note: 'Automatic health monitoring will continue to update status based on actual health checks',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Error in provider status override', error, 'PROVIDER_HEALTH_OVERRIDE_ERROR');
    
    return NextResponse.json(
      { error: 'Failed to override provider status' },
      { status: 500 }
    );
  }
}
