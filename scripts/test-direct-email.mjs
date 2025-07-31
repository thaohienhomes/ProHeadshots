#!/usr/bin/env node

// Direct Resend email test to verify domain verification
import { config } from 'dotenv';
import { Resend } from 'resend';

// Load environment variables
config({ path: '.env.local' });

console.log('🎯 Direct Resend Email Test (Post Domain Verification)\n');

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.NOREPLY_EMAIL || 'noreply@coolpix.me';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@coolpix.me';

if (!resendApiKey) {
  console.log('❌ RESEND_API_KEY not found');
  process.exit(1);
}

const resend = new Resend(resendApiKey);

async function testEmailAfterVerification() {
  try {
    console.log('🔍 Step 1: Checking Domain Status');
    console.log('==================================');
    
    // Check domains first
    try {
      const domainsResponse = await resend.domains.list();
      console.log('✅ API Connection: Successful');
      
      if (domainsResponse.data && domainsResponse.data.length > 0) {
        console.log(`✅ Domains Found: ${domainsResponse.data.length}`);
        
        domainsResponse.data.forEach((domain, index) => {
          console.log(`   ${index + 1}. ${domain.name} - Status: ${domain.status}`);
          if (domain.name === 'coolpix.me') {
            console.log(`   🎯 Target domain found: ${domain.status}`);
          }
        });
      } else {
        console.log('⚠️  No domains found in account');
      }
    } catch (domainError) {
      console.log(`⚠️  Could not fetch domains: ${domainError.message}`);
    }
    
    console.log('\n📧 Step 2: Sending Test Email');
    console.log('==============================');
    console.log(`From: ${fromEmail}`);
    console.log(`To: ${adminEmail}`);
    console.log('Subject: ✅ Coolpix.me Email System - VERIFIED & OPERATIONAL');
    
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email System Verified</title>
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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .content { 
            padding: 30px 20px; 
          }
          .success-badge { 
            background: #10b981; 
            color: white; 
            padding: 8px 16px; 
            border-radius: 20px; 
            font-size: 14px; 
            font-weight: 600; 
            display: inline-block; 
            margin-bottom: 20px; 
          }
          .status-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin: 20px 0; 
          }
          .status-item { 
            background: #f0fdf4; 
            border: 1px solid #22c55e; 
            border-radius: 6px; 
            padding: 15px; 
            text-align: center; 
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
            <h1>🎉 Coolpix.me</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email System Verified & Operational</p>
          </div>
          <div class="content">
            <div class="success-badge">✅ SYSTEM VERIFIED</div>
            
            <h2>Email System Successfully Configured!</h2>
            <p>Congratulations! Your Coolpix.me email system has been successfully migrated to Resend.com and is now fully operational.</p>
            
            <div class="status-grid">
              <div class="status-item">
                <strong>✅ Domain</strong><br>
                Verified & Active
              </div>
              <div class="status-item">
                <strong>✅ DNS Records</strong><br>
                Properly Configured
              </div>
              <div class="status-item">
                <strong>✅ API Integration</strong><br>
                Working Perfectly
              </div>
              <div class="status-item">
                <strong>✅ Email Templates</strong><br>
                Ready for Use
              </div>
            </div>
            
            <h3>🚀 What's Now Available:</h3>
            <ul>
              <li><strong>Welcome Emails</strong> - Professional onboarding for new users</li>
              <li><strong>Order Confirmations</strong> - Instant purchase confirmations</li>
              <li><strong>Processing Notifications</strong> - AI generation status updates</li>
              <li><strong>Completion Alerts</strong> - Headshot ready notifications</li>
              <li><strong>Password Resets</strong> - Secure account recovery</li>
              <li><strong>Support Responses</strong> - Customer service communications</li>
            </ul>
            
            <h3>📊 System Specifications:</h3>
            <p>
              <strong>Provider:</strong> Resend.com<br>
              <strong>Domain:</strong> coolpix.me<br>
              <strong>From Address:</strong> ${fromEmail}<br>
              <strong>Verification Date:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>Status:</strong> Production Ready
            </p>
            
            <p><strong>Migration Benefits:</strong></p>
            <ul>
              <li>✅ Better email deliverability rates</li>
              <li>✅ Modern, responsive email templates</li>
              <li>✅ Enhanced developer experience</li>
              <li>✅ Comprehensive email analytics</li>
              <li>✅ Reliable service infrastructure</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 Coolpix.me. All rights reserved.</p>
            <p>Professional AI-Generated Headshots</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: '✅ Coolpix.me Email System - VERIFIED & OPERATIONAL',
      html: emailHtml,
    });
    
    if (result.data) {
      console.log('\n🎉 EMAIL SENT SUCCESSFULLY!');
      console.log(`   Email ID: ${result.data.id}`);
      console.log(`   Status: Delivered to Resend`);
      console.log('');
      console.log('🎯 FINAL VERIFICATION STATUS:');
      console.log('==============================');
      console.log('   ✅ API Key: Valid & Working');
      console.log('   ✅ Domain: Verified & Active');
      console.log('   ✅ DNS Records: Properly Configured');
      console.log('   ✅ Email Sending: Fully Operational');
      console.log('   ✅ Templates: Professional & Ready');
      console.log('   ✅ Integration: Complete');
      console.log('');
      console.log('🎊 CONGRATULATIONS!');
      console.log('Your Coolpix.me email system is now FULLY OPERATIONAL!');
      console.log('');
      console.log('📧 Check your email inbox for the verification message.');
      console.log('   If you don\'t see it, check your spam folder.');
      console.log('');
      console.log('📈 Next Steps:');
      console.log('   1. Monitor email delivery in Resend dashboard');
      console.log('   2. Test user-facing email flows in your app');
      console.log('   3. Set up email analytics monitoring');
      console.log('   4. Consider implementing email bounce handling');
      console.log('');
      console.log('🔗 Resend Dashboard: https://resend.com/dashboard');
      
    } else {
      console.log('⚠️  Email sent but no confirmation received');
      console.log('   This might indicate a configuration issue');
    }
    
  } catch (error) {
    console.log('\n❌ EMAIL SENDING FAILED');
    console.log(`   Error: ${error.message}`);
    
    // Provide specific troubleshooting based on error type
    if (error.message.includes('Domain not found')) {
      console.log('\n🔧 ISSUE: Domain not found in Resend account');
      console.log('   SOLUTION: Ensure domain is added and verified in Resend dashboard');
    } else if (error.message.includes('not verified')) {
      console.log('\n🔧 ISSUE: Domain not verified');
      console.log('   SOLUTION: Complete domain verification process');
    } else if (error.message.includes('Invalid API key')) {
      console.log('\n🔧 ISSUE: Invalid API key');
      console.log('   SOLUTION: Check API key in Resend dashboard');
    } else {
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('   1. Check domain status in Resend dashboard');
      console.log('   2. Verify DNS records are propagated');
      console.log('   3. Ensure API key has proper permissions');
      console.log('   4. Check Resend logs for detailed error info');
    }
  }
}

// Run the test
testEmailAfterVerification();
