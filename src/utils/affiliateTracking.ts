/**
 * Unified Affiliate Tracking System
 *
 * This module provides a unified interface for tracking affiliate conversions
 * across multiple platforms (TrackDesk, etc.)
 */

import { logger } from './logger';
import { trackTrackDeskConversion, trackTrackDeskEvent, getTrackDeskAffiliateInfo } from './trackdesk';

// Affiliate tracking interface
interface AffiliateConversion {
  conversionType: 'sale' | 'signup' | 'lead' | 'freetrial';
  orderId?: string;
  revenue?: number;
  currency?: string;
  customerId?: string;
  customerEmail?: string;
  planType?: string;
  metadata?: Record<string, any>;
}

class AffiliateTracker {
  /**
   * Track conversion across all affiliate platforms
   */
  async trackConversion(conversion: AffiliateConversion): Promise<void> {
    try {
      // Track in TrackDesk
      await this.trackTrackDeskConversion(conversion);

      logger.info('Affiliate conversion tracked across all platforms', 'AFFILIATE_TRACKING', conversion);
    } catch (error) {
      logger.error('Failed to track affiliate conversion', error as Error, 'AFFILIATE_TRACKING');
    }
  }

  /**
   * Track TrackDesk conversion
   */
  private async trackTrackDeskConversion(conversion: AffiliateConversion): Promise<void> {
    try {
      const affiliateInfo = getTrackDeskAffiliateInfo();
      
      if (!affiliateInfo.affiliateId) {
        logger.info('No TrackDesk affiliate ID found, skipping TrackDesk tracking', 'AFFILIATE_TRACKING');
        return;
      }

      // Map conversion types
      let trackDeskType: 'sale' | 'freetrial' | 'lead' = 'lead';
      switch (conversion.conversionType) {
        case 'sale':
          trackDeskType = 'sale';
          break;
        case 'signup':
        case 'freetrial':
          trackDeskType = 'freetrial';
          break;
        case 'lead':
        default:
          trackDeskType = 'lead';
          break;
      }

      trackTrackDeskConversion({
        conversionType: trackDeskType,
        orderId: conversion.orderId,
        revenue: conversion.revenue,
        currency: conversion.currency,
        customerId: conversion.customerId,
        customerEmail: conversion.customerEmail,
        metadata: {
          planType: conversion.planType,
          originalConversionType: conversion.conversionType,
          ...conversion.metadata
        }
      });

      logger.info('TrackDesk conversion tracked', 'AFFILIATE_TRACKING', {
        affiliateId: affiliateInfo.affiliateId,
        conversionType: trackDeskType,
        orderId: conversion.orderId
      });
    } catch (error) {
      logger.error('Failed to track TrackDesk conversion', error as Error, 'AFFILIATE_TRACKING');
    }
  }



  /**
   * Track custom affiliate event
   */
  trackEvent(eventName: string, eventData?: any): void {
    try {
      // Track in TrackDesk
      trackTrackDeskEvent(eventName, eventData);

      logger.info(`Affiliate event tracked: ${eventName}`, 'AFFILIATE_TRACKING', eventData);
    } catch (error) {
      logger.error('Failed to track affiliate event', error as Error, 'AFFILIATE_TRACKING');
    }
  }

  /**
   * Get all affiliate information
   */
  getAffiliateInfo(): {
    trackdesk: { affiliateId: string | null; clickId: string | null };
  } {
    const trackdeskInfo = getTrackDeskAffiliateInfo();

    return {
      trackdesk: trackdeskInfo
    };
  }

  /**
   * Check if any affiliate tracking is active
   */
  hasActiveAffiliateTracking(): boolean {
    const affiliateInfo = this.getAffiliateInfo();
    return !!(affiliateInfo.trackdesk.affiliateId);
  }
}

// Create singleton instance
const affiliateTracker = new AffiliateTracker();

// Export convenience functions
export const trackAffiliateConversion = (conversion: AffiliateConversion) => 
  affiliateTracker.trackConversion(conversion);

export const trackAffiliateEvent = (eventName: string, eventData?: any) => 
  affiliateTracker.trackEvent(eventName, eventData);

export const getAffiliateInfo = () => 
  affiliateTracker.getAffiliateInfo();

export const hasActiveAffiliateTracking = () => 
  affiliateTracker.hasActiveAffiliateTracking();

export default affiliateTracker;
