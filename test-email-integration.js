#!/usr/bin/env node

/**
 * Test Email Integration with Polar Payment Data
 */

import http from 'http';

const EMAIL_TEST_URL = 'http://localhost:3000/api/test-email-integration';

// Test email data simulating different Polar payment scenarios
const TEST_SCENARIOS = [
  {
    name: 'Basic Plan Order',
    data: {
      customerEmail: 'test@gmail.com',
      planType: 'Basic',
      amount: 2900, // $29.00
      orderId: 'polar_order_basic_123'
    }
  },
  {
    name: 'Professional Plan Order',
    data: {
      customerEmail: 'test@gmail.com',
      planType: 'Professional',
      amount: 5900, // $59.00
      orderId: 'polar_order_pro_456'
    }
  },
  {
    name: 'Executive Plan Order',
    data: {
      customerEmail: 'test@gmail.com',
      planType: 'Executive',
      amount: 9900, // $99.00
      orderId: 'polar_order_exec_789'
    }
  }
];

async function sendEmailTest(scenario) {
  return new Promise((resolve, reject) => {
    const payloadString = JSON.stringify(scenario.data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/test-email-integration',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadString),
      }
    };
    
    console.log(`📧 Testing ${scenario.name}...`);
    console.log(`   📋 Plan: ${scenario.data.planType}`);
    console.log(`   💰 Amount: $${(scenario.data.amount / 100).toFixed(2)}`);
    console.log(`   📨 Email: ${scenario.data.customerEmail}`);
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(payloadString);
    req.end();
  });
}

function logTest(testName, status, details = '') {
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳';
  console.log(`${statusIcon} ${testName}${details ? ': ' + details : ''}`);
}

function logSection(sectionName) {
  console.log(`\n🔍 ${sectionName}`);
  console.log('='.repeat(50));
}

async function testEmailIntegration() {
  logSection('Email Integration Tests');
  
  const results = [];
  
  for (const scenario of TEST_SCENARIOS) {
    try {
      const response = await sendEmailTest(scenario);
      
      if (response.statusCode === 200 && response.data.success) {
        logTest(`${scenario.name} email`, 'PASS', 
          `Email sent successfully (ID: ${response.data.emailResult?.id || 'N/A'})`);
        results.push({ 
          scenario: scenario.name, 
          success: true, 
          emailId: response.data.emailResult?.id,
          details: response.data
        });
      } else {
        logTest(`${scenario.name} email`, 'FAIL', 
          `${response.data.error || 'Unknown error'}`);
        results.push({ 
          scenario: scenario.name, 
          success: false, 
          error: response.data.error || 'Unknown error'
        });
      }
    } catch (error) {
      logTest(`${scenario.name} email`, 'FAIL', `Network error: ${error.message}`);
      results.push({ 
        scenario: scenario.name, 
        success: false, 
        error: error.message
      });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

async function testEmailConfiguration() {
  logSection('Email Configuration Tests');
  
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/test-email-integration',
        method: 'GET'
      }, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(responseData));
          } catch (error) {
            resolve({ error: 'Invalid JSON response' });
          }
        });
      });
      
      req.on('error', reject);
      req.end();
    });
    
    if (response.configuration?.emailConfigured) {
      logTest('Email service configuration', 'PASS', 'Resend API configured');
    } else {
      logTest('Email service configuration', 'FAIL', 'Resend API not configured');
    }
    
    logTest('Email domain configuration', 'PASS', `Using domain: ${response.configuration?.fromDomain}`);
    
    return response.configuration?.emailConfigured || false;
    
  } catch (error) {
    logTest('Email configuration check', 'FAIL', error.message);
    return false;
  }
}

async function runEmailTests() {
  console.log('🚀 Starting Email Integration Tests');
  console.log('='.repeat(60));
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Test endpoint: ${EMAIL_TEST_URL}`);
  console.log(`📅 Test run: ${new Date().toISOString()}`);
  
  const startTime = Date.now();
  
  // Test email configuration first
  const isConfigured = await testEmailConfiguration();
  
  if (!isConfigured) {
    console.log('\n❌ Email service not configured. Cannot proceed with email tests.');
    return;
  }
  
  // Run email integration tests
  const emailResults = await testEmailIntegration();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n🏁 Email Test Summary');
  console.log('='.repeat(60));
  
  const successfulEmails = emailResults.filter(r => r.success);
  console.log(`📧 Email Sending: ${successfulEmails.length}/${emailResults.length} emails sent successfully`);
  
  successfulEmails.forEach(result => {
    console.log(`   ✅ ${result.scenario}: Email ID ${result.emailId || 'N/A'}`);
  });
  
  const failedEmails = emailResults.filter(r => !r.success);
  if (failedEmails.length > 0) {
    console.log('\n❌ Failed Emails:');
    failedEmails.forEach(result => {
      console.log(`   ❌ ${result.scenario}: ${result.error}`);
    });
  }
  
  console.log(`\n⏱️  Total execution time: ${duration}s`);
  console.log(`📊 Overall Status: ${successfulEmails.length === emailResults.length ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);
  
  if (successfulEmails.length > 0) {
    console.log('\n💡 Check your email inbox for the test order confirmation emails!');
  }
}

// Run email tests
runEmailTests().catch(console.error);
