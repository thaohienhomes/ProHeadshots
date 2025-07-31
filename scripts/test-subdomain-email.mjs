#!/usr/bin/env node

// Test subdomain email configuration
import { config } from 'dotenv';
import { Resend } from 'resend';

// Load environment variables
config({ path: '.env.local' });

console.log('📧 Testing Subdomain Email Configuration (mail.coolpix.me)\n');

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.NOREPLY_EMAIL || 'noreply@mail.coolpix.me';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@mail.coolpix.me';

console.log('🔧 Current Configuration:');
console.log('==========================');
console.log(`✅ From Email: ${fromEmail}`);
console.log(`✅ Admin Email: ${adminEmail}`);
console.log(`✅ Domain: ${fromEmail.split('@')[1]}`);
console.log('');

if (!resendApiKey) {
  console.log('❌ RESEND_API_KEY not found');
  process.exit(1);
}

const resend = new Resend(resendApiKey);

async function testSubdomainConfiguration() {
  try {
    console.log('🔍 Step 1: Domain Status Check');
    console.log('===============================');
    
    const domainsResponse = await resend.domains.list();
    console.log('✅ API Connection: Successful');
    
    if (domainsResponse.data && domainsResponse.data.length > 0) {
      console.log(`✅ Domains Found: ${domainsResponse.data.length}`);
      
      let targetDomainFound = false;
      domainsResponse.data.forEach((domain, index) => {
        console.log(`   ${index + 1}. ${domain.name} - Status: ${domain.status}`);
        if (domain.name === 'mail.coolpix.me' || domain.name === 'coolpix.me') {
          console.log(`   🎯 Target domain found: ${domain.name} (${domain.status})`);
          targetDomainFound = true;
        }
      });
      
      if (!targetDomainFound) {
        console.log('⚠️  Neither mail.coolpix.me nor coolpix.me found in your account');
        console.log('💡 You need to add mail.coolpix.me as a domain in Resend');
      }
    } else {
      console.log('⚠️  No domains found in account');
      console.log('💡 You need to add mail.coolpix.me domain in Resend dashboard');
    }
    
    console.log('\n📧 Step 2: Test Email Sending');
    console.log('==============================');
    
    const testEmailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subdomain Email Test</title>
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
            background: #eff6ff; 
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
            <p>Subdomain Email Configuration Test</p>
          </div>
          <div class="content">
            <h2>🎯 Subdomain Email Test</h2>
            <p>This email tests the subdomain configuration for mail.coolpix.me</p>
            
            <div class="info-box">
              <p><strong>📊 Configuration Details:</strong></p>
              <p>
                <strong>From:</strong> ${fromEmail}<br>
                <strong>To:</strong> ${adminEmail}<br>
                <strong>Domain:</strong> ${fromEmail.split('@')[1]}<br>
                <strong>Test Date:</strong> ${new Date().toISOString()}
              </p>
            </div>
            
            <p>If you receive this email, it means your subdomain email configuration is working!</p>
            
            <h3>📧 Recommended Email Addresses:</h3>
            <ul>
              <li><strong>noreply@mail.coolpix.me</strong> - System notifications</li>
              <li><strong>admin@mail.coolpix.me</strong> - Administrative emails</li>
              <li><strong>support@mail.coolpix.me</strong> - Customer support</li>
              <li><strong>orders@mail.coolpix.me</strong> - Order confirmations</li>
              <li><strong>notifications@mail.coolpix.me</strong> - Processing updates</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 Coolpix.me. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    console.log(`Sending test email from: ${fromEmail}`);
    console.log(`To: ${adminEmail}`);
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: '📧 Subdomain Email Test - mail.coolpix.me',
      html: testEmailHtml,
    });
    
    if (result.data) {
      console.log('\n🎉 SUBDOMAIN EMAIL TEST SUCCESSFUL!');
      console.log(`   Email ID: ${result.data.id}`);
      console.log(`   From: ${fromEmail}`);
      console.log(`   Domain: ${fromEmail.split('@')[1]}`);
      console.log('');
      console.log('✅ Your subdomain email configuration is working!');
      console.log('📧 Check your inbox for the test email.');
      
    } else {
      console.log('\n⚠️  Email sent but no confirmation received');
    }
    
  } catch (error) {
    console.log('\n❌ SUBDOMAIN EMAIL TEST FAILED');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('Domain not found')) {
      console.log('\n🔧 SOLUTION: Add mail.coolpix.me domain to Resend');
      console.log('   1. Go to https://resend.com/domains');
      console.log('   2. Click "Add Domain"');
      console.log('   3. Enter: mail.coolpix.me');
      console.log('   4. Complete verification process');
    }
  }
}

// Run the test
testSubdomainConfiguration();
