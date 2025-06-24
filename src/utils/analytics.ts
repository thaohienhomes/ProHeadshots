import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';

export interface AnalyticsEvent {
  id?: string;
  user_id?: string;
  session_id: string;
  event_type: string;
  event_name: string;
  properties: Record<string, any>;
  page_url: string;
  user_agent: string;
  ip_address?: string;
  timestamp: string;
}

export interface UserSession {
  id: string;
  user_id?: string;
  session_start: string;
  session_end?: string;
  page_views: number;
  events_count: number;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device_type: string;
  browser: string;
  os: string;
  country?: string;
  city?: string;
}

export interface ConversionFunnel {
  step: string;
  users_entered: number;
  users_completed: number;
  conversion_rate: number;
  drop_off_rate: number;
}

/**
 * Track an analytics event
 */
export async function trackEvent(
  eventName: string,
  properties: Record<string, any> = {},
  userId?: string,
  sessionId?: string
): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Generate session ID if not provided
    const finalSessionId = sessionId || generateSessionId();
    
    const event: Omit<AnalyticsEvent, 'id'> = {
      user_id: userId,
      session_id: finalSessionId,
      event_type: getEventType(eventName),
      event_name: eventName,
      properties,
      page_url: properties.page_url || '',
      user_agent: properties.user_agent || '',
      ip_address: properties.ip_address,
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase
      .from('analytics_events')
      .insert(event);

    if (error) {
      logger.error('Error tracking analytics event', error, 'ANALYTICS', { eventName, userId });
      return;
    }

    // Update session
    await updateSession(finalSessionId, userId, properties);

    logger.info('Analytics event tracked', 'ANALYTICS', { 
      eventName, 
      userId, 
      sessionId: finalSessionId 
    });

  } catch (error) {
    logger.error('Error tracking analytics event', error as Error, 'ANALYTICS', { eventName, userId });
  }
}

/**
 * Track page view
 */
export async function trackPageView(
  pageUrl: string,
  userId?: string,
  sessionId?: string,
  additionalProperties: Record<string, any> = {}
): Promise<void> {
  await trackEvent('page_view', {
    page_url: pageUrl,
    ...additionalProperties
  }, userId, sessionId);
}

/**
 * Track user conversion events
 */
export async function trackConversion(
  conversionType: 'signup' | 'payment' | 'generation' | 'download',
  value?: number,
  userId?: string,
  sessionId?: string,
  additionalProperties: Record<string, any> = {}
): Promise<void> {
  await trackEvent(`conversion_${conversionType}`, {
    conversion_type: conversionType,
    value,
    ...additionalProperties
  }, userId, sessionId);
}

/**
 * Get user behavior analytics
 */
export async function getUserBehaviorAnalytics(
  userId: string,
  dateRange: { start: string; end: string }
): Promise<{
  totalEvents: number;
  pageViews: number;
  sessionCount: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  eventBreakdown: Array<{ event: string; count: number }>;
}> {
  try {
    const supabase = await createClient();

    // Get events in date range
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', dateRange.start)
      .lte('timestamp', dateRange.end);

    if (eventsError) throw eventsError;

    // Get sessions in date range
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('session_start', dateRange.start)
      .lte('session_start', dateRange.end);

    if (sessionsError) throw sessionsError;

    // Calculate metrics
    const totalEvents = events?.length || 0;
    const pageViews = events?.filter(e => e.event_name === 'page_view').length || 0;
    const sessionCount = sessions?.length || 0;
    
    const avgSessionDuration = sessions?.reduce((acc, session) => {
      if (session.session_end) {
        const duration = new Date(session.session_end).getTime() - new Date(session.session_start).getTime();
        return acc + duration;
      }
      return acc;
    }, 0) / (sessionCount || 1) / 1000 / 60; // Convert to minutes

    // Top pages
    const pageViewEvents = events?.filter(e => e.event_name === 'page_view') || [];
    const pageViewCounts = pageViewEvents.reduce((acc, event) => {
      const page = event.page_url;
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topPages = Object.entries(pageViewCounts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Event breakdown
    const eventCounts = events?.reduce((acc, event) => {
      acc[event.event_name] = (acc[event.event_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    const eventBreakdown = Object.entries(eventCounts)
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalEvents,
      pageViews,
      sessionCount,
      avgSessionDuration,
      topPages,
      eventBreakdown
    };

  } catch (error) {
    logger.error('Error getting user behavior analytics', error as Error, 'ANALYTICS', { userId });
    throw error;
  }
}

/**
 * Get conversion funnel analytics
 */
export async function getConversionFunnel(
  dateRange: { start: string; end: string }
): Promise<ConversionFunnel[]> {
  try {
    const supabase = await createClient();

    // Define funnel steps
    const funnelSteps = [
      { step: 'Landing Page Visit', event: 'page_view' },
      { step: 'Sign Up Started', event: 'signup_started' },
      { step: 'Sign Up Completed', event: 'conversion_signup' },
      { step: 'Upload Started', event: 'upload_started' },
      { step: 'Payment Started', event: 'payment_started' },
      { step: 'Payment Completed', event: 'conversion_payment' },
      { step: 'Generation Started', event: 'generation_started' },
      { step: 'Generation Completed', event: 'conversion_generation' },
      { step: 'Download Completed', event: 'conversion_download' }
    ];

    const funnelData: ConversionFunnel[] = [];
    let previousStepUsers = 0;

    for (let i = 0; i < funnelSteps.length; i++) {
      const step = funnelSteps[i];
      
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('user_id')
        .eq('event_name', step.event)
        .gte('timestamp', dateRange.start)
        .lte('timestamp', dateRange.end);

      if (error) throw error;

      const uniqueUsers = new Set(events?.map(e => e.user_id).filter(Boolean)).size;
      
      const conversionRate = i === 0 ? 100 : previousStepUsers > 0 ? (uniqueUsers / previousStepUsers) * 100 : 0;
      const dropOffRate = 100 - conversionRate;

      funnelData.push({
        step: step.step,
        users_entered: i === 0 ? uniqueUsers : previousStepUsers,
        users_completed: uniqueUsers,
        conversion_rate: conversionRate,
        drop_off_rate: dropOffRate
      });

      previousStepUsers = uniqueUsers;
    }

    return funnelData;

  } catch (error) {
    logger.error('Error getting conversion funnel', error as Error, 'ANALYTICS');
    throw error;
  }
}

/**
 * Get business metrics dashboard data
 */
export async function getBusinessMetrics(
  dateRange: { start: string; end: string }
): Promise<{
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
    const supabase = await createClient();

    // Get user metrics
    const { data: allUsers } = await supabase
      .from('userTable')
      .select('id, created_at, paymentStatus');

    const { data: newUsers } = await supabase
      .from('userTable')
      .select('id')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    // Get active users (users with events in date range)
    const { data: activeUserEvents } = await supabase
      .from('analytics_events')
      .select('user_id')
      .gte('timestamp', dateRange.start)
      .lte('timestamp', dateRange.end);

    const activeUsers = new Set(activeUserEvents?.map(e => e.user_id).filter(Boolean)).size;

    // Get revenue data (mock calculation)
    const paidUsers = allUsers?.filter(u => u.paymentStatus === 'paid').length || 0;
    const totalRevenue = paidUsers * 39; // Assuming $39 per user

    // Get generation count
    const { data: generations } = await supabase
      .from('analytics_events')
      .select('id')
      .eq('event_name', 'conversion_generation')
      .gte('timestamp', dateRange.start)
      .lte('timestamp', dateRange.end);

    const totalGenerations = generations?.length || 0;

    // Calculate metrics
    const totalUsersCount = allUsers?.length || 0;
    const newUsersCount = newUsers?.length || 0;
    const avgRevenuePerUser = totalUsersCount > 0 ? totalRevenue / totalUsersCount : 0;
    const conversionRate = newUsersCount > 0 ? (paidUsers / newUsersCount) * 100 : 0;
    
    // Mock churn rate calculation
    const churnRate = 5; // 5% monthly churn rate

    return {
      totalUsers: totalUsersCount,
      newUsers: newUsersCount,
      activeUsers,
      totalRevenue,
      totalGenerations,
      avgRevenuePerUser,
      conversionRate,
      churnRate
    };

  } catch (error) {
    logger.error('Error getting business metrics', error as Error, 'ANALYTICS');
    throw error;
  }
}

/**
 * Helper functions
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getEventType(eventName: string): string {
  if (eventName.startsWith('conversion_')) return 'conversion';
  if (eventName === 'page_view') return 'pageview';
  if (eventName.includes('click')) return 'interaction';
  if (eventName.includes('error')) return 'error';
  return 'custom';
}

async function updateSession(
  sessionId: string, 
  userId?: string, 
  properties: Record<string, any> = {}
): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Check if session exists
    const { data: existingSession } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (existingSession) {
      // Update existing session
      await supabase
        .from('user_sessions')
        .update({
          session_end: new Date().toISOString(),
          page_views: existingSession.page_views + 1,
          events_count: existingSession.events_count + 1
        })
        .eq('id', sessionId);
    } else {
      // Create new session
      const session: Omit<UserSession, 'id'> = {
        user_id: userId,
        session_start: new Date().toISOString(),
        page_views: 1,
        events_count: 1,
        referrer: properties.referrer,
        utm_source: properties.utm_source,
        utm_medium: properties.utm_medium,
        utm_campaign: properties.utm_campaign,
        device_type: getDeviceType(properties.user_agent || ''),
        browser: getBrowser(properties.user_agent || ''),
        os: getOS(properties.user_agent || ''),
        country: properties.country,
        city: properties.city
      };

      await supabase
        .from('user_sessions')
        .insert({ id: sessionId, ...session });
    }
  } catch (error) {
    logger.error('Error updating session', error as Error, 'ANALYTICS', { sessionId });
  }
}

function getDeviceType(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) return 'mobile';
  if (/Tablet|iPad/.test(userAgent)) return 'tablet';
  return 'desktop';
}

function getBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}
