// Production analytics and engagement tracking system
import { useAuthStatus, getAuthHeaders } from '@/lib/auth/authUtils';

export interface EngagementEvent {
  eventType: 'page_view' | 'interaction' | 'video_play' | 'video_complete' | 'module_expand' | 'notification_permission' | 'processing_complete' | 'error' | 'custom';
  eventName: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  properties: Record<string, any>;
  metadata: {
    userAgent: string;
    viewport: { width: number; height: number };
    device: 'mobile' | 'tablet' | 'desktop';
    connectionType?: string;
    referrer?: string;
    url: string;
  };
}

export interface ConversionFunnel {
  step: 'wait_page_load' | 'learning_module_open' | 'video_start' | 'video_complete' | 'notification_enable' | 'processing_complete';
  userId: string;
  sessionId: string;
  timestamp: string;
  timeFromPrevious?: number; // seconds
  properties?: Record<string, any>;
}

export interface PerformanceMetric {
  metricType: 'page_load' | 'api_response' | 'websocket_latency' | 'video_load' | 'interaction_delay';
  value: number; // milliseconds
  userId?: string;
  sessionId: string;
  timestamp: string;
  context: Record<string, any>;
}

export interface HeatmapData {
  elementId: string;
  elementType: 'button' | 'link' | 'video' | 'module' | 'other';
  action: 'click' | 'hover' | 'scroll' | 'focus';
  x: number;
  y: number;
  viewport: { width: number; height: number };
  timestamp: string;
  sessionId: string;
  userId?: string;
}

class EngagementTracker {
  private baseUrl: string;
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean;
  private eventQueue: EngagementEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
    this.sessionId = this.generateSessionId();
    this.isEnabled = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
    
    if (this.isEnabled) {
      this.initializeTracking();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Set user ID from client-side auth context
  setUserId(userId: string): void {
    this.userId = userId;
  }

  private initializeTracking(): void {
    // User ID will be set when analytics is used in a component with auth context

    // Set up automatic flushing
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 10000); // Flush every 10 seconds

    // Set up performance monitoring
    this.setupPerformanceMonitoring();

    // Set up page visibility tracking
    this.setupVisibilityTracking();

    // Set up error tracking
    this.setupErrorTracking();

    // Track initial page load
    if (typeof window !== 'undefined') {
      this.trackEvent('page_view', 'wait_page_load', {
        url: window.location.href,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        loadTime: performance.now(),
      });
    }
  }

  private setupPerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackPerformance(
            entry.entryType as any,
            entry.duration,
            {
              name: entry.name,
              startTime: entry.startTime,
              entryType: entry.entryType,
            }
          );
        }
      });

      this.performanceObserver.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
    }
  }

  private setupVisibilityTracking(): void {
    let startTime = Date.now();

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.hidden) {
        const timeSpent = Date.now() - startTime;
        this.trackEvent('interaction', 'page_blur', {
          timeSpent,
          timestamp: new Date().toISOString(),
        });
      } else {
        startTime = Date.now();
        this.trackEvent('interaction', 'page_focus', {
          timestamp: new Date().toISOString(),
        });
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  }

  private setupErrorTracking(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.trackEvent('error', 'javascript_error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.trackEvent('error', 'unhandled_promise_rejection', {
          reason: event.reason?.toString(),
          stack: event.reason?.stack,
        });
      });
    }
  }

  // Public tracking methods
  trackEvent(
    eventType: EngagementEvent['eventType'],
    eventName: string,
    properties: Record<string, any> = {}
  ): void {
    if (!this.isEnabled) return;

    const event: EngagementEvent = {
      eventType,
      eventName,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      properties,
      metadata: typeof window !== 'undefined' ? {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        device: this.getDeviceType(),
        connectionType: this.getConnectionType(),
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        url: window.location.href,
      } : {},
    };

    this.eventQueue.push(event);

    // Flush immediately for critical events
    if (eventType === 'error' || eventName === 'processing_complete') {
      this.flushEvents();
    }
  }

  trackConversion(step: ConversionFunnel['step'], properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const conversion: ConversionFunnel = {
      step,
      userId: this.userId || '',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      properties,
    };

    this.sendData('/analytics/conversion', conversion);
  }

  trackPerformance(
    metricType: PerformanceMetric['metricType'],
    value: number,
    context: Record<string, any> = {}
  ): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      metricType,
      value,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      context,
    };

    this.sendData('/analytics/performance', metric);
  }

  trackHeatmap(
    elementId: string,
    elementType: HeatmapData['elementType'],
    action: HeatmapData['action'],
    x: number,
    y: number
  ): void {
    if (!this.isEnabled) return;

    const heatmapData: HeatmapData = {
      elementId,
      elementType,
      action,
      x,
      y,
      viewport: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight,
      } : { width: 0, height: 0 },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.sendData('/analytics/heatmap', heatmapData);
  }

  // Specific tracking methods for wait page interactions
  trackLearningModuleExpansion(moduleId: string, sectionId?: string): void {
    this.trackEvent('interaction', 'learning_module_expand', {
      moduleId,
      sectionId,
      timestamp: new Date().toISOString(),
    });
  }

  trackVideoInteraction(videoId: string, action: 'play' | 'pause' | 'complete' | 'seek', currentTime?: number): void {
    this.trackEvent('video_play', `video_${action}`, {
      videoId,
      currentTime,
      timestamp: new Date().toISOString(),
    });

    if (action === 'complete') {
      this.trackConversion('video_complete', { videoId });
    }
  }

  trackNotificationPermission(granted: boolean): void {
    this.trackEvent('interaction', 'notification_permission', {
      granted,
      timestamp: new Date().toISOString(),
    });

    if (granted) {
      this.trackConversion('notification_enable');
    }
  }

  trackProcessingComplete(sessionId: string, processingTime: number): void {
    this.trackEvent('processing_complete', 'ai_processing_finished', {
      processingSessionId: sessionId,
      processingTime,
      timestamp: new Date().toISOString(),
    });

    this.trackConversion('processing_complete', {
      processingSessionId: sessionId,
      processingTime,
    });
  }

  // Utility methods
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getConnectionType(): string | undefined {
    const connection = (navigator as any).connection;
    return connection?.effectiveType || connection?.type;
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendData('/analytics/events', { events });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events on failure (with limit to prevent memory issues)
      if (this.eventQueue.length < 100) {
        this.eventQueue.unshift(...events.slice(-50)); // Keep only last 50 events
      }
    }
  }

  private async sendData(endpoint: string, data: any): Promise<void> {
    try {
      const headers = await getAuthHeaders();

      await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Analytics request failed:', error);
    }
  }

  // Cleanup
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    // Flush remaining events
    this.flushEvents();
  }
}

// Singleton instance
export const engagementTracker = new EngagementTracker();

// React hook for analytics
export const useAnalytics = () => {
  return {
    setUserId: engagementTracker.setUserId.bind(engagementTracker),
    trackEvent: engagementTracker.trackEvent.bind(engagementTracker),
    trackConversion: engagementTracker.trackConversion.bind(engagementTracker),
    trackPerformance: engagementTracker.trackPerformance.bind(engagementTracker),
    trackHeatmap: engagementTracker.trackHeatmap.bind(engagementTracker),
    trackLearningModuleExpansion: engagementTracker.trackLearningModuleExpansion.bind(engagementTracker),
    trackVideoInteraction: engagementTracker.trackVideoInteraction.bind(engagementTracker),
    trackNotificationPermission: engagementTracker.trackNotificationPermission.bind(engagementTracker),
    trackProcessingComplete: engagementTracker.trackProcessingComplete.bind(engagementTracker),
  };
};
