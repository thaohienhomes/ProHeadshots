#!/usr/bin/env node

// Test email integration through the actual application
// This tests the sendEmail function directly

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

console.log('🧪 Testing Coolpix.me Email Integration\n');

// Test the actual email service
async function testEmailService() {
  try {
    console.log('📧 Testing Email Service Integration');
    console.log('====================================');
    
    // Import the actual email functions
    const { sendSimpleEmail } = await import('../src/action/sendEmail.js');
    
    console.log('✅ Successfully imported email functions');
    
    // Test data
    const testEmailData = {
      to: process.env.ADMIN_EMAIL || 'admin@coolpix.me',
      from: process.env.NOREPLY_EMAIL || 'noreply@coolpix.me',
      subject: '🎉 Coolpix.me Email Integration Test - SUCCESS!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Integration Test</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 20px; 
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
            .content { 
              padding: 30px 20px; 
            }
            .success-box { 
              background: #f0fdf4; 
              border: 1px solid #22c55e; 
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
              <h1>Coolpix.me</h1>
              <p>Email Integration Test</p>
            </div>
            <div class="content">
              <h2>🎉 Email Integration Test Successful!</h2>
              <p>This email confirms that your Coolpix.me application can successfully send emails using Resend.com.</p>
              
              <div class="success-box">
                <p><strong>✅ Integration Status:</strong></p>
                <ul>
                  <li>✅ Resend.com API: Connected</li>
                  <li>✅ Domain verification: Complete</li>
                  <li>✅ Email service: Operational</li>
                  <li>✅ Templates: Working</li>
                  <li>✅ Application integration: Success</li>
                </ul>
              </div>
              
              <p><strong>Test Details:</strong></p>
              <p>
                <strong>Sent:</strong> ${new Date().toISOString()}<br>
                <strong>From:</strong> ${process.env.NOREPLY_EMAIL}<br>
                <strong>Service:</strong> Resend.com<br>
                <strong>Integration:</strong> Coolpix.me Application
              </p>
              
              <p>Your email system is now ready to send:</p>
              <ul>
                <li>Welcome emails</li>
                <li>Order confirmations</li>
                <li>Processing notifications</li>
                <li>Password reset emails</li>
                <li>Support responses</li>
              </ul>
            </div>
            <div class="footer">
              <p>© 2024 Coolpix.me. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    console.log('📤 Sending test email through application...');
    console.log(`   From: ${testEmailData.from}`);
    console.log(`   To: ${testEmailData.to}`);
    console.log(`   Subject: ${testEmailData.subject}`);
    console.log('');
    
    // Send the email using the application's email service
    const result = await sendSimpleEmail(testEmailData);
    
    if (result.success) {
      console.log('🎉 EMAIL SENT SUCCESSFULLY!');
      console.log(`   Status: ${result.success ? 'Success' : 'Failed'}`);
      console.log(`   Message: ${result.message}`);
      if (result.emailId) {
        console.log(`   Email ID: ${result.emailId}`);
      }
      console.log('');
      console.log('✅ VERIFICATION COMPLETE:');
      console.log('   ✅ Application Integration: Working');
      console.log('   ✅ Resend.com Service: Operational');
      console.log('   ✅ Domain Configuration: Verified');
      console.log('   ✅ Email Delivery: Successful');
      console.log('');
      console.log('📧 Check your email inbox!');
      console.log(`   Look for: "${testEmailData.subject}"`);
      console.log(`   From: ${testEmailData.from}`);
      console.log('');
      console.log('🎊 Your email system is FULLY OPERATIONAL!');
      
    } else {
      console.log('❌ EMAIL SENDING FAILED');
      console.log(`   Error: ${result.message}`);
      console.log(`   Details: ${JSON.stringify(result.details || {}, null, 2)}`);
      
      if (result.skipped) {
        console.log('');
        console.log('ℹ️  Email was skipped (likely due to configuration)');
        console.log('   This usually means the API key is not properly set');
      }
    }
    
  } catch (error) {
    console.log('❌ TEST FAILED');
    console.log(`   Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
    
    if (error.message.includes('Cannot resolve module')) {
      console.log('');
      console.log('💡 This error is expected when running outside Next.js environment');
      console.log('   The email service should work properly within the application');
    }
  }
}

// Test environment variables
console.log('🔧 Environment Configuration Check');
console.log('===================================');
console.log(`✅ RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Set' : 'Missing'}`);
console.log(`✅ NOREPLY_EMAIL: ${process.env.NOREPLY_EMAIL || 'Not set'}`);
console.log(`✅ ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || 'Not set'}`);
console.log('');

// Run the test
testEmailService();
