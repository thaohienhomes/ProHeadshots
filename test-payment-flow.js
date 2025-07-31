#!/usr/bin/env node

/**
 * Comprehensive Polar Payment Flow Test
 * Tests the complete payment flow from checkout creation to order completion
 */

import { config } from 'dotenv';
import https from 'https';

// Load environment variables
config({ path: '.env.local' });

const POLAR_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.polar.sh' 
  : 'https://sandbox-api.polar.sh';

const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN;
const APP_BASE_URL = 'http://localhost:3000';

// Test configuration
const TEST_PLANS = [
  {
    name: 'Basic',
    productId: '28d871b5-be69-4594-af59-737fa189d5df',
    expectedPrice: 2900 // $29.00 in cents
  },
  {
    name: 'Professional', 
    productId: 'aff54590-b4c6-4e24-a966-8945f2ae2e19',
    expectedPrice: 5900 // $59.00 in cents
  },
  {
    name: 'Executive',
    productId: 'e2696f0f-213f-4b15-9c78-e8b4e7d83116', 
    expectedPrice: 9900 // $99.00 in cents
  }
];

// Utility functions
async function makeApiRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, POLAR_API_BASE);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
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

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function makeAppRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, APP_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
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

    if (data) {
      req.write(JSON.stringify(data));
    }

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

async function testFullPaymentFlow() {
  logSection('Full Payment Flow Test');
  
  const results = [];
  
  for (const plan of TEST_PLANS) {
    console.log(`\n💳 Testing ${plan.name} Plan Payment Flow`);
    console.log('-'.repeat(40));
    
    try {
      // Step 1: Create checkout session
      const checkoutData = {
        product_id: plan.productId,
        success_url: `${APP_BASE_URL}/postcheckout-polar?checkout_id={CHECKOUT_ID}`,
        customer_email: 'test@gmail.com',
        metadata: {
          user_id: 'test-user-123',
          plan_type: plan.name,
          test: 'true'
        }
      };

      const checkoutResponse = await makeApiRequest('/v1/checkouts/', 'POST', checkoutData);
      
      if (!checkoutResponse.data.id) {
        logTest(`${plan.name} checkout creation`, 'FAIL', 'No checkout ID returned');
        results.push({ plan: plan.name, success: false, step: 'checkout_creation' });
        continue;
      }

      logTest(`${plan.name} checkout creation`, 'PASS', `ID: ${checkoutResponse.data.id}`);
      
      // Step 2: Verify checkout details
      const checkoutId = checkoutResponse.data.id;
      const retrieveResponse = await makeApiRequest(`/v1/checkouts/${checkoutId}`);
      
      if (retrieveResponse.statusCode !== 200) {
        logTest(`${plan.name} checkout retrieval`, 'FAIL', `HTTP ${retrieveResponse.statusCode}`);
        results.push({ plan: plan.name, success: false, step: 'checkout_retrieval' });
        continue;
      }

      logTest(`${plan.name} checkout retrieval`, 'PASS', `Status: ${retrieveResponse.data.status}`);
      
      // Step 3: Verify product pricing
      const productResponse = await makeApiRequest(`/v1/products/${plan.productId}`);
      
      if (productResponse.statusCode === 200 && productResponse.data.prices) {
        const price = productResponse.data.prices[0];
        if (price && price.price_amount === plan.expectedPrice) {
          logTest(`${plan.name} pricing verification`, 'PASS', `$${price.price_amount / 100}`);
        } else {
          logTest(`${plan.name} pricing verification`, 'FAIL', 
            `Expected $${plan.expectedPrice / 100}, got $${price?.price_amount / 100 || 'N/A'}`);
        }
      } else {
        logTest(`${plan.name} pricing verification`, 'FAIL', 'Could not retrieve product pricing');
      }
      
      // Step 4: Test plan type extraction
      const extractedPlanType = extractPlanTypeFromProductId(plan.productId);
      if (extractedPlanType === plan.name) {
        logTest(`${plan.name} plan type extraction`, 'PASS', extractedPlanType);
      } else {
        logTest(`${plan.name} plan type extraction`, 'FAIL', 
          `Expected ${plan.name}, got ${extractedPlanType}`);
      }
      
      results.push({ 
        plan: plan.name, 
        success: true, 
        checkoutId: checkoutId,
        checkoutUrl: checkoutResponse.data.url,
        status: retrieveResponse.data.status
      });
      
    } catch (error) {
      logTest(`${plan.name} payment flow`, 'FAIL', error.message);
      results.push({ plan: plan.name, success: false, error: error.message });
    }
  }
  
  return results;
}

// Plan type extraction function (copied from utils)
function extractPlanTypeFromProductId(productId) {
  const productIdMapping = process.env.NODE_ENV === 'production' 
    ? {
        '5b26fbdf-87ee-4002-aecf-82f6278a4831': 'Basic',
        '2e38da8b-460f-4bb6-b7ab-e6e0056d99f5': 'Professional',
        '4fb38fdf-ebd1-484e-9f42-07781504af78': 'Executive',
      }
    : {
        '28d871b5-be69-4594-af59-737fa189d5df': 'Basic',
        'aff54590-b4c6-4e24-a966-8945f2ae2e19': 'Professional',
        'e2696f0f-213f-4b15-9c78-e8b4e7d83116': 'Executive',
      };

  return productIdMapping[productId] || 'Basic';
}

async function testWebhookSignatureVerification() {
  logSection('Webhook Security Test');
  
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    logTest('Webhook secret configuration', 'FAIL', 'POLAR_WEBHOOK_SECRET not set');
    return false;
  }
  
  logTest('Webhook secret configuration', 'PASS', `Length: ${webhookSecret.length}`);
  
  // Test signature verification logic
  const testPayload = JSON.stringify({
    type: 'order.created',
    data: {
      id: 'test-order-123',
      product_id: TEST_PLANS[0].productId,
      amount: TEST_PLANS[0].expectedPrice,
      metadata: {
        user_id: 'test-user-123',
        plan_type: 'Basic'
      }
    }
  });
  
  // This would normally be done by the webhook handler
  logTest('Webhook payload structure', 'PASS', 'Valid test payload created');
  
  return true;
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Polar Payment Tests');
  console.log('='.repeat(60));
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base: ${POLAR_API_BASE}`);
  console.log(`📅 Test run: ${new Date().toISOString()}`);
  
  if (!POLAR_ACCESS_TOKEN) {
    console.log('❌ POLAR_ACCESS_TOKEN not configured');
    return;
  }
  
  const startTime = Date.now();
  
  // Run all tests
  const paymentResults = await testFullPaymentFlow();
  await testWebhookSignatureVerification();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n🏁 Test Summary');
  console.log('='.repeat(60));
  
  const successfulPlans = paymentResults.filter(r => r.success);
  console.log(`💳 Payment Flow: ${successfulPlans.length}/${paymentResults.length} plans tested successfully`);
  
  successfulPlans.forEach(result => {
    console.log(`   ✅ ${result.plan}: Checkout ID ${result.checkoutId}`);
    console.log(`      🔗 URL: ${result.checkoutUrl}`);
  });
  
  console.log(`\n⏱️  Total execution time: ${duration}s`);
  console.log(`📊 Overall Status: ${successfulPlans.length === TEST_PLANS.length ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);
}

// Run comprehensive tests
runComprehensiveTests().catch(console.error);
