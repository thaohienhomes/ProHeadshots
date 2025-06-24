// Health check API endpoint for monitoring
import { NextRequest, NextResponse } from 'next/server';
import { getSystemHealth, getUptimeStats } from '@/utils/uptimeMonitoring';
import { getPerformanceSummary } from '@/utils/webVitals';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    const timeframe = searchParams.get('timeframe') as 'hour' | 'day' | 'week' || 'day';

    // Basic health check
    const basicHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      environment: process.env.NODE_ENV || 'unknown',
    };

    // If not detailed, return basic health
    if (!detailed) {
      return NextResponse.json(basicHealth);
    }

    // Get detailed health information
    const systemHealth = getSystemHealth();
    const uptimeStats = getUptimeStats(timeframe);
    const performanceSummary = getPerformanceSummary();

    // Check database connectivity
    let databaseHealth = 'unknown';
    try {
      // Simple database check - you could make this more sophisticated
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
        });
        databaseHealth = response.ok ? 'healthy' : 'unhealthy';
      }
    } catch (error) {
      databaseHealth = 'unhealthy';
      logger.error('Database health check failed', error as Error, 'HEALTH_CHECK');
    }

    // Check external services
    const externalServices = {
      fal_ai: 'unknown',
      polar_payment: 'unknown',
      supabase: databaseHealth,
    };

    // Check Fal AI
    try {
      const falResponse = await fetch('https://fal.run/health', {
        method: 'GET',
        timeout: 5000,
      } as any);
      externalServices.fal_ai = falResponse.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      externalServices.fal_ai = 'unhealthy';
    }

    // Check Polar Payment
    try {
      const polarResponse = await fetch('https://api.polar.sh/v1/products/', {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
        },
        timeout: 5000,
      } as any);
      externalServices.polar_payment = polarResponse.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      externalServices.polar_payment = 'unhealthy';
    }

    const detailedHealth = {
      ...basicHealth,
      system: systemHealth,
      uptime: uptimeStats,
      performance: performanceSummary,
      external_services: externalServices,
      memory_usage: process.memoryUsage(),
      cpu_usage: process.cpuUsage(),
    };

    // Log health check
    logger.info('Health check completed', 'HEALTH_CHECK', {
      overall: systemHealth.overall,
      uptime_percentage: uptimeStats.uptimePercentage,
      external_services: externalServices,
    });

    return NextResponse.json(detailedHealth);

  } catch (error) {
    logger.error('Health check API error', error as Error, 'HEALTH_CHECK');
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Manual health check trigger
    const { runManualHealthCheck } = await import('@/utils/uptimeMonitoring');
    const result = await runManualHealthCheck();

    logger.info('Manual health check triggered', 'HEALTH_CHECK', result);

    return NextResponse.json({
      message: 'Manual health check completed',
      result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Manual health check failed', error as Error, 'HEALTH_CHECK');
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Manual health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
