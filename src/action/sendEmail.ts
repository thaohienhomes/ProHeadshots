'use server'

import sgMail from '@sendgrid/mail';
import { MailDataRequired } from '@sendgrid/mail';
import { logger } from '@/utils/logger';

// Check if SendGrid is properly configured
const isEmailConfigured = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  return apiKey && apiKey !== 'YOUR_SENDGRID_API_KEY' && apiKey.startsWith('SG.');
};

// Only set API key if it's properly configured
if (isEmailConfigured()) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
}

interface EmailData {
  to: string;
  from: string;
  templateId: string;
  sendAt?: number;
}

interface SimpleEmailData {
  to: string;
  from: string;
  subject: string;
  html: string;
}

//Template ID
export async function sendEmail({ to, from, templateId, sendAt }: EmailData) {
  // Check if email is configured
  if (!isEmailConfigured()) {
    logger.warn('Email not configured - skipping email send', 'EMAIL', {
      to,
      templateId,
      reason: 'SendGrid API key not configured or invalid'
    });
    return {
      success: true,
      message: 'Email skipped - not configured',
      skipped: true
    };
  }

  try {
    const msg: MailDataRequired = {
      to,
      from,
      templateId,
      ...(sendAt && { sendAt }),
    };

    await sgMail.send(msg);
    logger.info('Template email sent successfully', 'EMAIL', {
      to,
      templateId,
      hasScheduledSend: !!sendAt
    });
    return { success: true, message: 'Email sent successfully' };
  } catch (error: any) {
    logger.error('Error sending template email', error, 'EMAIL', {
      to,
      templateId,
      sendGridErrors: error.response?.body?.errors
    });
    return {
      success: false,
      error: error.message,
      details: error.response?.body?.errors
    };
  }
}

// Simple email function for admin notifications
export async function sendSimpleEmail({ to, from, subject, html }: SimpleEmailData) {
  // Check if email is configured
  if (!isEmailConfigured()) {
    logger.warn('Email not configured - skipping email send', 'EMAIL', {
      to,
      subject,
      reason: 'SendGrid API key not configured or invalid'
    });
    return {
      success: true,
      message: 'Email skipped - not configured',
      skipped: true
    };
  }

  try {
    const msg: MailDataRequired = {
      to,
      from,
      subject,
      html,
    };

    await sgMail.send(msg);
    logger.info('Simple email sent successfully', 'EMAIL', {
      to,
      subject,
      hasHtmlContent: !!html
    });
    return { success: true, message: 'Email sent successfully' };
  } catch (error: any) {
    logger.error('Error sending simple email', error, 'EMAIL', {
      to,
      subject,
      sendGridErrors: error.response?.body?.errors
    });
    return {
      success: false,
      error: error.message,
      details: error.response?.body?.errors
    };
  }
}