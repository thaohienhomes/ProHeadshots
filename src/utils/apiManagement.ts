import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';
import crypto from 'crypto';

export interface APIKey {
  id: string;
  organization_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  permissions: string[];
  rate_limit: number; // requests per minute
  is_active: boolean;
  last_used_at?: string;
  usage_count: number;
  expires_at?: string;
  created_by: string;
  created_at: string;
}

export interface WebhookEndpoint {
  id: string;
  organization_id: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  retry_count: number;
  last_success_at?: string;
  last_failure_at?: string;
  failure_count: number;
  created_at: string;
}

export interface APIUsage {
  id: string;
  api_key_id: string;
  organization_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time: number;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, any>;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  last_attempt_at?: string;
  delivered_at?: string;
  error_message?: string;
  created_at: string;
}

/**
 * Generate a new API key for an organization
 */
export async function generateAPIKey(
  organizationId: string,
  name: string,
  permissions: string[],
  createdBy: string,
  rateLimit: number = 1000,
  expiresAt?: string
): Promise<{ success: boolean; apiKey?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Generate API key
    const apiKey = generateSecureAPIKey();
    const keyHash = hashAPIKey(apiKey);
    const keyPrefix = apiKey.substring(0, 8);

    const newAPIKey: Omit<APIKey, 'id' | 'created_at'> = {
      organization_id: organizationId,
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      permissions,
      rate_limit: rateLimit,
      is_active: true,
      usage_count: 0,
      expires_at: expiresAt,
      created_by: createdBy
    };

    const { error } = await supabase
      .from('api_keys')
      .insert(newAPIKey);

    if (error) throw error;

    logger.info('API key generated', 'API_MANAGEMENT', {
      organizationId,
      name,
      permissions,
      createdBy
    });

    return { success: true, apiKey };

  } catch (error) {
    logger.error('Error generating API key', error as Error, 'API_MANAGEMENT', {
      organizationId,
      name,
      createdBy
    });
    return { success: false, error: 'Failed to generate API key' };
  }
}

/**
 * Validate API key and check permissions
 */
export async function validateAPIKey(
  apiKey: string,
  requiredPermission?: string
): Promise<{
  valid: boolean;
  organizationId?: string;
  keyId?: string;
  permissions?: string[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    
    const keyHash = hashAPIKey(apiKey);
    
    const { data: apiKeyData, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single();

    if (error || !apiKeyData) {
      return { valid: false, error: 'Invalid API key' };
    }

    // Check if key has expired
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return { valid: false, error: 'API key has expired' };
    }

    // Check permission if required
    if (requiredPermission && !apiKeyData.permissions.includes(requiredPermission) && !apiKeyData.permissions.includes('*')) {
      return { valid: false, error: 'Insufficient permissions' };
    }

    // Update last used timestamp and usage count
    await supabase
      .from('api_keys')
      .update({
        last_used_at: new Date().toISOString(),
        usage_count: apiKeyData.usage_count + 1
      })
      .eq('id', apiKeyData.id);

    return {
      valid: true,
      organizationId: apiKeyData.organization_id,
      keyId: apiKeyData.id,
      permissions: apiKeyData.permissions
    };

  } catch (error) {
    logger.error('Error validating API key', error as Error, 'API_MANAGEMENT');
    return { valid: false, error: 'Error validating API key' };
  }
}

/**
 * Track API usage
 */
export async function trackAPIUsage(
  apiKeyId: string,
  organizationId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const supabase = await createClient();
    
    const usage: Omit<APIUsage, 'id'> = {
      api_key_id: apiKeyId,
      organization_id: organizationId,
      endpoint,
      method,
      status_code: statusCode,
      response_time: responseTime,
      timestamp: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent
    };

    await supabase
      .from('api_usage')
      .insert(usage);

  } catch (error) {
    logger.error('Error tracking API usage', error as Error, 'API_MANAGEMENT', {
      apiKeyId,
      organizationId,
      endpoint
    });
  }
}

/**
 * Create webhook endpoint
 */
export async function createWebhookEndpoint(
  organizationId: string,
  url: string,
  events: string[]
): Promise<{ success: boolean; webhookId?: string; secret?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Validate URL
    try {
      new URL(url);
    } catch {
      return { success: false, error: 'Invalid webhook URL' };
    }

    // Generate webhook secret
    const secret = generateWebhookSecret();

    const webhook: Omit<WebhookEndpoint, 'id' | 'created_at'> = {
      organization_id: organizationId,
      url,
      events,
      secret,
      is_active: true,
      retry_count: 3,
      failure_count: 0
    };

    const { data: newWebhook, error } = await supabase
      .from('webhook_endpoints')
      .insert(webhook)
      .select()
      .single();

    if (error) throw error;

    logger.info('Webhook endpoint created', 'API_MANAGEMENT', {
      organizationId,
      url,
      events,
      webhookId: newWebhook.id
    });

    return { success: true, webhookId: newWebhook.id, secret };

  } catch (error) {
    logger.error('Error creating webhook endpoint', error as Error, 'API_MANAGEMENT', {
      organizationId,
      url,
      events
    });
    return { success: false, error: 'Failed to create webhook endpoint' };
  }
}

/**
 * Send webhook event
 */
export async function sendWebhookEvent(
  organizationId: string,
  eventType: string,
  payload: Record<string, any>
): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Get active webhooks for this organization and event type
    const { data: webhooks, error } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .contains('events', [eventType]);

    if (error || !webhooks || webhooks.length === 0) {
      return;
    }

    // Create delivery records and send webhooks
    for (const webhook of webhooks) {
      const delivery: Omit<WebhookDelivery, 'id' | 'created_at'> = {
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        status: 'pending',
        attempts: 0
      };

      const { data: newDelivery, error: deliveryError } = await supabase
        .from('webhook_deliveries')
        .insert(delivery)
        .select()
        .single();

      if (deliveryError) {
        logger.error('Error creating webhook delivery', deliveryError, 'API_MANAGEMENT', {
          webhookId: webhook.id,
          eventType
        });
        continue;
      }

      // Send webhook asynchronously
      deliverWebhook(newDelivery.id, webhook, payload);
    }

  } catch (error) {
    logger.error('Error sending webhook event', error as Error, 'API_MANAGEMENT', {
      organizationId,
      eventType
    });
  }
}

/**
 * Deliver webhook with retries
 */
async function deliverWebhook(
  deliveryId: string,
  webhook: WebhookEndpoint,
  payload: Record<string, any>
): Promise<void> {
  const supabase = await createClient();
  
  try {
    // Generate signature
    const signature = generateWebhookSignature(payload, webhook.secret);
    
    // Send HTTP request
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CVPhoto-Signature': signature,
        'X-CVPhoto-Event': payload.event_type,
        'User-Agent': 'CVPhoto-Webhooks/1.0'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (response.ok) {
      // Success
      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          attempts: 1
        })
        .eq('id', deliveryId);

      await supabase
        .from('webhook_endpoints')
        .update({
          last_success_at: new Date().toISOString(),
          failure_count: 0
        })
        .eq('id', webhook.id);

      logger.info('Webhook delivered successfully', 'API_MANAGEMENT', {
        deliveryId,
        webhookId: webhook.id,
        statusCode: response.status
      });

    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

  } catch (error) {
    // Handle failure
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await supabase
      .from('webhook_deliveries')
      .update({
        status: 'failed',
        error_message: errorMessage,
        attempts: 1,
        last_attempt_at: new Date().toISOString()
      })
      .eq('id', deliveryId);

    await supabase
      .from('webhook_endpoints')
      .update({
        last_failure_at: new Date().toISOString(),
        failure_count: webhook.failure_count + 1
      })
      .eq('id', webhook.id);

    logger.error('Webhook delivery failed', error as Error, 'API_MANAGEMENT', {
      deliveryId,
      webhookId: webhook.id,
      url: webhook.url
    });

    // Schedule retry if within retry limit
    if (webhook.retry_count > 1) {
      // In production, implement exponential backoff retry logic
      setTimeout(() => {
        retryWebhookDelivery(deliveryId, webhook, payload, 1);
      }, 5000); // Retry after 5 seconds
    }
  }
}

/**
 * Retry webhook delivery
 */
async function retryWebhookDelivery(
  deliveryId: string,
  webhook: WebhookEndpoint,
  payload: Record<string, any>,
  attemptNumber: number
): Promise<void> {
  if (attemptNumber >= webhook.retry_count) {
    return;
  }

  const supabase = await createClient();
  
  try {
    const signature = generateWebhookSignature(payload, webhook.secret);
    
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CVPhoto-Signature': signature,
        'X-CVPhoto-Event': payload.event_type,
        'User-Agent': 'CVPhoto-Webhooks/1.0'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000)
    });

    if (response.ok) {
      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          attempts: attemptNumber + 1
        })
        .eq('id', deliveryId);

      logger.info('Webhook retry successful', 'API_MANAGEMENT', {
        deliveryId,
        attemptNumber: attemptNumber + 1
      });

    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

  } catch (error) {
    await supabase
      .from('webhook_deliveries')
      .update({
        status: attemptNumber + 1 >= webhook.retry_count ? 'failed' : 'retrying',
        attempts: attemptNumber + 1,
        last_attempt_at: new Date().toISOString()
      })
      .eq('id', deliveryId);

    if (attemptNumber + 1 < webhook.retry_count) {
      // Schedule next retry with exponential backoff
      const delay = Math.pow(2, attemptNumber) * 5000; // 5s, 10s, 20s, etc.
      setTimeout(() => {
        retryWebhookDelivery(deliveryId, webhook, payload, attemptNumber + 1);
      }, delay);
    }
  }
}

/**
 * Helper functions
 */
function generateSecureAPIKey(): string {
  const prefix = 'cvp_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}${randomBytes}`;
}

function hashAPIKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateWebhookSignature(payload: Record<string, any>, secret: string): string {
  const payloadString = JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
}

/**
 * Database schema for API management (run in Supabase SQL editor)
 */
export const createAPIManagementTables = `
-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,
  key_prefix TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  rate_limit INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_endpoints table
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_failure_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_usage table
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create webhook_deliveries table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'delivered', 'failed', 'retrying')),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_org_id ON webhook_endpoints(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_key_id ON api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
`;
