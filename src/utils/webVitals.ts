// Enhanced Web Vitals and performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';
import { trackPerformanceMetric } from './performanceMonitoring';
import { trackPerformance } from './googleAnalytics';
import { trackPerformanceIssue } from './errorTracking';
import { logger } from './logger';

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  LCP: 2500,    // Largest Contentful Paint
  FID: 100,     // First Input Delay
  CLS: 0.1,     // Cumulative Layout Shift (unitless)
  FCP: 1800,    // First Contentful Paint
  TTFB: 800,    // Time to First Byte
};

// Performance monitoring configuration
interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number;
  reportToGA: boolean;
  reportToSupabase: boolean;
  reportThresholdViolations: boolean;
}

class WebVitalsMonitor {
  private config: PerformanceConfig;
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.config = {
      enabled: true,
      sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      reportToGA: true,
      reportToSupabase: true,
      reportThresholdViolations: true,
    };
    
    this.sessionId = this.generateSessionId();
  }

  /**
   * Initialize Web Vitals monitoring
   */
  initialize(userId?: string): void {
    if (!this.config.enabled || typeof window === 'undefined') {
      return;
    }

    this.userId = userId;

    // Sample based on configuration
    if (Math.random() > this.config.sampleRate) {
      return;
    }

    try {
      // Monitor Core Web Vitals
      getCLS(this.handleMetric.bind(this));
      getFID(this.handleMetric.bind(this));
      getFCP(this.handleMetric.bind(this));
      getLCP(this.handleMetric.bind(this));
      getTTFB(this.handleMetric.bind(this));

      // Monitor custom performance metrics
      this.monitorCustomMetrics();

      logger.info('Web Vitals monitoring initialized', 'PERFORMANCE', { 
        userId: this.userId, 
        sessionId: this.sessionId 
      });
    } catch (error) {
      logger.error('Error initializing Web Vitals monitoring', error as Error, 'PERFORMANCE');
    }
  }

  /**
   * Handle Web Vitals metric
   */
  private handleMetric(metric: Metric): void {
    try {
      const metricData = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
        sessionId: this.sessionId,
        userId: this.userId,
        url: window.location.href,
        timestamp: Date.now(),
      };

      // Log metric
      logger.info(`Web Vital: ${metric.name}`, 'PERFORMANCE', metricData);

      // Report to Google Analytics
      if (this.config.reportToGA) {
        trackPerformance(metric.name, metric.value, this.userId);
      }

      // Report to Supabase
      if (this.config.reportToSupabase) {
        trackPerformanceMetric(
          `web_vitals_${metric.name.toLowerCase()}`,
          metric.value,
          this.getMetricUnit(metric.name),
          {
            rating: metric.rating,
            session_id: this.sessionId,
            user_id: this.userId,
            page_url: window.location.href,
            navigation_type: metric.navigationType,
          }
        );
      }

      // Check thresholds and report violations
      if (this.config.reportThresholdViolations) {
        this.checkThreshold(metric);
      }

    } catch (error) {
      logger.error('Error handling Web Vitals metric', error as Error, 'PERFORMANCE', { metric: metric.name });
    }
  }

  /**
   * Monitor custom performance metrics
   */
  private monitorCustomMetrics(): void {
    // Monitor page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.reportCustomMetric('page_load_time', loadTime, 'ms');
    });

    // Monitor DOM content loaded
    document.addEventListener('DOMContentLoaded', () => {
      const domLoadTime = performance.now();
      this.reportCustomMetric('dom_content_loaded', domLoadTime, 'ms');
    });

    // Monitor resource loading
    this.monitorResourceLoading();

    // Monitor JavaScript errors
    this.monitorJavaScriptErrors();

    // Monitor long tasks
    this.monitorLongTasks();
  }

  /**
   * Monitor resource loading performance
   */
  private monitorResourceLoading(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              
              // Report slow resources
              if (resourceEntry.duration > 1000) {
                this.reportCustomMetric(
                  'slow_resource_load',
                  resourceEntry.duration,
                  'ms',
                  {
                    resource_name: resourceEntry.name,
                    resource_type: this.getResourceType(resourceEntry.name),
                  }
                );
              }
            }
          }
        });

        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        logger.error('Error setting up resource monitoring', error as Error, 'PERFORMANCE');
      }
    }
  }

  /**
   * Monitor JavaScript errors
   */
  private monitorJavaScriptErrors(): void {
    window.addEventListener('error', (event) => {
      this.reportCustomMetric(
        'javascript_error',
        1,
        'count',
        {
          error_message: event.message,
          error_filename: event.filename,
          error_line: event.lineno,
          error_column: event.colno,
        }
      );
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.reportCustomMetric(
        'unhandled_promise_rejection',
        1,
        'count',
        {
          error_reason: event.reason?.toString() || 'Unknown',
        }
      );
    });
  }

  /**
   * Monitor long tasks (tasks that block the main thread)
   */
  private monitorLongTasks(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'longtask') {
              this.reportCustomMetric(
                'long_task',
                entry.duration,
                'ms',
                {
                  task_name: entry.name,
                  start_time: entry.startTime,
                }
              );
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        logger.error('Error setting up long task monitoring', error as Error, 'PERFORMANCE');
      }
    }
  }

  /**
   * Report custom performance metric
   */
  private reportCustomMetric(name: string, value: number, unit: string, additionalData?: Record<string, any>): void {
    try {
      // Report to Google Analytics
      if (this.config.reportToGA) {
        trackPerformance(name, value, this.userId);
      }

      // Report to Supabase
      if (this.config.reportToSupabase) {
        trackPerformanceMetric(name, value, unit, {
          session_id: this.sessionId,
          user_id: this.userId,
          page_url: window.location.href,
          ...additionalData,
        });
      }

      logger.info(`Custom metric: ${name}`, 'PERFORMANCE', { value, unit, ...additionalData });
    } catch (error) {
      logger.error('Error reporting custom metric', error as Error, 'PERFORMANCE', { name, value });
    }
  }

  /**
   * Check if metric exceeds threshold
   */
  private checkThreshold(metric: Metric): void {
    const threshold = PERFORMANCE_THRESHOLDS[metric.name as keyof typeof PERFORMANCE_THRESHOLDS];
    
    if (threshold && metric.value > threshold) {
      const violationData = {
        metric: metric.name,
        value: metric.value,
        threshold,
        rating: metric.rating,
        url: window.location.href,
        userId: this.userId,
        sessionId: this.sessionId,
      };

      // Report threshold violation
      trackPerformanceIssue(
        metric.name,
        metric.value,
        threshold,
        violationData
      );

      logger.warn(
        `Performance threshold violation: ${metric.name}`,
        'PERFORMANCE',
        violationData
      );
    }
  }

  /**
   * Get metric unit
   */
  private getMetricUnit(metricName: string): string {
    switch (metricName) {
      case 'CLS':
        return 'score';
      case 'LCP':
      case 'FID':
      case 'FCP':
      case 'TTFB':
        return 'ms';
      default:
        return 'ms';
    }
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.webp')) return 'image';
    if (url.includes('.woff') || url.includes('.woff2') || url.includes('.ttf')) return 'font';
    return 'other';
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    this.userId = userId;
    logger.info('User ID set for performance monitoring', 'PERFORMANCE', { userId });
  }

  /**
   * Get current performance summary
   */
  getPerformanceSummary(): Record<string, any> {
    if (typeof window === 'undefined' || !window.performance) {
      return {};
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      url: window.location.href,
      loadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      timeToFirstByte: navigation?.responseStart - navigation?.requestStart || 0,
      timestamp: Date.now(),
    };
  }
}

// Create singleton instance
export const webVitalsMonitor = new WebVitalsMonitor();

// Convenience functions
export const initializeWebVitals = (userId?: string) => webVitalsMonitor.initialize(userId);
export const setPerformanceUserId = (userId: string) => webVitalsMonitor.setUserId(userId);
export const getPerformanceSummary = () => webVitalsMonitor.getPerformanceSummary();

// Auto-initialize on client side
if (typeof window !== 'undefined') {
  // Initialize after a short delay to ensure other scripts are loaded
  setTimeout(() => {
    webVitalsMonitor.initialize();
  }, 100);
}

export default webVitalsMonitor;
