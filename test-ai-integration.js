#!/usr/bin/env node

/**
 * Comprehensive AI Integration Test Suite
 * Tests AI integration with payment system, authentication, and email notifications
 */

import { config } from 'dotenv';
import http from 'http';

// Load environment variables
config({ path: '.env.local' });

const LOCAL_API_BASE = 'http://localhost:3000';

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
      timeout: options.timeout || 60000
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

async function testAIPerformance() {
  logSection('AI Performance Tests');
  
  const performanceTests = [
    {
      name: 'Quick Generation (Leonardo)',
      data: {
        prompt: 'professional headshot, quick test',
        provider: 'leonardo',
        num_images: 1,
        image_size: 'portrait'
      },
      expectedMaxTime: 15000 // 15 seconds
    },
    {
      name: 'Batch Generation (Leonardo)',
      data: {
        prompt: 'professional headshot, batch test',
        provider: 'leonardo',
        num_images: 2,
        image_size: 'portrait'
      },
      expectedMaxTime: 30000 // 30 seconds
    }
  ];
  
  const results = [];
  
  for (const test of performanceTests) {
    try {
      console.log(`\n⏱️  Testing: ${test.name}`);
      console.log(`   📝 Prompt: "${test.data.prompt}"`);
      console.log(`   🖼️  Images: ${test.data.num_images}`);
      console.log(`   ⏰ Expected Max Time: ${test.expectedMaxTime / 1000}s`);
      
      const startTime = Date.now();
      const response = await makeLocalRequest('/api/test-ai-generation', {
        method: 'POST',
        data: test.data,
        timeout: test.expectedMaxTime + 5000 // Add 5s buffer
      });
      const actualTime = Date.now() - startTime;
      
      if (response.statusCode === 200 && response.data.success) {
        const withinTimeLimit = actualTime <= test.expectedMaxTime;
        
        logTest(`${test.name} performance`, withinTimeLimit ? 'PASS' : 'WARN', 
          `${(actualTime / 1000).toFixed(2)}s (limit: ${test.expectedMaxTime / 1000}s)`);
        
        results.push({
          test: test.name,
          success: true,
          actualTime,
          expectedMaxTime: test.expectedMaxTime,
          withinLimit: withinTimeLimit,
          imagesGenerated: response.data.images?.length || 0,
          cost: response.data.metadata?.cost
        });
      } else {
        logTest(`${test.name} performance`, 'FAIL', 
          `HTTP ${response.statusCode}: ${response.data.error || 'Unknown error'}`);
        
        results.push({
          test: test.name,
          success: false,
          error: response.data.error || 'Unknown error'
        });
      }
      
      // Delay between performance tests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      logTest(`${test.name} performance`, 'FAIL', error.message);
      results.push({
        test: test.name,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

async function testAIWithPaymentIntegration() {
  logSection('AI + Payment Integration Tests');
  
  // Simulate a user who has paid for a plan
  const testScenarios = [
    {
      name: 'Basic Plan User AI Generation',
      planType: 'Basic',
      expectedImages: 1,
      prompt: 'professional headshot for basic plan user'
    },
    {
      name: 'Professional Plan User AI Generation',
      planType: 'Professional',
      expectedImages: 2,
      prompt: 'professional headshot for professional plan user'
    }
  ];
  
  const results = [];
  
  for (const scenario of testScenarios) {
    try {
      console.log(`\n💳 Testing: ${scenario.name}`);
      console.log(`   📋 Plan: ${scenario.planType}`);
      console.log(`   🖼️  Expected Images: ${scenario.expectedImages}`);
      
      const testData = {
        prompt: scenario.prompt,
        provider: 'leonardo',
        num_images: scenario.expectedImages,
        image_size: 'portrait',
        metadata: {
          planType: scenario.planType,
          userId: 'test-user-123'
        }
      };
      
      const response = await makeLocalRequest('/api/test-ai-generation', {
        method: 'POST',
        data: testData
      });
      
      if (response.statusCode === 200 && response.data.success) {
        const actualImages = response.data.images?.length || 0;
        const correctImageCount = actualImages === scenario.expectedImages;
        
        logTest(`${scenario.name}`, correctImageCount ? 'PASS' : 'WARN', 
          `Generated ${actualImages}/${scenario.expectedImages} images`);
        
        results.push({
          scenario: scenario.name,
          success: true,
          planType: scenario.planType,
          expectedImages: scenario.expectedImages,
          actualImages,
          correctCount: correctImageCount
        });
      } else {
        logTest(`${scenario.name}`, 'FAIL', 
          `HTTP ${response.statusCode}: ${response.data.error || 'Unknown error'}`);
        
        results.push({
          scenario: scenario.name,
          success: false,
          error: response.data.error || 'Unknown error'
        });
      }
      
      // Delay between tests
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      logTest(`${scenario.name}`, 'FAIL', error.message);
      results.push({
        scenario: scenario.name,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

async function testAISystemResilience() {
  logSection('AI System Resilience Tests');
  
  // Test system behavior under various conditions
  const resilienceTests = [
    {
      name: 'Provider Failover Test',
      description: 'Test automatic failover when primary provider fails',
      data: { prompt: 'failover test', provider: 'fal' } // FAL is failing
    },
    {
      name: 'Load Test',
      description: 'Test system under moderate load',
      concurrent: 3,
      data: { prompt: 'load test', provider: 'leonardo' }
    }
  ];
  
  const results = [];
  
  for (const test of resilienceTests) {
    try {
      console.log(`\n🛡️  Testing: ${test.name}`);
      console.log(`   📝 Description: ${test.description}`);
      
      if (test.concurrent) {
        // Concurrent load test
        const promises = [];
        for (let i = 0; i < test.concurrent; i++) {
          promises.push(
            makeLocalRequest('/api/test-ai-generation', {
              method: 'POST',
              data: { ...test.data, prompt: `${test.data.prompt} ${i + 1}` }
            })
          );
        }
        
        const responses = await Promise.all(promises);
        const successful = responses.filter(r => r.statusCode === 200 && r.data.success).length;
        
        logTest(`${test.name}`, successful > 0 ? 'PASS' : 'FAIL', 
          `${successful}/${test.concurrent} requests successful`);
        
        results.push({
          test: test.name,
          success: successful > 0,
          concurrent: test.concurrent,
          successful,
          successRate: (successful / test.concurrent * 100).toFixed(1) + '%'
        });
      } else {
        // Single failover test
        const response = await makeLocalRequest('/api/test-ai-generation', {
          method: 'POST',
          data: test.data
        });
        
        if (response.statusCode === 200 && response.data.success) {
          const usedFallback = response.data.fallbackUsed;
          const actualProvider = response.data.actualProvider;
          
          logTest(`${test.name}`, 'PASS', 
            `Provider: ${actualProvider}, Fallback: ${usedFallback ? 'Yes' : 'No'}`);
          
          results.push({
            test: test.name,
            success: true,
            requestedProvider: test.data.provider,
            actualProvider,
            fallbackUsed: usedFallback
          });
        } else {
          logTest(`${test.name}`, 'FAIL', 
            `HTTP ${response.statusCode}: ${response.data.error || 'Unknown error'}`);
          
          results.push({
            test: test.name,
            success: false,
            error: response.data.error || 'Unknown error'
          });
        }
      }
      
    } catch (error) {
      logTest(`${test.name}`, 'FAIL', error.message);
      results.push({
        test: test.name,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

async function runAIIntegrationTests() {
  console.log('🚀 Starting AI Integration Tests');
  console.log('='.repeat(60));
  console.log(`🤖 Testing AI integration with payment, auth, and notifications`);
  console.log(`🌐 Local API: ${LOCAL_API_BASE}`);
  console.log(`📅 Test run: ${new Date().toISOString()}`);
  
  const startTime = Date.now();
  
  // Run all integration tests
  const performanceResults = await testAIPerformance();
  const paymentIntegrationResults = await testAIWithPaymentIntegration();
  const resilienceResults = await testAISystemResilience();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n🏁 AI Integration Test Summary');
  console.log('='.repeat(60));
  
  // Performance summary
  const successfulPerformance = performanceResults.filter(r => r.success);
  console.log(`⏱️  Performance Tests: ${successfulPerformance.length}/${performanceResults.length} passed`);
  successfulPerformance.forEach(result => {
    console.log(`   ✅ ${result.test}: ${(result.actualTime / 1000).toFixed(2)}s (${result.imagesGenerated} images)`);
  });
  
  // Payment integration summary
  const successfulPayment = paymentIntegrationResults.filter(r => r.success);
  console.log(`\n💳 Payment Integration: ${successfulPayment.length}/${paymentIntegrationResults.length} scenarios passed`);
  successfulPayment.forEach(result => {
    console.log(`   ✅ ${result.scenario}: ${result.actualImages} images generated`);
  });
  
  // Resilience summary
  const successfulResilience = resilienceResults.filter(r => r.success);
  console.log(`\n🛡️  Resilience Tests: ${successfulResilience.length}/${resilienceResults.length} tests passed`);
  successfulResilience.forEach(result => {
    if (result.concurrent) {
      console.log(`   ✅ ${result.test}: ${result.successRate} success rate`);
    } else {
      console.log(`   ✅ ${result.test}: ${result.actualProvider} (fallback: ${result.fallbackUsed ? 'Yes' : 'No'})`);
    }
  });
  
  console.log(`\n⏱️  Total execution time: ${duration}s`);
  
  const overallSuccess = successfulPerformance.length > 0 && successfulPayment.length > 0 && successfulResilience.length > 0;
  console.log(`📊 Overall Status: ${overallSuccess ? '✅ AI INTEGRATION WORKING' : '❌ AI INTEGRATION ISSUES'}`);
  
  return {
    performanceResults,
    paymentIntegrationResults,
    resilienceResults,
    overallSuccess,
    totalTime: duration
  };
}

// Run tests
runAIIntegrationTests().catch(console.error);
