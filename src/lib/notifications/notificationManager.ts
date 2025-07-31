// Production notification management system
import { getAuthHeaders } from '@/lib/auth/authUtils';

export interface NotificationPreferences {
  userId: string;
  email: {
    enabled: boolean;
    processingStart: boolean;
    processingComplete: boolean;
    processingError: boolean;
    marketingUpdates: boolean;
  };
  browser: {
    enabled: boolean;
    processingComplete: boolean;
    processingError: boolean;
  };
  sms: {
    enabled: boolean;
    phoneNumber?: string;
    processingComplete: boolean;
    processingError: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  type: 'email' | 'browser' | 'sms';
  event: 'processing_start' | 'processing_complete' | 'processing_error' | 'marketing';
  subject?: string;
  title: string;
  body: string;
  htmlBody?: string;
  variables: string[];
  isActive: boolean;
}

export interface NotificationDelivery {
  id: string;
  userId: string;
  type: 'email' | 'browser' | 'sms';
  event: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'clicked';
  recipient: string;
  content: {
    subject?: string;
    title: string;
    body: string;
  };
  metadata: Record<string, any>;
  sentAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  createdAt: string;
}

class NotificationManager {
  private baseUrl: string;
  private resendApiKey: string;
  private twilioConfig: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
    this.resendApiKey = process.env.RESEND_API_KEY || '';
    this.twilioConfig = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    };
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    return await getAuthHeaders();
  }

  // Get user notification preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/notifications/preferences/${userId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch preferences: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  // Update user notification preferences
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/notifications/preferences/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(preferences),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  // Send email notification via Resend
  async sendEmailNotification(
    userId: string,
    templateId: string,
    variables: Record<string, any> = {}
  ): Promise<string | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/notifications/email/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          templateId,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }

      const result = await response.json();
      return result.messageId;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return null;
    }
  }

  // Send browser notification
  async sendBrowserNotification(
    title: string,
    body: string,
    options: NotificationOptions = {}
  ): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return false;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Browser notification permission not granted');
      return false;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'coolpix-processing',
        requireInteraction: true,
        ...options,
      });

      // Track notification interaction
      notification.onclick = () => {
        if (typeof window !== 'undefined') {
          window.focus();
        }
        notification.close();
        
        // Track click analytics
        this.trackNotificationInteraction('browser', 'click', {
          title,
          body,
          timestamp: new Date().toISOString(),
        });
      };

      notification.onshow = () => {
        this.trackNotificationInteraction('browser', 'show', {
          title,
          body,
          timestamp: new Date().toISOString(),
        });
      };

      return true;
    } catch (error) {
      console.error('Error sending browser notification:', error);
      return false;
    }
  }

  // Send SMS notification via Twilio
  async sendSMSNotification(
    userId: string,
    phoneNumber: string,
    message: string
  ): Promise<string | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/notifications/sms/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          phoneNumber,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send SMS: ${response.statusText}`);
      }

      const result = await response.json();
      return result.messageSid;
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      return null;
    }
  }

  // Request browser notification permission
  async requestBrowserPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      
      // Track permission result
      this.trackNotificationInteraction('browser', 'permission_request', {
        result: permission,
        timestamp: new Date().toISOString(),
      });

      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Send processing complete notification
  async sendProcessingCompleteNotification(
    userId: string,
    sessionId: string,
    processingTime: number
  ): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId);
    if (!preferences) return;

    const variables = {
      sessionId,
      processingTime: this.formatProcessingTime(processingTime),
      completedAt: new Date().toLocaleString(),
      dashboardUrl: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '/dashboard',
    };

    // Send email notification
    if (preferences.email.enabled && preferences.email.processingComplete) {
      await this.sendEmailNotification(userId, 'processing_complete', variables);
    }

    // Send browser notification
    if (preferences.browser.enabled && preferences.browser.processingComplete) {
      await this.sendBrowserNotification(
        '🎉 Your AI Headshots are Ready!',
        `Processing completed in ${variables.processingTime}. Click to view your results.`,
        {
          data: { sessionId, url: variables.dashboardUrl },
        }
      );
    }

    // Send SMS notification (premium feature)
    if (preferences.sms.enabled && preferences.sms.processingComplete && preferences.sms.phoneNumber) {
      const message = `🎉 Your CoolPix AI headshots are ready! Processing completed in ${variables.processingTime}. View them at: ${variables.dashboardUrl}`;
      await this.sendSMSNotification(userId, preferences.sms.phoneNumber, message);
    }
  }

  // Send processing error notification
  async sendProcessingErrorNotification(
    userId: string,
    sessionId: string,
    errorMessage: string
  ): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId);
    if (!preferences) return;

    const variables = {
      sessionId,
      errorMessage,
      supportUrl: typeof window !== 'undefined' ? `${window.location.origin}/support` : '/support',
      timestamp: new Date().toLocaleString(),
    };

    // Send email notification
    if (preferences.email.enabled && preferences.email.processingError) {
      await this.sendEmailNotification(userId, 'processing_error', variables);
    }

    // Send browser notification
    if (preferences.browser.enabled && preferences.browser.processingError) {
      await this.sendBrowserNotification(
        '⚠️ Processing Issue',
        'There was an issue with your headshot processing. Click for details.',
        {
          data: { sessionId, url: variables.supportUrl },
        }
      );
    }

    // Send SMS notification (premium feature)
    if (preferences.sms.enabled && preferences.sms.processingError && preferences.sms.phoneNumber) {
      const message = `⚠️ CoolPix processing issue for session ${sessionId}. Please check your email or visit ${variables.supportUrl} for assistance.`;
      await this.sendSMSNotification(userId, preferences.sms.phoneNumber, message);
    }
  }

  // Track notification interactions for analytics
  private async trackNotificationInteraction(
    type: 'email' | 'browser' | 'sms',
    action: string,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      await fetch(`${this.baseUrl}/notifications/analytics`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type,
          action,
          metadata,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error tracking notification interaction:', error);
    }
  }

  // Get notification delivery history
  async getNotificationHistory(
    userId: string,
    limit = 50
  ): Promise<NotificationDelivery[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/notifications/history/${userId}?limit=${limit}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch notification history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }
  }

  // Utility functions
  private formatProcessingTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}

// Singleton instance
export const notificationManager = new NotificationManager();

// React hook for notifications
export const useNotifications = () => {
  return {
    getPreferences: notificationManager.getNotificationPreferences.bind(notificationManager),
    updatePreferences: notificationManager.updateNotificationPreferences.bind(notificationManager),
    sendEmail: notificationManager.sendEmailNotification.bind(notificationManager),
    sendBrowser: notificationManager.sendBrowserNotification.bind(notificationManager),
    sendSMS: notificationManager.sendSMSNotification.bind(notificationManager),
    requestPermission: notificationManager.requestBrowserPermission.bind(notificationManager),
    sendProcessingComplete: notificationManager.sendProcessingCompleteNotification.bind(notificationManager),
    sendProcessingError: notificationManager.sendProcessingErrorNotification.bind(notificationManager),
    getHistory: notificationManager.getNotificationHistory.bind(notificationManager),
  };
};
