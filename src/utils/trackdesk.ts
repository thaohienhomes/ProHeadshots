/**
 * TrackDesk Affiliate Tracking Integration
 * 
 * This module handles TrackDesk affiliate tracking for Coolpix.me
 * Supports tracking visits, conversions, and revenue attribution
 */

import { logger } from './logger';

// TrackDesk configuration
const TRACKDESK_CONFIG = {
  // These will be populated from your TrackDesk account
  trackingDomain: 'coolpixme.trackdesk.com',
  offerId: 'a8216467-8b03-4623-a03d-1241791640b2', // From your URL
  offerName: 'Coolpix Partners',
  
  // Conversion types from your configuration
  conversionTypes: {
    sale: {
      code: 'sale',
      name: 'Sale',
      conversionValueType: 'CONVERSION_VALUE_TYPE_RATE',
      conversionRecurrenceType: 'once',
      conversionCountLimit: 1
    },
    freetrial: {
      code: 'freetrial', 
      name: 'Free Trial',
      conversionValueType: 'CONVERSION_VALUE_TYPE_NO_REVENUE',
      conversionRecurrenceType: 'once',
      conversionCountLimit: 1
    },
    lead: {
      code: 'lead',
      name: 'Lead', 
      conversionValueType: 'CONVERSION_VALUE_TYPE_NO_REVENUE',
      conversionRecurrenceType: 'once',
      conversionCountLimit: 1
    }
  }
};

// TrackDesk tracking interface
interface TrackDeskConversion {
  conversionType: 'sale' | 'freetrial' | 'lead';
  orderId?: string;
  revenue?: number;
  currency?: string;
  customerId?: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
}

class TrackDeskTracker {
  private isInitialized = false;
  private trackingPixelLoaded = false;

  /**
   * Initialize TrackDesk tracking
   */
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      // Load TrackDesk tracking script
      this.loadTrackingScript();
      
      // Set up global tracking object
      this.setupGlobalTracker();
      
      // Track initial page visit
      this.trackPageVisit();
      
      this.isInitialized = true;
      logger.info('TrackDesk tracking initialized', 'TRACKDESK');
    } catch (error) {
      logger.error('Failed to initialize TrackDesk tracking', error as Error, 'TRACKDESK');
    }
  }

  /**
   * Load TrackDesk tracking script
   */
  private loadTrackingScript(): void {
    if (this.trackingPixelLoaded) return;

    // Create tracking pixel/script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://${TRACKDESK_CONFIG.trackingDomain}/tracking.js`;
    
    script.onload = () => {
      this.trackingPixelLoaded = true;
      logger.info('TrackDesk tracking script loaded', 'TRACKDESK');
    };

    script.onerror = () => {
      logger.error('Failed to load TrackDesk tracking script', new Error('Script load failed'), 'TRACKDESK');
    };

    document.head.appendChild(script);
  }

  /**
   * Set up global TrackDesk tracking object
   */
  private setupGlobalTracker(): void {
    // Initialize TrackDesk global object if not exists
    if (!(window as any).trackdesk) {
      (window as any).trackdesk = {
        queue: [],
        track: (event: string, data?: any) => {
          (window as any).trackdesk.queue.push({ event, data, timestamp: Date.now() });
        }
      };
    }
  }

  /**
   * Track page visit (affiliate click tracking)
   */
  private trackPageVisit(): void {
    try {
      // Get URL parameters for affiliate tracking
      const urlParams = new URLSearchParams(window.location.search);
      const affiliateId = urlParams.get('aff') || urlParams.get('affiliate') || urlParams.get('ref');
      const clickId = urlParams.get('click_id') || urlParams.get('clickid');
      
      // Store affiliate data in session/local storage for later conversion tracking
      if (affiliateId) {
        sessionStorage.setItem('trackdesk_affiliate_id', affiliateId);
        if (clickId) {
          sessionStorage.setItem('trackdesk_click_id', clickId);
        }
        
        logger.info('Affiliate visit tracked', 'TRACKDESK', { affiliateId, clickId });
      }

      // Track page visit
      this.trackEvent('page_visit', {
        url: window.location.href,
        referrer: document.referrer,
        affiliate_id: affiliateId,
        click_id: clickId,
        offer_id: TRACKDESK_CONFIG.offerId
      });

    } catch (error) {
      logger.error('Failed to track page visit', error as Error, 'TRACKDESK');
    }
  }

  /**
   * Track conversion event
   */
  trackConversion(conversion: TrackDeskConversion): void {
    if (!this.isInitialized) {
      logger.warn('TrackDesk not initialized, queuing conversion', 'TRACKDESK');
      // Queue the conversion for when tracking is ready
      setTimeout(() => this.trackConversion(conversion), 1000);
      return;
    }

    try {
      // Get stored affiliate data
      const affiliateId = sessionStorage.getItem('trackdesk_affiliate_id');
      const clickId = sessionStorage.getItem('trackdesk_click_id');

      if (!affiliateId) {
        logger.info('No affiliate ID found, skipping TrackDesk conversion tracking', 'TRACKDESK');
        return;
      }

      const conversionData = {
        conversion_type: conversion.conversionType,
        offer_id: TRACKDESK_CONFIG.offerId,
        affiliate_id: affiliateId,
        click_id: clickId,
        order_id: conversion.orderId,
        revenue: conversion.revenue,
        currency: conversion.currency || 'USD',
        customer_id: conversion.customerId,
        customer_email: conversion.customerEmail,
        timestamp: new Date().toISOString(),
        ...conversion.metadata
      };

      // Track the conversion
      this.trackEvent('conversion', conversionData);

      // Send conversion to TrackDesk API
      this.sendConversionToAPI(conversionData);

      logger.info('TrackDesk conversion tracked', 'TRACKDESK', conversionData);

    } catch (error) {
      logger.error('Failed to track TrackDesk conversion', error as Error, 'TRACKDESK');
    }
  }

  /**
   * Send conversion data to TrackDesk API
   */
  private async sendConversionToAPI(conversionData: any): Promise<void> {
    try {
      // This would typically be a pixel request or API call to TrackDesk
      const trackingUrl = `https://${TRACKDESK_CONFIG.trackingDomain}/conversion`;
      
      // Create tracking pixel for conversion
      const pixel = document.createElement('img');
      pixel.style.display = 'none';
      pixel.src = `${trackingUrl}?${new URLSearchParams(conversionData).toString()}`;
      
      document.body.appendChild(pixel);

      // Also try fetch if available for better tracking
      if (navigator.sendBeacon) {
        navigator.sendBeacon(trackingUrl, JSON.stringify(conversionData));
      }

    } catch (error) {
      logger.error('Failed to send conversion to TrackDesk API', error as Error, 'TRACKDESK');
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, eventData?: any): void {
    try {
      if ((window as any).trackdesk) {
        (window as any).trackdesk.track(eventName, eventData);
      }
      
      logger.info(`TrackDesk event: ${eventName}`, 'TRACKDESK', eventData);
    } catch (error) {
      logger.error('Failed to track TrackDesk event', error as Error, 'TRACKDESK');
    }
  }

  /**
   * Get current affiliate information
   */
  getAffiliateInfo(): { affiliateId: string | null; clickId: string | null } {
    return {
      affiliateId: sessionStorage.getItem('trackdesk_affiliate_id'),
      clickId: sessionStorage.getItem('trackdesk_click_id')
    };
  }
}

// Create singleton instance
const trackDeskTracker = new TrackDeskTracker();

// Export convenience functions
export const initializeTrackDesk = () => trackDeskTracker.initialize();
export const trackTrackDeskConversion = (conversion: TrackDeskConversion) => trackDeskTracker.trackConversion(conversion);
export const trackTrackDeskEvent = (eventName: string, eventData?: any) => trackDeskTracker.trackEvent(eventName, eventData);
export const getTrackDeskAffiliateInfo = () => trackDeskTracker.getAffiliateInfo();

export default trackDeskTracker;
