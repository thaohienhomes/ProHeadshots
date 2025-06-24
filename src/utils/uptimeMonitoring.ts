// Uptime monitoring and health checks for ProHeadshots
import { logger } from './logger';
import { captureError, captureMessage } from './errorTracking';
import { trackEvent } from './googleAnalytics';

// Health check configuration
interface HealthCheckConfig {
  enabled: boolean;
  interval: number; // in milliseconds
  timeout: number; // in milliseconds
  retries: number;
  endpoints: HealthCheckEndpoint[];
}

interface HealthCheckEndpoint {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  expectedStatus: number;
  timeout: number;
  critical: boolean;
  headers?: Record<string, string>;
  body?: string;
}

interface HealthCheckResult {
  endpoint: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  statusCode?: number;
  error?: string;
  timestamp: string;
}

interface SystemHealth {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  uptime: number;
  checks: HealthCheckResult[];
  lastCheck: string;
  incidents: number;
}

class UptimeMonitor {
  private config: HealthCheckConfig;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;
  private healthHistory: HealthCheckResult[] = [];
  private incidentCount = 0;
  private startTime = Date.now();

  constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      interval: 60000, // 1 minute
      timeout: 10000, // 10 seconds
      retries: 3,
      endpoints: [
        {
          name: 'Main Site',
          url: 'https://coolpix.me',
          method: 'GET',
          expectedStatus: 200,
          timeout: 5000,
          critical: true,
        },
        {
          name: 'API Health',
          url: 'https://coolpix.me/api/health',
          method: 'GET',
          expectedStatus: 200,
          timeout: 5000,
          critical: true,
        },
        {
          name: 'Authentication',
          url: 'https://coolpix.me/api/auth/session',
          method: 'GET',
          expectedStatus: 200,
          timeout: 5000,
          critical: false,
        },
        {
          name: 'Supabase Health',
          url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
          method: 'GET',
          expectedStatus: 200,
          timeout: 5000,
          critical: true,
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
        },
        {
          name: 'Fal AI Health',
          url: 'https://fal.run/health',
          method: 'GET',
          expectedStatus: 200,
          timeout: 10000,
          critical: false,
        },
      ],
    };
  }

  /**
   * Start uptime monitoring
   */
  start(): void {
    if (this.isRunning || !this.config.enabled) {
      return;
    }

    this.isRunning = true;
    this.startTime = Date.now();

    // Run initial health check
    this.runHealthChecks();

    // Set up interval for regular checks
    this.intervalId = setInterval(() => {
      this.runHealthChecks();
    }, this.config.interval);

    logger.info('Uptime monitoring started', 'UPTIME', {
      interval: this.config.interval,
      endpoints: this.config.endpoints.length,
    });
  }

  /**
   * Stop uptime monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    logger.info('Uptime monitoring stopped', 'UPTIME');
  }

  /**
   * Run health checks for all endpoints
   */
  private async runHealthChecks(): Promise<void> {
    const checkPromises = this.config.endpoints.map(endpoint =>
      this.checkEndpoint(endpoint)
    );

    try {
      const results = await Promise.all(checkPromises);
      this.processHealthCheckResults(results);
    } catch (error) {
      logger.error('Error running health checks', error as Error, 'UPTIME');
      captureError(error as Error, {
        tags: { type: 'uptime_monitoring' },
        level: 'error',
      });
    }
  }

  /**
   * Check individual endpoint health
   */
  private async checkEndpoint(endpoint: HealthCheckEndpoint): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let attempt = 0;

    while (attempt < this.config.retries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);

        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: endpoint.headers,
          body: endpoint.body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseTime = Date.now() - startTime;
        const isHealthy = response.status === endpoint.expectedStatus;

        const result: HealthCheckResult = {
          endpoint: endpoint.name,
          status: isHealthy ? 'healthy' : 'unhealthy',
          responseTime,
          statusCode: response.status,
          timestamp: new Date().toISOString(),
        };

        if (isHealthy) {
          return result;
        } else {
          result.error = `Unexpected status code: ${response.status}`;
          if (attempt === this.config.retries - 1) {
            return result;
          }
        }
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        if (attempt === this.config.retries - 1) {
          return {
            endpoint: endpoint.name,
            status: 'unhealthy',
            responseTime,
            error: (error as Error).message,
            timestamp: new Date().toISOString(),
          };
        }
      }

      attempt++;
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // This should never be reached, but TypeScript requires it
    return {
      endpoint: endpoint.name,
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: 'Max retries exceeded',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process health check results
   */
  private processHealthCheckResults(results: HealthCheckResult[]): void {
    // Add to history
    this.healthHistory.push(...results);

    // Keep only last 100 results per endpoint
    if (this.healthHistory.length > 1000) {
      this.healthHistory = this.healthHistory.slice(-1000);
    }

    // Determine overall system health
    const criticalEndpoints = this.config.endpoints.filter(e => e.critical);
    const criticalResults = results.filter(r => 
      criticalEndpoints.some(e => e.name === r.endpoint)
    );

    const unhealthyCritical = criticalResults.filter(r => r.status === 'unhealthy');
    const degradedCritical = criticalResults.filter(r => r.status === 'degraded');

    let overallStatus: 'healthy' | 'unhealthy' | 'degraded';
    if (unhealthyCritical.length > 0) {
      overallStatus = 'unhealthy';
      this.incidentCount++;
    } else if (degradedCritical.length > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    // Log results
    results.forEach(result => {
      if (result.status === 'unhealthy') {
        logger.error(
          `Health check failed: ${result.endpoint}`,
          new Error(result.error || 'Unknown error'),
          'UPTIME',
          result
        );

        // Report to error tracking
        captureMessage(
          `Uptime check failed: ${result.endpoint}`,
          'error',
          {
            tags: { type: 'uptime_failure', endpoint: result.endpoint },
            extra: result,
          }
        );

        // Track in analytics
        trackEvent('uptime_failure', {
          event_category: 'system_health',
          event_label: result.endpoint,
          value: result.responseTime,
        });
      } else {
        logger.info(`Health check passed: ${result.endpoint}`, 'UPTIME', {
          responseTime: result.responseTime,
          status: result.status,
        });
      }
    });

    // Log overall system health
    logger.info('System health check completed', 'UPTIME', {
      overall: overallStatus,
      healthy: results.filter(r => r.status === 'healthy').length,
      unhealthy: results.filter(r => r.status === 'unhealthy').length,
      degraded: results.filter(r => r.status === 'degraded').length,
    });

    // Track overall system health
    trackEvent('system_health_check', {
      event_category: 'system_health',
      event_label: overallStatus,
      value: results.filter(r => r.status === 'healthy').length,
    });
  }

  /**
   * Get current system health
   */
  getSystemHealth(): SystemHealth {
    const now = new Date().toISOString();
    const uptime = Date.now() - this.startTime;

    // Get latest results for each endpoint
    const latestChecks: HealthCheckResult[] = [];
    this.config.endpoints.forEach(endpoint => {
      const endpointResults = this.healthHistory
        .filter(r => r.endpoint === endpoint.name)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (endpointResults.length > 0) {
        latestChecks.push(endpointResults[0]);
      }
    });

    // Determine overall health
    const criticalEndpoints = this.config.endpoints.filter(e => e.critical);
    const criticalResults = latestChecks.filter(r => 
      criticalEndpoints.some(e => e.name === r.endpoint)
    );

    const unhealthyCritical = criticalResults.filter(r => r.status === 'unhealthy');
    const degradedCritical = criticalResults.filter(r => r.status === 'degraded');

    let overall: 'healthy' | 'unhealthy' | 'degraded';
    if (unhealthyCritical.length > 0) {
      overall = 'unhealthy';
    } else if (degradedCritical.length > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    return {
      overall,
      uptime,
      checks: latestChecks,
      lastCheck: now,
      incidents: this.incidentCount,
    };
  }

  /**
   * Get uptime statistics
   */
  getUptimeStats(timeframe: 'hour' | 'day' | 'week' = 'day'): Record<string, any> {
    const now = Date.now();
    const timeframes = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
    };

    const cutoff = now - timeframes[timeframe];
    const recentResults = this.healthHistory.filter(r => 
      new Date(r.timestamp).getTime() > cutoff
    );

    const totalChecks = recentResults.length;
    const healthyChecks = recentResults.filter(r => r.status === 'healthy').length;
    const uptimePercentage = totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 100;

    const avgResponseTime = recentResults.length > 0 
      ? recentResults.reduce((sum, r) => sum + r.responseTime, 0) / recentResults.length
      : 0;

    return {
      timeframe,
      uptimePercentage: Math.round(uptimePercentage * 100) / 100,
      totalChecks,
      healthyChecks,
      unhealthyChecks: totalChecks - healthyChecks,
      avgResponseTime: Math.round(avgResponseTime),
      incidents: this.incidentCount,
    };
  }

  /**
   * Manual health check
   */
  async runManualHealthCheck(): Promise<SystemHealth> {
    await this.runHealthChecks();
    return this.getSystemHealth();
  }
}

// Create singleton instance
export const uptimeMonitor = new UptimeMonitor();

// Convenience functions
export const startUptimeMonitoring = () => uptimeMonitor.start();
export const stopUptimeMonitoring = () => uptimeMonitor.stop();
export const getSystemHealth = () => uptimeMonitor.getSystemHealth();
export const getUptimeStats = (timeframe?: 'hour' | 'day' | 'week') => uptimeMonitor.getUptimeStats(timeframe);
export const runManualHealthCheck = () => uptimeMonitor.runManualHealthCheck();

// Auto-start in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // Start monitoring after a delay to ensure services are ready
  setTimeout(() => {
    uptimeMonitor.start();
  }, 30000); // 30 seconds delay
}

export default uptimeMonitor;
