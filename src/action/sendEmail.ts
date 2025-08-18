'use server'

import { Resend } from 'resend';
import { logger } from '@/utils/logger';

// Check if Resend is properly configured
const isEmailConfigured = () => {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey && apiKey !== 'YOUR_RESEND_API_KEY' && apiKey.startsWith('re_');
};

// Initialize Resend client
let resend: Resend | null = null;
if (isEmailConfigured()) {
  resend = new Resend(process.env.RESEND_API_KEY as string);
}

interface EmailData {
  to: string;
  from: string;
  templateId: string;
  templateData?: Record<string, any>;
  scheduledAt?: Date;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
    path?: string; // For file paths
  }>;
}

interface SimpleEmailData {
  to: string;
  from: string;
  subject: string;
  html: string;
  scheduledAt?: Date;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
    path?: string; // For file paths
  }>;
}

//Template ID
export async function sendEmail({ to, from, templateId, templateData, scheduledAt, attachments }: EmailData) {
  // Check if email is configured
  if (!isEmailConfigured() || !resend) {
    logger.warn('Email not configured - skipping email send', 'EMAIL', {
      to,
      templateId,
      reason: 'Resend API key not configured or invalid'
    });
    return {
      success: true,
      message: 'Email skipped - not configured',
      skipped: true
    };
  }

  try {
    // For Resend, we'll use React templates or HTML templates
    // Since we're migrating from SendGrid templates, we'll use HTML for now
    const emailOptions: any = {
      from,
      to,
      react: undefined, // We'll implement React templates later
      html: await getTemplateHtml(templateId, templateData || {}),
      subject: getTemplateSubject(templateId),
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      emailOptions.attachments = attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        ...(attachment.contentType && { contentType: attachment.contentType }),
        ...(attachment.path && { path: attachment.path })
      }));
    }

    // Handle scheduled emails (Resend doesn't support scheduling natively)
    if (scheduledAt) {
      logger.info('Scheduled email requested - will send immediately (Resend limitation)', 'EMAIL', {
        to,
        templateId,
        requestedScheduleTime: scheduledAt.toISOString()
      });
    }

    const result = await resend.emails.send(emailOptions);

    logger.info('Template email sent successfully', 'EMAIL', {
      to,
      templateId,
      emailId: result.data?.id,
      hasScheduledSend: !!scheduledAt
    });

    return {
      success: true,
      message: 'Email sent successfully',
      emailId: result.data?.id
    };
  } catch (error: any) {
    logger.error('Error sending template email', error, 'EMAIL', {
      to,
      templateId,
      resendError: error.message
    });
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
      error: error.message,
      details: error.response?.data
    };
  }
}

// Simple email function for admin notifications
export async function sendSimpleEmail({ to, from, subject, html, scheduledAt, attachments }: SimpleEmailData) {
  // Check if email is configured
  if (!isEmailConfigured() || !resend) {
    logger.warn('Email not configured - skipping email send', 'EMAIL', {
      to,
      subject,
      reason: 'Resend API key not configured or invalid'
    });
    return {
      success: true,
      message: 'Email skipped - not configured',
      skipped: true
    };
  }

  try {
    // Handle scheduled emails (Resend doesn't support scheduling natively)
    if (scheduledAt) {
      logger.info('Scheduled email requested - will send immediately (Resend limitation)', 'EMAIL', {
        to,
        subject,
        requestedScheduleTime: scheduledAt.toISOString()
      });
    }

    const emailOptions: any = {
      from,
      to,
      subject,
      html,
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      emailOptions.attachments = attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        ...(attachment.contentType && { contentType: attachment.contentType }),
        ...(attachment.path && { path: attachment.path })
      }));
    }

    const result = await resend.emails.send(emailOptions);

    logger.info('Simple email sent successfully', 'EMAIL', {
      to,
      subject,
      emailId: result.data?.id,
      hasHtmlContent: !!html
    });

    return {
      success: true,
      message: 'Email sent successfully',
      emailId: result.data?.id
    };
  } catch (error: any) {
    logger.error('Error sending simple email', error, 'EMAIL', {
      to,
      subject,
      resendError: error.message
    });
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
      error: error.message,
      details: error.response?.data
    };
  }
}

// Helper function to get template HTML content
async function getTemplateHtml(templateId: string, templateData: Record<string, any>): Promise<string> {
  // Map SendGrid template IDs to HTML templates
  const templateMap: Record<string, string> = {
    'd-709841e3498344fba8a981d8be9666ba': 'welcome',
    'd-85b5b99d09684408ba908abfe98537f5': 'order_confirmation',
    'd-db27d729c9ef4a2ebb176451e3ab266a': 'processing_started',
    'd-ee3bde9d6dec4c928eec5422300840f6': 'processing_complete',
    'd-7dcd6ecde3dc4a1c990d388c283e38f0': 'payment_confirmation',
    'd-1b85a5df63c94e23ac388415916c1598': 'password_reset',
    'd-3aafb72ab3474fcfb9a7da04b3afb2a1': 'promotional',
    'd-266b25ccb7ec4ff4a19135d64a50b66f': 'support_response'
  };

  const templateName = templateMap[templateId] || 'welcome';

  // Import the HTML template content
  try {
    const { getEmailTemplate } = await import('@/utils/emailTemplates');
    return getEmailTemplate(templateName as any, templateData);
  } catch (error) {
    logger.error('Error loading email template', error as Error, 'EMAIL_TEMPLATE');
    return getDefaultTemplate(templateName, templateData);
  }
}

// Helper function to get template subject
function getTemplateSubject(templateId: string): string {
  const subjectMap: Record<string, string> = {
    'd-709841e3498344fba8a981d8be9666ba': 'Welcome to Coolpix.me!',
    'd-85b5b99d09684408ba908abfe98537f5': 'Order Confirmation - Coolpix.me',
    'd-db27d729c9ef4a2ebb176451e3ab266a': 'Your Headshots Are Being Processed',
    'd-ee3bde9d6dec4c928eec5422300840f6': 'Your Professional Headshots Are Ready!',
    'd-7dcd6ecde3dc4a1c990d388c283e38f0': 'Payment Confirmation - Coolpix.me',
    'd-1b85a5df63c94e23ac388415916c1598': 'Reset Your Password - Coolpix.me',
    'd-3aafb72ab3474fcfb9a7da04b3afb2a1': 'Special Offer from Coolpix.me',
    'd-266b25ccb7ec4ff4a19135d64a50b66f': 'Support Response - Coolpix.me'
  };

  return subjectMap[templateId] || 'Coolpix.me Notification';
}

// Fallback template function
function getDefaultTemplate(templateName: string, data: Record<string, any>): string {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Coolpix.me</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Coolpix.me</h1>
        </div>
        <div class="content">
          ${getTemplateContent(templateName, data)}
        </div>
        <div class="footer">
          <p>© 2024 Coolpix.me. All rights reserved.</p>
          <p>Professional AI-Generated Headshots</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return baseTemplate;
}

// Template content generator
function getTemplateContent(templateName: string, data: Record<string, any>): string {
  switch (templateName) {
    case 'welcome':
      return `
        <h2>Welcome to ProHeadshots!</h2>
        <p>Hi ${data.firstName || 'there'},</p>
        <p>Welcome to ProHeadshots! We're excited to help you create professional AI-generated headshots.</p>
        <p><a href="${data.dashboardUrl || '#'}" class="button">Get Started</a></p>
      `;
    case 'order_confirmation':
      return `
        <h2>Order Confirmation</h2>
        <p>Thank you for your order! We've received your payment and will begin processing your headshots shortly.</p>
        <p>Order ID: ${data.orderId || 'N/A'}</p>
      `;
    case 'processing_started':
      return `
        <h2>Processing Started</h2>
        <p>Great news! We've started processing your professional headshots.</p>
        <p>This usually takes 10-30 minutes. We'll notify you when they're ready!</p>
      `;
    case 'processing_complete':
      return `
        <h2>Your Headshots Are Ready!</h2>
        <p>Fantastic! Your professional headshots have been generated and are ready for download.</p>
        <p>We've created ${data.imageCount || 'several'} high-quality headshots for you.</p>
        <p><a href="${data.downloadUrl || '#'}" class="button">Download Your Headshots</a></p>
      `;
    case 'payment_confirmation':
      return `
        <h2>Payment Confirmed</h2>
        <p>Thank you! Your payment has been successfully processed.</p>
        <p>Amount: ${data.amount || 'N/A'}</p>
      `;
    case 'password_reset':
      return `
        <h2>Reset Your Password</h2>
        <p>You requested to reset your password. Click the link below to create a new password:</p>
        <p><a href="${data.resetUrl || '#'}" class="button">Reset Password</a></p>
        <p>This link will expire in 24 hours.</p>
      `;
    case 'promotional':
      return `
        <h2>Special Offer!</h2>
        <p>Don't miss out on this limited-time offer for professional headshots.</p>
        <p>${data.offerDetails || 'Get premium headshots at a special price!'}</p>
        <p><a href="${data.offerUrl || '#'}" class="button">Claim Offer</a></p>
      `;
    case 'support_response':
      return `
        <h2>Support Response</h2>
        <p>Hi ${data.firstName || 'there'},</p>
        <p>Thank you for contacting our support team. Here's our response:</p>
        <div style="background: white; padding: 15px; border-left: 4px solid #2563eb;">
          ${data.responseMessage || 'We\'ll get back to you soon!'}
        </div>
      `;
    default:
      return `
        <h2>Notification from Coolpix.me</h2>
        <p>You have a new notification from Coolpix.me.</p>
      `;
  }
}