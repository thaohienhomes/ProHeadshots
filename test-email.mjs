#!/usr/bin/env node

/**
 * Comprehensive test script for ProHeadshots email templates
 * Run with: node test-email.mjs [template-name] [your-email]
 *
 * Examples:
 * node test-email.mjs welcome your@email.com
 * node test-email.mjs all your@email.com
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

// Import email functions (we'll need to create a simple version for testing)
import sgMail from '@sendgrid/mail';

// Set up SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const TEMPLATE_IDS = {
  welcome: 'd-709841e3498344fba8a981d8be9666ba',
  order_confirmation: 'd-85b5b99d09684408ba908abfe98537f5',
  processing_started: 'd-db27d729c9ef4a2ebb176451e3ab266a',
  processing_complete: 'd-ee3bde9d6dec4c928eec5422300840f6',
  payment_confirmation: 'd-7dcd6ecde3dc4a1c990d388c283e38f0',
  password_reset: 'd-1b85a5df63c94e23ac388415916c1598',
  promotional: 'd-3aafb72ab3474fcfb9a7da04b3afb2a1',
  support_response: 'd-266b25ccb7ec4ff4a19135d64a50b66f'
};

async function sendTestEmail(templateId, templateData, recipientEmail) {
  try {
    const msg = {
      to: recipientEmail,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: templateId,
      dynamicTemplateData: templateData
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

const testData = {
  welcome: {
    firstName: 'John',
    dashboardUrl: 'https://coolpix.me/dashboard'
  },
  order_confirmation: {
    firstName: 'John',
    orderId: 'ORD-12345',
    planName: 'Professional Package',
    amount: 29.99,
    currency: 'USD',
    orderDate: 'December 24, 2024',
    dashboardUrl: 'https://coolpix.me/dashboard'
  },
  processing_started: {
    firstName: 'John',
    estimatedTime: '10-15 minutes',
    dashboardUrl: 'https://coolpix.me/dashboard',
    supportUrl: 'https://coolpix.me/support'
  },
  processing_complete: {
    firstName: 'John',
    downloadUrl: 'https://coolpix.me/download/test123',
    dashboardUrl: 'https://coolpix.me/dashboard',
    imageCount: 8,
    expiryDate: 'January 23, 2025'
  },
  payment_confirmation: {
    firstName: 'John',
    orderId: 'ORD-12345',
    amount: 29.99,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN-67890',
    receiptUrl: 'https://coolpix.me/receipt/ORD-12345',
    dashboardUrl: 'https://coolpix.me/dashboard'
  },
  password_reset: {
    firstName: 'John',
    resetUrl: 'https://coolpix.me/reset-password?token=test123',
    expiryTime: '1 hour'
  },
  promotional: {
    firstName: 'John',
    offerTitle: '50% Off Professional Headshots',
    offerDescription: 'Get stunning AI-generated headshots at half the price!',
    discountCode: 'SAVE50',
    ctaUrl: 'https://coolpix.me/pricing?code=SAVE50',
    expiryDate: 'December 31, 2024'
  },
  support_response: {
    firstName: 'John',
    ticketId: 'TICKET-123',
    subject: 'Question about image quality',
    responseMessage: 'Thank you for contacting us! We\'ve reviewed your concern about image quality. Our AI generates high-resolution 4K images that are perfect for professional use. If you\'re experiencing any issues with the quality, please let us know and we\'ll be happy to regenerate your images.',
    dashboardUrl: 'https://coolpix.me/dashboard'
  }
};

async function testTemplate(templateName, recipientEmail) {
  console.log(`🧪 Testing ${templateName} email...`);

  const templateId = TEMPLATE_IDS[templateName];
  const data = testData[templateName];

  if (!templateId || !data) {
    console.log(`❌ Template ${templateName} not found`);
    return false;
  }

  const result = await sendTestEmail(templateId, data, recipientEmail);

  if (result.success) {
    console.log(`✅ ${templateName} email sent successfully!`);
    return true;
  } else {
    console.log(`❌ Failed to send ${templateName} email:`, result.error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const templateName = args[0] || 'welcome';
  const recipientEmail = args[1] || 'test@example.com';

  console.log('📧 ProHeadshots Email Template Tester\n');

  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not found in environment variables');
    process.exit(1);
  }

  console.log(`📬 Recipient: ${recipientEmail}`);
  console.log(`📋 Template: ${templateName}\n`);

  if (templateName === 'all') {
    console.log('🚀 Testing all email templates...\n');
    let successCount = 0;

    for (const template of Object.keys(TEMPLATE_IDS)) {
      const success = await testTemplate(template, recipientEmail);
      if (success) successCount++;

      // Add delay between emails
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n📊 Results: ${successCount}/${Object.keys(TEMPLATE_IDS).length} emails sent successfully`);
  } else {
    await testTemplate(templateName, recipientEmail);
  }

  console.log('\n📧 Check your email inbox to see the templates!');
}

main().catch(console.error);
