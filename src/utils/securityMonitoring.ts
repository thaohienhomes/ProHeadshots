import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';
import crypto from 'crypto';

export interface SecurityEvent {
  id: string;
  event_type: 'login_attempt' | 'login_success' | 'login_failure' | 'password_change' | 'api_access' | 'suspicious_activity' | 'data_access' | 'permission_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  ip_address: string;
  user_agent: string;
  location?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  details: Record<string, any>;
  risk_score: number; // 0-100
  blocked: boolean;
  timestamp: string;
}

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  rule_type: 'rate_limit' | 'geo_blocking' | 'device_fingerprint' | 'behavioral_analysis';
  conditions: Record<string, any>;
  actions: ('log' | 'block' | 'alert' | 'require_mfa')[];
  is_active: boolean;
  created_at: string;
}

export interface ThreatIntelligence {
  ip_address: string;
  threat_type: 'malware' | 'botnet' | 'tor' | 'vpn' | 'proxy' | 'scanner' | 'spam';
  confidence: number; // 0-100
  last_seen: string;
  source: string;
}

export interface SecurityAlert {
  id: string;
  alert_type: 'brute_force' | 'account_takeover' | 'data_breach' | 'suspicious_login' | 'api_abuse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  description: string;
  evidence: SecurityEvent[];
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assigned_to?: string;
  created_at: string;
  resolved_at?: string;
}

/**
 * Log security event and analyze for threats
 */
export async function logSecurityEvent(
  eventType: SecurityEvent['event_type'],
  ipAddress: string,
  userAgent: string,
  details: Record<string, any>,
  userId?: string
): Promise<{ blocked: boolean; riskScore: number; alertId?: string }> {
  try {
    const supabase = await createClient();
    
    // Calculate risk score
    const riskScore = await calculateRiskScore(eventType, ipAddress, userAgent, details, userId);
    
    // Determine severity based on risk score
    let severity: SecurityEvent['severity'] = 'low';
    if (riskScore >= 80) severity = 'critical';
    else if (riskScore >= 60) severity = 'high';
    else if (riskScore >= 40) severity = 'medium';
    
    // Check if event should be blocked
    const blocked = await shouldBlockEvent(eventType, ipAddress, riskScore, userId);
    
    // Get location data (mock implementation)
    const location = await getLocationFromIP(ipAddress);
    
    const securityEvent: Omit<SecurityEvent, 'id'> = {
      event_type: eventType,
      severity,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      location,
      details,
      risk_score: riskScore,
      blocked,
      timestamp: new Date().toISOString()
    };

    const { data: newEvent, error } = await supabase
      .from('security_events')
      .insert(securityEvent)
      .select()
      .single();

    if (error) throw error;

    // Check for security patterns and create alerts
    const alertId = await checkForSecurityAlerts(newEvent);

    logger.info('Security event logged', 'SECURITY', {
      eventType,
      riskScore,
      blocked,
      userId,
      ipAddress: ipAddress.substring(0, 8) + '***' // Partial IP for privacy
    });

    return { blocked, riskScore, alertId };

  } catch (error) {
    logger.error('Error logging security event', error as Error, 'SECURITY', { eventType, userId });
    return { blocked: false, riskScore: 0 };
  }
}

/**
 * Calculate risk score for an event
 */
async function calculateRiskScore(
  eventType: SecurityEvent['event_type'],
  ipAddress: string,
  userAgent: string,
  details: Record<string, any>,
  userId?: string
): Promise<number> {
  let riskScore = 0;
  
  // Base risk by event type
  const eventRisks = {
    'login_failure': 20,
    'login_attempt': 10,
    'login_success': 5,
    'password_change': 30,
    'api_access': 15,
    'suspicious_activity': 50,
    'data_access': 25,
    'permission_change': 40
  };
  
  riskScore += eventRisks[eventType] || 0;
  
  // Check threat intelligence
  const threatInfo = await checkThreatIntelligence(ipAddress);
  if (threatInfo) {
    riskScore += threatInfo.confidence * 0.5;
  }
  
  // Check for unusual location
  if (userId) {
    const isUnusualLocation = await checkUnusualLocation(userId, ipAddress);
    if (isUnusualLocation) {
      riskScore += 25;
    }
  }
  
  // Check for rapid requests (rate limiting)
  const recentEvents = await getRecentEvents(ipAddress, 5); // Last 5 minutes
  if (recentEvents.length > 10) {
    riskScore += 30;
  }
  
  // Check for unusual user agent
  if (isUnusualUserAgent(userAgent)) {
    riskScore += 15;
  }
  
  // Check for failed login attempts
  if (eventType === 'login_failure' && userId) {
    const failedAttempts = await getFailedLoginAttempts(userId, 15); // Last 15 minutes
    riskScore += failedAttempts * 10;
  }
  
  return Math.min(riskScore, 100);
}

/**
 * Check if event should be blocked
 */
async function shouldBlockEvent(
  eventType: SecurityEvent['event_type'],
  ipAddress: string,
  riskScore: number,
  userId?: string
): Promise<boolean> {
  // Block high-risk events
  if (riskScore >= 80) {
    return true;
  }
  
  // Check security rules
  const supabase = await createClient();
  const { data: rules } = await supabase
    .from('security_rules')
    .select('*')
    .eq('is_active', true);

  if (rules) {
    for (const rule of rules) {
      if (await evaluateSecurityRule(rule, eventType, ipAddress, riskScore, userId)) {
        if (rule.actions.includes('block')) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Check for security alert patterns
 */
async function checkForSecurityAlerts(event: SecurityEvent): Promise<string | undefined> {
  const supabase = await createClient();
  
  // Check for brute force attacks
  if (event.event_type === 'login_failure' && event.user_id) {
    const recentFailures = await getFailedLoginAttempts(event.user_id, 30);
    if (recentFailures >= 5) {
      return await createSecurityAlert(
        'brute_force',
        'high',
        `Multiple failed login attempts detected for user`,
        [event],
        event.user_id
      );
    }
  }
  
  // Check for suspicious API usage
  if (event.event_type === 'api_access' && event.risk_score >= 60) {
    const recentAPIEvents = await getRecentEvents(event.ip_address, 10);
    const apiEvents = recentAPIEvents.filter(e => e.event_type === 'api_access');
    if (apiEvents.length >= 20) {
      return await createSecurityAlert(
        'api_abuse',
        'medium',
        `Suspicious API usage pattern detected`,
        [event, ...apiEvents.slice(0, 5)]
      );
    }
  }
  
  // Check for account takeover indicators
  if (event.event_type === 'login_success' && event.risk_score >= 70) {
    return await createSecurityAlert(
      'account_takeover',
      'high',
      `Suspicious login detected with high risk score`,
      [event],
      event.user_id
    );
  }
  
  return undefined;
}

/**
 * Create security alert
 */
async function createSecurityAlert(
  alertType: SecurityAlert['alert_type'],
  severity: SecurityAlert['severity'],
  description: string,
  evidence: SecurityEvent[],
  userId?: string
): Promise<string> {
  const supabase = await createClient();
  
  const alert: Omit<SecurityAlert, 'id' | 'created_at'> = {
    alert_type: alertType,
    severity,
    user_id: userId,
    description,
    evidence,
    status: 'open'
  };

  const { data: newAlert, error } = await supabase
    .from('security_alerts')
    .insert(alert)
    .select()
    .single();

  if (error) {
    logger.error('Error creating security alert', error, 'SECURITY', { alertType, severity });
    throw error;
  }

  logger.warn('Security alert created', 'SECURITY', {
    alertId: newAlert.id,
    alertType,
    severity,
    userId
  });

  return newAlert.id;
}

/**
 * Check threat intelligence for IP address
 */
async function checkThreatIntelligence(ipAddress: string): Promise<ThreatIntelligence | null> {
  try {
    const supabase = await createClient();
    
    const { data: threat } = await supabase
      .from('threat_intelligence')
      .select('*')
      .eq('ip_address', ipAddress)
      .single();

    return threat;
  } catch (error) {
    return null;
  }
}

/**
 * Check if location is unusual for user
 */
async function checkUnusualLocation(userId: string, ipAddress: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Get user's recent login locations
    const { data: recentEvents } = await supabase
      .from('security_events')
      .select('location')
      .eq('user_id', userId)
      .eq('event_type', 'login_success')
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .limit(10);

    if (!recentEvents || recentEvents.length === 0) {
      return false; // No history to compare
    }

    const currentLocation = await getLocationFromIP(ipAddress);
    if (!currentLocation) {
      return false;
    }

    // Check if current country is different from recent locations
    const recentCountries = recentEvents
      .map(e => e.location?.country)
      .filter(Boolean);

    return !recentCountries.includes(currentLocation.country);
  } catch (error) {
    return false;
  }
}

/**
 * Get recent security events
 */
async function getRecentEvents(ipAddress: string, minutes: number): Promise<SecurityEvent[]> {
  try {
    const supabase = await createClient();
    const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    
    const { data: events } = await supabase
      .from('security_events')
      .select('*')
      .eq('ip_address', ipAddress)
      .gte('timestamp', since)
      .order('timestamp', { ascending: false });

    return events || [];
  } catch (error) {
    return [];
  }
}

/**
 * Get failed login attempts for user
 */
async function getFailedLoginAttempts(userId: string, minutes: number): Promise<number> {
  try {
    const supabase = await createClient();
    const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    
    const { count } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('event_type', 'login_failure')
      .gte('timestamp', since);

    return count || 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Evaluate security rule
 */
async function evaluateSecurityRule(
  rule: SecurityRule,
  eventType: string,
  ipAddress: string,
  riskScore: number,
  userId?: string
): Promise<boolean> {
  try {
    const conditions = rule.conditions;
    
    // Check event type condition
    if (conditions.event_types && !conditions.event_types.includes(eventType)) {
      return false;
    }
    
    // Check risk score condition
    if (conditions.min_risk_score && riskScore < conditions.min_risk_score) {
      return false;
    }
    
    // Check rate limit condition
    if (conditions.max_requests_per_minute) {
      const recentEvents = await getRecentEvents(ipAddress, 1);
      if (recentEvents.length < conditions.max_requests_per_minute) {
        return false;
      }
    }
    
    // Check geo-blocking condition
    if (conditions.blocked_countries) {
      const location = await getLocationFromIP(ipAddress);
      if (location && conditions.blocked_countries.includes(location.country)) {
        return true;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if user agent is unusual
 */
function isUnusualUserAgent(userAgent: string): boolean {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Get location from IP address (mock implementation)
 */
async function getLocationFromIP(ipAddress: string): Promise<SecurityEvent['location'] | null> {
  // In production, use a real geolocation service like MaxMind or IPinfo
  // This is a mock implementation
  const mockLocations = [
    { country: 'US', city: 'New York', latitude: 40.7128, longitude: -74.0060 },
    { country: 'UK', city: 'London', latitude: 51.5074, longitude: -0.1278 },
    { country: 'DE', city: 'Berlin', latitude: 52.5200, longitude: 13.4050 },
    { country: 'JP', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503 }
  ];
  
  // Return a random location for demo purposes
  return mockLocations[Math.floor(Math.random() * mockLocations.length)];
}

/**
 * Database schema for security monitoring (run in Supabase SQL editor)
 */
export const createSecurityMonitoringTables = `
-- Create security_events table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('login_attempt', 'login_success', 'login_failure', 'password_change', 'api_access', 'suspicious_activity', 'data_access', 'permission_change')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET NOT NULL,
  user_agent TEXT NOT NULL,
  location JSONB,
  details JSONB DEFAULT '{}',
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  blocked BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create security_rules table
CREATE TABLE IF NOT EXISTS security_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('rate_limit', 'geo_blocking', 'device_fingerprint', 'behavioral_analysis')),
  conditions JSONB NOT NULL DEFAULT '{}',
  actions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create threat_intelligence table
CREATE TABLE IF NOT EXISTS threat_intelligence (
  ip_address INET PRIMARY KEY,
  threat_type TEXT NOT NULL CHECK (threat_type IN ('malware', 'botnet', 'tor', 'vpn', 'proxy', 'scanner', 'spam')),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT NOT NULL
);

-- Create security_alerts table
CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('brute_force', 'account_takeover', 'data_breach', 'suspicious_login', 'api_abuse')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '[]',
  status TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON security_events(risk_score);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_ip ON threat_intelligence(ip_address);

-- Enable RLS
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin only for security data)
CREATE POLICY "Admin can manage security events" ON security_events
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage security rules" ON security_rules
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can view threat intelligence" ON threat_intelligence
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage security alerts" ON security_alerts
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
`;
