#!/usr/bin/env node

/**
 * Comprehensive AI Image Generation Test Suite
 * Tests headshot generation functionality with various scenarios
 */

import { config } from 'dotenv';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

const LOCAL_API_BASE = 'http://localhost:3000';

// Test scenarios for image generation
const TEST_SCENARIOS = [
  {
    name: 'Basic Professional Headshot',
    prompt: 'professional headshot of a person in business attire, studio lighting, clean background',
    requirements: {
      quality: 'high',
      speed: 'standard',
      budget: 'medium'
    },
    expectedFeatures: ['professional', 'business attire', 'clean background']
  },
  {
    name: 'Executive Portrait',
    prompt: 'executive portrait of a confident professional, formal suit, corporate setting',
    requirements: {
      quality: 'premium',
      speed: 'slow',
      budget: 'high'
    },
    expectedFeatures: ['executive', 'formal', 'confident']
  },
  {
    name: 'Creative Professional',
    prompt: 'creative professional headshot, modern casual attire, artistic lighting',
    requirements: {
      quality: 'high',
      speed: 'fast',
      budget: 'medium'
    },
    expectedFeatures: ['creative', 'modern', 'artistic']
  },
  {
    name: 'Medical Professional',
    prompt: 'medical professional headshot, white coat, hospital background, trustworthy appearance',
    requirements: {
      quality: 'high',
      speed: 'standard',
      budget: 'medium'
    },
    expectedFeatures: ['medical', 'white coat', 'trustworthy']
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

async function makeLocalRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 60000 // 60 seconds for AI operations
    };

    if (options.data) {
      const jsonData = JSON.stringify(options.data);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(requestOptions, (res) => {
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

    if (options.data) {
      req.write(JSON.stringify(options.data));
    }

    req.end();
  });
}

async function testBasicImageGeneration() {
  logSection('Basic Image Generation Tests');
  
  const basicPrompt = {
    prompt: 'professional headshot of a person, business attire, studio lighting',
    num_images: 1,
    image_size: 'portrait',
    provider: 'fal'
  };
  
  try {
    console.log('🎨 Testing basic image generation...');
    console.log(`   📝 Prompt: "${basicPrompt.prompt}"`);
    console.log(`   🔧 Provider: ${basicPrompt.provider}`);
    
    const startTime = Date.now();
    const response = await makeLocalRequest('/api/test-ai-generation', {
      method: 'POST',
      data: basicPrompt
    });
    const processingTime = Date.now() - startTime;
    
    if (response.statusCode === 200 && response.data.success) {
      logTest('Basic image generation', 'PASS', 
        `Generated in ${(processingTime / 1000).toFixed(2)}s`);
      
      // Check response structure
      if (response.data.images && response.data.images.length > 0) {
        logTest('Response structure validation', 'PASS', 
          `${response.data.images.length} image(s) generated`);
        
        // Check image URLs
        const validUrls = response.data.images.filter(img => 
          img.url && img.url.startsWith('http')
        ).length;
        
        logTest('Image URL validation', validUrls === response.data.images.length ? 'PASS' : 'FAIL',
          `${validUrls}/${response.data.images.length} valid URLs`);
        
        return {
          success: true,
          processingTime,
          imageCount: response.data.images.length,
          provider: response.data.metadata?.provider,
          cost: response.data.metadata?.cost
        };
      } else {
        logTest('Response structure validation', 'FAIL', 'No images in response');
        return { success: false, error: 'No images generated' };
      }
    } else {
      logTest('Basic image generation', 'FAIL', 
        `HTTP ${response.statusCode}: ${response.data.error || 'Unknown error'}`);
      return { success: false, error: response.data.error || 'Generation failed' };
    }
  } catch (error) {
    logTest('Basic image generation', 'FAIL', error.message);
    return { success: false, error: error.message };
  }
}

async function testScenarioBasedGeneration() {
  logSection('Scenario-Based Generation Tests');
  
  const results = [];
  
  for (const scenario of TEST_SCENARIOS) {
    try {
      console.log(`\n🎭 Testing: ${scenario.name}`);
      console.log(`   📝 Prompt: "${scenario.prompt}"`);
      console.log(`   ⚙️  Requirements: ${JSON.stringify(scenario.requirements)}`);
      
      const requestData = {
        prompt: scenario.prompt,
        requirements: scenario.requirements,
        num_images: 1,
        image_size: 'portrait'
      };
      
      const startTime = Date.now();
      const response = await makeLocalRequest('/api/test-ai-generation', {
        method: 'POST',
        data: requestData
      });
      const processingTime = Date.now() - startTime;
      
      if (response.statusCode === 200 && response.data.success) {
        logTest(`${scenario.name} generation`, 'PASS', 
          `Generated in ${(processingTime / 1000).toFixed(2)}s`);
        
        results.push({
          scenario: scenario.name,
          success: true,
          processingTime,
          provider: response.data.metadata?.provider,
          imageCount: response.data.images?.length || 0,
          cost: response.data.metadata?.cost
        });
      } else {
        logTest(`${scenario.name} generation`, 'FAIL', 
          `HTTP ${response.statusCode}: ${response.data.error || 'Unknown error'}`);
        
        results.push({
          scenario: scenario.name,
          success: false,
          error: response.data.error || 'Generation failed'
        });
      }
      
      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      logTest(`${scenario.name} generation`, 'FAIL', error.message);
      results.push({
        scenario: scenario.name,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

async function testProviderFallback() {
  logSection('Provider Fallback Tests');
  
  // Test with specific provider requests
  const providers = ['fal', 'leonardo'];
  const results = [];
  
  for (const provider of providers) {
    try {
      console.log(`\n🔄 Testing ${provider.toUpperCase()} provider...`);
      
      const requestData = {
        prompt: 'professional headshot test for provider fallback',
        provider: provider,
        num_images: 1,
        image_size: 'portrait'
      };
      
      const startTime = Date.now();
      const response = await makeLocalRequest('/api/test-ai-generation', {
        method: 'POST',
        data: requestData
      });
      const processingTime = Date.now() - startTime;
      
      if (response.statusCode === 200 && response.data.success) {
        const actualProvider = response.data.metadata?.provider;
        const fallbackUsed = actualProvider !== provider;
        
        logTest(`${provider.toUpperCase()} provider test`, 'PASS', 
          `Used: ${actualProvider}${fallbackUsed ? ' (fallback)' : ''}, Time: ${(processingTime / 1000).toFixed(2)}s`);
        
        results.push({
          requestedProvider: provider,
          actualProvider: actualProvider,
          fallbackUsed,
          success: true,
          processingTime
        });
      } else {
        logTest(`${provider.toUpperCase()} provider test`, 'FAIL', 
          `HTTP ${response.statusCode}: ${response.data.error || 'Unknown error'}`);
        
        results.push({
          requestedProvider: provider,
          success: false,
          error: response.data.error || 'Provider test failed'
        });
      }
      
      // Delay between provider tests
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      logTest(`${provider.toUpperCase()} provider test`, 'FAIL', error.message);
      results.push({
        requestedProvider: provider,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

async function runImageGenerationTests() {
  console.log('🚀 Starting AI Image Generation Tests');
  console.log('='.repeat(60));
  console.log(`🎨 Testing headshot generation capabilities`);
  console.log(`🌐 Local API: ${LOCAL_API_BASE}`);
  console.log(`📅 Test run: ${new Date().toISOString()}`);
  
  const startTime = Date.now();
  
  // Run all image generation tests
  const basicResult = await testBasicImageGeneration();
  const scenarioResults = await testScenarioBasedGeneration();
  const fallbackResults = await testProviderFallback();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n🏁 Image Generation Test Summary');
  console.log('='.repeat(60));
  
  // Basic generation summary
  console.log(`🎨 Basic Generation: ${basicResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (basicResult.success) {
    console.log(`   ⏱️  Processing Time: ${(basicResult.processingTime / 1000).toFixed(2)}s`);
    console.log(`   🤖 Provider: ${basicResult.provider || 'Unknown'}`);
    console.log(`   🖼️  Images: ${basicResult.imageCount}`);
  }
  
  // Scenario-based summary
  const successfulScenarios = scenarioResults.filter(r => r.success);
  console.log(`\n🎭 Scenario Tests: ${successfulScenarios.length}/${scenarioResults.length} scenarios passed`);
  successfulScenarios.forEach(result => {
    console.log(`   ✅ ${result.scenario}: ${(result.processingTime / 1000).toFixed(2)}s (${result.provider})`);
  });
  
  const failedScenarios = scenarioResults.filter(r => !r.success);
  if (failedScenarios.length > 0) {
    console.log('\n❌ Failed Scenarios:');
    failedScenarios.forEach(result => {
      console.log(`   ❌ ${result.scenario}: ${result.error}`);
    });
  }
  
  // Provider fallback summary
  const successfulProviders = fallbackResults.filter(r => r.success);
  console.log(`\n🔄 Provider Tests: ${successfulProviders.length}/${fallbackResults.length} providers working`);
  successfulProviders.forEach(result => {
    console.log(`   ✅ ${result.requestedProvider.toUpperCase()}: ${result.actualProvider}${result.fallbackUsed ? ' (fallback)' : ''}`);
  });
  
  console.log(`\n⏱️  Total execution time: ${duration}s`);
  
  const overallSuccess = basicResult.success && successfulScenarios.length > 0 && successfulProviders.length > 0;
  console.log(`📊 Overall Status: ${overallSuccess ? '✅ IMAGE GENERATION WORKING' : '❌ IMAGE GENERATION ISSUES'}`);
  
  return {
    basicGeneration: basicResult,
    scenarioResults,
    fallbackResults,
    overallSuccess,
    totalTime: duration
  };
}

// Run tests
runImageGenerationTests().catch(console.error);
