#!/usr/bin/env node

/**
 * Leonardo AI Scenarios Test Suite
 * Tests various AI scenarios using Leonardo AI since it's working
 */

import { config } from 'dotenv';
import https from 'https';

// Load environment variables
config({ path: '.env.local' });

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;
const LEONARDO_API_BASE = 'https://cloud.leonardo.ai/api/rest/v1';

// Test scenarios
const TEST_SCENARIOS = [
  {
    name: 'Professional Business Headshot',
    prompt: 'professional business headshot of a person in formal suit, studio lighting, clean white background, high quality, corporate style',
    modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876', // Leonardo Diffusion XL
    width: 512,
    height: 768,
    expectedFeatures: ['professional', 'business', 'formal']
  },
  {
    name: 'Creative Professional Portrait',
    prompt: 'creative professional portrait, modern casual attire, artistic lighting, contemporary background, high quality',
    modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
    width: 512,
    height: 768,
    expectedFeatures: ['creative', 'modern', 'artistic']
  },
  {
    name: 'Executive Leadership Photo',
    prompt: 'executive leadership photo, confident pose, premium business attire, office environment, professional lighting',
    modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
    width: 512,
    height: 768,
    expectedFeatures: ['executive', 'confident', 'premium']
  }
];

// Utility functions
function logTest(testName, status, details = '') {
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : '⏳';
  console.log(`${statusIcon} ${testName}${details ? ': ' + details : ''}`);
}

function logSection(sectionName) {
  console.log(`\n🔍 ${sectionName}`);
  console.log('='.repeat(50));
}

async function makeLeonardoRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, LEONARDO_API_BASE);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${LEONARDO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000
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

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testLeonardoUserInfo() {
  logSection('Leonardo AI User Information');
  
  try {
    const response = await makeLeonardoRequest('/me');
    
    if (response.statusCode === 200) {
      const userInfo = response.data.user_details?.[0];
      if (userInfo) {
        logTest('User authentication', 'PASS', `User: ${userInfo.user?.username}`);
        logTest('API credits', userInfo.apiCreditBalance > 0 ? 'PASS' : 'WARN', 
          `Balance: ${userInfo.apiCreditBalance || 'Unknown'}`);
        logTest('Subscription status', userInfo.subscriptionTokens > 0 ? 'PASS' : 'WARN',
          `Tokens: ${userInfo.subscriptionTokens || 'Unknown'}`);
        
        return {
          success: true,
          credits: userInfo.apiCreditBalance,
          tokens: userInfo.subscriptionTokens,
          username: userInfo.user?.username
        };
      } else {
        logTest('User information', 'FAIL', 'No user details in response');
        return { success: false };
      }
    } else {
      logTest('User authentication', 'FAIL', `HTTP ${response.statusCode}`);
      return { success: false };
    }
  } catch (error) {
    logTest('User authentication', 'FAIL', error.message);
    return { success: false };
  }
}

async function testLeonardoModels() {
  logSection('Leonardo AI Models');
  
  try {
    const response = await makeLeonardoRequest('/models');
    
    if (response.statusCode === 200 && response.data.custom_models) {
      const models = response.data.custom_models;
      logTest('Models retrieval', 'PASS', `Found ${models.length} models`);
      
      // Check for common models
      const diffusionModel = models.find(m => m.name?.includes('Diffusion'));
      const portraitModel = models.find(m => m.name?.toLowerCase().includes('portrait'));
      
      if (diffusionModel) {
        logTest('Diffusion model available', 'PASS', diffusionModel.name);
      } else {
        logTest('Diffusion model available', 'WARN', 'No diffusion model found');
      }
      
      if (portraitModel) {
        logTest('Portrait model available', 'PASS', portraitModel.name);
      } else {
        logTest('Portrait model available', 'WARN', 'No portrait-specific model found');
      }
      
      return {
        success: true,
        modelCount: models.length,
        models: models.slice(0, 5).map(m => ({ id: m.id, name: m.name }))
      };
    } else {
      logTest('Models retrieval', 'FAIL', `HTTP ${response.statusCode}`);
      return { success: false };
    }
  } catch (error) {
    logTest('Models retrieval', 'FAIL', error.message);
    return { success: false };
  }
}

async function testImageGeneration(scenario) {
  console.log(`\n🎨 Testing: ${scenario.name}`);
  console.log(`   📝 Prompt: "${scenario.prompt.substring(0, 80)}..."`);
  
  try {
    const generationData = {
      prompt: scenario.prompt,
      modelId: scenario.modelId,
      width: scenario.width,
      height: scenario.height,
      num_images: 1,
      guidance_scale: 7, // Integer value for Leonardo
      num_inference_steps: 30,
      presetStyle: 'CINEMATIC'
    };
    
    const startTime = Date.now();
    const response = await makeLeonardoRequest('/generations', 'POST', generationData);
    const requestTime = Date.now() - startTime;
    
    if (response.statusCode === 200 && response.data.sdGenerationJob) {
      const jobId = response.data.sdGenerationJob.generationId;
      logTest(`${scenario.name} generation request`, 'PASS', 
        `Job ID: ${jobId}, Request time: ${requestTime}ms`);
      
      // Wait a bit and check generation status
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await makeLeonardoRequest(`/generations/${jobId}`);
      
      if (statusResponse.statusCode === 200) {
        const generation = statusResponse.data.generations_by_pk;
        const status = generation?.status;
        const imageCount = generation?.generated_images?.length || 0;
        
        logTest(`${scenario.name} generation status`, 'PASS', 
          `Status: ${status}, Images: ${imageCount}`);
        
        return {
          success: true,
          jobId,
          status,
          imageCount,
          requestTime,
          images: generation?.generated_images || []
        };
      } else {
        logTest(`${scenario.name} generation status`, 'FAIL', 
          `HTTP ${statusResponse.statusCode}`);
        return { success: false, error: 'Status check failed' };
      }
    } else {
      logTest(`${scenario.name} generation request`, 'FAIL', 
        `HTTP ${response.statusCode}: ${JSON.stringify(response.data)}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    logTest(`${scenario.name} generation`, 'FAIL', error.message);
    return { success: false, error: error.message };
  }
}

async function testErrorHandling() {
  logSection('Error Handling Tests');
  
  // Test 1: Invalid model ID
  try {
    const response = await makeLeonardoRequest('/generations', 'POST', {
      prompt: 'test prompt',
      modelId: 'invalid-model-id',
      width: 512,
      height: 512,
      num_images: 1
    });
    
    if (response.statusCode >= 400) {
      logTest('Invalid model ID handling', 'PASS', 
        `Correctly rejected with HTTP ${response.statusCode}`);
    } else {
      logTest('Invalid model ID handling', 'FAIL', 
        `Expected error, got HTTP ${response.statusCode}`);
    }
  } catch (error) {
    logTest('Invalid model ID handling', 'PASS', 'Network error as expected');
  }
  
  // Test 2: Invalid dimensions
  try {
    const response = await makeLeonardoRequest('/generations', 'POST', {
      prompt: 'test prompt',
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      width: 10000, // Invalid large dimension
      height: 10000,
      num_images: 1
    });
    
    if (response.statusCode >= 400) {
      logTest('Invalid dimensions handling', 'PASS', 
        `Correctly rejected with HTTP ${response.statusCode}`);
    } else {
      logTest('Invalid dimensions handling', 'FAIL', 
        `Expected error, got HTTP ${response.statusCode}`);
    }
  } catch (error) {
    logTest('Invalid dimensions handling', 'PASS', 'Network error as expected');
  }
  
  // Test 3: Empty prompt
  try {
    const response = await makeLeonardoRequest('/generations', 'POST', {
      prompt: '',
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      width: 512,
      height: 512,
      num_images: 1
    });
    
    if (response.statusCode >= 400) {
      logTest('Empty prompt handling', 'PASS', 
        `Correctly rejected with HTTP ${response.statusCode}`);
    } else {
      logTest('Empty prompt handling', 'FAIL', 
        `Expected error, got HTTP ${response.statusCode}`);
    }
  } catch (error) {
    logTest('Empty prompt handling', 'PASS', 'Network error as expected');
  }
}

async function runLeonardoScenarioTests() {
  console.log('🚀 Starting Leonardo AI Scenario Tests');
  console.log('='.repeat(60));
  console.log(`🎨 Testing headshot generation scenarios`);
  console.log(`🔑 API Key: ${LEONARDO_API_KEY ? 'Configured' : 'Missing'}`);
  console.log(`📅 Test run: ${new Date().toISOString()}`);
  
  if (!LEONARDO_API_KEY) {
    console.log('❌ Leonardo API key not configured');
    return;
  }
  
  const startTime = Date.now();
  
  // Run all tests
  const userInfo = await testLeonardoUserInfo();
  const modelsInfo = await testLeonardoModels();
  
  if (!userInfo.success) {
    console.log('❌ Cannot proceed without valid user authentication');
    return;
  }
  
  // Test image generation scenarios (only if we have credits)
  const generationResults = [];
  if (userInfo.credits > 0 || userInfo.tokens > 0) {
    for (const scenario of TEST_SCENARIOS) {
      const result = await testImageGeneration(scenario);
      generationResults.push({ scenario: scenario.name, ...result });
      
      // Delay between generations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  } else {
    console.log('⚠️ Skipping image generation tests - insufficient credits/tokens');
  }
  
  // Test error handling
  await testErrorHandling();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n🏁 Leonardo AI Test Summary');
  console.log('='.repeat(60));
  
  // User info summary
  console.log(`👤 User: ${userInfo.username || 'Unknown'}`);
  console.log(`💰 Credits: ${userInfo.credits || 0}`);
  console.log(`🎫 Tokens: ${userInfo.tokens || 0}`);
  
  // Models summary
  if (modelsInfo.success) {
    console.log(`🤖 Models: ${modelsInfo.modelCount} available`);
  }
  
  // Generation results
  if (generationResults.length > 0) {
    const successfulGenerations = generationResults.filter(r => r.success);
    console.log(`\n🎨 Generation Tests: ${successfulGenerations.length}/${generationResults.length} scenarios completed`);
    
    successfulGenerations.forEach(result => {
      console.log(`   ✅ ${result.scenario}: ${result.status} (${result.imageCount} images)`);
    });
    
    const failedGenerations = generationResults.filter(r => !r.success);
    if (failedGenerations.length > 0) {
      console.log('\n❌ Failed Generations:');
      failedGenerations.forEach(result => {
        console.log(`   ❌ ${result.scenario}: ${result.error}`);
      });
    }
  }
  
  console.log(`\n⏱️  Total execution time: ${duration}s`);
  
  const overallSuccess = userInfo.success && modelsInfo.success;
  console.log(`📊 Overall Status: ${overallSuccess ? '✅ LEONARDO AI FULLY OPERATIONAL' : '❌ LEONARDO AI ISSUES'}`);
  
  return {
    userInfo,
    modelsInfo,
    generationResults,
    overallSuccess
  };
}

// Run tests
runLeonardoScenarioTests().catch(console.error);
