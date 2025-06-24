import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';
import { FalAIModelId } from './falAI';

export interface PerformanceMetric {
  id?: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  page_url?: string;
  user_id?: string;
  session_id?: string;
  timestamp: string;
  additional_data?: Record<string, any>;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  systemLoad: number;
  memoryUsage: number;
  lastChecked: string;
}

export interface AlertRule {
  id: string;
  metric_name: string;
  condition: 'greater_than' | 'less_than' | 'equals';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  notification_channels: string[];
}

export interface AIPerformanceMetrics {
  timestamp: string;
  modelId: FalAIModelId;
  processingTime: number; // milliseconds
  queueTime: number; // milliseconds
  totalTime: number; // milliseconds
  success: boolean;
  errorType?: string;
  qualityScore?: number;
  userSatisfaction?: number; // 1-5 rating
  resourceUsage: {
    cpu: number;
    memory: number;
    gpu: number;
  };
  cost: number;
  cacheHit: boolean;
  batchSize?: number;
  userId?: string;
}

export interface ModelPerformanceStats {
  modelId: FalAIModelId;
  totalGenerations: number;
  successRate: number;
  averageProcessingTime: number;
  averageQualityScore: number;
  averageUserSatisfaction: number;
  averageCost: number;
  cacheHitRate: number;
  errorBreakdown: Record<string, number>;
  performanceTrend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
}

/**
 * Track Core Web Vitals and performance metrics
 */
export async function trackPerformanceMetric(
  metricName: string,
  value: number,
  unit: string,
  additionalData?: Record<string, any>
): Promise<void> {
  try {
    const supabase = await createClient();
    
    const metric: Omit<PerformanceMetric, 'id'> = {
      metric_name: metricName,
      metric_value: value,
      metric_unit: unit,
      page_url: additionalData?.page_url,
      user_id: additionalData?.user_id,
      session_id: additionalData?.session_id,
      timestamp: new Date().toISOString(),
      additional_data: additionalData
    };

    const { error } = await supabase
      .from('performance_metrics')
      .insert(metric);

    if (error) {
      logger.error('Error tracking performance metric', error, 'PERFORMANCE', { metricName, value });
      return;
    }

    // Check for alerts
    await checkPerformanceAlerts(metricName, value);

    logger.info('Performance metric tracked', 'PERFORMANCE', { metricName, value, unit });

  } catch (error) {
    logger.error('Error tracking performance metric', error as Error, 'PERFORMANCE', { metricName, value });
  }
}

/**
 * Track Core Web Vitals
 */
export async function trackCoreWebVitals(vitals: {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  pageUrl: string;
  userId?: string;
  sessionId?: string;
}): Promise<void> {
  const promises = [];

  if (vitals.fcp !== undefined) {
    promises.push(trackPerformanceMetric('core_web_vitals_fcp', vitals.fcp, 'ms', {
      page_url: vitals.pageUrl,
      user_id: vitals.userId,
      session_id: vitals.sessionId
    }));
  }

  if (vitals.lcp !== undefined) {
    promises.push(trackPerformanceMetric('core_web_vitals_lcp', vitals.lcp, 'ms', {
      page_url: vitals.pageUrl,
      user_id: vitals.userId,
      session_id: vitals.sessionId
    }));
  }

  if (vitals.fid !== undefined) {
    promises.push(trackPerformanceMetric('core_web_vitals_fid', vitals.fid, 'ms', {
      page_url: vitals.pageUrl,
      user_id: vitals.userId,
      session_id: vitals.sessionId
    }));
  }

  if (vitals.cls !== undefined) {
    promises.push(trackPerformanceMetric('core_web_vitals_cls', vitals.cls, 'score', {
      page_url: vitals.pageUrl,
      user_id: vitals.userId,
      session_id: vitals.sessionId
    }));
  }

  if (vitals.ttfb !== undefined) {
    promises.push(trackPerformanceMetric('core_web_vitals_ttfb', vitals.ttfb, 'ms', {
      page_url: vitals.pageUrl,
      user_id: vitals.userId,
      session_id: vitals.sessionId
    }));
  }

  await Promise.all(promises);
}

/**
 * Track API performance
 */
export async function trackAPIPerformance(
  endpoint: string,
  method: string,
  responseTime: number,
  statusCode: number,
  userId?: string
): Promise<void> {
  await trackPerformanceMetric('api_response_time', responseTime, 'ms', {
    endpoint,
    method,
    status_code: statusCode,
    user_id: userId
  });

  // Track error rate
  if (statusCode >= 400) {
    await trackPerformanceMetric('api_error_rate', 1, 'count', {
      endpoint,
      method,
      status_code: statusCode,
      user_id: userId
    });
  }
}

/**
 * Track AI model performance metrics
 */
export async function trackAIPerformance(metrics: AIPerformanceMetrics): Promise<void> {
  try {
    const supabase = await createClient();

    // Store AI-specific metrics
    const { error } = await supabase
      .from('ai_performance_metrics')
      .insert({
        timestamp: metrics.timestamp,
        model_id: metrics.modelId,
        processing_time: metrics.processingTime,
        queue_time: metrics.queueTime,
        total_time: metrics.totalTime,
        success: metrics.success,
        error_type: metrics.errorType,
        quality_score: metrics.qualityScore,
        user_satisfaction: metrics.userSatisfaction,
        resource_usage: metrics.resourceUsage,
        cost: metrics.cost,
        cache_hit: metrics.cacheHit,
        batch_size: metrics.batchSize,
        user_id: metrics.userId,
      });

    if (error) {
      logger.error('Error tracking AI performance', error, 'AI_PERFORMANCE');
      return;
    }

    // Track individual metrics for alerting
    await Promise.all([
      trackPerformanceMetric('ai_processing_time', metrics.processingTime, 'ms', {
        model_id: metrics.modelId,
        user_id: metrics.userId,
      }),
      trackPerformanceMetric('ai_queue_time', metrics.queueTime, 'ms', {
        model_id: metrics.modelId,
        user_id: metrics.userId,
      }),
      trackPerformanceMetric('ai_total_time', metrics.totalTime, 'ms', {
        model_id: metrics.modelId,
        user_id: metrics.userId,
      }),
      trackPerformanceMetric('ai_cost', metrics.cost, 'usd', {
        model_id: metrics.modelId,
        user_id: metrics.userId,
      }),
    ]);

    if (metrics.qualityScore) {
      await trackPerformanceMetric('ai_quality_score', metrics.qualityScore, 'score', {
        model_id: metrics.modelId,
        user_id: metrics.userId,
      });
    }

    if (metrics.userSatisfaction) {
      await trackPerformanceMetric('ai_user_satisfaction', metrics.userSatisfaction, 'rating', {
        model_id: metrics.modelId,
        user_id: metrics.userId,
      });
    }

    // Track success/failure
    await trackPerformanceMetric('ai_success_rate', metrics.success ? 1 : 0, 'boolean', {
      model_id: metrics.modelId,
      user_id: metrics.userId,
      error_type: metrics.errorType,
    });

    logger.info('AI performance metrics tracked', 'AI_PERFORMANCE', {
      modelId: metrics.modelId,
      processingTime: metrics.processingTime,
      success: metrics.success,
    });

  } catch (error) {
    logger.error('Error tracking AI performance metrics', error as Error, 'AI_PERFORMANCE');
  }
}

/**
 * Get AI model performance statistics
 */
export async function getModelPerformanceStats(
  modelId: FalAIModelId,
  timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'
): Promise<ModelPerformanceStats> {
  try {
    const supabase = await createClient();
    const startTime = getStartTime(timeframe);

    const { data: metrics, error } = await supabase
      .from('ai_performance_metrics')
      .select('*')
      .eq('model_id', modelId)
      .gte('timestamp', startTime.toISOString());

    if (error) throw error;

    if (!metrics || metrics.length === 0) {
      return {
        modelId,
        totalGenerations: 0,
        successRate: 0,
        averageProcessingTime: 0,
        averageQualityScore: 0,
        averageUserSatisfaction: 0,
        averageCost: 0,
        cacheHitRate: 0,
        errorBreakdown: {},
        performanceTrend: 'stable',
        lastUpdated: new Date().toISOString(),
      };
    }

    const successfulMetrics = metrics.filter(m => m.success);
    const qualityScores = metrics.filter(m => m.quality_score).map(m => m.quality_score);
    const satisfactionScores = metrics.filter(m => m.user_satisfaction).map(m => m.user_satisfaction);
    const cacheHits = metrics.filter(m => m.cache_hit);

    // Calculate error breakdown
    const errorBreakdown = metrics
      .filter(m => !m.success && m.error_type)
      .reduce((acc, m) => {
        acc[m.error_type] = (acc[m.error_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Calculate performance trend (simplified)
    const recentMetrics = metrics.slice(-10);
    const olderMetrics = metrics.slice(0, -10);
    const recentAvgTime = recentMetrics.reduce((sum, m) => sum + m.processing_time, 0) / recentMetrics.length;
    const olderAvgTime = olderMetrics.length > 0
      ? olderMetrics.reduce((sum, m) => sum + m.processing_time, 0) / olderMetrics.length
      : recentAvgTime;

    let performanceTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentAvgTime < olderAvgTime * 0.9) performanceTrend = 'improving';
    else if (recentAvgTime > olderAvgTime * 1.1) performanceTrend = 'declining';

    return {
      modelId,
      totalGenerations: metrics.length,
      successRate: (successfulMetrics.length / metrics.length) * 100,
      averageProcessingTime: metrics.reduce((sum, m) => sum + m.processing_time, 0) / metrics.length,
      averageQualityScore: qualityScores.length > 0
        ? qualityScores.reduce((sum, s) => sum + s, 0) / qualityScores.length
        : 0,
      averageUserSatisfaction: satisfactionScores.length > 0
        ? satisfactionScores.reduce((sum, s) => sum + s, 0) / satisfactionScores.length
        : 0,
      averageCost: metrics.reduce((sum, m) => sum + m.cost, 0) / metrics.length,
      cacheHitRate: (cacheHits.length / metrics.length) * 100,
      errorBreakdown,
      performanceTrend,
      lastUpdated: new Date().toISOString(),
    };

  } catch (error) {
    logger.error('Error getting model performance stats', error as Error, 'AI_PERFORMANCE');
    return {
      modelId,
      totalGenerations: 0,
      successRate: 0,
      averageProcessingTime: 0,
      averageQualityScore: 0,
      averageUserSatisfaction: 0,
      averageCost: 0,
      cacheHitRate: 0,
      errorBreakdown: {},
      performanceTrend: 'stable',
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Get AI system performance overview
 */
export async function getAISystemPerformance(
  timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'
): Promise<{
  overall: {
    totalGenerations: number;
    successRate: number;
    averageProcessingTime: number;
    averageQueueTime: number;
    totalCost: number;
    averageQualityScore: number;
  };
  models: ModelPerformanceStats[];
  trends: Array<{
    timestamp: string;
    metric: string;
    value: number;
  }>;
}> {
  try {
    const supabase = await createClient();
    const startTime = getStartTime(timeframe);

    const { data: metrics, error } = await supabase
      .from('ai_performance_metrics')
      .select('*')
      .gte('timestamp', startTime.toISOString());

    if (error) throw error;

    if (!metrics || metrics.length === 0) {
      return {
        overall: {
          totalGenerations: 0,
          successRate: 0,
          averageProcessingTime: 0,
          averageQueueTime: 0,
          totalCost: 0,
          averageQualityScore: 0,
        },
        models: [],
        trends: [],
      };
    }

    // Calculate overall stats
    const successfulMetrics = metrics.filter(m => m.success);
    const qualityScores = metrics.filter(m => m.quality_score).map(m => m.quality_score);

    const overall = {
      totalGenerations: metrics.length,
      successRate: (successfulMetrics.length / metrics.length) * 100,
      averageProcessingTime: metrics.reduce((sum, m) => sum + m.processing_time, 0) / metrics.length,
      averageQueueTime: metrics.reduce((sum, m) => sum + m.queue_time, 0) / metrics.length,
      totalCost: metrics.reduce((sum, m) => sum + m.cost, 0),
      averageQualityScore: qualityScores.length > 0
        ? qualityScores.reduce((sum, s) => sum + s, 0) / qualityScores.length
        : 0,
    };

    // Get model-specific stats
    const modelIds = [...new Set(metrics.map(m => m.model_id))] as FalAIModelId[];
    const models = await Promise.all(
      modelIds.map(modelId => getModelPerformanceStats(modelId, timeframe))
    );

    // Calculate trends (simplified - hourly averages)
    const trends = calculatePerformanceTrends(metrics);

    return {
      overall,
      models,
      trends,
    };

  } catch (error) {
    logger.error('Error getting AI system performance', error as Error, 'AI_PERFORMANCE');
    return {
      overall: {
        totalGenerations: 0,
        successRate: 0,
        averageProcessingTime: 0,
        averageQueueTime: 0,
        totalCost: 0,
        averageQualityScore: 0,
      },
      models: [],
      trends: [],
    };
  }
}

/**
 * Get system health status
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const supabase = await createClient();
    
    // Get recent metrics (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: recentMetrics, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .gte('timestamp', fiveMinutesAgo);

    if (error) throw error;

    // Calculate health metrics
    const responseTimeMetrics = recentMetrics?.filter(m => m.metric_name === 'api_response_time') || [];
    const errorMetrics = recentMetrics?.filter(m => m.metric_name === 'api_error_rate') || [];
    
    const avgResponseTime = responseTimeMetrics.length > 0 
      ? responseTimeMetrics.reduce((sum, m) => sum + m.metric_value, 0) / responseTimeMetrics.length
      : 0;
    
    const errorRate = errorMetrics.length > 0
      ? (errorMetrics.length / (responseTimeMetrics.length || 1)) * 100
      : 0;

    // Mock system metrics (in production, get from actual system monitoring)
    const systemLoad = Math.random() * 100;
    const memoryUsage = Math.random() * 100;
    const uptime = 99.9; // 99.9% uptime

    // Determine overall status
    let status: SystemHealth['status'] = 'healthy';
    if (avgResponseTime > 2000 || errorRate > 5 || systemLoad > 80) {
      status = 'warning';
    }
    if (avgResponseTime > 5000 || errorRate > 10 || systemLoad > 95) {
      status = 'critical';
    }

    return {
      status,
      uptime,
      responseTime: avgResponseTime,
      errorRate,
      activeUsers: 0, // Would be calculated from active sessions
      systemLoad,
      memoryUsage,
      lastChecked: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Error getting system health', error as Error, 'PERFORMANCE');
    
    return {
      status: 'critical',
      uptime: 0,
      responseTime: 0,
      errorRate: 100,
      activeUsers: 0,
      systemLoad: 100,
      memoryUsage: 100,
      lastChecked: new Date().toISOString()
    };
  }
}

/**
 * Get performance analytics for a date range
 */
export async function getPerformanceAnalytics(
  dateRange: { start: string; end: string },
  metricNames?: string[]
): Promise<{
  metrics: Array<{
    metric_name: string;
    avg_value: number;
    min_value: number;
    max_value: number;
    count: number;
    unit: string;
  }>;
  trends: Array<{
    date: string;
    metric_name: string;
    avg_value: number;
  }>;
}> {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from('performance_metrics')
      .select('*')
      .gte('timestamp', dateRange.start)
      .lte('timestamp', dateRange.end);

    if (metricNames && metricNames.length > 0) {
      query = query.in('metric_name', metricNames);
    }

    const { data: metrics, error } = await query;

    if (error) throw error;

    // Calculate aggregated metrics
    const metricGroups = metrics?.reduce((acc, metric) => {
      if (!acc[metric.metric_name]) {
        acc[metric.metric_name] = [];
      }
      acc[metric.metric_name].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>) || {};

    const aggregatedMetrics = Object.entries(metricGroups).map(([metricName, metricData]) => {
      const values = metricData.map(m => m.metric_value);
      return {
        metric_name: metricName,
        avg_value: values.reduce((sum, val) => sum + val, 0) / values.length,
        min_value: Math.min(...values),
        max_value: Math.max(...values),
        count: values.length,
        unit: metricData[0]?.metric_unit || ''
      };
    });

    // Calculate daily trends
    const dailyGroups = metrics?.reduce((acc, metric) => {
      const date = metric.timestamp.split('T')[0];
      const key = `${date}_${metric.metric_name}`;
      if (!acc[key]) {
        acc[key] = { date, metric_name: metric.metric_name, values: [] };
      }
      acc[key].values.push(metric.metric_value);
      return acc;
    }, {} as Record<string, { date: string; metric_name: string; values: number[] }>) || {};

    const trends = Object.values(dailyGroups).map(group => ({
      date: group.date,
      metric_name: group.metric_name,
      avg_value: group.values.reduce((sum, val) => sum + val, 0) / group.values.length
    }));

    return {
      metrics: aggregatedMetrics,
      trends
    };

  } catch (error) {
    logger.error('Error getting performance analytics', error as Error, 'PERFORMANCE');
    return { metrics: [], trends: [] };
  }
}

/**
 * Check performance alerts
 */
async function checkPerformanceAlerts(metricName: string, value: number): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Get active alert rules for this metric
    const { data: alertRules, error } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('metric_name', metricName)
      .eq('is_active', true);

    if (error || !alertRules) return;

    for (const rule of alertRules) {
      let triggered = false;
      
      switch (rule.condition) {
        case 'greater_than':
          triggered = value > rule.threshold;
          break;
        case 'less_than':
          triggered = value < rule.threshold;
          break;
        case 'equals':
          triggered = value === rule.threshold;
          break;
      }

      if (triggered) {
        await triggerAlert(rule, metricName, value);
      }
    }

  } catch (error) {
    logger.error('Error checking performance alerts', error as Error, 'PERFORMANCE', { metricName, value });
  }
}

/**
 * Trigger an alert
 */
async function triggerAlert(rule: AlertRule, metricName: string, value: number): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Log the alert
    const { error } = await supabase
      .from('performance_alerts')
      .insert({
        rule_id: rule.id,
        metric_name: metricName,
        metric_value: value,
        threshold: rule.threshold,
        severity: rule.severity,
        triggered_at: new Date().toISOString()
      });

    if (error) {
      logger.error('Error logging alert', error, 'PERFORMANCE', { ruleId: rule.id });
    }

    // Send notifications (implement based on notification_channels)
    logger.warn(`Performance alert triggered: ${metricName} = ${value} (threshold: ${rule.threshold})`, 'PERFORMANCE', {
      ruleId: rule.id,
      severity: rule.severity,
      metricName,
      value,
      threshold: rule.threshold
    });

  } catch (error) {
    logger.error('Error triggering alert', error as Error, 'PERFORMANCE', { ruleId: rule.id });
  }
}

/**
 * Helper function to get start time for timeframe
 */
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

/**
 * Calculate performance trends from metrics
 */
function calculatePerformanceTrends(metrics: any[]): Array<{
  timestamp: string;
  metric: string;
  value: number;
}> {
  // Group metrics by hour
  const hourlyGroups = metrics.reduce((acc, metric) => {
    const hour = new Date(metric.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
    if (!acc[hour]) {
      acc[hour] = {
        processing_times: [],
        queue_times: [],
        costs: [],
        quality_scores: [],
        success_count: 0,
        total_count: 0,
      };
    }

    acc[hour].processing_times.push(metric.processing_time);
    acc[hour].queue_times.push(metric.queue_time);
    acc[hour].costs.push(metric.cost);
    if (metric.quality_score) acc[hour].quality_scores.push(metric.quality_score);
    if (metric.success) acc[hour].success_count++;
    acc[hour].total_count++;

    return acc;
  }, {} as Record<string, any>);

  const trends: Array<{ timestamp: string; metric: string; value: number }> = [];

  Object.entries(hourlyGroups).forEach(([timestamp, data]) => {
    trends.push(
      {
        timestamp,
        metric: 'processing_time',
        value: data.processing_times.reduce((sum: number, t: number) => sum + t, 0) / data.processing_times.length,
      },
      {
        timestamp,
        metric: 'queue_time',
        value: data.queue_times.reduce((sum: number, t: number) => sum + t, 0) / data.queue_times.length,
      },
      {
        timestamp,
        metric: 'cost',
        value: data.costs.reduce((sum: number, c: number) => sum + c, 0),
      },
      {
        timestamp,
        metric: 'success_rate',
        value: (data.success_count / data.total_count) * 100,
      }
    );

    if (data.quality_scores.length > 0) {
      trends.push({
        timestamp,
        metric: 'quality_score',
        value: data.quality_scores.reduce((sum: number, s: number) => sum + s, 0) / data.quality_scores.length,
      });
    }
  });

  return trends.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Database schema for performance monitoring (run in Supabase SQL editor)
 */
export const createPerformanceMonitoringTables = `
-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL,
  page_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  additional_data JSONB
);

-- Create AI performance metrics table
CREATE TABLE IF NOT EXISTS ai_performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  model_id TEXT NOT NULL,
  processing_time INTEGER NOT NULL, -- milliseconds
  queue_time INTEGER NOT NULL, -- milliseconds
  total_time INTEGER NOT NULL, -- milliseconds
  success BOOLEAN NOT NULL,
  error_type TEXT,
  quality_score NUMERIC CHECK (quality_score >= 0 AND quality_score <= 1),
  user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
  resource_usage JSONB, -- {cpu: number, memory: number, gpu: number}
  cost NUMERIC NOT NULL,
  cache_hit BOOLEAN DEFAULT false,
  batch_size INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create alert_rules table
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('greater_than', 'less_than', 'equals')),
  threshold NUMERIC NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN DEFAULT true,
  notification_channels TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance_alerts table
CREATE TABLE IF NOT EXISTS performance_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES alert_rules(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  threshold NUMERIC NOT NULL,
  severity TEXT NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  is_resolved BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_timestamp ON performance_metrics(metric_name, timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_metric_name ON alert_rules(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_triggered_at ON performance_alerts(triggered_at);

-- AI performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_model_timestamp ON ai_performance_metrics(model_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_timestamp ON ai_performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_user_id ON ai_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_success ON ai_performance_metrics(success);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_model_success ON ai_performance_metrics(model_id, success);

-- Enable RLS
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin only for now)
CREATE POLICY "Admin can manage performance metrics" ON performance_metrics
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage alert rules" ON alert_rules
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can view alerts" ON performance_alerts
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage AI performance metrics" ON ai_performance_metrics
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their own AI performance metrics" ON ai_performance_metrics
  FOR SELECT USING (auth.uid() = user_id);
`;
