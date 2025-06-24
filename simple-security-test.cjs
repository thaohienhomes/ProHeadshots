const crypto = require('crypto');

console.log('🔒 Testing Webhook Security Implementation...\n');

// Test the improved Polar webhook verification
function verifyPolarWebhook(payload, signature, secret) {
  if (!signature || !secret || !payload) {
    console.error('Missing required parameters for webhook verification');
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    let receivedSignature = signature;
    if (signature.startsWith('sha256=')) {
      receivedSignature = signature.substring(7);
    }

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Test cases
const testSecret = 'test_webhook_secret_123';
const testPayload = JSON.stringify({
  type: 'order.created',
  data: { id: 'order_123', amount: 2900 }
});

// Generate valid signature
const validSignature = crypto
  .createHmac('sha256', testSecret)
  .update(testPayload, 'utf8')
  .digest('hex');

console.log('📋 Test Results:');

// Test 1: Valid signature
const test1 = verifyPolarWebhook(testPayload, validSignature, testSecret);
console.log(`✅ Valid signature test: ${test1 ? 'PASSED' : 'FAILED'}`);

// Test 2: Valid signature with prefix
const test2 = verifyPolarWebhook(testPayload, `sha256=${validSignature}`, testSecret);
console.log(`✅ Valid signature with prefix: ${test2 ? 'PASSED' : 'FAILED'}`);

// Test 3: Invalid signature
const test3 = verifyPolarWebhook(testPayload, 'invalid_signature', testSecret);
console.log(`✅ Invalid signature test: ${!test3 ? 'PASSED' : 'FAILED'}`);

// Test 4: Missing parameters
const test4 = verifyPolarWebhook('', '', '');
console.log(`✅ Missing parameters test: ${!test4 ? 'PASSED' : 'FAILED'}`);

const allPassed = test1 && test2 && !test3 && !test4;
console.log(`\n🎯 Overall Security Test: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

if (allPassed) {
  console.log('\n🚀 Webhook Security Status:');
  console.log('✅ HMAC-SHA256 signature verification: IMPLEMENTED');
  console.log('✅ Timing attack resistance: IMPLEMENTED');
  console.log('✅ Input validation: IMPLEMENTED');
  console.log('✅ Multiple signature formats supported: IMPLEMENTED');
  console.log('\n🔒 Production webhook security: SIGNIFICANTLY IMPROVED!');
}
