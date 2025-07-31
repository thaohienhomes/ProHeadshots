#!/usr/bin/env node

// Test script to verify hybrid AI system configuration
// Run with: node scripts/test-hybrid-ai-setup.mjs

import { config } from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

console.log('🧪 Testing Hybrid AI System Configuration...\n');

// Test 1: Environment Variables
console.log('📋 Test 1: Environment Variables');
const requiredVars = [
  'AI_PROVIDER',
  'AI_PRIMARY_PROVIDER', 
  'AI_SECONDARY_PROVIDER',
  'FAL_AI_API_KEY',
  'LEONARDO_API_KEY'
];

let envTestPassed = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== 'your_fal_ai_api_key_here' && value !== 'your_leonardo_ai_api_key_here') {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing or placeholder`);
    envTestPassed = false;
  }
});

if (!envTestPassed) {
  console.log('\n❌ Environment configuration incomplete. Please set all required API keys.\n');
  process.exit(1);
}

console.log(`✅ AI Provider: ${process.env.AI_PROVIDER}`);
console.log(`✅ Primary: ${process.env.AI_PRIMARY_PROVIDER} → Secondary: ${process.env.AI_SECONDARY_PROVIDER}`);
console.log(`✅ Fallback: ${process.env.AI_FALLBACK_ENABLED}\n`);

// Test 2: Server Health
console.log('🏥 Test 2: Server Health Check');
try {
  const healthResponse = await fetch(`${BASE_URL}/api/ai/provider-health`);
  
  if (healthResponse.ok) {
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint accessible');
    console.log(`✅ System status: ${healthData.systemHealth?.overall || 'Unknown'}`);
    
    if (healthData.providers) {
      Object.entries(healthData.providers).forEach(([provider, status]) => {
        const statusIcon = status.online ? '🟢' : '🔴';
        console.log(`${statusIcon} ${provider}: ${status.online ? 'Online' : 'Offline'} (${status.responseTime || 0}ms)`);
      });
    }
  } else {
    console.log(`❌ Health check failed: ${healthResponse.status}`);
  }
} catch (error) {
  console.log(`❌ Cannot connect to server: ${error.message}`);
  console.log('💡 Make sure the development server is running: npm run dev');
}

console.log('\n🔧 Test 3: Configuration Validation');

// Validate provider configuration
if (process.env.AI_PROVIDER === 'unified') {
  if (process.env.AI_PRIMARY_PROVIDER === process.env.AI_SECONDARY_PROVIDER) {
    console.log('❌ Primary and secondary providers must be different');
  } else {
    console.log('✅ Provider configuration valid');
  }
} else {
  console.log(`ℹ️  Using single provider mode: ${process.env.AI_PROVIDER}`);
}

// Test 4: API Key Format Validation
console.log('\n🔑 Test 4: API Key Format Validation');

const falKey = process.env.FAL_AI_API_KEY;
if (falKey && falKey.includes(':')) {
  console.log('✅ fal.ai API key format appears correct');
} else {
  console.log('⚠️  fal.ai API key format may be incorrect (should contain ":")');
}

const leonardoKey = process.env.LEONARDO_API_KEY;
if (leonardoKey && leonardoKey.length > 20) {
  console.log('✅ Leonardo AI API key format appears correct');
} else {
  console.log('⚠️  Leonardo AI API key format may be incorrect');
}

console.log('\n🎯 Test 5: Unified Generation Test');
try {
  const testPayload = {
    prompt: 'test prompt for configuration validation',
    requirements: {
      quality: 'standard',
      speed: 'fast',
      budget: 'low'
    },
    options: {
      num_images: 1
    }
  };

  console.log('📤 Sending test generation request...');
  const genResponse = await fetch(`${BASE_URL}/api/ai/unified-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testPayload)
  });

  if (genResponse.ok) {
    const genData = await genResponse.json();
    console.log('✅ Unified generation endpoint accessible');
    console.log(`✅ Provider selected: ${genData.result?.metadata?.provider || 'Unknown'}`);
  } else {
    const errorText = await genResponse.text();
    console.log(`⚠️  Generation test failed: ${genResponse.status}`);
    console.log(`   Error: ${errorText}`);
  }
} catch (error) {
  console.log(`⚠️  Generation test error: ${error.message}`);
}

console.log('\n📊 Configuration Summary:');
console.log('================================');
console.log(`🎯 Mode: ${process.env.AI_PROVIDER}`);
console.log(`🥇 Primary: ${process.env.AI_PRIMARY_PROVIDER}`);
console.log(`🥈 Secondary: ${process.env.AI_SECONDARY_PROVIDER}`);
console.log(`🔄 Fallback: ${process.env.AI_FALLBACK_ENABLED}`);
console.log(`💾 Caching: ${process.env.AI_CACHE_ENABLED || 'true'}`);
console.log(`🏥 Health Monitoring: Active`);
console.log('================================');

console.log('\n✨ Setup verification complete!');
console.log('\n📖 Next steps:');
console.log('1. Visit http://localhost:3000/api/ai/provider-health to see live status');
console.log('2. Test image generation through your app');
console.log('3. Monitor console logs for health check updates');
console.log('4. Check fallback behavior by temporarily disabling one provider');
