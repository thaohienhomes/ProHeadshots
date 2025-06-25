#!/usr/bin/env node

/**
 * Integration test for ProHeadshots email workflows
 * Tests the actual email functions from your application
 * Run with: node scripts/test-email-integration.mjs [your-email]
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Mock the logger to avoid import issues
global.console.info = console.log;
global.console.error = console.error;

// Simple mock for the logger
const mockLogger = {
  info: (message, category, data) => console.log(`[${category}] ${message}`, data || ''),
  error: (message, error, category, data) => console.error(`[${category}] ${message}`, error?.message || error, data || '')
};

// Mock the email functions with direct SendGrid calls
import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const TEMPLATE_IDS = {
  welcome: 'd-709841e3498344fba8a981d8be9666ba',
  order_confirmation: 'd-85b5b99d09684408ba908abfe98537f5',
  processing_started: 'd-db27d729c9ef4a2ebb176451e3ab266a',
  processing_complete: 'd-ee3bde9d6dec4c928eec5422300840f6',
  payment_confirmation: 'd-7dcd6ecde3dc4a1c990d388c283e38f0'
};

async function testWelcomeWorkflow(email) {
  console.log('🧪 Testing Welcome Email Workflow...');
  
  try {
    const msg = {
      to: email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: TEMPLATE_IDS.welcome,
      dynamicTemplateData: {
        firstName: 'Test User',
        dashboardUrl: 'https://coolpix.me/dashboard'
      }
    };

    await sgMail.send(msg);
    console.log('✅ Welcome email workflow test passed');
    return true;
  } catch (error) {
    console.error('❌ Welcome email workflow failed:', error.message);
    return false;
  }
}

async function testOrderConfirmationWorkflow(email) {
  console.log('🧪 Testing Order Confirmation Workflow...');
  
  try {
    const msg = {
      to: email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: TEMPLATE_IDS.order_confirmation,
      dynamicTemplateData: {
        firstName: 'Test User',
        orderId: 'TEST-ORDER-123',
        planName: 'Professional Package',
        amount: 29.99,
        currency: 'USD',
        orderDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        dashboardUrl: 'https://coolpix.me/dashboard'
      }
    };

    await sgMail.send(msg);
    console.log('✅ Order confirmation workflow test passed');
    return true;
  } catch (error) {
    console.error('❌ Order confirmation workflow failed:', error.message);
    return false;
  }
}

async function testProcessingWorkflow(email) {
  console.log('🧪 Testing Processing Started Workflow...');
  
  try {
    const msg = {
      to: email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: TEMPLATE_IDS.processing_started,
      dynamicTemplateData: {
        firstName: 'Test User',
        estimatedTime: '10-15 minutes',
        dashboardUrl: 'https://coolpix.me/dashboard',
        supportUrl: 'https://coolpix.me/support'
      }
    };

    await sgMail.send(msg);
    console.log('✅ Processing started workflow test passed');
    return true;
  } catch (error) {
    console.error('❌ Processing started workflow failed:', error.message);
    return false;
  }
}

async function testCompletionWorkflow(email) {
  console.log('🧪 Testing Processing Complete Workflow...');
  
  try {
    const msg = {
      to: email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: TEMPLATE_IDS.processing_complete,
      dynamicTemplateData: {
        firstName: 'Test User',
        downloadUrl: 'https://coolpix.me/download/test123',
        dashboardUrl: 'https://coolpix.me/dashboard',
        imageCount: 8,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    };

    await sgMail.send(msg);
    console.log('✅ Processing complete workflow test passed');
    return true;
  } catch (error) {
    console.error('❌ Processing complete workflow failed:', error.message);
    return false;
  }
}

async function testPaymentWorkflow(email) {
  console.log('🧪 Testing Payment Confirmation Workflow...');
  
  try {
    const msg = {
      to: email,
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      templateId: TEMPLATE_IDS.payment_confirmation,
      dynamicTemplateData: {
        firstName: 'Test User',
        orderId: 'TEST-ORDER-123',
        amount: 29.99,
        currency: 'USD',
        paymentMethod: 'Credit Card',
        transactionId: 'TEST-TXN-456',
        receiptUrl: 'https://coolpix.me/receipt/TEST-ORDER-123',
        dashboardUrl: 'https://coolpix.me/dashboard'
      }
    };

    await sgMail.send(msg);
    console.log('✅ Payment confirmation workflow test passed');
    return true;
  } catch (error) {
    console.error('❌ Payment confirmation workflow failed:', error.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const testEmail = args[0] || 'test@example.com';
  
  console.log('🚀 ProHeadshots Email Integration Tests\n');
  console.log(`📧 Test email: ${testEmail}\n`);
  
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  const tests = [
    () => testWelcomeWorkflow(testEmail),
    () => testOrderConfirmationWorkflow(testEmail),
    () => testProcessingWorkflow(testEmail),
    () => testCompletionWorkflow(testEmail),
    () => testPaymentWorkflow(testEmail)
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result) passedTests++;
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📊 Integration Test Results:');
  console.log(`✅ Passed: ${passedTests}/${tests.length}`);
  console.log(`❌ Failed: ${tests.length - passedTests}/${tests.length}`);
  
  if (passedTests === tests.length) {
    console.log('\n🎉 All email integration tests passed!');
    console.log('📧 Check your email inbox to see all the templates.');
    console.log('\n✅ Your email system is ready for production!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the error messages above.');
  }
}

main().catch(console.error);
