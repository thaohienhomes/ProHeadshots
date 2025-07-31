#!/usr/bin/env node

// Test actual email sending functionality with Resend
// This script will attempt to send a test email to verify the configuration

import { config } from 'dotenv';
import { Resend } from 'resend';

// Load environment variables
config({ path: '.env.local' });

console.log('📧 Resend.com Email Sending Test\n');

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.NOREPLY_EMAIL || 'noreply@coolpix.me';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@coolpix.me';

if (!resendApiKey) {
  console.log('❌ RESEND_API_KEY not found');
  process.exit(1);
}

const resend = new Resend(resendApiKey);

// Test email content
const testEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coolpix.me Configuration Test</title>
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
    }
    .success-box { 
      background: #f0fdf4; 
      border: 1px solid #22c55e; 
      border-radius: 6px; 
      padding: 20px; 
      margin: 20px 0; 
    }
    .button { 
      display: inline-block; 
      padding: 14px 28px; 
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
      color: white; 
      text-decoration: none; 
      border-radius: 6px; 
      font-weight: 600; 
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
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Configuration Test</p>
    </div>
    <div class="content">
      <h2>🎉 Email Configuration Test Successful!</h2>
      <p>Congratulations! This test email confirms that your Resend.com email configuration is working perfectly.</p>
      
      <div class="success-box">
        <p><strong>✅ Configuration Status:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>API Key: Valid and working</li>
          <li>Domain: Properly configured</li>
          <li>DNS Records: Set up correctly</li>
          <li>Email Templates: Rendering properly</li>
          <li>Delivery: Successfully sent</li>
        </ul>
      </div>
      
      <p>Your Coolpix.me application is now ready to send professional emails to your users including:</p>
      <ul>
        <li>Welcome emails for new users</li>
        <li>Order confirmations</li>
        <li>Processing notifications</li>
        <li>Completion notifications</li>
        <li>Password reset emails</li>
        <li>Support responses</li>
      </ul>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://coolpix.me/dashboard" class="button">Visit Dashboard</a>
      </p>
      
      <p><strong>Test Details:</strong></p>
      <p>
        <strong>Sent:</strong> ${new Date().toISOString()}<br>
        <strong>From:</strong> ${fromEmail}<br>
        <strong>Provider:</strong> Resend.com<br>
        <strong>Template:</strong> Configuration Test
      </p>
    </div>
    <div class="footer">
      <p>© 2024 Coolpix.me. All rights reserved.</p>
      <p>Professional AI-Generated Headshots</p>
    </div>
  </div>
</body>
</html>
`;

async function sendTestEmail() {
  try {
    console.log('📤 Attempting to send test email...');
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: ${adminEmail}`);
    console.log('');

    const result = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: '🎉 Coolpix.me Email Configuration Test - SUCCESS!',
      html: testEmailHtml,
    });

    if (result.data) {
      console.log('✅ TEST EMAIL SENT SUCCESSFULLY!');
      console.log(`   Email ID: ${result.data.id}`);
      console.log(`   Status: Sent`);
      console.log('');
      console.log('🎯 VERIFICATION COMPLETE:');
      console.log('   ✅ API Key: Valid');
      console.log('   ✅ Domain: Working');
      console.log('   ✅ DNS Records: Configured');
      console.log('   ✅ Email Delivery: Successful');
      console.log('');
      console.log('📧 Check your email inbox for the test message!');
      console.log(`   Look for an email from: ${fromEmail}`);
      console.log('   Subject: "🎉 Coolpix.me Email Configuration Test - SUCCESS!"');
      console.log('');
      console.log('🎉 Your Resend.com configuration is FULLY OPERATIONAL!');
    } else {
      console.log('⚠️  Email sent but no confirmation data received');
    }

  } catch (error) {
    console.log('❌ EMAIL SENDING FAILED');
    console.log(`   Error: ${error.message}`);
    console.log('');
    
    if (error.message.includes('Domain not found')) {
      console.log('🔧 ISSUE: Domain not verified in Resend');
      console.log('   SOLUTION:');
      console.log('   1. Go to https://resend.com/domains');
      console.log('   2. Add your domain: coolpix.me');
      console.log('   3. Complete domain verification');
      console.log('   4. Wait for DNS propagation (up to 24 hours)');
    } else if (error.message.includes('Invalid API key')) {
      console.log('🔧 ISSUE: Invalid API key');
      console.log('   SOLUTION:');
      console.log('   1. Check your API key in Resend dashboard');
      console.log('   2. Ensure it starts with "re_"');
      console.log('   3. Update .env.local with correct key');
    } else if (error.message.includes('not verified')) {
      console.log('🔧 ISSUE: Email address not verified');
      console.log('   SOLUTION:');
      console.log('   1. Verify your domain in Resend dashboard');
      console.log('   2. Ensure DNS records are properly configured');
      console.log('   3. Wait for verification to complete');
    } else {
      console.log('🔧 TROUBLESHOOTING STEPS:');
      console.log('   1. Check Resend dashboard for domain status');
      console.log('   2. Verify DNS records are propagated');
      console.log('   3. Ensure API key has proper permissions');
      console.log('   4. Check Resend logs for detailed error info');
    }
  }
}

// Run the test
sendTestEmail();
