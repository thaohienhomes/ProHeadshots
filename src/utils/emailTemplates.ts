// Email template types for ProHeadshots
export type EmailTemplateType =
  | 'welcome'
  | 'order_confirmation'
  | 'processing_started'
  | 'processing_complete'
  | 'payment_confirmation'
  | 'password_reset'
  | 'promotional'
  | 'support_response';

// SendGrid template IDs for ProHeadshots
export const SENDGRID_TEMPLATE_IDS = {
  welcome: 'd-709841e3498344fba8a981d8be9666ba',
  order_confirmation: 'd-85b5b99d09684408ba908abfe98537f5',
  processing_started: 'd-db27d729c9ef4a2ebb176451e3ab266a',
  processing_complete: 'd-ee3bde9d6dec4c928eec5422300840f6',
  payment_confirmation: 'd-7dcd6ecde3dc4a1c990d388c283e38f0',
  password_reset: 'd-1b85a5df63c94e23ac388415916c1598',
  promotional: 'd-3aafb72ab3474fcfb9a7da04b3afb2a1',
  support_response: 'd-266b25ccb7ec4ff4a19135d64a50b66f'
} as const;

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

// Email functions are now in src/action/emailActions.ts



/**
 * Get email template configuration for SendGrid
 */
export function getEmailTemplateConfig(templateType: EmailTemplateType) {
  return {
    templateId: SENDGRID_TEMPLATE_IDS[templateType],
    from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
    type: templateType
  };
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
    support_response: ['firstName', 'email', 'ticketId', 'subject', 'responseMessage', 'dashboardUrl']
  };

  const required = requiredFields[templateType];
  return required.every(field => data[field] !== undefined && data[field] !== null && data[field] !== '');
}
