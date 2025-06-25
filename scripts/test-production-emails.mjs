#!/usr/bin/env node

/**
 * Production email testing script for ProHeadshots
 * Tests email functionality on the live site
 * Run with: node scripts/test-production-emails.mjs [your-email] [site-url]
 */

async function testProductionEmail(siteUrl, email, templateType) {
  const testEndpoint = `${siteUrl}/api/test-email`;
  
  try {
    const response = await fetch(testEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        template: templateType,
        test: true
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${templateType} email test: ${result.message || 'Success'}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ ${templateType} email test failed: ${response.status} ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${templateType} email test error: ${error.message}`);
    return false;
  }
}

async function testSiteHealth(siteUrl) {
  console.log('🔍 Testing site health...');
  
  try {
    const response = await fetch(siteUrl);
    if (response.ok) {
      console.log('✅ Site is accessible');
      return true;
    } else {
      console.log(`❌ Site returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Site is not accessible: ${error.message}`);
    return false;
  }
}

async function testEmailEndpoint(siteUrl) {
  console.log('🔍 Testing email API endpoint...');
  
  try {
    const response = await fetch(`${siteUrl}/api/health`);
    if (response.ok) {
      console.log('✅ API endpoints are accessible');
      return true;
    } else {
      console.log(`⚠️ Health endpoint returned: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`⚠️ Health endpoint test failed: ${error.message}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const testEmail = args[0] || 'test@example.com';
  const siteUrl = args[1] || 'https://coolpix.me';
  
  console.log('🚀 ProHeadshots Production Email Testing\n');
  console.log(`🌐 Site URL: ${siteUrl}`);
  console.log(`📧 Test Email: ${testEmail}\n`);
  
  // Test site health first
  const siteHealthy = await testSiteHealth(siteUrl);
  if (!siteHealthy) {
    console.log('\n❌ Site is not accessible. Deployment may have failed.');
    process.exit(1);
  }
  
  // Test API health
  await testEmailEndpoint(siteUrl);
  
  console.log('\n📧 Testing email templates...\n');
  
  const emailTests = [
    'welcome',
    'order_confirmation',
    'processing_started',
    'processing_complete',
    'payment_confirmation'
  ];
  
  let successCount = 0;
  
  for (const template of emailTests) {
    const success = await testProductionEmail(siteUrl, testEmail, template);
    if (success) successCount++;
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📊 Production Email Test Results:');
  console.log(`✅ Successful: ${successCount}/${emailTests.length}`);
  console.log(`❌ Failed: ${emailTests.length - successCount}/${emailTests.length}`);
  
  if (successCount === emailTests.length) {
    console.log('\n🎉 All production email tests passed!');
    console.log('📧 Check your email inbox to verify the templates.');
    console.log('\n✅ Your email system is working correctly in production!');
  } else {
    console.log('\n⚠️ Some email tests failed. Check the following:');
    console.log('1. Verify environment variables are set correctly in Vercel');
    console.log('2. Check SendGrid API key and template IDs');
    console.log('3. Review application logs for errors');
    console.log('4. Ensure email API endpoints are deployed');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Test the complete user journey (signup → purchase → processing)');
  console.log('2. Monitor SendGrid dashboard for delivery metrics');
  console.log('3. Check email formatting across different email clients');
  console.log('4. Set up monitoring and alerts for email delivery');
}

main().catch(console.error);
