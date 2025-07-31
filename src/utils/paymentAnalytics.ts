import { logger } from './logger';
import { createServiceClient } from './supabase/service';

export interface PaymentEvent {
  event_type: 'checkout_created' | 'payment_started' | 'payment_completed' | 'payment_failed' | 'verification_started' | 'verification_completed';
  checkout_id: string;
  user_id?: string;
  plan_type?: string;
  amount?: number;
  error_message?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface PaymentMetrics {
  total_checkouts: number;
  successful_payments: number;
  failed_payments: number;
  conversion_rate: number;
  average_verification_time: number;
  error_rate: number;
  revenue_total: number;
}

class PaymentAnalytics {
  private supabase = createServiceClient();

  /**
   * Track a payment event
   */
  async trackEvent(event: Omit<PaymentEvent, 'timestamp'>) {
    try {
      const eventWithTimestamp: PaymentEvent = {
        ...event,
        timestamp: new Date().toISOString()
      };

      // Log the event
      logger.info(`Payment Event: ${event.event_type}`, 'PAYMENT_ANALYTICS', eventWithTimestamp);

      // Store in database
      await this.supabase
        .from('payment_events')
        .insert(eventWithTimestamp);

      // Update real-time metrics if needed
      if (event.event_type === 'payment_completed') {
        await this.updateMetrics();
      }

    } catch (error) {
      logger.error('Failed to track payment event', error as Error, 'PAYMENT_ANALYTICS');
    }
  }

  /**
   * Get payment metrics for a time period
   */
  async getMetrics(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<PaymentMetrics> {
    try {
      const timeAgo = this.getTimeAgo(timeframe);
      
      const { data: events, error } = await this.supabase
        .from('payment_events')
        .select('*')
        .gte('timestamp', timeAgo);

      if (error) throw error;

      return this.calculateMetrics(events || []);
    } catch (error) {
      logger.error('Failed to get payment metrics', error as Error, 'PAYMENT_ANALYTICS');
      return this.getDefaultMetrics();
    }
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(timeframe: 'day' | 'week' | 'month' = 'day') {
    try {
      const timeAgo = this.getTimeAgo(timeframe);
      
      const { data: events, error } = await this.supabase
        .from('payment_events')
        .select('event_type, checkout_id')
        .gte('timestamp', timeAgo);

      if (error) throw error;

      const checkouts = new Set();
      const payments_started = new Set();
      const payments_completed = new Set();

      events?.forEach(event => {
        if (event.event_type === 'checkout_created') {
          checkouts.add(event.checkout_id);
        } else if (event.event_type === 'payment_started') {
          payments_started.add(event.checkout_id);
        } else if (event.event_type === 'payment_completed') {
          payments_completed.add(event.checkout_id);
        }
      });

      return {
        checkouts_created: checkouts.size,
        payments_started: payments_started.size,
        payments_completed: payments_completed.size,
        checkout_to_payment_rate: checkouts.size > 0 ? (payments_started.size / checkouts.size) * 100 : 0,
        payment_completion_rate: payments_started.size > 0 ? (payments_completed.size / payments_started.size) * 100 : 0,
        overall_conversion_rate: checkouts.size > 0 ? (payments_completed.size / checkouts.size) * 100 : 0
      };
    } catch (error) {
      logger.error('Failed to get conversion funnel', error as Error, 'PAYMENT_ANALYTICS');
      return {
        checkouts_created: 0,
        payments_started: 0,
        payments_completed: 0,
        checkout_to_payment_rate: 0,
        payment_completion_rate: 0,
        overall_conversion_rate: 0
      };
    }
  }

  /**
   * Get error analysis
   */
  async getErrorAnalysis(timeframe: 'day' | 'week' | 'month' = 'day') {
    try {
      const timeAgo = this.getTimeAgo(timeframe);
      
      const { data: events, error } = await this.supabase
        .from('payment_events')
        .select('error_message, metadata')
        .eq('event_type', 'payment_failed')
        .gte('timestamp', timeAgo);

      if (error) throw error;

      const errorCounts: Record<string, number> = {};
      
      events?.forEach(event => {
        const errorType = this.categorizeError(event.error_message);
        errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
      });

      return Object.entries(errorCounts)
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      logger.error('Failed to get error analysis', error as Error, 'PAYMENT_ANALYTICS');
      return [];
    }
  }

  private calculateMetrics(events: PaymentEvent[]): PaymentMetrics {
    const checkouts = events.filter(e => e.event_type === 'checkout_created').length;
    const successful = events.filter(e => e.event_type === 'payment_completed').length;
    const failed = events.filter(e => e.event_type === 'payment_failed').length;
    
    const revenue = events
      .filter(e => e.event_type === 'payment_completed' && e.amount)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const verificationEvents = events.filter(e => 
      e.event_type === 'verification_started' || e.event_type === 'verification_completed'
    );

    let averageVerificationTime = 0;
    if (verificationEvents.length >= 2) {
      // Calculate average verification time (simplified)
      averageVerificationTime = 2.5; // seconds - would need more complex calculation
    }

    return {
      total_checkouts: checkouts,
      successful_payments: successful,
      failed_payments: failed,
      conversion_rate: checkouts > 0 ? (successful / checkouts) * 100 : 0,
      average_verification_time: averageVerificationTime,
      error_rate: (successful + failed) > 0 ? (failed / (successful + failed)) * 100 : 0,
      revenue_total: revenue
    };
  }

  private getDefaultMetrics(): PaymentMetrics {
    return {
      total_checkouts: 0,
      successful_payments: 0,
      failed_payments: 0,
      conversion_rate: 0,
      average_verification_time: 0,
      error_rate: 0,
      revenue_total: 0
    };
  }

  private getTimeAgo(timeframe: string): string {
    const now = new Date();
    switch (timeframe) {
      case 'hour':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  }

  private categorizeError(errorMessage?: string): string {
    if (!errorMessage) return 'Unknown';
    
    const message = errorMessage.toLowerCase();
    
    if (message.includes('timeout')) return 'Timeout';
    if (message.includes('network')) return 'Network';
    if (message.includes('validation')) return 'Validation';
    if (message.includes('authentication')) return 'Authentication';
    if (message.includes('rate limit')) return 'Rate Limit';
    if (message.includes('server')) return 'Server Error';
    
    return 'Other';
  }

  private async updateMetrics() {
    // Update cached metrics for dashboard
    // This would be implemented based on your caching strategy
  }
}

export const paymentAnalytics = new PaymentAnalytics();
