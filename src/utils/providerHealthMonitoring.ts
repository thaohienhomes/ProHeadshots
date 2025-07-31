// Provider health monitoring system for AI services
// Tracks availability, performance, and error rates for fal.ai and Leonardo AI

import { logger } from './logger';
import * as FalAI from './falAI';
import * as LeonardoAI from './leonardoAI';

export interface HealthMetrics {
  provider: 'fal' | 'leonardo';
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  successRate: number;
  errorCount: number;
  lastError?: string;
  lastChecked: Date;
  uptime: number; // percentage
  consecutiveFailures: number;
}

export interface HealthCheckResult {
  success: boolean;
  responseTime: number;
  error?: string;
  timestamp: Date;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  providers: Record<'fal' | 'leonardo', HealthMetrics>;
  recommendations: string[];
  lastUpdated: Date;
}

class ProviderHealthMonitor {
  private metrics: Map<'fal' | 'leonardo', HealthMetrics>;
  private healthHistory: Map<'fal' | 'leonardo', HealthCheckResult[]>;
  private monitoringInterval?: NodeJS.Timeout;
  private readonly maxHistorySize = 100;
  private readonly checkInterval = 30000; // 30 seconds
  private readonly degradedThreshold = 0.8; // 80% success rate
  private readonly offlineThreshold = 3; // consecutive failures

  constructor() {
    this.metrics = new Map();
    this.healthHistory = new Map();
    this.initializeMetrics();
  }

  private initializeMetrics() {
    const providers: ('fal' | 'leonardo')[] = ['fal', 'leonardo'];
    
    providers.forEach(provider => {
      this.metrics.set(provider, {
        provider,
        status: 'online',
        responseTime: 0,
        successRate: 100,
        errorCount: 0,
        lastChecked: new Date(),
        uptime: 100,
        consecutiveFailures: 0,
      });
      
      this.healthHistory.set(provider, []);
    });
  }

  public startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Initial check
    this.performHealthChecks();

    // Set up periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.checkInterval);

    logger.info('Provider health monitoring started', {
      checkInterval: this.checkInterval,
      providers: ['fal', 'leonardo'],
    }, 'HEALTH_MONITOR');
  }

  public stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    logger.info('Provider health monitoring stopped', {}, 'HEALTH_MONITOR');
  }

  private async performHealthChecks() {
    const providers: ('fal' | 'leonardo')[] = ['fal', 'leonardo'];
    
    await Promise.all(providers.map(provider => this.checkProviderHealth(provider)));
    
    // Log system health summary
    const systemHealth = this.getSystemHealth();
    if (systemHealth.overall !== 'healthy') {
      logger.warn('System health degraded', {
        overall: systemHealth.overall,
        providers: systemHealth.providers,
        recommendations: systemHealth.recommendations,
      }, 'HEALTH_MONITOR');
    }
  }

  private async checkProviderHealth(provider: 'fal' | 'leonardo'): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let result: HealthCheckResult;

    try {
      if (provider === 'fal') {
        await this.testFalAIHealth();
      } else {
        await LeonardoAI.healthCheck();
      }

      result = {
        success: true,
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      result = {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }

    this.updateMetrics(provider, result);
    return result;
  }

  private async testFalAIHealth(): Promise<void> {
    try {
      // Test with a lightweight operation
      const modelInfo = FalAI.getModelInfo('flux-dev');
      if (!modelInfo) {
        throw new Error('Failed to get model info');
      }
    } catch (error) {
      throw new Error(`Fal AI health check failed: ${error}`);
    }
  }

  private updateMetrics(provider: 'fal' | 'leonardo', result: HealthCheckResult) {
    const currentMetrics = this.metrics.get(provider)!;
    const history = this.healthHistory.get(provider)!;

    // Add to history
    history.push(result);
    if (history.length > this.maxHistorySize) {
      history.shift();
    }

    // Update consecutive failures
    const consecutiveFailures = result.success ? 0 : currentMetrics.consecutiveFailures + 1;

    // Calculate success rate from recent history
    const recentHistory = history.slice(-20); // Last 20 checks
    const successCount = recentHistory.filter(h => h.success).length;
    const successRate = recentHistory.length > 0 ? (successCount / recentHistory.length) * 100 : 100;

    // Calculate uptime from all history
    const totalSuccessCount = history.filter(h => h.success).length;
    const uptime = history.length > 0 ? (totalSuccessCount / history.length) * 100 : 100;

    // Determine status
    let status: 'online' | 'offline' | 'degraded';
    if (consecutiveFailures >= this.offlineThreshold) {
      status = 'offline';
    } else if (successRate < this.degradedThreshold * 100) {
      status = 'degraded';
    } else {
      status = 'online';
    }

    // Update metrics
    const updatedMetrics: HealthMetrics = {
      ...currentMetrics,
      status,
      responseTime: result.responseTime,
      successRate,
      errorCount: result.success ? currentMetrics.errorCount : currentMetrics.errorCount + 1,
      lastError: result.error,
      lastChecked: result.timestamp,
      uptime,
      consecutiveFailures,
    };

    this.metrics.set(provider, updatedMetrics);

    // Log status changes
    if (currentMetrics.status !== status) {
      logger.info(`Provider status changed`, {
        provider,
        oldStatus: currentMetrics.status,
        newStatus: status,
        consecutiveFailures,
        successRate,
        lastError: result.error,
      }, 'HEALTH_MONITOR');
    }
  }

  public getProviderMetrics(provider: 'fal' | 'leonardo'): HealthMetrics | undefined {
    return this.metrics.get(provider);
  }

  public getAllMetrics(): Record<'fal' | 'leonardo', HealthMetrics> {
    return {
      fal: this.metrics.get('fal')!,
      leonardo: this.metrics.get('leonardo')!,
    };
  }

  public getProviderHistory(provider: 'fal' | 'leonardo'): HealthCheckResult[] {
    return this.healthHistory.get(provider) || [];
  }

  public getSystemHealth(): SystemHealth {
    const providers = this.getAllMetrics();
    const onlineCount = Object.values(providers).filter(p => p.status === 'online').length;
    const degradedCount = Object.values(providers).filter(p => p.status === 'degraded').length;
    
    let overall: 'healthy' | 'degraded' | 'critical';
    const recommendations: string[] = [];

    if (onlineCount === 2) {
      overall = 'healthy';
    } else if (onlineCount === 1 || degradedCount > 0) {
      overall = 'degraded';
      recommendations.push('Some AI providers are experiencing issues. Service may be slower than usual.');
    } else {
      overall = 'critical';
      recommendations.push('All AI providers are offline. Service is unavailable.');
    }

    // Add specific recommendations
    Object.entries(providers).forEach(([providerName, metrics]) => {
      if (metrics.status === 'offline') {
        recommendations.push(`${providerName} provider is offline (${metrics.consecutiveFailures} consecutive failures)`);
      } else if (metrics.status === 'degraded') {
        recommendations.push(`${providerName} provider is degraded (${metrics.successRate.toFixed(1)}% success rate)`);
      }
      
      if (metrics.responseTime > 10000) {
        recommendations.push(`${providerName} provider is responding slowly (${metrics.responseTime}ms average)`);
      }
    });

    return {
      overall,
      providers,
      recommendations,
      lastUpdated: new Date(),
    };
  }

  public async forceHealthCheck(provider?: 'fal' | 'leonardo'): Promise<void> {
    if (provider) {
      await this.checkProviderHealth(provider);
    } else {
      await this.performHealthChecks();
    }
  }

  public resetMetrics(provider?: 'fal' | 'leonardo') {
    if (provider) {
      this.healthHistory.set(provider, []);
      const currentMetrics = this.metrics.get(provider)!;
      this.metrics.set(provider, {
        ...currentMetrics,
        errorCount: 0,
        consecutiveFailures: 0,
        successRate: 100,
        uptime: 100,
      });
    } else {
      this.initializeMetrics();
    }

    logger.info('Health metrics reset', { provider: provider || 'all' }, 'HEALTH_MONITOR');
  }

  public getHealthSummary(): {
    totalChecks: number;
    totalErrors: number;
    averageResponseTime: number;
    systemUptime: number;
  } {
    const allMetrics = Object.values(this.getAllMetrics());
    const totalHistory = Array.from(this.healthHistory.values()).flat();
    
    const totalChecks = totalHistory.length;
    const totalErrors = allMetrics.reduce((sum, m) => sum + m.errorCount, 0);
    const averageResponseTime = totalHistory.length > 0 
      ? totalHistory.reduce((sum, h) => sum + h.responseTime, 0) / totalHistory.length 
      : 0;
    const systemUptime = allMetrics.length > 0 
      ? allMetrics.reduce((sum, m) => sum + m.uptime, 0) / allMetrics.length 
      : 100;

    return {
      totalChecks,
      totalErrors,
      averageResponseTime,
      systemUptime,
    };
  }
}

// Export singleton instance
export const healthMonitor = new ProviderHealthMonitor();

// Export class for custom instances
export { ProviderHealthMonitor };
