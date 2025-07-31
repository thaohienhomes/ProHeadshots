#!/usr/bin/env node

/**
 * Test Polar Webhook Integration
 * Tests webhook endpoint, signature verification, and event handling
 */

import { config } from 'dotenv';
import crypto from 'crypto';
import http from 'http';

// Load environment variables
config({ path: '.env.local' });

const WEBHOOK_URL = 'http://localhost:3000/api/test-webhook';
const WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;

// Test webhook payloads
const TEST_PAYLOADS = {
  'order.created': {
    type: 'order.created',
    data: {
      id: 'test-order-123',
      product_id: '28d871b5-be69-4594-af59-737fa189d5df', // Basic plan sandbox ID
      amount: 2900, // $29.00 in cents
      currency: 'usd',
      checkout_id: 'test-checkout-123',
      customer_email: 'test@gmail.com',
      customer_name: 'Test User',
      status: 'completed',
      created_at: new Date().toISOString(),
      metadata: {
        user_id: 'test-user-123',
        plan_type: 'Basic',
        test: 'true'
      }
    }
  },
  'checkout.created': {
    type: 'checkout.created',
    data: {
      id: 'test-checkout-456',
      product_id: 'aff54590-b4c6-4e24-a966-8945f2ae2e19', // Professional plan sandbox ID
      customer_email: 'test@gmail.com',
      status: 'open',
      url: 'https://sandbox.polar.sh/checkout/test-url',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      metadata: {
        user_id: 'test-user-456',
        plan_type: 'Professional',
        test: 'true'
      }
    }
  },
  'checkout.updated': {
    type: 'checkout.updated',
    data: {
      id: 'test-checkout-456',
      product_id: 'aff54590-b4c6-4e24-a966-8945f2ae2e19',
      customer_email: 'test@gmail.com',
      status: 'complete',
      url: 'https://sandbox.polar.sh/checkout/test-url',
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      expires_at: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 minutes from now
      metadata: {
        user_id: 'test-user-456',
        plan_type: 'Professional',
        test: 'true'
      }
    }
  }
};

function createWebhookSignature(payload, secret) {
  if (!secret) {
    return null;
  }
  
  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signaturePayload)
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

async function sendWebhookRequest(eventType, payload, includeSignature = true) {
  return new Promise((resolve, reject) => {
    const payloadString = JSON.stringify(payload);
    const signature = includeSignature ? createWebhookSignature(payloadString, WEBHOOK_SECRET) : null;
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/test-webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadString),
        'User-Agent': 'Polar-Webhook-Test/1.0'
      }
    };
    
    if (signature) {
      options.headers['polar-signature'] = signature;
    }
    
    console.log(`📤 Sending ${eventType} webhook...`);
    console.log(`   📋 Payload size: ${payloadString.length} bytes`);
    console.log(`   🔐 Signature: ${signature ? 'Included' : 'Not included'}`);
    
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
            data: parsedData,
            rawData: responseData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData,
            rawData: responseData
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

async function testWebhookEndpoint() {
  logSection('Webhook Endpoint Tests');
  
  const results = [];
  
  // Test 1: Valid webhook with signature
  for (const [eventType, payload] of Object.entries(TEST_PAYLOADS)) {
    try {
      const response = await sendWebhookRequest(eventType, payload, true);
      
      if (response.statusCode === 200) {
        logTest(`${eventType} with signature`, 'PASS', `HTTP ${response.statusCode}`);
        results.push({ event: eventType, success: true, withSignature: true });
      } else {
        logTest(`${eventType} with signature`, 'FAIL', 
          `HTTP ${response.statusCode}: ${JSON.stringify(response.data)}`);
        results.push({ event: eventType, success: false, withSignature: true, error: response.data });
      }
    } catch (error) {
      logTest(`${eventType} with signature`, 'FAIL', `Error: ${error.message}`);
      results.push({ event: eventType, success: false, withSignature: true, error: error.message });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

async function testWebhookSecurity() {
  logSection('Webhook Security Tests');
  
  const testPayload = TEST_PAYLOADS['order.created'];
  
  // Test 1: Webhook without signature (should fail if secret is configured)
  if (WEBHOOK_SECRET) {
    try {
      const response = await sendWebhookRequest('order.created', testPayload, false);
      
      if (response.statusCode === 401) {
        logTest('Webhook without signature', 'PASS', 'Correctly rejected (401)');
      } else {
        logTest('Webhook without signature', 'FAIL', 
          `Expected 401, got ${response.statusCode}`);
      }
    } catch (error) {
      logTest('Webhook without signature', 'FAIL', `Error: ${error.message}`);
    }
  } else {
    logTest('Webhook secret configuration', 'FAIL', 'POLAR_WEBHOOK_SECRET not configured');
  }
  
  // Test 2: Webhook with invalid signature
  if (WEBHOOK_SECRET) {
    try {
      const payloadString = JSON.stringify(testPayload);
      const invalidSignature = 't=1234567890,v1=invalid_signature_here';
      
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/test-webhook',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payloadString),
          'polar-signature': invalidSignature
        }
      };
      
      const response = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let responseData = '';
          res.on('data', (chunk) => responseData += chunk);
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              data: responseData
            });
          });
        });
        
        req.on('error', reject);
        req.write(payloadString);
        req.end();
      });
      
      if (response.statusCode === 401) {
        logTest('Webhook with invalid signature', 'PASS', 'Correctly rejected (401)');
      } else {
        logTest('Webhook with invalid signature', 'FAIL', 
          `Expected 401, got ${response.statusCode}`);
      }
    } catch (error) {
      logTest('Webhook with invalid signature', 'FAIL', `Error: ${error.message}`);
    }
  }
}

async function testWebhookEventHandling() {
  logSection('Webhook Event Handling Tests');
  
  // Test specific event types that should trigger different actions
  const criticalEvents = ['order.created', 'checkout.updated'];
  
  for (const eventType of criticalEvents) {
    if (TEST_PAYLOADS[eventType]) {
      try {
        const response = await sendWebhookRequest(eventType, TEST_PAYLOADS[eventType], true);
        
        if (response.statusCode === 200) {
          logTest(`${eventType} event handling`, 'PASS', 'Event processed successfully');
        } else {
          logTest(`${eventType} event handling`, 'FAIL', 
            `HTTP ${response.statusCode}: ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        logTest(`${eventType} event handling`, 'FAIL', `Error: ${error.message}`);
      }
    }
  }
}

async function runWebhookTests() {
  console.log('🚀 Starting Polar Webhook Integration Tests');
  console.log('='.repeat(60));
  console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`);
  console.log(`🔐 Webhook Secret: ${WEBHOOK_SECRET ? 'Configured' : 'Not configured'}`);
  console.log(`📅 Test run: ${new Date().toISOString()}`);
  
  const startTime = Date.now();
  
  // Run all webhook tests
  const endpointResults = await testWebhookEndpoint();
  await testWebhookSecurity();
  await testWebhookEventHandling();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n🏁 Webhook Test Summary');
  console.log('='.repeat(60));
  
  const successfulEvents = endpointResults.filter(r => r.success);
  console.log(`📨 Webhook Events: ${successfulEvents.length}/${endpointResults.length} processed successfully`);
  
  successfulEvents.forEach(result => {
    console.log(`   ✅ ${result.event}: Processed successfully`);
  });
  
  const failedEvents = endpointResults.filter(r => !r.success);
  if (failedEvents.length > 0) {
    console.log('\n❌ Failed Events:');
    failedEvents.forEach(result => {
      console.log(`   ❌ ${result.event}: ${result.error}`);
    });
  }
  
  console.log(`\n⏱️  Total execution time: ${duration}s`);
  console.log(`📊 Overall Status: ${successfulEvents.length === endpointResults.length ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);
}

// Run webhook tests
runWebhookTests().catch(console.error);
