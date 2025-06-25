import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';
import { sendEmail, sendSimpleEmail } from '@/action/sendEmail';
import { sendWelcomeEmail } from '../action/emailActions';

export interface EmailSubscriber {
  id: string;
  email: string;
  user_id?: string;
  status: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';
  source: 'signup' | 'newsletter' | 'referral' | 'manual';
  tags: string[];
  subscribed_at: string;
  unsubscribed_at?: string;
  last_email_sent?: string;
  email_count: number;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_id?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  target_audience: 'all' | 'new_users' | 'paid_users' | 'inactive_users' | 'custom';
  tags_filter?: string[];
  scheduled_at?: string;
  sent_at?: string;
  recipients_count: number;
  opened_count: number;
  clicked_count: number;
  unsubscribed_count: number;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  template_type: 'welcome' | 'onboarding' | 'newsletter' | 'promotional' | 'transactional';
  variables: string[];
  is_active: boolean;
  created_at: string;
}

/**
 * Subscribe user to email list
 */
export async function subscribeToNewsletter(
  email: string,
  userId?: string,
  source: string = 'newsletter',
  tags: string[] = []
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Check if email already exists
    const { data: existing } = await supabase
      .from('email_subscribers')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.status === 'unsubscribed') {
        // Resubscribe
        const { error } = await supabase
          .from('email_subscribers')
          .update({
            status: 'subscribed',
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
            tags: Array.from(new Set([...existing.tags, ...tags]))
          })
          .eq('id', existing.id);

        if (error) throw error;
        
        logger.info('User resubscribed to newsletter', 'EMAIL_MARKETING', { email, userId });
      }
      return { success: true };
    }

    // Create new subscription
    const subscriber: Omit<EmailSubscriber, 'id'> = {
      email: email.toLowerCase(),
      user_id: userId,
      status: 'subscribed',
      source: source as EmailSubscriber['source'],
      tags,
      subscribed_at: new Date().toISOString(),
      email_count: 0
    };

    const { error } = await supabase
      .from('email_subscribers')
      .insert(subscriber);

    if (error) throw error;

    // Send welcome email
    await sendWelcomeEmail(email);

    logger.info('User subscribed to newsletter', 'EMAIL_MARKETING', { email, userId, source });
    return { success: true };

  } catch (error) {
    logger.error('Error subscribing to newsletter', error as Error, 'EMAIL_MARKETING', { email, userId });
    return { success: false, error: 'Failed to subscribe to newsletter' };
  }
}

/**
 * Unsubscribe user from email list
 */
export async function unsubscribeFromNewsletter(
  email: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('email_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase());

    if (error) throw error;

    logger.info('User unsubscribed from newsletter', 'EMAIL_MARKETING', { email, reason });
    return { success: true };

  } catch (error) {
    logger.error('Error unsubscribing from newsletter', error as Error, 'EMAIL_MARKETING', { email });
    return { success: false, error: 'Failed to unsubscribe from newsletter' };
  }
}

/**
 * Send welcome email to new subscriber using new template system
 */
export async function sendWelcomeEmailToSubscriber(email: string, firstName: string = 'there'): Promise<void> {
  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/dashboard`;

    // Use the new template system
    const result = await sendWelcomeEmail({
      firstName,
      email,
      dashboardUrl
    });

    if (!result.success) {
      // Fallback to simple email if template fails
      await sendSimpleEmail({
        to: email,
        from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
        subject: 'Welcome to ProHeadshots!',
        html: `
          <h1>Welcome to ProHeadshots!</h1>
          <p>Thank you for subscribing to our newsletter. We're excited to help you create amazing professional headshots!</p>
          <p>Get started by visiting <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}">coolpix.me</a></p>
          <p>Best regards,<br>The ProHeadshots Team</p>
        `
      });
    }
  } catch (error) {
    logger.error('Error sending welcome email', error as Error, 'EMAIL_MARKETING', { email });
  }
}

/**
 * Create email campaign
 */
export async function createEmailCampaign(
  name: string,
  subject: string,
  content: string,
  targetAudience: EmailCampaign['target_audience'],
  tagsFilter?: string[],
  scheduledAt?: string
): Promise<{ success: boolean; campaignId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Get recipients count
    const recipientsCount = await getRecipientsCount(targetAudience, tagsFilter);
    
    const campaign: Omit<EmailCampaign, 'id' | 'created_at'> = {
      name,
      subject,
      content,
      status: scheduledAt ? 'scheduled' : 'draft',
      target_audience: targetAudience,
      tags_filter: tagsFilter,
      scheduled_at: scheduledAt,
      recipients_count: recipientsCount,
      opened_count: 0,
      clicked_count: 0,
      unsubscribed_count: 0
    };

    const { data, error } = await supabase
      .from('email_campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) throw error;

    logger.info('Email campaign created', 'EMAIL_MARKETING', { 
      campaignId: data.id, 
      name, 
      recipientsCount 
    });

    return { success: true, campaignId: data.id };

  } catch (error) {
    logger.error('Error creating email campaign', error as Error, 'EMAIL_MARKETING', { name });
    return { success: false, error: 'Failed to create email campaign' };
  }
}

/**
 * Send email campaign
 */
export async function sendEmailCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new Error('Campaign cannot be sent in current status');
    }

    // Get recipients
    const recipients = await getEmailRecipients(campaign.target_audience, campaign.tags_filter);
    
    // Update campaign status
    await supabase
      .from('email_campaigns')
      .update({
        status: 'sending',
        sent_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    // Send emails (in production, use a queue system)
    let sentCount = 0;
    for (const recipient of recipients) {
      try {
        await sendSimpleEmail({
          to: recipient.email,
          from: process.env.NOREPLY_EMAIL || 'noreply@cvphoto.app',
          subject: campaign.subject,
          html: campaign.content
        });
        
        sentCount++;
        
        // Update subscriber email count
        await supabase
          .from('email_subscribers')
          .update({
            email_count: recipient.email_count + 1,
            last_email_sent: new Date().toISOString()
          })
          .eq('id', recipient.id);

      } catch (error) {
        logger.error('Error sending email to recipient', error as Error, 'EMAIL_MARKETING', {
          campaignId,
          recipientEmail: recipient.email
        });
      }
    }

    // Update campaign status
    await supabase
      .from('email_campaigns')
      .update({
        status: 'sent',
        recipients_count: sentCount
      })
      .eq('id', campaignId);

    logger.info('Email campaign sent', 'EMAIL_MARKETING', { 
      campaignId, 
      sentCount, 
      totalRecipients: recipients.length 
    });

    return { success: true };

  } catch (error) {
    logger.error('Error sending email campaign', error as Error, 'EMAIL_MARKETING', { campaignId });
    return { success: false, error: 'Failed to send email campaign' };
  }
}

/**
 * Get email recipients based on audience and filters
 */
async function getEmailRecipients(
  targetAudience: EmailCampaign['target_audience'],
  tagsFilter?: string[]
): Promise<EmailSubscriber[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('email_subscribers')
    .select('*')
    .eq('status', 'subscribed');

  // Apply audience filters
  switch (targetAudience) {
    case 'new_users':
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('subscribed_at', sevenDaysAgo);
      break;
    
    case 'paid_users':
      query = query.contains('tags', ['paid']);
      break;
    
    case 'inactive_users':
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.or(`last_email_sent.is.null,last_email_sent.lt.${thirtyDaysAgo}`);
      break;
  }

  // Apply tags filter
  if (tagsFilter && tagsFilter.length > 0) {
    query = query.overlaps('tags', tagsFilter);
  }

  const { data: recipients } = await query;
  return recipients || [];
}

/**
 * Get recipients count for campaign planning
 */
async function getRecipientsCount(
  targetAudience: EmailCampaign['target_audience'],
  tagsFilter?: string[]
): Promise<number> {
  const recipients = await getEmailRecipients(targetAudience, tagsFilter);
  return recipients.length;
}

/**
 * Get email template by type
 */
async function getEmailTemplate(templateType: string): Promise<EmailTemplate | null> {
  try {
    const supabase = await createClient();
    
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', templateType)
      .eq('is_active', true)
      .single();

    return template;
  } catch (error) {
    logger.error('Error getting email template', error as Error, 'EMAIL_MARKETING', { templateType });
    return null;
  }
}

/**
 * Track email engagement
 */
export async function trackEmailEngagement(
  campaignId: string,
  email: string,
  action: 'opened' | 'clicked' | 'unsubscribed'
): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Update campaign metrics
    const updateField = `${action}_count`;
    await supabase.rpc('increment_campaign_metric', {
      campaign_id: campaignId,
      metric_field: updateField
    });

    // Log engagement event
    await supabase
      .from('email_engagement')
      .insert({
        campaign_id: campaignId,
        email,
        action,
        timestamp: new Date().toISOString()
      });

    logger.info('Email engagement tracked', 'EMAIL_MARKETING', { campaignId, email, action });

  } catch (error) {
    logger.error('Error tracking email engagement', error as Error, 'EMAIL_MARKETING', { 
      campaignId, 
      email, 
      action 
    });
  }
}

/**
 * Database schema for email marketing (run in Supabase SQL editor)
 */
export const createEmailMarketingTables = `
-- Create email_subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('subscribed', 'unsubscribed', 'bounced', 'complained')),
  source TEXT NOT NULL CHECK (source IN ('signup', 'newsletter', 'referral', 'manual')),
  tags TEXT[] DEFAULT '{}',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  last_email_sent TIMESTAMP WITH TIME ZONE,
  email_count INTEGER DEFAULT 0
);

-- Create email_campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_id UUID,
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused')),
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'new_users', 'paid_users', 'inactive_users', 'custom')),
  tags_filter TEXT[],
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipients_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('welcome', 'onboarding', 'newsletter', 'promotional', 'transactional')),
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_engagement table
CREATE TABLE IF NOT EXISTS email_engagement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('opened', 'clicked', 'unsubscribed')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_tags ON email_subscribers USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_engagement_campaign_id ON email_engagement(campaign_id);

-- Enable RLS
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_engagement ENABLE ROW LEVEL SECURITY;

-- Function to increment campaign metrics
CREATE OR REPLACE FUNCTION increment_campaign_metric(campaign_id UUID, metric_field TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE email_campaigns SET %I = %I + 1 WHERE id = $1', metric_field, metric_field)
  USING campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;
