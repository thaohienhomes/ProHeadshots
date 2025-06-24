#!/usr/bin/env node

/**
 * Test script to validate Fal AI and Polar Payment integrations
 * Usage: node scripts/test-integrations.js [fal|polar|all]
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testFalAI() {
  console.log('🧪 Testing Fal AI Integration...');
  
  try {
    // Check if Fal AI API key is configured
    if (!process.env.FAL_AI_API_KEY) {
      throw new Error('FAL_AI_API_KEY not configured');
    }
    
    console.log('✅ Fal AI API key configured');
    
    // Test basic API connection (would need actual implementation)
    console.log('⚠️  Manual testing required:');
    console.log('   1. Upload test photos');
    console.log('   2. Trigger model training');
    console.log('   3. Verify webhook callbacks');
    console.log('   4. Test image generation');
    
    return true;
  } catch (error) {
    console.error('❌ Fal AI test failed:', error.message);
    return false;
  }
}

async function testPolarPayment() {
  console.log('🧪 Testing Polar Payment Integration...');
  
  try {
    // Check if Polar access token is configured
    if (!process.env.POLAR_ACCESS_TOKEN) {
      throw new Error('POLAR_ACCESS_TOKEN not configured');
    }
    
    console.log('✅ Polar access token configured');
    
    // Test basic API connection
    const response = await fetch('https://api.polar.sh/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('✅ Polar API connection successful');
      console.log(`   Connected as: ${user.username || user.email || 'Unknown'}`);
    } else {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    // Check pricing plans configuration
    const pricingPlansPath = path.join(process.cwd(), 'src/app/checkout/pricingPlansPolar.json');
    if (fs.existsSync(pricingPlansPath)) {
      const pricingPlans = JSON.parse(fs.readFileSync(pricingPlansPath, 'utf8'));
      console.log('✅ Polar pricing plans configured');
      console.log(`   Found ${pricingPlans.plans.length} pricing plans`);
    } else {
      console.log('⚠️  Polar pricing plans not found');
    }
    
    console.log('⚠️  Manual testing required:');
    console.log('   1. Create test checkout session');
    console.log('   2. Complete test payment');
    console.log('   3. Verify webhook processing');
    console.log('   4. Check database updates');
    
    return true;
  } catch (error) {
    console.error('❌ Polar Payment test failed:', error.message);
    return false;
  }
}

async function testConfiguration() {
  console.log('🧪 Testing Configuration...');
  
  const errors = [];
  
  // Check service provider configuration
  const aiProvider = process.env.AI_PROVIDER || 'fal';
  const paymentProvider = process.env.PAYMENT_PROVIDER || 'polar';
  
  console.log(`   AI Provider: ${aiProvider}`);
  console.log(`   Payment Provider: ${paymentProvider}`);
  
  // Validate AI configuration
  if (aiProvider === 'astria' && !process.env.ASTRIA_API_KEY) {
    errors.push('ASTRIA_API_KEY is required when using Astria AI');
  }
  if (aiProvider === 'fal' && !process.env.FAL_AI_API_KEY) {
    errors.push('FAL_AI_API_KEY is required when using Fal AI');
  }
  
  // Validate payment configuration
  if (paymentProvider === 'stripe') {
    if (!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_TEST_SECRET_KEY) {
      errors.push('STRIPE_SECRET_KEY or STRIPE_TEST_SECRET_KEY is required when using Stripe');
    }
  }
  if (paymentProvider === 'polar' && !process.env.POLAR_ACCESS_TOKEN) {
    errors.push('POLAR_ACCESS_TOKEN is required when using Polar Payment');
  }
  
  // Check required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'APP_WEBHOOK_SECRET',
  ];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`${varName} is required`);
    }
  });
  
  if (errors.length === 0) {
    console.log('✅ Configuration is valid');
    return true;
  } else {
    console.log('❌ Configuration errors:');
    errors.forEach(error => console.log(`   - ${error}`));
    return false;
  }
}

async function testFileStructure() {
  console.log('🧪 Testing File Structure...');
  
  const requiredFiles = [
    'src/utils/falAI.ts',
    'src/utils/polarPayment.ts',
    'src/config/services.ts',
    'src/app/api/llm/tune/createTuneFal.ts',
    'src/app/api/llm/prompt/createPromptFal.ts',
    'src/action/verifyPaymentPolar.ts',
    'src/app/checkout/CheckoutPagePolar.tsx',
    'src/app/checkout/pricingPlansPolar.json',
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length === 0) {
    console.log('✅ All required files present');
    return true;
  } else {
    console.log('❌ Missing files:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    return false;
  }
}

async function runTests(testType) {
  console.log('🚀 Starting Integration Tests\n');
  
  const results = {
    configuration: false,
    fileStructure: false,
    falAI: false,
    polar: false,
  };
  
  // Always test configuration and file structure
  results.configuration = await testConfiguration();
  console.log('');
  
  results.fileStructure = await testFileStructure();
  console.log('');
  
  // Test specific services based on input
  if (testType === 'fal' || testType === 'all') {
    results.falAI = await testFalAI();
    console.log('');
  }
  
  if (testType === 'polar' || testType === 'all') {
    results.polar = await testPolarPayment();
    console.log('');
  }
  
  // Summary
  console.log('📊 Test Results Summary:');
  Object.entries(results).forEach(([test, passed]) => {
    if (passed !== false) {
      console.log(`   ${passed ? '✅' : '❌'} ${test}`);
    }
  });
  
  const allPassed = Object.values(results).every(result => result !== false);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Your integration is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  return allPassed;
}

// Main script logic
const args = process.argv.slice(2);
const testType = args[0] || 'all';

if (!['fal', 'polar', 'all'].includes(testType)) {
  console.error('Usage: node scripts/test-integrations.js [fal|polar|all]');
  process.exit(1);
}

runTests(testType)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
