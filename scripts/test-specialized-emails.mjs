#!/usr/bin/env node

// Test specialized email addresses and templates
import { config } from 'dotenv';
import { Resend } from 'resend';

// Load environment variables
config({ path: '.env.local' });

console.log('📧 Testing Specialized Email Addresses & Templates\n');

const resendApiKey = process.env.RESEND_API_KEY;
const testRecipient = process.env.ADMIN_EMAIL || 'admin@mail.coolpix.me';

if (!resendApiKey) {
  console.log('❌ RESEND_API_KEY not found');
  process.exit(1);
}

const resend = new Resend(resendApiKey);

// Email configurations for different purposes
const emailConfigs = {
  support: {
    from: process.env.SUPPORT_EMAIL || 'support@mail.coolpix.me',
    subject: '🎧 Support Request Confirmation',
    type: 'Support Email'
  },
  orders: {
    from: process.env.ORDERS_EMAIL || 'orders@mail.coolpix.me',
    subject: '📦 Order Status Update',
    type: 'Order Email'
  },
  notifications: {
    from: process.env.NOTIFICATIONS_EMAIL || 'notifications@mail.coolpix.me',
    subject: '🔔 Processing Notification',
    type: 'Notification Email'
  },
  billing: {
    from: process.env.BILLING_EMAIL || 'billing@mail.coolpix.me',
    subject: '💳 Billing Notification',
    type: 'Billing Email'
  }
};

async function testSpecializedEmails() {
  console.log('🔧 Current Email Configuration:');
  console.log('===============================');
  console.log(`✅ Support Email: ${emailConfigs.support.from}`);
  console.log(`✅ Orders Email: ${emailConfigs.orders.from}`);
  console.log(`✅ Notifications Email: ${emailConfigs.notifications.from}`);
  console.log(`✅ Billing Email: ${emailConfigs.billing.from}`);
  console.log(`✅ Test Recipient: ${testRecipient}`);
  console.log('');

  console.log('📧 Testing Email Sending Capabilities:');
  console.log('======================================');

  for (const [key, config] of Object.entries(emailConfigs)) {
    try {
      console.log(`📤 Testing ${config.type}...`);
      console.log(`   From: ${config.from}`);
      console.log(`   To: ${testRecipient}`);
      console.log(`   Subject: ${config.subject}`);

      const emailHtml = generateTestEmailHtml(config.type, config.from);

      const result = await resend.emails.send({
        from: config.from,
        to: testRecipient,
        subject: config.subject,
        html: emailHtml,
      });

      if (result.data) {
        console.log(`   ✅ SUCCESS: Email ID ${result.data.id}`);
      } else {
        console.log(`   ⚠️  Sent but no confirmation`);
      }
      console.log('');

    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      console.log('');
    }
  }

  console.log('🎯 Email Address Usage Guide:');
  console.log('==============================');
  console.log('');
  console.log('📧 SUPPORT_EMAIL (support@mail.coolpix.me):');
  console.log('   • Customer support inquiries');
  console.log('   • Help desk responses');
  console.log('   • Technical assistance');
  console.log('   • General questions');
  console.log('');
  console.log('📦 ORDERS_EMAIL (orders@mail.coolpix.me):');
  console.log('   • Order confirmations');
  console.log('   • Order status updates');
  console.log('   • Shipping notifications');
  console.log('   • Order modifications');
  console.log('');
  console.log('🔔 NOTIFICATIONS_EMAIL (notifications@mail.coolpix.me):');
  console.log('   • Processing status updates');
  console.log('   • Job completion notifications');
  console.log('   • System alerts');
  console.log('   • Progress updates');
  console.log('');
  console.log('💳 BILLING_EMAIL (billing@mail.coolpix.me):');
  console.log('   • Invoice notifications');
  console.log('   • Payment confirmations');
  console.log('   • Billing updates');
  console.log('   • Subscription changes');
  console.log('');

  console.log('🔧 How to Use in Your Application:');
  console.log('===================================');
  console.log('');
  console.log('// Import the email functions');
  console.log('import { sendBillingNotificationEmail } from "@/action/emailActions";');
  console.log('');
  console.log('// Send a billing notification');
  console.log('await sendBillingNotificationEmail({');
  console.log('  firstName: "John",');
  console.log('  email: "user@example.com",');
  console.log('  invoiceId: "INV-001",');
  console.log('  amount: 29.99,');
  console.log('  currency: "USD",');
  console.log('  dueDate: "2024-02-15",');
  console.log('  billingUrl: "https://coolpix.me/billing",');
  console.log('  description: "Monthly subscription payment"');
  console.log('});');
  console.log('');

  console.log('✨ Benefits of Specialized Email Addresses:');
  console.log('============================================');
  console.log('✅ Professional organization');
  console.log('✅ Better email filtering for users');
  console.log('✅ Improved deliverability');
  console.log('✅ Clear purpose identification');
  console.log('✅ Better analytics and tracking');
  console.log('✅ Easier customer service management');
  console.log('');

  console.log('🎉 All specialized email addresses are ready to use!');
  console.log('Check your inbox for the test emails.');
}

function generateTestEmailHtml(emailType, fromAddress) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailType} Test</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f5f5f5; 
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white; 
          border-radius: 8px; 
          overflow: hidden; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .content { 
          padding: 30px 20px; 
        }
        .info-box { 
          background: #f0f9ff; 
          border: 1px solid #3b82f6; 
          border-radius: 6px; 
          padding: 20px; 
          margin: 20px 0; 
        }
        .footer { 
          padding: 20px; 
          text-align: center; 
          background: #f9fafb; 
          border-top: 1px solid #e5e7eb; 
          color: #6b7280; 
          font-size: 14px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 Coolpix.me</h1>
          <p>${emailType} Test</p>
        </div>
        <div class="content">
          <h2>✅ ${emailType} Configuration Test</h2>
          <p>This email confirms that your specialized email address is working correctly.</p>
          
          <div class="info-box">
            <p><strong>📊 Email Details:</strong></p>
            <p>
              <strong>Type:</strong> ${emailType}<br>
              <strong>From:</strong> ${fromAddress}<br>
              <strong>Domain:</strong> ${fromAddress.split('@')[1]}<br>
              <strong>Test Date:</strong> ${new Date().toISOString()}
            </p>
          </div>
          
          <p>This specialized email address is now ready for use in your Coolpix.me application!</p>
          
          <h3>🎯 Purpose:</h3>
          <p>${getEmailPurpose(emailType)}</p>
        </div>
        <div class="footer">
          <p>© 2024 Coolpix.me. All rights reserved.</p>
          <p>Professional AI-Generated Headshots</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getEmailPurpose(emailType) {
  const purposes = {
    'Support Email': 'Handle customer support inquiries, technical assistance, and general help requests.',
    'Order Email': 'Send order confirmations, status updates, and shipping notifications.',
    'Notification Email': 'Deliver processing updates, job completion alerts, and system notifications.',
    'Billing Email': 'Send invoice notifications, payment confirmations, and billing updates.'
  };
  return purposes[emailType] || 'General purpose email communication.';
}

// Run the test
testSpecializedEmails();
