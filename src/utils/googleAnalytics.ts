// Google Analytics 4 integration for ProHeadshots
import { logger } from './logger';

// GA4 Configuration
interface GAConfig {
  measurementId: string;
  enabled: boolean;
  debugMode: boolean;
}

// Event parameters interface
interface GAEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
  item_id?: string;
  item_name?: string;
  item_category?: string;
  quantity?: number;
  price?: number;
  user_id?: string;
  session_id?: string;
  custom_parameters?: Record<string, any>;
}

// Enhanced event tracking for ProHeadshots business
interface ConversionEvent {
  event_name: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    item_category: string;
    quantity: number;
    price: number;
  }>;
}

class GoogleAnalyticsService {
  private config: GAConfig;
  private isInitialized = false;

  constructor() {
    this.config = {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
      enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      debugMode: process.env.NODE_ENV === 'development',
    };
  }

  /**
   * Initialize Google Analytics
   */
  initialize(): void {
    if (this.isInitialized || !this.config.enabled || typeof window === 'undefined') {
      return;
    }

    try {
      // Load gtag script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', this.config.measurementId, {
        debug_mode: this.config.debugMode,
        send_page_view: false, // We'll handle page views manually
      });

      this.isInitialized = true;
      logger.info('Google Analytics initialized', 'ANALYTICS', { measurementId: this.config.measurementId });
    } catch (error) {
      logger.error('Failed to initialize Google Analytics', error as Error, 'ANALYTICS');
    }
  }

  /**
   * Track page view
   */
  trackPageView(pageTitle: string, pagePath: string, userId?: string): void {
    if (!this.isEnabled()) return;

    try {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pagePath,
        user_id: userId,
      });

      logger.info('Page view tracked', 'ANALYTICS', { pageTitle, pagePath, userId });
    } catch (error) {
      logger.error('Error tracking page view', error as Error, 'ANALYTICS');
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, parameters: GAEventParams = {}): void {
    if (!this.isEnabled()) return;

    try {
      const eventParams = {
        ...parameters,
        timestamp: Date.now(),
      };

      window.gtag('event', eventName, eventParams);

      logger.info('Event tracked', 'ANALYTICS', { eventName, parameters: eventParams });
    } catch (error) {
      logger.error('Error tracking event', error as Error, 'ANALYTICS', { eventName });
    }
  }

  /**
   * Track user signup
   */
  trackSignup(method: 'google' | 'email', userId?: string): void {
    this.trackEvent('sign_up', {
      event_category: 'engagement',
      event_label: method,
      user_id: userId,
    });
  }

  /**
   * Track payment/purchase
   */
  trackPurchase(conversionData: ConversionEvent): void {
    if (!this.isEnabled()) return;

    try {
      window.gtag('event', 'purchase', {
        transaction_id: conversionData.transaction_id,
        value: conversionData.value,
        currency: conversionData.currency || 'USD',
        items: conversionData.items,
      });

      // Also track as conversion
      this.trackEvent('conversion', {
        event_category: 'ecommerce',
        event_label: 'purchase',
        value: conversionData.value,
        transaction_id: conversionData.transaction_id,
      });

      logger.info('Purchase tracked', 'ANALYTICS', conversionData);
    } catch (error) {
      logger.error('Error tracking purchase', error as Error, 'ANALYTICS');
    }
  }

  /**
   * Track AI generation completion
   */
  trackAIGeneration(userId: string, planType: string, generationCount: number, processingTime?: number): void {
    this.trackEvent('ai_generation_complete', {
      event_category: 'ai_processing',
      event_label: planType,
      value: generationCount,
      user_id: userId,
      custom_parameters: {
        plan_type: planType,
        generation_count: generationCount,
        processing_time: processingTime,
      },
    });
  }

  /**
   * Track photo upload
   */
  trackPhotoUpload(userId: string, photoCount: number, totalSize: number): void {
    this.trackEvent('photo_upload', {
      event_category: 'user_content',
      event_label: 'photos',
      value: photoCount,
      user_id: userId,
      custom_parameters: {
        photo_count: photoCount,
        total_size_mb: Math.round(totalSize / (1024 * 1024)),
      },
    });
  }

  /**
   * Track download
   */
  trackDownload(userId: string, downloadType: 'single' | 'batch', imageCount: number): void {
    this.trackEvent('file_download', {
      event_category: 'engagement',
      event_label: downloadType,
      value: imageCount,
      user_id: userId,
      custom_parameters: {
        download_type: downloadType,
        image_count: imageCount,
      },
    });
  }

  /**
   * Track user engagement
   */
  trackEngagement(action: string, userId?: string, value?: number): void {
    this.trackEvent('engagement', {
      event_category: 'user_interaction',
      event_label: action,
      value,
      user_id: userId,
    });
  }

  /**
   * Track error events
   */
  trackError(errorType: string, errorMessage: string, userId?: string): void {
    this.trackEvent('exception', {
      event_category: 'error',
      event_label: errorType,
      user_id: userId,
      custom_parameters: {
        error_message: errorMessage,
        error_type: errorType,
      },
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, userId?: string): void {
    this.trackEvent('timing_complete', {
      event_category: 'performance',
      event_label: metric,
      value: Math.round(value),
      user_id: userId,
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(userId: string, properties: Record<string, any>): void {
    if (!this.isEnabled()) return;

    try {
      window.gtag('config', this.config.measurementId, {
        user_id: userId,
        custom_map: properties,
      });

      logger.info('User properties set', 'ANALYTICS', { userId, properties });
    } catch (error) {
      logger.error('Error setting user properties', error as Error, 'ANALYTICS');
    }
  }

  /**
   * Track conversion funnel step
   */
  trackFunnelStep(step: 'landing' | 'signup' | 'upload' | 'payment' | 'generation' | 'download', userId?: string): void {
    this.trackEvent(`funnel_${step}`, {
      event_category: 'funnel',
      event_label: step,
      user_id: userId,
      custom_parameters: {
        funnel_step: step,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Track business metrics
   */
  trackBusinessMetric(metric: 'ltv' | 'churn' | 'retention', value: number, userId?: string): void {
    this.trackEvent('business_metric', {
      event_category: 'business',
      event_label: metric,
      value,
      user_id: userId,
      custom_parameters: {
        metric_type: metric,
      },
    });
  }

  // Private methods
  private isEnabled(): boolean {
    return this.config.enabled && this.isInitialized && typeof window !== 'undefined' && window.gtag;
  }
}

// Create singleton instance
export const googleAnalytics = new GoogleAnalyticsService();

// Initialize on client side
if (typeof window !== 'undefined') {
  googleAnalytics.initialize();
}

// Convenience functions
export const trackPageView = (pageTitle: string, pagePath: string, userId?: string) =>
  googleAnalytics.trackPageView(pageTitle, pagePath, userId);

export const trackEvent = (eventName: string, parameters?: GAEventParams) =>
  googleAnalytics.trackEvent(eventName, parameters);

export const trackSignup = (method: 'google' | 'email', userId?: string) =>
  googleAnalytics.trackSignup(method, userId);

export const trackPurchase = (conversionData: ConversionEvent) =>
  googleAnalytics.trackPurchase(conversionData);

export const trackAIGeneration = (userId: string, planType: string, generationCount: number, processingTime?: number) =>
  googleAnalytics.trackAIGeneration(userId, planType, generationCount, processingTime);

export const trackPhotoUpload = (userId: string, photoCount: number, totalSize: number) =>
  googleAnalytics.trackPhotoUpload(userId, photoCount, totalSize);

export const trackDownload = (userId: string, downloadType: 'single' | 'batch', imageCount: number) =>
  googleAnalytics.trackDownload(userId, downloadType, imageCount);

export const trackEngagement = (action: string, userId?: string, value?: number) =>
  googleAnalytics.trackEngagement(action, userId, value);

export const trackError = (errorType: string, errorMessage: string, userId?: string) =>
  googleAnalytics.trackError(errorType, errorMessage, userId);

export const trackPerformance = (metric: string, value: number, userId?: string) =>
  googleAnalytics.trackPerformance(metric, value, userId);

export const setUserProperties = (userId: string, properties: Record<string, any>) =>
  googleAnalytics.setUserProperties(userId, properties);

export const trackFunnelStep = (step: 'landing' | 'signup' | 'upload' | 'payment' | 'generation' | 'download', userId?: string) =>
  googleAnalytics.trackFunnelStep(step, userId);

export const trackBusinessMetric = (metric: 'ltv' | 'churn' | 'retention', value: number, userId?: string) =>
  googleAnalytics.trackBusinessMetric(metric, value, userId);

// Type declarations for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default googleAnalytics;
