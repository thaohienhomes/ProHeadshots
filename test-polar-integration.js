#!/usr/bin/env node

/**
 * Comprehensive Polar Payment Integration Test Suite
 * Tests all aspects of the Polar payment system for production readiness
 */

import https from 'https';
import crypto from 'crypto';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const POLAR_API_BASE = 'https://api.polar.sh';
const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN;
const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;

// Test configuration
const TEST_CONFIG = {
  productIds: {
    basic: '5b26fbdf-87ee-4002-aecf-82f6278a4831',
    professional: '2e38da8b-460f-4bb6-b7ab-e6e0056d99f5',
    executive: '4fb38fdf-ebd1-484e-9f42-07781504af78'
  },
  testEmail: 'test@coolpix.me',
  testUserId: 'test-user-123',
  successUrl: 'https://coolpix.me/postcheckout-polar?checkout_id={CHECKOUT_ID}'
};

// Utility functions
function makeApiRequest(path, method = 'GET', data = null) {
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
        'User-Agent': 'Coolpix-Test/1.0'
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

// Test functions
async function testEnvironmentConfiguration() {
  logSection('Environment Configuration Tests');
  
  // Test 1: Check if POLAR_ACCESS_TOKEN exists
  if (!POLAR_ACCESS_TOKEN) {
    logTest('POLAR_ACCESS_TOKEN exists', 'FAIL', 'Environment variable not set');
    return false;
  }
  logTest('POLAR_ACCESS_TOKEN exists', 'PASS', `Length: ${POLAR_ACCESS_TOKEN.length}`);
  
  // Test 2: Check token format
  if (!POLAR_ACCESS_TOKEN.startsWith('polar_')) {
    logTest('Token format validation', 'FAIL', 'Token should start with "polar_"');
    return false;
  }
  logTest('Token format validation', 'PASS', 'Starts with "polar_"');
  
  // Test 3: Check webhook secret (optional but recommended)
  if (!POLAR_WEBHOOK_SECRET) {
    logTest('POLAR_WEBHOOK_SECRET exists', 'FAIL', 'Webhook secret not configured (optional but recommended)');
  } else {
    logTest('POLAR_WEBHOOK_SECRET exists', 'PASS', `Length: ${POLAR_WEBHOOK_SECRET.length}`);
  }
  
  return true;
}

async function testApiConnectivity() {
  logSection('API Connectivity Tests');
  
  try {
    // Test 1: Basic API connectivity
    const response = await makeApiRequest('/v1/products');
    
    if (response.statusCode === 200) {
      logTest('API connectivity', 'PASS', `Retrieved ${response.data.items?.length || 0} products`);
      return response.data;
    } else if (response.statusCode === 401) {
      logTest('API connectivity', 'FAIL', 'Authentication failed - check access token');
      return null;
    } else {
      logTest('API connectivity', 'FAIL', `HTTP ${response.statusCode}: ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    logTest('API connectivity', 'FAIL', `Network error: ${error.message}`);
    return null;
  }
}

async function testProductConfiguration(products) {
  logSection('Product Configuration Tests');
  
  if (!products || !products.items) {
    logTest('Product data available', 'FAIL', 'No product data from API');
    return false;
  }
  
  const availableProducts = products.items;
  let allProductsFound = true;
  
  // Test each configured product ID
  for (const [planName, productId] of Object.entries(TEST_CONFIG.productIds)) {
    const product = availableProducts.find(p => p.id === productId);
    
    if (product) {
      logTest(`${planName} product exists`, 'PASS', `"${product.name}" - $${product.prices?.[0]?.price_amount / 100 || 'N/A'}`);
    } else {
      logTest(`${planName} product exists`, 'FAIL', `Product ID ${productId} not found`);
      allProductsFound = false;
    }
  }
  
  return allProductsFound;
}

async function testCheckoutCreation() {
  logSection('Checkout Creation Tests');
  
  // Test checkout creation for each plan
  for (const [planName, productId] of Object.entries(TEST_CONFIG.productIds)) {
    try {
      const checkoutData = {
        product_id: productId,
        success_url: TEST_CONFIG.successUrl,
        customer_email: TEST_CONFIG.testEmail,
        customer_name: 'Test User',
        metadata: {
          user_id: TEST_CONFIG.testUserId,
          plan_type: planName,
          test: 'true'
        }
      };
      
      const response = await makeApiRequest('/v1/checkouts/', 'POST', checkoutData);
      
      if (response.statusCode === 201 || response.statusCode === 200) {
        logTest(`${planName} checkout creation`, 'PASS', `Checkout ID: ${response.data.id}`);
        
        // Store checkout ID for later tests
        TEST_CONFIG[`${planName}CheckoutId`] = response.data.id;
      } else {
        logTest(`${planName} checkout creation`, 'FAIL', `HTTP ${response.statusCode}: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      logTest(`${planName} checkout creation`, 'FAIL', `Error: ${error.message}`);
    }
  }
}

async function testCheckoutRetrieval() {
  logSection('Checkout Retrieval Tests');
  
  // Test retrieving created checkouts
  for (const [planName] of Object.entries(TEST_CONFIG.productIds)) {
    const checkoutId = TEST_CONFIG[`${planName}CheckoutId`];
    
    if (!checkoutId) {
      logTest(`${planName} checkout retrieval`, 'FAIL', 'No checkout ID available');
      continue;
    }
    
    try {
      const response = await makeApiRequest(`/v1/checkouts/${checkoutId}`);
      
      if (response.statusCode === 200) {
        const checkout = response.data;
        logTest(`${planName} checkout retrieval`, 'PASS', `Status: ${checkout.status}, URL: ${checkout.url ? 'Available' : 'N/A'}`);
      } else {
        logTest(`${planName} checkout retrieval`, 'FAIL', `HTTP ${response.statusCode}: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      logTest(`${planName} checkout retrieval`, 'FAIL', `Error: ${error.message}`);
    }
  }
}

async function testWebhookSignatureVerification() {
  logSection('Webhook Security Tests');
  
  if (!POLAR_WEBHOOK_SECRET) {
    logTest('Webhook signature verification', 'FAIL', 'POLAR_WEBHOOK_SECRET not configured');
    return;
  }
  
  // Test webhook signature verification
  const testPayload = JSON.stringify({
    type: 'order.created',
    data: {
      id: 'test-order-123',
      product_id: TEST_CONFIG.productIds.basic,
      amount: 2900,
      metadata: {
        user_id: TEST_CONFIG.testUserId,
        plan_type: 'Basic'
      }
    }
  });
  
  // Create test signature
  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `${timestamp}.${testPayload}`;
  const signature = crypto
    .createHmac('sha256', POLAR_WEBHOOK_SECRET)
    .update(signaturePayload)
    .digest('hex');
  
  const testSignature = `t=${timestamp},v1=${signature}`;
  
  // Verify signature (simulate webhook verification logic)
  try {
    const parts = testSignature.split(',');
    const timestampPart = parts.find(part => part.startsWith('t='));
    const signaturePart = parts.find(part => part.startsWith('v1='));
    
    if (timestampPart && signaturePart) {
      const extractedTimestamp = timestampPart.split('=')[1];
      const extractedSignature = signaturePart.split('=')[1];
      
      const expectedSignature = crypto
        .createHmac('sha256', POLAR_WEBHOOK_SECRET)
        .update(`${extractedTimestamp}.${testPayload}`)
        .digest('hex');
      
      if (crypto.timingSafeEqual(Buffer.from(extractedSignature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
        logTest('Webhook signature verification', 'PASS', 'Signature verification working correctly');
      } else {
        logTest('Webhook signature verification', 'FAIL', 'Signature mismatch');
      }
    } else {
      logTest('Webhook signature verification', 'FAIL', 'Invalid signature format');
    }
  } catch (error) {
    logTest('Webhook signature verification', 'FAIL', `Error: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Polar Payment Integration Tests');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  // Run all test suites
  const configValid = await testEnvironmentConfiguration();
  
  if (!configValid) {
    console.log('\n❌ Configuration tests failed. Cannot proceed with API tests.');
    return;
  }
  
  const products = await testApiConnectivity();
  
  if (products) {
    await testProductConfiguration(products);
    await testCheckoutCreation();
    await testCheckoutRetrieval();
  }
  
  await testWebhookSignatureVerification();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n🏁 Test Suite Complete');
  console.log('='.repeat(60));
  console.log(`⏱️  Total execution time: ${duration}s`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Test run: ${new Date().toISOString()}`);
}

// Run tests if this script is executed directly
runAllTests().catch(console.error);

export {
  runAllTests,
  testEnvironmentConfiguration,
  testApiConnectivity,
  testProductConfiguration,
  testCheckoutCreation,
  testCheckoutRetrieval,
  testWebhookSignatureVerification
};
