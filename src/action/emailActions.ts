'use server'

import { sendEmail } from "./sendEmail";
import { logger } from "@/utils/logger";
import { SENDGRID_TEMPLATE_IDS } from "@/utils/emailTemplates";
import type {
  WelcomeEmailData,
  OrderConfirmationEmailData,
  ProcessingEmailData,
  CompletionEmailData
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
    const sendAt = Math.floor((Date.now() + delayInSeconds * 1000) / 1000);
    
    const result = await sendEmail({
      to: email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: SENDGRID_TEMPLATE_IDS.processing_complete,
      sendAt: sendAt,
    });

    logger.info('Scheduled processing complete email sent', 'EMAIL_TEMPLATES', { 
      email,
      delayInSeconds,
      scheduledFor: new Date(sendAt * 1000).toISOString()
    });
    return result;
  } catch (error) {
    logger.error('Error sending scheduled processing complete email', error as Error, 'EMAIL_TEMPLATES', { email });
    return { success: false, message: 'Failed to send scheduled processing complete email' };
  }
}
