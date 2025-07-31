#!/usr/bin/env node

/**
 * Test Polar Checkout Creation with Updated Configuration
 */

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const POLAR_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.polar.sh' 
  : 'https://sandbox-api.polar.sh';

const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN;

// Sandbox product IDs (from API test results)
const SANDBOX_PRODUCT_IDS = {
  basic: '28d871b5-be69-4594-af59-737fa189d5df',
  professional: 'aff54590-b4c6-4e24-a966-8945f2ae2e19',
  executive: 'e2696f0f-213f-4b15-9c78-e8b4e7d83116'
};

async function testCheckoutCreation(productId, planName) {
  console.log(`\n🧪 Testing checkout creation for ${planName} plan...`);
  
  try {
    const checkoutData = {
      product_id: productId,
      success_url: 'http://localhost:3000/postcheckout-polar?checkout_id={CHECKOUT_ID}',
      customer_email: 'test@gmail.com', // Use a real email domain
      // Try adding more fields that might be required
      organization_id: '0ee0b69f-cddb-4f1c-85ba-86db691992fa', // From API test results
      metadata: {
        user_id: 'test-user-123',
        plan_type: planName,
        test: 'true'
      }
    };

    console.log('📤 Sending checkout request:', {
      api: POLAR_API_BASE,
      product_id: productId,
      customer_email: checkoutData.customer_email
    });

    const response = await fetch(`${POLAR_API_BASE}/v1/checkouts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log('✅ Checkout created successfully!');
      console.log('📋 Checkout details:', {
        id: responseData.id,
        url: responseData.url,
        status: responseData.status,
        expires_at: responseData.expires_at
      });
      
      // Test retrieving the checkout
      await testCheckoutRetrieval(responseData.id, planName);
      
      return responseData;
    } else {
      console.log('❌ Checkout creation failed:', response.status);
      console.log('📄 Error details:', responseData);
      return null;
    }
  } catch (error) {
    console.log('❌ Error creating checkout:', error.message);
    return null;
  }
}

async function testCheckoutRetrieval(checkoutId, planName) {
  console.log(`\n🔍 Testing checkout retrieval for ${planName}...`);
  
  try {
    const response = await fetch(`${POLAR_API_BASE}/v1/checkouts/${checkoutId}`, {
      headers: {
        'Authorization': `Bearer ${POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log('✅ Checkout retrieved successfully!');
      console.log('📋 Retrieved details:', {
        id: responseData.id,
        status: responseData.status,
        product_id: responseData.product_id,
        customer_email: responseData.customer_email,
        metadata: responseData.metadata
      });
      return responseData;
    } else {
      console.log('❌ Checkout retrieval failed:', response.status);
      console.log('📄 Error details:', responseData);
      return null;
    }
  } catch (error) {
    console.log('❌ Error retrieving checkout:', error.message);
    return null;
  }
}

async function runCheckoutTests() {
  console.log('🚀 Starting Polar Checkout Creation Tests');
  console.log('='.repeat(60));
  console.log(`🌐 API Base: ${POLAR_API_BASE}`);
  console.log(`🔑 Token: ${POLAR_ACCESS_TOKEN ? 'Configured' : 'Missing'}`);
  console.log(`📅 Test run: ${new Date().toISOString()}`);

  if (!POLAR_ACCESS_TOKEN) {
    console.log('❌ POLAR_ACCESS_TOKEN not configured');
    return;
  }

  const results = [];

  // Test each plan
  for (const [planKey, productId] of Object.entries(SANDBOX_PRODUCT_IDS)) {
    const planName = planKey.charAt(0).toUpperCase() + planKey.slice(1);
    const result = await testCheckoutCreation(productId, planName);
    results.push({ plan: planName, success: !!result, result });
  }

  console.log('\n🏁 Test Results Summary');
  console.log('='.repeat(60));
  
  results.forEach(({ plan, success, result }) => {
    const status = success ? '✅' : '❌';
    console.log(`${status} ${plan}: ${success ? 'SUCCESS' : 'FAILED'}`);
    if (success && result) {
      console.log(`   📋 Checkout ID: ${result.id}`);
      console.log(`   🔗 Checkout URL: ${result.url}`);
    }
  });

  const successCount = results.filter(r => r.success).length;
  console.log(`\n📊 Overall: ${successCount}/${results.length} tests passed`);
}

// Run tests
runCheckoutTests().catch(console.error);
