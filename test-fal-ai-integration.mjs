// Comprehensive Fal AI integration test
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

async function testFalAIConnection() {
  console.log('🧪 Testing Fal AI Basic Connection...');
  
  const apiKey = env.FAL_AI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ FAL_AI_API_KEY not found');
    return false;
  }
  
  try {
    // Test with a simple image generation request
    const response = await fetch('https://fal.run/fal-ai/flux/dev', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: "A professional headshot of a person in business attire",
        num_images: 1,
        image_size: "square_hd",
        enable_safety_checker: true,
      }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Fal AI connection successful');
      console.log('✅ Image generation endpoint working');
      
      if (result.images && result.images.length > 0) {
        console.log('✅ Image generation completed successfully');
        console.log(`   Generated ${result.images.length} image(s)`);
        return true;
      } else {
        console.warn('⚠️  No images returned in response');
        return false;
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Fal AI request failed:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Fal AI connection error:', error.message);
    return false;
  }
}

async function testFalAIModels() {
  console.log('\n🧪 Testing Fal AI Model Availability...');
  
  const apiKey = env.FAL_AI_API_KEY;
  
  const models = [
    'fal-ai/flux/dev',
    'fal-ai/flux/schnell',
    'fal-ai/stable-diffusion-v3-medium',
  ];
  
  const results = {};
  
  for (const model of models) {
    try {
      const response = await fetch(`https://fal.run/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: "test prompt",
          num_images: 1,
          image_size: "square",
        }),
      });
      
      if (response.ok) {
        console.log(`✅ ${model} - Available`);
        results[model] = true;
      } else if (response.status === 402) {
        console.log(`💰 ${model} - Available (requires payment)`);
        results[model] = true;
      } else {
        console.log(`❌ ${model} - Not available (${response.status})`);
        results[model] = false;
      }
    } catch (error) {
      console.log(`❌ ${model} - Error: ${error.message}`);
      results[model] = false;
    }
  }
  
  const availableModels = Object.values(results).filter(Boolean).length;
  console.log(`📊 Available models: ${availableModels}/${models.length}`);
  
  return availableModels > 0;
}

async function testWebhookEndpoint() {
  console.log('\n🧪 Testing Fal AI Webhook Endpoint...');
  
  const siteUrl = env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${siteUrl}/api/llm/prompt-webhook-fal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Test webhook payload
        event_type: 'test',
        request_id: 'test-request-id',
        status: 'completed',
      }),
    });
    
    // We expect either 200 (success) or 400 (validation error) for a test payload
    if (response.status === 200 || response.status === 400) {
      console.log('✅ Fal AI webhook endpoint accessible');
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

async function testAPIRoutes() {
  console.log('\n🧪 Testing Fal AI API Routes...');
  
  const siteUrl = env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const routes = [
    '/api/llm/tune-webhook-fal',
    '/api/llm/prompt-webhook-fal',
  ];
  
  const results = {};
  
  for (const route of routes) {
    try {
      const response = await fetch(`${siteUrl}${route}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      });
      
      // We expect the endpoint to be accessible (even if it returns an error for test data)
      if (response.status < 500) {
        console.log(`✅ ${route} - Accessible`);
        results[route] = true;
      } else {
        console.log(`❌ ${route} - Server error (${response.status})`);
        results[route] = false;
      }
    } catch (error) {
      console.log(`❌ ${route} - Not accessible: ${error.message}`);
      results[route] = false;
    }
  }
  
  return Object.values(results).every(Boolean);
}

async function testServiceConfiguration() {
  console.log('\n🧪 Testing Service Configuration...');
  
  const aiProvider = env.AI_PROVIDER;
  const aiEnabled = env.AI_ENABLED;
  
  if (aiProvider !== 'fal') {
    console.warn('⚠️  AI_PROVIDER is not set to "fal"');
    console.log(`   Current value: ${aiProvider || 'not set'}`);
  } else {
    console.log('✅ AI_PROVIDER correctly set to "fal"');
  }
  
  if (aiEnabled !== 'true') {
    console.warn('⚠️  AI_ENABLED is not set to "true"');
    console.log(`   Current value: ${aiEnabled || 'not set'}`);
  } else {
    console.log('✅ AI_ENABLED correctly set to "true"');
  }
  
  return aiProvider === 'fal' && aiEnabled === 'true';
}

async function runFalAITests() {
  console.log('🚀 Starting Fal AI Integration Tests\n');
  
  const results = {
    connection: await testFalAIConnection(),
    models: await testFalAIModels(),
    webhook: await testWebhookEndpoint(),
    apiRoutes: await testAPIRoutes(),
    configuration: await testServiceConfiguration(),
  };
  
  console.log('\n📊 Fal AI Integration Test Results:');
  console.log(`   Basic Connection: ${results.connection ? '✅' : '❌'}`);
  console.log(`   Model Availability: ${results.models ? '✅' : '❌'}`);
  console.log(`   Webhook Endpoint: ${results.webhook ? '✅' : '❌'}`);
  console.log(`   API Routes: ${results.apiRoutes ? '✅' : '❌'}`);
  console.log(`   Service Configuration: ${results.configuration ? '✅' : '❌'}`);
  
  const criticalPassed = results.connection && results.models;
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All Fal AI integration tests passed! Ready for production.');
  } else if (criticalPassed) {
    console.log('\n✅ Critical Fal AI requirements met. Some optimizations recommended.');
  } else {
    console.log('\n⚠️  Critical Fal AI issues found. Please address before deploying.');
  }
  
  return criticalPassed;
}

// Run the tests
runFalAITests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fal AI test execution failed:', error);
    process.exit(1);
  });
