'use server'

import {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendProcessingStartedEmail,
  sendProcessingCompleteEmail,
  sendPaymentConfirmationEmail,
  sendPasswordResetEmail,
  sendPromotionalEmail,
  sendSupportResponseEmail
} from '@/action/emailActions';
import { createClient } from "@/utils/supabase/server";
import { logger } from "@/utils/logger";

/**
 * Email workflow integration for ProHeadshots
 * This file contains functions that integrate email templates with business workflows
 */

/**
 * Handle new user registration workflow
 */
export async function handleNewUserRegistration(userId: string, email: string, firstName?: string) {
  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/dashboard`;
    
    // Send welcome email
    const result = await sendWelcomeEmail({
      firstName: firstName || 'there',
      email,
      dashboardUrl
    });

    // Log the registration
    logger.info('New user registration email workflow completed', 'EMAIL_WORKFLOW', {
      userId,
      email,
      emailSent: result.success
    });

    return result;
  } catch (error) {
    logger.error('Error in new user registration workflow', error as Error, 'EMAIL_WORKFLOW', { userId, email });
    return { success: false, message: 'Failed to complete registration workflow' };
  }
}

/**
 * Handle Polar payment success workflow
 */
export async function handlePolarPaymentSuccess(paymentData: {
  userId: string;
  email: string;
  firstName: string;
  orderId: string;
  planName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
}) {
  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/dashboard`;
    const receiptUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/receipt/${paymentData.orderId}`;
    const orderDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send order confirmation email
    const orderConfirmationResult = await sendOrderConfirmationEmail({
      firstName: paymentData.firstName,
      email: paymentData.email,
      orderId: paymentData.orderId,
      planName: paymentData.planName,
      amount: paymentData.amount,
      currency: paymentData.currency,
      orderDate,
      dashboardUrl
    });

    // Send payment confirmation email
    const paymentConfirmationResult = await sendPaymentConfirmationEmail({
      firstName: paymentData.firstName,
      email: paymentData.email,
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      paymentMethod: paymentData.paymentMethod,
      transactionId: paymentData.transactionId,
      receiptUrl,
      dashboardUrl
    });

    logger.info('Polar payment success email workflow completed', 'EMAIL_WORKFLOW', {
      userId: paymentData.userId,
      orderId: paymentData.orderId,
      orderConfirmationSent: orderConfirmationResult.success,
      paymentConfirmationSent: paymentConfirmationResult.success
    });

    return {
      success: orderConfirmationResult.success && paymentConfirmationResult.success,
      orderConfirmation: orderConfirmationResult,
      paymentConfirmation: paymentConfirmationResult
    };
  } catch (error) {
    logger.error('Error in Polar payment success workflow', error as Error, 'EMAIL_WORKFLOW', { 
      userId: paymentData.userId, 
      orderId: paymentData.orderId 
    });
    return { success: false, message: 'Failed to complete payment workflow' };
  }
}

/**
 * Handle Fal AI processing started workflow
 */
export async function handleFalAIProcessingStarted(processingData: {
  userId: string;
  email: string;
  firstName: string;
  requestId: string;
}) {
  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/dashboard`;
    const supportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/support`;

    const result = await sendProcessingStartedEmail({
      firstName: processingData.firstName,
      email: processingData.email,
      estimatedTime: '10-15 minutes',
      dashboardUrl,
      supportUrl
    });

    logger.info('Fal AI processing started email workflow completed', 'EMAIL_WORKFLOW', {
      userId: processingData.userId,
      requestId: processingData.requestId,
      emailSent: result.success
    });

    return result;
  } catch (error) {
    logger.error('Error in Fal AI processing started workflow', error as Error, 'EMAIL_WORKFLOW', { 
      userId: processingData.userId, 
      requestId: processingData.requestId 
    });
    return { success: false, message: 'Failed to complete processing started workflow' };
  }
}

/**
 * Handle Fal AI processing completed workflow
 */
export async function handleFalAIProcessingCompleted(completionData: {
  userId: string;
  email: string;
  firstName: string;
  requestId: string;
  imageCount: number;
  downloadUrls: string[];
}) {
  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/dashboard`;
    const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/download/${completionData.requestId}`;
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }); // 30 days from now

    const result = await sendProcessingCompleteEmail({
      firstName: completionData.firstName,
      email: completionData.email,
      downloadUrl,
      dashboardUrl,
      imageCount: completionData.imageCount,
      expiryDate
    });

    logger.info('Fal AI processing completed email workflow completed', 'EMAIL_WORKFLOW', {
      userId: completionData.userId,
      requestId: completionData.requestId,
      imageCount: completionData.imageCount,
      emailSent: result.success
    });

    return result;
  } catch (error) {
    logger.error('Error in Fal AI processing completed workflow', error as Error, 'EMAIL_WORKFLOW', { 
      userId: completionData.userId, 
      requestId: completionData.requestId 
    });
    return { success: false, message: 'Failed to complete processing completed workflow' };
  }
}

/**
 * Handle password reset workflow
 */
export async function handlePasswordReset(resetData: {
  email: string;
  firstName: string;
  resetToken: string;
}) {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/reset-password?token=${resetData.resetToken}`;
    const expiryTime = '1 hour';

    const result = await sendPasswordResetEmail({
      firstName: resetData.firstName,
      email: resetData.email,
      resetUrl,
      expiryTime
    });

    logger.info('Password reset email workflow completed', 'EMAIL_WORKFLOW', {
      email: resetData.email,
      emailSent: result.success
    });

    return result;
  } catch (error) {
    logger.error('Error in password reset workflow', error as Error, 'EMAIL_WORKFLOW', { email: resetData.email });
    return { success: false, message: 'Failed to complete password reset workflow' };
  }
}

/**
 * Handle promotional campaign workflow
 */
export async function handlePromotionalCampaign(campaignData: {
  email: string;
  firstName: string;
  offerTitle: string;
  offerDescription: string;
  discountCode?: string;
  expiryDate?: string;
}) {
  try {
    const ctaUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/pricing${campaignData.discountCode ? `?code=${campaignData.discountCode}` : ''}`;

    const result = await sendPromotionalEmail({
      firstName: campaignData.firstName,
      email: campaignData.email,
      offerTitle: campaignData.offerTitle,
      offerDescription: campaignData.offerDescription,
      discountCode: campaignData.discountCode,
      ctaUrl,
      expiryDate: campaignData.expiryDate
    });

    logger.info('Promotional campaign email workflow completed', 'EMAIL_WORKFLOW', {
      email: campaignData.email,
      offerTitle: campaignData.offerTitle,
      emailSent: result.success
    });

    return result;
  } catch (error) {
    logger.error('Error in promotional campaign workflow', error as Error, 'EMAIL_WORKFLOW', { 
      email: campaignData.email,
      offerTitle: campaignData.offerTitle 
    });
    return { success: false, message: 'Failed to complete promotional campaign workflow' };
  }
}

/**
 * Handle support response workflow
 */
export async function handleSupportResponse(supportData: {
  email: string;
  firstName: string;
  ticketId: string;
  subject: string;
  responseMessage: string;
}) {
  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/dashboard`;

    const result = await sendSupportResponseEmail({
      firstName: supportData.firstName,
      email: supportData.email,
      ticketId: supportData.ticketId,
      subject: supportData.subject,
      responseMessage: supportData.responseMessage,
      dashboardUrl
    });

    logger.info('Support response email workflow completed', 'EMAIL_WORKFLOW', {
      email: supportData.email,
      ticketId: supportData.ticketId,
      emailSent: result.success
    });

    return result;
  } catch (error) {
    logger.error('Error in support response workflow', error as Error, 'EMAIL_WORKFLOW', { 
      email: supportData.email,
      ticketId: supportData.ticketId 
    });
    return { success: false, message: 'Failed to complete support response workflow' };
  }
}
