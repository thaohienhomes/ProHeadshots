import { createClient } from '@/utils/supabase/client';

export interface ConversionFunnel {
  step: string;
  users_entered: number;
  users_completed: number;
  conversion_rate: number;
  drop_off_rate: number;
}

/**
 * Client-side analytics functions
 * These are simplified versions for client components
 * Full analytics should be handled server-side for security
 */

/**
 * Track an analytics event (client-side)
 */
export async function trackEventClient(
  eventName: string,
  properties: Record<string, any> = {}
): Promise<void> {
  try {
    // For client-side tracking, we'll use a simplified approach
    // In production, you might want to send this to an API endpoint
    console.log('Analytics Event:', { eventName, properties });
    
    // You could also send to an API endpoint:
    // await fetch('/api/analytics/track', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ eventName, properties })
    // });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

/**
 * Get business metrics (client-side - limited data)
 */
export async function getBusinessMetricsClient(): Promise<{
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalGenerations: number;
  avgRevenuePerUser: number;
  conversionRate: number;
  churnRate: number;
}> {
  try {
    // For client-side, we'll return mock data or call an API endpoint
    // In production, this should be an API call to avoid exposing sensitive data
    
    // Mock data for demo purposes
    return {
      totalUsers: 1250,
      newUsers: 45,
      activeUsers: 320,
      totalRevenue: 48750,
      totalGenerations: 3420,
      avgRevenuePerUser: 39,
      conversionRate: 12.5,
      churnRate: 3.2
    };
  } catch (error) {
    console.error('Error getting business metrics:', error);
    return {
      totalUsers: 0,
      newUsers: 0,
      activeUsers: 0,
      totalRevenue: 0,
      totalGenerations: 0,
      avgRevenuePerUser: 0,
      conversionRate: 0,
      churnRate: 0
    };
  }
}

/**
 * Get conversion funnel (client-side - limited data)
 */
export async function getConversionFunnelClient(): Promise<ConversionFunnel[]> {
  try {
    // Mock data for demo purposes
    // In production, this should be an API call
    return [
      {
        step: 'Landing Page Visit',
        users_entered: 1000,
        users_completed: 1000,
        conversion_rate: 100,
        drop_off_rate: 0
      },
      {
        step: 'Sign Up Started',
        users_entered: 1000,
        users_completed: 450,
        conversion_rate: 45,
        drop_off_rate: 55
      },
      {
        step: 'Sign Up Completed',
        users_entered: 450,
        users_completed: 380,
        conversion_rate: 84.4,
        drop_off_rate: 15.6
      },
      {
        step: 'Upload Started',
        users_entered: 380,
        users_completed: 320,
        conversion_rate: 84.2,
        drop_off_rate: 15.8
      },
      {
        step: 'Payment Started',
        users_entered: 320,
        users_completed: 180,
        conversion_rate: 56.3,
        drop_off_rate: 43.7
      },
      {
        step: 'Payment Completed',
        users_entered: 180,
        users_completed: 165,
        conversion_rate: 91.7,
        drop_off_rate: 8.3
      },
      {
        step: 'Generation Started',
        users_entered: 165,
        users_completed: 160,
        conversion_rate: 97,
        drop_off_rate: 3
      },
      {
        step: 'Generation Completed',
        users_entered: 160,
        users_completed: 155,
        conversion_rate: 96.9,
        drop_off_rate: 3.1
      },
      {
        step: 'Download Completed',
        users_entered: 155,
        users_completed: 145,
        conversion_rate: 93.5,
        drop_off_rate: 6.5
      }
    ];
  } catch (error) {
    console.error('Error getting conversion funnel:', error);
    return [];
  }
}
