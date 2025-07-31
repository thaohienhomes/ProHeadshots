// Email template types for ProHeadshots
export type EmailTemplateType =
  | 'welcome'
  | 'order_confirmation'
  | 'processing_started'
  | 'processing_complete'
  | 'payment_confirmation'
  | 'password_reset'
  | 'promotional'
  | 'support_response'
  | 'billing_notification'
  | 'order_update'
  | 'processing_notification'
  | 'general_support';

// Resend template IDs for ProHeadshots (mapped from old SendGrid IDs for compatibility)
export const RESEND_TEMPLATE_IDS = {
  welcome: 'd-709841e3498344fba8a981d8be9666ba',
  order_confirmation: 'd-85b5b99d09684408ba908abfe98537f5',
  processing_started: 'd-db27d729c9ef4a2ebb176451e3ab266a',
  processing_complete: 'd-ee3bde9d6dec4c928eec5422300840f6',
  payment_confirmation: 'd-7dcd6ecde3dc4a1c990d388c283e38f0',
  password_reset: 'd-1b85a5df63c94e23ac388415916c1598',
  promotional: 'd-3aafb72ab3474fcfb9a7da04b3afb2a1',
  support_response: 'd-266b25ccb7ec4ff4a19135d64a50b66f',
  // New template types for specialized email addresses
  billing_notification: 'd-billing-notification-template',
  order_update: 'd-order-update-template',
  processing_notification: 'd-processing-notification-template',
  general_support: 'd-general-support-template'
} as const;

// Backward compatibility - keep old name for existing code
export const SENDGRID_TEMPLATE_IDS = RESEND_TEMPLATE_IDS;

// Email template data interfaces
export interface WelcomeEmailData {
  firstName: string;
  email: string;
  dashboardUrl: string;
}

export interface OrderConfirmationEmailData {
  firstName: string;
  email: string;
  orderId: string;
  planName: string;
  amount: number;
  currency: string;
  orderDate: string;
  dashboardUrl: string;
}

export interface ProcessingEmailData {
  firstName: string;
  email: string;
  estimatedTime: string;
  dashboardUrl: string;
  supportUrl: string;
}

export interface CompletionEmailData {
  firstName: string;
  email: string;
  downloadUrl: string;
  dashboardUrl: string;
  imageCount: number;
  expiryDate: string;
}

export interface PaymentConfirmationEmailData {
  firstName: string;
  email: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  receiptUrl: string;
  dashboardUrl: string;
}

export interface PasswordResetEmailData {
  firstName: string;
  email: string;
  resetUrl: string;
  expiryTime: string;
}

export interface PromotionalEmailData {
  firstName: string;
  email: string;
  offerTitle: string;
  offerDescription: string;
  discountCode?: string;
  ctaUrl: string;
  expiryDate?: string;
}

export interface SupportResponseEmailData {
  firstName: string;
  email: string;
  ticketId: string;
  subject: string;
  responseMessage: string;
  dashboardUrl: string;
}

// New email template data interfaces for specialized addresses
export interface BillingNotificationEmailData {
  firstName: string;
  email: string;
  invoiceId: string;
  amount: number;
  currency: string;
  dueDate: string;
  billingUrl: string;
  description: string;
}

export interface OrderUpdateEmailData {
  firstName: string;
  email: string;
  orderId: string;
  status: string;
  updateMessage: string;
  dashboardUrl: string;
  estimatedCompletion?: string;
}

export interface ProcessingNotificationEmailData {
  firstName: string;
  email: string;
  jobId: string;
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  estimatedTime?: string;
  dashboardUrl: string;
  supportUrl: string;
}

export interface GeneralSupportEmailData {
  firstName: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dashboardUrl: string;
}

// Email functions are now in src/action/emailActions.ts



/**
 * Get email template configuration for Resend
 */
export function getEmailTemplateConfig(templateType: EmailTemplateType) {
  return {
    templateId: RESEND_TEMPLATE_IDS[templateType],
    from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
    type: templateType
  };
}

/**
 * Generate HTML email template for Resend
 */
export function getEmailTemplate(templateType: EmailTemplateType, data: Record<string, any>): string {
  const baseTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Coolpix.me</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .content {
          padding: 30px 20px;
          background: white;
        }
        .content h2 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .content p {
          margin-bottom: 16px;
          color: #4b5563;
          font-size: 16px;
        }
        .button {
          display: inline-block;
          padding: 14px 28px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-1px);
        }
        .footer {
          padding: 20px;
          text-align: center;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
          color: #6b7280;
          font-size: 14px;
        }
        .highlight-box {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
        }
        .success-box {
          background: #f0fdf4;
          border: 1px solid #22c55e;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Coolpix.me</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional AI-Generated Headshots</p>
        </div>
        <div class="content">
          ${getTemplateContent(templateType, data)}
        </div>
        <div class="footer">
          <p>© 2024 Coolpix.me. All rights reserved.</p>
          <p>Need help? Contact us at <a href="mailto:support@coolpix.me" style="color: #2563eb;">support@coolpix.me</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return baseTemplate;
}

/**
 * Validate email template data
 */
export function validateEmailData(templateType: EmailTemplateType, data: any): boolean {
  const requiredFields: Record<EmailTemplateType, string[]> = {
    welcome: ['firstName', 'email', 'dashboardUrl'],
    order_confirmation: ['firstName', 'email', 'orderId', 'planName', 'amount', 'currency', 'orderDate', 'dashboardUrl'],
    processing_started: ['firstName', 'email', 'estimatedTime', 'dashboardUrl', 'supportUrl'],
    processing_complete: ['firstName', 'email', 'downloadUrl', 'dashboardUrl', 'imageCount', 'expiryDate'],
    payment_confirmation: ['firstName', 'email', 'orderId', 'amount', 'currency', 'paymentMethod', 'transactionId', 'receiptUrl', 'dashboardUrl'],
    password_reset: ['firstName', 'email', 'resetUrl', 'expiryTime'],
    promotional: ['firstName', 'email', 'offerTitle', 'offerDescription', 'ctaUrl'],
    support_response: ['firstName', 'email', 'ticketId', 'subject', 'responseMessage', 'dashboardUrl'],
    billing_notification: ['firstName', 'email', 'invoiceId', 'amount', 'currency', 'dueDate', 'billingUrl', 'description'],
    order_update: ['firstName', 'email', 'orderId', 'status', 'updateMessage', 'dashboardUrl'],
    processing_notification: ['firstName', 'email', 'jobId', 'status', 'dashboardUrl', 'supportUrl'],
    general_support: ['firstName', 'email', 'subject', 'message', 'category', 'priority', 'dashboardUrl']
  };

  const required = requiredFields[templateType];
  return required.every(field => data[field] !== undefined && data[field] !== null && data[field] !== '');
}

/**
 * Generate template-specific content
 */
function getTemplateContent(templateType: EmailTemplateType, data: Record<string, any>): string {
  switch (templateType) {
    case 'welcome':
      return `
        <h2>Welcome to Coolpix.me!</h2>
        <p>Hi ${data.firstName || 'there'},</p>
        <p>Welcome to Coolpix.me! We're excited to help you create professional AI-generated headshots that will make you stand out.</p>
        <div class="highlight-box">
          <p><strong>What's next?</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Upload your photos</li>
            <li>Choose your style preferences</li>
            <li>Let our AI create amazing headshots</li>
          </ul>
        </div>
        <p style="text-align: center;">
          <a href="${data.dashboardUrl || '#'}" class="button">Get Started Now</a>
        </p>
        <p>If you have any questions, don't hesitate to reach out to our support team.</p>
      `;

    case 'order_confirmation':
      return `
        <h2>Order Confirmation</h2>
        <p>Hi ${data.firstName || 'there'},</p>
        <p>Thank you for your order! We've received your payment and will begin processing your professional headshots shortly.</p>
        <div class="success-box">
          <p><strong>Order Details:</strong></p>
          <p>Order ID: <strong>${data.orderId || 'N/A'}</strong></p>
          <p>Plan: <strong>${data.planName || 'Professional Headshots'}</strong></p>
          <p>Amount: <strong>${data.amount || 'N/A'} ${data.currency || 'USD'}</strong></p>
          <p>Date: <strong>${data.orderDate || new Date().toLocaleDateString()}</strong></p>
        </div>
        <p>We'll send you another email once your headshots are ready for download.</p>
        <p style="text-align: center;">
          <a href="${data.dashboardUrl || '#'}" class="button">View Order Status</a>
        </p>
      `;

    case 'processing_started':
      return `
        <h2>Your Headshots Are Being Processed</h2>
        <p>Hi ${data.firstName || 'there'},</p>
        <p>Great news! We've started processing your professional headshots using our advanced AI technology.</p>
        <div class="highlight-box">
          <p><strong>Processing Details:</strong></p>
          <p>Estimated completion time: <strong>${data.estimatedTime || '10-30 minutes'}</strong></p>
          <p>You'll receive an email notification when your headshots are ready.</p>
        </div>
        <p>While you wait, feel free to explore your dashboard or check out our tips for the best headshot results.</p>
        <p style="text-align: center;">
          <a href="${data.dashboardUrl || '#'}" class="button">View Progress</a>
        </p>
      `;

    case 'processing_complete':
      return `
        <h2>🎉 Your Professional Headshots Are Ready!</h2>
        <p>Hi ${data.firstName || 'there'},</p>
        <p>Fantastic news! Your professional headshots have been generated and are ready for download.</p>
        <div class="success-box">
          <p><strong>Your Results:</strong></p>
          <p>Number of headshots: <strong>${data.imageCount || 'Multiple'}</strong></p>
          <p>High-resolution images ready for professional use</p>
          <p>Download expires: <strong>${data.expiryDate || '30 days from now'}</strong></p>
        </div>
        <p>We can't wait for you to see how amazing you look! Click below to download your headshots.</p>
        <p style="text-align: center;">
          <a href="${data.downloadUrl || '#'}" class="button">Download Your Headshots</a>
        </p>
        <p>Don't forget to share your new professional look on LinkedIn and other platforms!</p>
      `;

    case 'payment_confirmation':
      return `
        <h2>Payment Confirmation</h2>
        <p>Hi ${data.firstName || 'there'},</p>
        <p>Thank you! Your payment has been successfully processed.</p>
        <div class="success-box">
          <p><strong>Payment Details:</strong></p>
          <p>Transaction ID: <strong>${data.transactionId || 'N/A'}</strong></p>
          <p>Amount: <strong>${data.amount || 'N/A'} ${data.currency || 'USD'}</strong></p>
          <p>Payment Method: <strong>${data.paymentMethod || 'N/A'}</strong></p>
          <p>Order ID: <strong>${data.orderId || 'N/A'}</strong></p>
        </div>
        <p>Your receipt is available for download, and we'll begin processing your order immediately.</p>
        <p style="text-align: center;">
          <a href="${data.receiptUrl || '#'}" class="button">Download Receipt</a>
        </p>
      `;

    case 'password_reset':
      return `
        <h2>Reset Your Password</h2>
        <p>Hi ${data.firstName || 'there'},</p>
        <p>You requested to reset your password for your Coolpix.me account. Click the button below to create a new password:</p>
        <div class="highlight-box">
          <p><strong>Important:</strong></p>
          <p>This link will expire in <strong>${data.expiryTime || '24 hours'}</strong></p>
          <p>If you didn't request this reset, you can safely ignore this email.</p>
        </div>
        <p style="text-align: center;">
          <a href="${data.resetUrl || '#'}" class="button">Reset Password</a>
        </p>
        <p>For security reasons, this link can only be used once.</p>
      `;

    case 'promotional':
      return `
        <h2>${data.offerTitle || 'Special Offer Just for You!'}</h2>
        <p>Hi ${data.firstName || 'there'},</p>
        <p>${data.offerDescription || 'Don\'t miss out on this limited-time offer for professional headshots.'}</p>
        <div class="highlight-box">
          <p><strong>This exclusive offer includes:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Professional AI-generated headshots</li>
            <li>Multiple style options</li>
            <li>High-resolution downloads</li>
            <li>Fast processing time</li>
          </ul>
        </div>
        <p style="text-align: center;">
          <a href="${data.ctaUrl || '#'}" class="button">Claim Your Offer</a>
        </p>
        <p><em>This offer is valid for a limited time only.</em></p>
      `;

    case 'support_response':
      return `
        <h2>Support Response</h2>
        <p>Hi ${data.firstName || 'there'},</p>
        <p>Thank you for contacting our support team. We've reviewed your inquiry and here's our response:</p>
        <div class="highlight-box">
          <p><strong>Ticket ID:</strong> ${data.ticketId || 'N/A'}</p>
          <p><strong>Subject:</strong> ${data.subject || 'Support Request'}</p>
        </div>
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 6px; margin: 20px 0;">
          ${data.responseMessage || 'We\'ll get back to you with more details soon!'}
        </div>
        <p>If you need further assistance, please don't hesitate to reply to this email or contact us through your dashboard.</p>
        <p style="text-align: center;">
          <a href="${data.dashboardUrl || '#'}" class="button">Go to Dashboard</a>
        </p>
      `;

    case 'billing_notification':
      return `
        <h2>Billing Notification</h2>
        <p>Hi ${data.firstName || 'there'},</p>
        <p>This is a notification regarding your billing account with Coolpix.me.</p>
        <div class="highlight-box">
          <p><strong>Invoice ID:</strong> ${data.invoiceId || 'N/A'}</p>
          <p><strong>Amount:</strong> ${data.amount || 'N/A'} ${data.currency || 'USD'}</p>
          <p><strong>Due Date:</strong> ${data.dueDate || 'N/A'}</p>
        </div>
        <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;"><strong>Description:</strong> ${data.description || 'Billing update'}</p>
        </div>
        <p style="text-align: center;">
          <a href="${data.billingUrl || '#'}" class="button">View Billing Details</a>
        </p>
      `;

    case 'order_update':
      return `
        <h2>Order Update</h2>
        <p>Hi ${data.firstName || 'there'},</p>
        <p>We have an update regarding your order with Coolpix.me.</p>
        <div class="success-box">
          <p><strong>Order ID:</strong> ${data.orderId || 'N/A'}</p>
          <p><strong>Status:</strong> ${data.status || 'In Progress'}</p>
          ${data.estimatedCompletion ? `<p><strong>Estimated Completion:</strong> ${data.estimatedCompletion}</p>` : ''}
        </div>
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 6px; margin: 20px 0;">
          ${data.updateMessage || 'Your order is progressing as expected.'}
        </div>
        <p style="text-align: center;">
          <a href="${data.dashboardUrl || '#'}" class="button">Check Order Status</a>
        </p>
      `;

    case 'processing_notification':
      return `
        <h2>Processing Update</h2>
        <p>Hi ${data.firstName || 'there'},</p>
        <p>Here's an update on your headshot processing job:</p>
        <div class="highlight-box">
          <p><strong>Job ID:</strong> ${data.jobId || 'N/A'}</p>
          <p><strong>Status:</strong> ${data.status || 'In Progress'}</p>
          ${data.progress ? `<p><strong>Progress:</strong> ${data.progress}%</p>` : ''}
          ${data.estimatedTime ? `<p><strong>Estimated Time:</strong> ${data.estimatedTime}</p>` : ''}
        </div>
        ${data.status === 'completed' ?
          '<div class="success-box"><p><strong>🎉 Your headshots are ready!</strong></p></div>' :
          data.status === 'failed' ?
          '<div style="background: #fef2f2; border: 1px solid #ef4444; padding: 15px; border-radius: 6px; margin: 20px 0;"><p style="color: #dc2626; margin: 0;"><strong>Processing encountered an issue. Our team has been notified.</strong></p></div>' :
          '<div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;"><p style="margin: 0;">Your headshots are being processed. We\'ll notify you when they\'re ready!</p></div>'
        }
        <p style="text-align: center;">
          <a href="${data.dashboardUrl || '#'}" class="button">View Progress</a>
        </p>
        <p style="text-align: center; font-size: 14px;">
          <a href="${data.supportUrl || '#'}" style="color: #6b7280;">Need help? Contact Support</a>
        </p>
      `;

    case 'general_support':
      return `
        <h2>Support Request Received</h2>
        <p>Hi ${data.firstName || 'there'},</p>
        <p>Thank you for contacting Coolpix.me support. We've received your message and will respond as soon as possible.</p>
        <div class="highlight-box">
          <p><strong>Subject:</strong> ${data.subject || 'Support Request'}</p>
          <p><strong>Category:</strong> ${data.category || 'General'}</p>
          <p><strong>Priority:</strong> ${data.priority || 'Medium'}</p>
        </div>
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 6px; margin: 20px 0;">
          <p><strong>Your Message:</strong></p>
          <p style="font-style: italic;">${data.message || 'No message provided'}</p>
        </div>
        <p>Our support team typically responds within 24 hours. For urgent matters, please contact us directly through your dashboard.</p>
        <p style="text-align: center;">
          <a href="${data.dashboardUrl || '#'}" class="button">Go to Dashboard</a>
        </p>
      `;

    default:
      return `
        <h2>Notification from Coolpix.me</h2>
        <p>Hi there,</p>
        <p>You have a new notification from Coolpix.me.</p>
        <p>Please check your dashboard for more details.</p>
        <p style="text-align: center;">
          <a href="#" class="button">View Dashboard</a>
        </p>
      `;
  }
}
