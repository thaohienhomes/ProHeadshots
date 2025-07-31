import crypto from 'crypto';
import { logger } from './logger';

export interface WebhookValidationResult {
  isValid: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export class WebhookSecurity {
  private static readonly MAX_TIMESTAMP_DIFF = 5 * 60 * 1000; // 5 minutes
  private static readonly REPLAY_CACHE = new Map<string, number>();
  private static readonly CACHE_CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

  static {
    // Cleanup replay cache periodically
    setInterval(() => {
      const now = Date.now();
      for (const [key, timestamp] of this.REPLAY_CACHE.entries()) {
        if (now - timestamp > this.MAX_TIMESTAMP_DIFF) {
          this.REPLAY_CACHE.delete(key);
        }
      }
    }, this.CACHE_CLEANUP_INTERVAL);
  }

  /**
   * Validate Polar webhook signature and prevent replay attacks
   */
  static validatePolarWebhook(
    payload: string,
    signature: string,
    timestamp: string,
    secret: string
  ): WebhookValidationResult {
    try {
      // 1. Validate timestamp to prevent replay attacks
      const timestampMs = parseInt(timestamp) * 1000;
      const now = Date.now();
      
      if (Math.abs(now - timestampMs) > this.MAX_TIMESTAMP_DIFF) {
        logger.warn('Webhook timestamp too old or too far in future', 'WEBHOOK_SECURITY', {
          timestamp: timestampMs,
          now,
          diff: Math.abs(now - timestampMs)
        });
        return { isValid: false, error: 'Invalid timestamp' };
      }

      // 2. Check for replay attacks
      const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
      const replayKey = `${payloadHash}-${timestamp}`;
      
      if (this.REPLAY_CACHE.has(replayKey)) {
        logger.warn('Potential replay attack detected', 'WEBHOOK_SECURITY', {
          payloadHash,
          timestamp
        });
        return { isValid: false, error: 'Replay attack detected' };
      }

      // 3. Validate signature
      const expectedSignature = this.generatePolarSignature(payload, timestamp, secret);
      
      if (!this.timingSafeEqual(signature, expectedSignature)) {
        logger.warn('Invalid webhook signature', 'WEBHOOK_SECURITY', {
          provided: signature.substring(0, 10) + '...',
          expected: expectedSignature.substring(0, 10) + '...'
        });
        return { isValid: false, error: 'Invalid signature' };
      }

      // 4. Store in replay cache
      this.REPLAY_CACHE.set(replayKey, now);

      logger.info('Webhook validation successful', 'WEBHOOK_SECURITY', {
        payloadSize: payload.length,
        timestamp: timestampMs
      });

      return { 
        isValid: true, 
        metadata: { 
          timestamp: timestampMs,
          payloadSize: payload.length 
        } 
      };

    } catch (error) {
      logger.error('Webhook validation error', error as Error, 'WEBHOOK_SECURITY');
      return { isValid: false, error: 'Validation error' };
    }
  }

  /**
   * Generate Polar webhook signature
   */
  private static generatePolarSignature(payload: string, timestamp: string, secret: string): string {
    const signedPayload = `${timestamp}.${payload}`;
    return crypto
      .createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex');
  }

  /**
   * Timing-safe string comparison to prevent timing attacks
   */
  private static timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Rate limiting for webhook endpoints
   */
  static checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // This is a simple in-memory rate limiter
    // In production, you'd want to use Redis or similar
    const key = `rate_limit_${identifier}`;
    const requests = this.getRateLimitData(key, windowStart);
    
    if (requests.length >= maxRequests) {
      logger.warn('Rate limit exceeded for webhook', 'WEBHOOK_SECURITY', {
        identifier,
        requests: requests.length,
        maxRequests
      });
      return false;
    }

    this.addRateLimitEntry(key, now);
    return true;
  }

  private static rateLimitCache = new Map<string, number[]>();

  private static getRateLimitData(key: string, windowStart: number): number[] {
    const data = this.rateLimitCache.get(key) || [];
    // Filter out old entries
    const filtered = data.filter(timestamp => timestamp > windowStart);
    this.rateLimitCache.set(key, filtered);
    return filtered;
  }

  private static addRateLimitEntry(key: string, timestamp: number): void {
    const data = this.rateLimitCache.get(key) || [];
    data.push(timestamp);
    this.rateLimitCache.set(key, data);
  }

  /**
   * Sanitize webhook payload to prevent injection attacks
   */
  static sanitizePayload(payload: any): any {
    if (typeof payload !== 'object' || payload === null) {
      return payload;
    }

    const sanitized: any = Array.isArray(payload) ? [] : {};

    for (const [key, value] of Object.entries(payload)) {
      // Sanitize key
      const cleanKey = key.replace(/[<>\"'&]/g, '');
      
      if (typeof value === 'string') {
        // Basic XSS prevention
        sanitized[cleanKey] = value
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/&/g, '&amp;');
      } else if (typeof value === 'object' && value !== null) {
        sanitized[cleanKey] = this.sanitizePayload(value);
      } else {
        sanitized[cleanKey] = value;
      }
    }

    return sanitized;
  }

  /**
   * Log security events for monitoring
   */
  static logSecurityEvent(event: string, details: Record<string, any>, severity: 'low' | 'medium' | 'high' = 'medium'): void {
    logger.warn(`Security Event: ${event}`, 'WEBHOOK_SECURITY', {
      severity,
      timestamp: new Date().toISOString(),
      ...details
    });

    // In production, you might want to send alerts for high severity events
    if (severity === 'high') {
      // Send alert to monitoring system
      this.sendSecurityAlert(event, details);
    }
  }

  private static sendSecurityAlert(event: string, details: Record<string, any>): void {
    // Implement your alerting logic here
    // This could send to Slack, email, PagerDuty, etc.
    console.error(`🚨 HIGH SEVERITY SECURITY EVENT: ${event}`, details);
  }
}
