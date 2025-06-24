// Enhanced error tracking with Sentry integration
import { logger } from './logger';

// Error tracking configuration
interface ErrorTrackingConfig {
  dsn?: string;
  environment: string;
  release?: string;
  sampleRate: number;
  enableTracing: boolean;
}

// Error context interface
interface ErrorContext {
  user?: {
    id?: string;
    email?: string;
    plan?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  level?: 'error' | 'warning' | 'info' | 'debug';
  fingerprint?: string[];
}

// Error tracking service
class ErrorTrackingService {
  private config: ErrorTrackingConfig;
  private isInitialized = false;

  constructor() {
    this.config = {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      enableTracing: process.env.NODE_ENV === 'production',
    };
  }

  /**
   * Initialize error tracking
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // In a real implementation, you would initialize Sentry here
      // For now, we'll use a mock implementation
      if (this.config.dsn) {
        console.log('🔍 Error tracking initialized with Sentry');
        this.isInitialized = true;
      } else {
        console.log('⚠️  Error tracking: No DSN provided, using console logging');
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize error tracking:', error);
    }
  }

  /**
   * Capture an error
   */
  captureError(error: Error, context?: ErrorContext): string {
    const errorId = this.generateErrorId();
    
    try {
      // Enhanced error logging
      logger.error(
        `Error captured: ${error.message}`,
        error,
        'ERROR_TRACKING',
        {
          errorId,
          context,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        }
      );

      // In production, send to Sentry
      if (this.config.dsn && this.isInitialized) {
        this.sendToSentry(error, context, errorId);
      }

      // Store error locally for analysis
      this.storeErrorLocally(error, context, errorId);

      return errorId;
    } catch (trackingError) {
      console.error('Error in error tracking:', trackingError);
      return errorId;
    }
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: 'error' | 'warning' | 'info' | 'debug' = 'info', context?: ErrorContext): string {
    const messageId = this.generateErrorId();
    
    try {
      logger.info(
        `Message captured: ${message}`,
        'ERROR_TRACKING',
        {
          messageId,
          level,
          context,
          timestamp: new Date().toISOString(),
        }
      );

      // In production, send to Sentry
      if (this.config.dsn && this.isInitialized) {
        this.sendMessageToSentry(message, level, context, messageId);
      }

      return messageId;
    } catch (trackingError) {
      console.error('Error in message tracking:', trackingError);
      return messageId;
    }
  }

  /**
   * Set user context
   */
  setUserContext(user: { id?: string; email?: string; plan?: string }): void {
    try {
      // Store user context for future error reports
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('errorTracking_userContext', JSON.stringify(user));
      }
      
      logger.info('User context set for error tracking', 'ERROR_TRACKING', { userId: user.id });
    } catch (error) {
      console.error('Error setting user context:', error);
    }
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
    try {
      const breadcrumb = {
        message,
        category,
        data,
        timestamp: new Date().toISOString(),
      };

      // Store breadcrumbs in session storage (limited to last 50)
      if (typeof window !== 'undefined') {
        const breadcrumbs = this.getBreadcrumbs();
        breadcrumbs.push(breadcrumb);
        
        // Keep only last 50 breadcrumbs
        if (breadcrumbs.length > 50) {
          breadcrumbs.shift();
        }
        
        sessionStorage.setItem('errorTracking_breadcrumbs', JSON.stringify(breadcrumbs));
      }
    } catch (error) {
      console.error('Error adding breadcrumb:', error);
    }
  }

  /**
   * Track performance issue
   */
  trackPerformanceIssue(metric: string, value: number, threshold: number, context?: Record<string, any>): void {
    if (value > threshold) {
      this.captureMessage(
        `Performance issue: ${metric} (${value}ms) exceeded threshold (${threshold}ms)`,
        'warning',
        {
          tags: { type: 'performance' },
          extra: { metric, value, threshold, ...context },
        }
      );
    }
  }

  /**
   * Track API error
   */
  trackAPIError(endpoint: string, method: string, status: number, error?: Error, context?: Record<string, any>): void {
    const message = `API Error: ${method} ${endpoint} - Status ${status}`;
    
    if (error) {
      this.captureError(error, {
        tags: { 
          type: 'api_error',
          endpoint,
          method,
          status: status.toString(),
        },
        extra: context,
      });
    } else {
      this.captureMessage(message, 'error', {
        tags: { 
          type: 'api_error',
          endpoint,
          method,
          status: status.toString(),
        },
        extra: context,
      });
    }
  }

  /**
   * Track payment error
   */
  trackPaymentError(error: Error, paymentData?: Record<string, any>): void {
    this.captureError(error, {
      tags: { type: 'payment_error' },
      extra: {
        ...paymentData,
        // Remove sensitive data
        cardNumber: undefined,
        cvv: undefined,
      },
      level: 'error',
    });
  }

  /**
   * Track AI processing error
   */
  trackAIError(error: Error, modelId?: string, userId?: string, context?: Record<string, any>): void {
    this.captureError(error, {
      tags: { 
        type: 'ai_error',
        model_id: modelId || 'unknown',
      },
      extra: {
        user_id: userId,
        ...context,
      },
      level: 'error',
    });
  }

  // Private methods
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sendToSentry(error: Error, context?: ErrorContext, errorId?: string): void {
    // Mock Sentry integration - in production, use actual Sentry SDK
    console.log('📤 Sending to Sentry:', { error: error.message, context, errorId });
  }

  private sendMessageToSentry(message: string, level: string, context?: ErrorContext, messageId?: string): void {
    // Mock Sentry integration - in production, use actual Sentry SDK
    console.log('📤 Sending message to Sentry:', { message, level, context, messageId });
  }

  private storeErrorLocally(error: Error, context?: ErrorContext, errorId?: string): void {
    try {
      if (typeof window !== 'undefined') {
        const errorData = {
          id: errorId,
          message: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
        };

        const errors = this.getLocalErrors();
        errors.push(errorData);

        // Keep only last 100 errors
        if (errors.length > 100) {
          errors.shift();
        }

        localStorage.setItem('errorTracking_errors', JSON.stringify(errors));
      }
    } catch (storageError) {
      console.error('Error storing error locally:', storageError);
    }
  }

  private getBreadcrumbs(): any[] {
    try {
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('errorTracking_breadcrumbs');
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      console.error('Error getting breadcrumbs:', error);
    }
    return [];
  }

  private getLocalErrors(): any[] {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('errorTracking_errors');
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      console.error('Error getting local errors:', error);
    }
    return [];
  }
}

// Create singleton instance
export const errorTracking = new ErrorTrackingService();

// Initialize error tracking
if (typeof window !== 'undefined') {
  errorTracking.initialize();
}

// Convenience functions
export const captureError = (error: Error, context?: ErrorContext) => errorTracking.captureError(error, context);
export const captureMessage = (message: string, level?: 'error' | 'warning' | 'info' | 'debug', context?: ErrorContext) => 
  errorTracking.captureMessage(message, level, context);
export const setUserContext = (user: { id?: string; email?: string; plan?: string }) => errorTracking.setUserContext(user);
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => 
  errorTracking.addBreadcrumb(message, category, data);

// Specialized tracking functions
export const trackAPIError = (endpoint: string, method: string, status: number, error?: Error, context?: Record<string, any>) =>
  errorTracking.trackAPIError(endpoint, method, status, error, context);
export const trackPaymentError = (error: Error, paymentData?: Record<string, any>) =>
  errorTracking.trackPaymentError(error, paymentData);
export const trackAIError = (error: Error, modelId?: string, userId?: string, context?: Record<string, any>) =>
  errorTracking.trackAIError(error, modelId, userId, context);
export const trackPerformanceIssue = (metric: string, value: number, threshold: number, context?: Record<string, any>) =>
  errorTracking.trackPerformanceIssue(metric, value, threshold, context);

export default errorTracking;
