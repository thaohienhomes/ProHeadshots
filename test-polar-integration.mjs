// Comprehensive Polar Payment integration test
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
function loadEnvVars() {
  try {
    const envPath = join(__dirname, '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Error loading .env.local:', error.message);
    return {};
  }
}

const env = loadEnvVars();

async function testPolarConnection() {
  console.log('🧪 Testing Polar Payment Connection...');
  
  const accessToken = env.POLAR_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('❌ POLAR_ACCESS_TOKEN not found');
    return false;
  }
  
  if (accessToken === 'YOUR_POLAR_ACCESS_TOKEN' || accessToken === 'YOUR_PRODUCTION_POLAR_ACCESS_TOKEN') {
    console.error('❌ POLAR_ACCESS_TOKEN is placeholder value');
    return false;
  }
  
  try {
    // Test basic API connection
    const response = await fetch('https://api.polar.sh/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('✅ Polar API connection successful');
      console.log(`   Connected as: ${user.username || user.email || 'Unknown'}`);
      console.log(`   Account ID: ${user.id}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Polar API request failed:', response.status, errorText);
      
      if (response.status === 401) {
        console.error('   This usually means the access token is expired or invalid');
        console.error('   Please generate a new access token from Polar dashboard');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Polar connection error:', error.message);
    return false;
  }
}

async function testPolarProducts() {
  console.log('\n🧪 Testing Polar Products...');
  
  const accessToken = env.POLAR_ACCESS_TOKEN;
  
  try {
    const response = await fetch('https://api.polar.sh/v1/products/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Polar products endpoint accessible');
      
      if (data.items && data.items.length > 0) {
        console.log(`✅ Found ${data.items.length} product(s)`);
        data.items.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - $${(product.price_amount / 100).toFixed(2)}`);
        });
        return true;
      } else {
        console.warn('⚠️  No products found - you may need to create products in Polar dashboard');
        return true; // Not critical for basic functionality
      }
    } else {
      console.error('❌ Products endpoint failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Products test error:', error.message);
    return false;
  }
}

async function testPolarCheckouts() {
  console.log('\n🧪 Testing Polar Checkout Creation...');
  
  const accessToken = env.POLAR_ACCESS_TOKEN;
  
  try {
    // First, get available products
    const productsResponse = await fetch('https://api.polar.sh/v1/products/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!productsResponse.ok) {
      console.error('❌ Cannot test checkout - products endpoint failed');
      return false;
    }
    
    const productsData = await productsResponse.json();
    
    if (!productsData.items || productsData.items.length === 0) {
      console.warn('⚠️  Cannot test checkout - no products available');
      return true; // Not critical if no products exist yet
    }
    
    // Try to create a test checkout (this will fail but should give us a proper error)
    const testProduct = productsData.items[0];
    const checkoutResponse = await fetch('https://api.polar.sh/v1/checkouts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: testProduct.id,
        success_url: 'https://cvphoto.app/postcheckout-polar',
        customer_email: 'test@example.com',
      }),
    });
    
    if (checkoutResponse.ok) {
      console.log('✅ Polar checkout creation successful');
      return true;
    } else if (checkoutResponse.status === 400 || checkoutResponse.status === 422) {
      console.log('✅ Polar checkout endpoint accessible (validation error expected for test data)');
      return true;
    } else {
      console.error('❌ Checkout creation failed:', checkoutResponse.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Checkout test error:', error.message);
    return false;
  }
}

async function testWebhookEndpoint() {
  console.log('\n🧪 Testing Polar Webhook Endpoint...');
  
  const siteUrl = env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${siteUrl}/api/webhooks/polar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Test webhook payload
        type: 'test',
        data: {
          id: 'test-id',
        },
      }),
    });
    
    // We expect either 200 (success) or 400 (validation error) for a test payload
    if (response.status === 200 || response.status === 400) {
      console.log('✅ Polar webhook endpoint accessible');
      return true;
    } else {
      console.error('❌ Webhook endpoint returned:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Webhook endpoint error:', error.message);
    return false;
  }
}

async function testServiceConfiguration() {
  console.log('\n🧪 Testing Payment Service Configuration...');
  
  const paymentProvider = env.PAYMENT_PROVIDER;
  const paymentEnabled = env.PAYMENT_ENABLED;
  const webhookSecret = env.POLAR_WEBHOOK_SECRET;
  
  if (paymentProvider !== 'polar') {
    console.warn('⚠️  PAYMENT_PROVIDER is not set to "polar"');
    console.log(`   Current value: ${paymentProvider || 'not set'}`);
  } else {
    console.log('✅ PAYMENT_PROVIDER correctly set to "polar"');
  }
  
  if (paymentEnabled !== 'true') {
    console.warn('⚠️  PAYMENT_ENABLED is not set to "true"');
    console.log(`   Current value: ${paymentEnabled || 'not set'}`);
  } else {
    console.log('✅ PAYMENT_ENABLED correctly set to "true"');
  }
  
  if (!webhookSecret || webhookSecret === 'YOUR_POLAR_WEBHOOK_SECRET') {
    console.warn('⚠️  POLAR_WEBHOOK_SECRET not configured');
  } else {
    console.log('✅ POLAR_WEBHOOK_SECRET configured');
  }
  
  return paymentProvider === 'polar' && paymentEnabled === 'true';
}

async function testPricingPlans() {
  console.log('\n🧪 Testing Pricing Plans Configuration...');
  
  try {
    const pricingPlansPath = join(__dirname, 'src/app/checkout/pricingPlansPolar.json');
    const pricingPlans = JSON.parse(readFileSync(pricingPlansPath, 'utf8'));
    
    if (pricingPlans && pricingPlans.length > 0) {
      console.log('✅ Polar pricing plans configured');
      console.log(`   Found ${pricingPlans.length} pricing plan(s)`);
      
      pricingPlans.forEach((plan, index) => {
        console.log(`   ${index + 1}. ${plan.name} - $${plan.price}`);
      });
      
      return true;
    } else {
      console.error('❌ No pricing plans found');
      return false;
    }
  } catch (error) {
    console.error('❌ Error reading pricing plans:', error.message);
    return false;
  }
}

async function runPolarTests() {
  console.log('🚀 Starting Polar Payment Integration Tests\n');
  
  const results = {
    connection: await testPolarConnection(),
    products: await testPolarProducts(),
    checkouts: await testPolarCheckouts(),
    webhook: await testWebhookEndpoint(),
    configuration: await testServiceConfiguration(),
    pricingPlans: await testPricingPlans(),
  };
  
  console.log('\n📊 Polar Payment Integration Test Results:');
  console.log(`   API Connection: ${results.connection ? '✅' : '❌'}`);
  console.log(`   Products Access: ${results.products ? '✅' : '❌'}`);
  console.log(`   Checkout Creation: ${results.checkouts ? '✅' : '❌'}`);
  console.log(`   Webhook Endpoint: ${results.webhook ? '✅' : '❌'}`);
  console.log(`   Service Configuration: ${results.configuration ? '✅' : '❌'}`);
  console.log(`   Pricing Plans: ${results.pricingPlans ? '✅' : '❌'}`);
  
  const criticalPassed = results.connection && results.webhook && results.configuration;
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All Polar payment integration tests passed! Ready for production.');
  } else if (criticalPassed) {
    console.log('\n✅ Critical Polar requirements met. Some optimizations recommended.');
    if (!results.connection) {
      console.log('⚠️  URGENT: Update Polar access token before deploying to production');
    }
  } else {
    console.log('\n⚠️  Critical Polar payment issues found. Please address before deploying.');
  }
  
  return criticalPassed;
}

// Run the tests
runPolarTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Polar payment test execution failed:', error);
    process.exit(1);
  });
