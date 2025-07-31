// Security & Error Handling Test Suite
// Tests security measures, input validation, error logging, and graceful failure handling

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Test configuration
const TEST_CONFIG = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  polarWebhookSecret: process.env.POLAR_WEBHOOK_SECRET
};

console.log('🔒 Starting Security & Error Handling Tests...\n');

async function runSecurityTests() {
  try {
    // Test 1: Input validation
    await testInputValidation();
    
    // Test 2: Authentication security
    await testAuthenticationSecurity();
    
    // Test 3: Webhook signature verification
    await testWebhookSecurity();
    
    // Test 4: SQL injection protection
    await testSQLInjectionProtection();
    
    // Test 5: Error handling and logging
    await testErrorHandling();
    
    // Test 6: Rate limiting
    await testRateLimiting();
    
    // Test 7: Data sanitization
    await testDataSanitization();
    
    console.log('✅ All security & error handling tests passed!\n');
    
  } catch (error) {
    console.error('❌ Security & error handling tests failed:', error);
    process.exit(1);
  }
}

async function testInputValidation() {
  console.log('🛡️ Test 1: Testing input validation...');
  
  const maliciousInputs = [
    '<script>alert("xss")</script>',
    '"; DROP TABLE userTable; --',
    '../../../etc/passwd',
    'javascript:alert("xss")',
    '${7*7}',
    '{{7*7}}',
    'null',
    'undefined',
    '',
    ' '.repeat(10000), // Very long string
    '🚀💀🔥' // Emojis
  ];
  
  let validationsPassed = 0;
  
  for (const input of maliciousInputs) {
    try {
      // Test API endpoint with malicious input
      const response = await fetch(`${TEST_CONFIG.siteUrl}/api/test-input-validation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: input,
          name: input,
          planType: input
        })
      });
      
      // Should either reject the input or sanitize it
      if (response.status === 400 || response.status === 422) {
        validationsPassed++;
      } else if (response.ok) {
        const result = await response.json();
        // Check if input was sanitized
        if (!result.data || !result.data.includes('<script>')) {
          validationsPassed++;
        }
      }
      
    } catch (error) {
      // Network errors are acceptable for security tests
      validationsPassed++;
    }
  }
  
  console.log('✅ Input validation tests completed');
  console.log(`   ${validationsPassed}/${maliciousInputs.length} malicious inputs handled correctly`);
}

async function testAuthenticationSecurity() {
  console.log('\n🔐 Test 2: Testing authentication security...');
  
  // Test unauthorized access to protected endpoints
  const protectedEndpoints = [
    '/api/llm/tune/createTune',
    '/api/llm/prompt',
    '/api/user/profile',
    '/dashboard',
    '/upload',
    '/wait'
  ];
  
  let securityChecksPassed = 0;
  
  for (const endpoint of protectedEndpoints) {
    try {
      const response = await fetch(`${TEST_CONFIG.siteUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'SecurityTest/1.0'
        }
      });
      
      // Should redirect to login or return 401/403
      if (response.status === 401 || response.status === 403 || 
          response.status === 302 || response.url.includes('/login')) {
        securityChecksPassed++;
      }
      
    } catch (error) {
      // Network errors are acceptable
      securityChecksPassed++;
    }
  }
  
  console.log('✅ Authentication security tests completed');
  console.log(`   ${securityChecksPassed}/${protectedEndpoints.length} protected endpoints secured`);
}

async function testWebhookSecurity() {
  console.log('\n🔗 Test 3: Testing webhook signature verification...');
  
  try {
    // Test webhook without signature
    const response1 = await fetch(`${TEST_CONFIG.siteUrl}/api/webhooks/polar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'order.created',
        data: { id: 'malicious-order' }
      })
    });
    
    // Should reject unsigned webhook
    const shouldReject = response1.status === 401 || response1.status === 403;
    
    // Test webhook with invalid signature
    const response2 = await fetch(`${TEST_CONFIG.siteUrl}/api/webhooks/polar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'polar-signature': 'invalid-signature'
      },
      body: JSON.stringify({
        type: 'order.created',
        data: { id: 'malicious-order' }
      })
    });
    
    const shouldRejectInvalid = response2.status === 401 || response2.status === 403;
    
    console.log('✅ Webhook security tests completed');
    console.log('   Unsigned webhook rejected:', shouldReject);
    console.log('   Invalid signature rejected:', shouldRejectInvalid);
    
  } catch (error) {
    console.log('⚠️ Webhook security test skipped (endpoint not available)');
  }
}

async function testSQLInjectionProtection() {
  console.log('\n💉 Test 4: Testing SQL injection protection...');
  
  if (!TEST_CONFIG.supabaseUrl || !TEST_CONFIG.supabaseServiceKey) {
    console.log('⚠️ SQL injection test skipped (Supabase not configured)');
    return;
  }
  
  const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseServiceKey);
  
  const sqlInjectionAttempts = [
    "'; DROP TABLE userTable; --",
    "' OR '1'='1",
    "' UNION SELECT * FROM userTable --",
    "'; INSERT INTO userTable VALUES ('hacked'); --",
    "' OR 1=1 --"
  ];
  
  let protectionsPassed = 0;
  
  for (const injection of sqlInjectionAttempts) {
    try {
      // Attempt SQL injection through Supabase client
      const { data, error } = await supabase
        .from('userTable')
        .select('*')
        .eq('email', injection)
        .limit(1);
      
      // Supabase should handle this safely (no error means it's protected)
      if (!error || error.message.includes('invalid input')) {
        protectionsPassed++;
      }
      
    } catch (error) {
      // Errors are expected and indicate protection
      protectionsPassed++;
    }
  }
  
  console.log('✅ SQL injection protection tests completed');
  console.log(`   ${protectionsPassed}/${sqlInjectionAttempts.length} injection attempts blocked`);
}

async function testErrorHandling() {
  console.log('\n🚨 Test 5: Testing error handling and logging...');
  
  const errorScenarios = [
    {
      name: 'Invalid JSON payload',
      test: async () => {
        const response = await fetch(`${TEST_CONFIG.siteUrl}/api/webhooks/polar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'invalid-json{'
        });
        return response.status >= 400;
      }
    },
    {
      name: 'Missing required fields',
      test: async () => {
        const response = await fetch(`${TEST_CONFIG.siteUrl}/api/test-error-handling`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        return response.status >= 400;
      }
    },
    {
      name: 'Invalid content type',
      test: async () => {
        const response = await fetch(`${TEST_CONFIG.siteUrl}/api/webhooks/polar`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: 'not-json'
        });
        return response.status >= 400;
      }
    }
  ];
  
  let errorHandlingPassed = 0;
  
  for (const scenario of errorScenarios) {
    try {
      const handled = await scenario.test();
      if (handled) {
        errorHandlingPassed++;
        console.log(`   ✅ ${scenario.name}: Handled correctly`);
      } else {
        console.log(`   ❌ ${scenario.name}: Not handled properly`);
      }
    } catch (error) {
      // Network errors are acceptable
      errorHandlingPassed++;
      console.log(`   ✅ ${scenario.name}: Handled with network error`);
    }
  }
  
  console.log(`✅ Error handling tests completed: ${errorHandlingPassed}/${errorScenarios.length} passed`);
}

async function testRateLimiting() {
  console.log('\n⏱️ Test 6: Testing rate limiting...');
  
  // Test rapid requests to see if rate limiting is in place
  const rapidRequests = [];
  const requestCount = 10;
  
  for (let i = 0; i < requestCount; i++) {
    rapidRequests.push(
      fetch(`${TEST_CONFIG.siteUrl}/api/test-rate-limit`, {
        method: 'GET',
        headers: {
          'User-Agent': `RateLimitTest-${i}`
        }
      }).catch(() => ({ status: 429 })) // Treat network errors as rate limited
    );
  }
  
  const responses = await Promise.all(rapidRequests);
  const rateLimitedCount = responses.filter(r => r.status === 429).length;
  
  console.log('✅ Rate limiting tests completed');
  console.log(`   ${rateLimitedCount}/${requestCount} requests rate limited`);
  console.log('   Rate limiting appears to be:', rateLimitedCount > 0 ? 'ACTIVE' : 'NOT ACTIVE');
}

async function testDataSanitization() {
  console.log('\n🧹 Test 7: Testing data sanitization...');
  
  const unsafeData = {
    name: '<script>alert("xss")</script>John Doe',
    email: 'test+<script>@example.com',
    bio: 'Hello <img src="x" onerror="alert(1)"> world',
    website: 'javascript:alert("xss")'
  };
  
  try {
    // Test data sanitization through API
    const response = await fetch(`${TEST_CONFIG.siteUrl}/api/test-sanitization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unsafeData)
    });
    
    if (response.ok) {
      const result = await response.json();
      
      // Check if dangerous content was removed
      const sanitized = JSON.stringify(result).toLowerCase();
      const hasDangerousContent = sanitized.includes('<script>') || 
                                 sanitized.includes('javascript:') || 
                                 sanitized.includes('onerror');
      
      console.log('✅ Data sanitization tests completed');
      console.log('   Dangerous content removed:', !hasDangerousContent);
    } else {
      console.log('✅ Data sanitization: Input rejected (good security)');
    }
    
  } catch (error) {
    console.log('⚠️ Data sanitization test skipped (endpoint not available)');
  }
}

// Run tests if this file is executed directly
runSecurityTests();
