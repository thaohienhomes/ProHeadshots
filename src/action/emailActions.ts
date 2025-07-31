'use server'

import { sendEmail } from "./sendEmail";
import { logger } from "@/utils/logger";
import { SENDGRID_TEMPLATE_IDS } from "@/utils/emailTemplates";
import type {
  WelcomeEmailData,
  OrderConfirmationEmailData,
  ProcessingEmailData,
  CompletionEmailData,
  PaymentConfirmationEmailData,
  PasswordResetEmailData,
  PromotionalEmailData,
  SupportResponseEmailData,
  BillingNotificationEmailData,
  OrderUpdateEmailData,
  ProcessingNotificationEmailData,
  GeneralSupportEmailData
} from "@/utils/emailTemplates";

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendEmail({
      to: data.email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.welcome,
      templateData: data,
    });

    logger.info('Welcome email sent', 'EMAIL_TEMPLATES', { email: data.email });
    return result;
  } catch (error) {
    logger.error('Error sending welcome email', error as Error, 'EMAIL_TEMPLATES', { email: data.email });
    return { success: false, message: 'Failed to send welcome email' };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendEmail({
      to: data.email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.order_confirmation,
      templateData: data,
    });

    logger.info('Order confirmation email sent', 'EMAIL_TEMPLATES', {
      email: data.email,
      orderId: data.orderId
    });
    return result;
  } catch (error) {
    logger.error('Error sending order confirmation email', error as Error, 'EMAIL_TEMPLATES', {
      email: data.email,
      orderId: data.orderId
    });
    return { success: false, message: 'Failed to send order confirmation email' };
  }
}

/**
 * Send processing started email
 */
export async function sendProcessingStartedEmail(data: ProcessingEmailData): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendEmail({
      to: data.email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.processing_started,
      templateData: data,
    });

    logger.info('Processing started email sent', 'EMAIL_TEMPLATES', { email: data.email });
    return result;
  } catch (error) {
    logger.error('Error sending processing started email', error as Error, 'EMAIL_TEMPLATES', { email: data.email });
    return { success: false, message: 'Failed to send processing started email' };
  }
}

/**
 * Send processing complete email with download link
 */
export async function sendProcessingCompleteEmail(data: CompletionEmailData): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendEmail({
      to: data.email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.processing_complete,
      templateData: data,
    });

    logger.info('Processing complete email sent', 'EMAIL_TEMPLATES', {
      email: data.email,
      imageCount: data.imageCount
    });
    return result;
  } catch (error) {
    logger.error('Error sending processing complete email', error as Error, 'EMAIL_TEMPLATES', { email: data.email });
    return { success: false, message: 'Failed to send processing complete email' };
  }
}

/**
 * Send scheduled processing complete email (used in wait page)
 */
export async function sendScheduledProcessingCompleteEmail(
  email: string,
  delayInSeconds: number = 7200
): Promise<{ success: boolean; message: string }> {
  try {
    const scheduledAt = new Date(Date.now() + delayInSeconds * 1000);

    const result = await sendEmail({
      to: email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.processing_complete,
      scheduledAt: scheduledAt,
      templateData: {
        email,
        firstName: 'there', // Default since we don't have user data
        imageCount: 'Multiple',
        downloadUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/dashboard`,
        dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/dashboard`,
        expiryDate: '30 days from now'
      },
    });

    logger.info('Scheduled processing complete email sent', 'EMAIL_TEMPLATES', {
      email,
      delayInSeconds,
      scheduledFor: scheduledAt.toISOString()
    });
    return result;
  } catch (error) {
    logger.error('Error sending scheduled processing complete email', error as Error, 'EMAIL_TEMPLATES', { email });
    return { success: false, message: 'Failed to send scheduled processing complete email' };
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(data: PaymentConfirmationEmailData): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendEmail({
      to: data.email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.payment_confirmation,
      templateData: data,
    });

    logger.info('Payment confirmation email sent', 'EMAIL_TEMPLATES', { email: data.email });
    return result;
  } catch (error) {
    logger.error('Error sending payment confirmation email', error as Error, 'EMAIL_TEMPLATES', { email: data.email });
    return { success: false, message: 'Failed to send payment confirmation email' };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendEmail({
      to: data.email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.password_reset,
      templateData: data,
    });

    logger.info('Password reset email sent', 'EMAIL_TEMPLATES', { email: data.email });
    return result;
  } catch (error) {
    logger.error('Error sending password reset email', error as Error, 'EMAIL_TEMPLATES', { email: data.email });
    return { success: false, message: 'Failed to send password reset email' };
  }
}

/**
 * Send promotional email
 */
export async function sendPromotionalEmail(data: PromotionalEmailData): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendEmail({
      to: data.email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.promotional,
      templateData: data,
    });

    logger.info('Promotional email sent', 'EMAIL_TEMPLATES', { email: data.email });
    return result;
  } catch (error) {
    logger.error('Error sending promotional email', error as Error, 'EMAIL_TEMPLATES', { email: data.email });
    return { success: false, message: 'Failed to send promotional email' };
  }
}

/**
 * Send support response email
 */
export async function sendSupportResponseEmail(data: SupportResponseEmailData): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendEmail({
      to: data.email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.support_response,
      templateData: data,
    });

    logger.info('Support response email sent', 'EMAIL_TEMPLATES', { email: data.email });
    return result;
  } catch (error) {
    logger.error('Error sending support response email', error as Error, 'EMAIL_TEMPLATES', { email: data.email });
    return { success: false, message: 'Failed to send support response email' };
  }
}

/**
 * Send billing notification email
 */
export async function sendBillingNotificationEmail(data: BillingNotificationEmailData): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendEmail({
      to: data.email,
      from: process.env.BILLING_EMAIL || process.env.ADMIN_EMAIL || 'billing@mail.coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.billing_notification,
      templateData: data,
    });

    logger.info('Billing notification email sent', 'EMAIL_TEMPLATES', {
      email: data.email,
      invoiceId: data.invoiceId
    });
    return result;
  } catch (error) {
    logger.error('Error sending billing notification email', error as Error, 'EMAIL_TEMPLATES', {
      email: data.email,
      invoiceId: data.invoiceId
    });
    return { success: false, message: 'Failed to send billing notification email' };
  }
}

/**
 * Send order update email
 */
export async function sendOrderUpdateEmail(data: OrderUpdateEmailData): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendEmail({
      to: data.email,
      from: process.env.ORDERS_EMAIL || process.env.NOREPLY_EMAIL || 'orders@mail.coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.order_update,
      templateData: data,
    });

    logger.info('Order update email sent', 'EMAIL_TEMPLATES', {
      email: data.email,
      orderId: data.orderId,
      status: data.status
    });
    return result;
  } catch (error) {
    logger.error('Error sending order update email', error as Error, 'EMAIL_TEMPLATES', {
      email: data.email,
      orderId: data.orderId
    });
    return { success: false, message: 'Failed to send order update email' };
  }
}

/**
 * Send processing notification email
 */
export async function sendProcessingNotificationEmail(data: ProcessingNotificationEmailData): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendEmail({
      to: data.email,
      from: process.env.NOTIFICATIONS_EMAIL || process.env.NOREPLY_EMAIL || 'notifications@mail.coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.processing_notification,
      templateData: data,
    });

    logger.info('Processing notification email sent', 'EMAIL_TEMPLATES', {
      email: data.email,
      jobId: data.jobId,
      status: data.status
    });
    return result;
  } catch (error) {
    logger.error('Error sending processing notification email', error as Error, 'EMAIL_TEMPLATES', {
      email: data.email,
      jobId: data.jobId
    });
    return { success: false, message: 'Failed to send processing notification email' };
  }
}

/**
 * Send general support email
 */
export async function sendGeneralSupportEmail(data: GeneralSupportEmailData): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendEmail({
      to: data.email,
      from: process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL || 'support@mail.coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.general_support,
      templateData: data,
    });

    logger.info('General support email sent', 'EMAIL_TEMPLATES', {
      email: data.email,
      subject: data.subject,
      category: data.category,
      priority: data.priority
    });
    return result;
  } catch (error) {
    logger.error('Error sending general support email', error as Error, 'EMAIL_TEMPLATES', {
      email: data.email,
      subject: data.subject
    });
    return { success: false, message: 'Failed to send general support email' };
  }
}

/**
 * Send headshots with attachments
 */
export async function sendHeadshotsWithAttachments(data: {
  firstName: string;
  email: string;
  orderId: string;
  imageCount: number;
  attachments: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
  dashboardUrl: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendEmail({
      to: data.email,
      from: process.env.NOREPLY_EMAIL || 'noreply@mail.coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.processing_complete,
      templateData: {
        ...data,
        downloadUrl: data.dashboardUrl, // Fallback to dashboard
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() // 30 days
      },
      attachments: data.attachments,
    });

    logger.info('Headshots sent with attachments', 'EMAIL_TEMPLATES', {
      email: data.email,
      orderId: data.orderId,
      imageCount: data.imageCount,
      attachmentCount: data.attachments.length
    });
    return result;
  } catch (error) {
    logger.error('Error sending headshots with attachments', error as Error, 'EMAIL_TEMPLATES', {
      email: data.email,
      orderId: data.orderId
    });
    return { success: false, message: 'Failed to send headshots with attachments' };
  }
}
