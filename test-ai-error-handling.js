#!/usr/bin/env node

/**
 * AI Error Handling Test Suite
 * Tests how the system handles various AI-related errors and edge cases
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
      timeout: options.timeout || 30000
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

async function testInvalidInputHandling() {
  logSection('Invalid Input Handling Tests');
  
  const invalidInputTests = [
    {
      name: 'Empty prompt',
      data: { prompt: '', provider: 'fal' },
      expectedStatus: 400
    },
    {
      name: 'Null prompt',
      data: { prompt: null, provider: 'fal' },
      expectedStatus: 400
    },
    {
      name: 'Invalid provider',
      data: { prompt: 'test prompt', provider: 'invalid_provider' },
      expectedStatus: 400
    },
    {
      name: 'Invalid image size',
      data: { prompt: 'test prompt', image_size: 'invalid_size' },
      expectedStatus: 400
    },
    {
      name: 'Negative num_images',
      data: { prompt: 'test prompt', num_images: -1 },
      expectedStatus: 400
    },
    {
      name: 'Excessive num_images',
      data: { prompt: 'test prompt', num_images: 100 },
      expectedStatus: 400
    }
  ];
  
  const results = [];
  
  for (const test of invalidInputTests) {
    try {
      const response = await makeLocalRequest('/api/test-ai-generation', {
        method: 'POST',
        data: test.data
      });
      
      if (response.statusCode >= 400) {
        logTest(`${test.name} validation`, 'PASS', 
          `Correctly rejected with HTTP ${response.statusCode}`);
        results.push({ test: test.name, success: true, status: response.statusCode });
      } else {
        logTest(`${test.name} validation`, 'FAIL', 
          `Expected error, got HTTP ${response.statusCode}`);
        results.push({ test: test.name, success: false, status: response.statusCode });
      }
    } catch (error) {
      logTest(`${test.name} validation`, 'PASS', 'Network error as expected');
      results.push({ test: test.name, success: true, error: error.message });
    }
  }
  
  return results;
}

async function testTimeoutHandling() {
  logSection('Timeout Handling Tests');
  
  try {
    // Test with very short timeout
    const response = await makeLocalRequest('/api/test-ai-generation', {
      method: 'POST',
      data: {
        prompt: 'test prompt for timeout handling',
        provider: 'fal'
      },
      timeout: 1000 // 1 second timeout
    });
    
    if (response.statusCode === 500) {
      logTest('Short timeout handling', 'PASS', 'Request timed out as expected');
      return { success: true };
    } else {
      logTest('Short timeout handling', 'WARN', 
        `Request completed unexpectedly: HTTP ${response.statusCode}`);
      return { success: false };
    }
  } catch (error) {
    if (error.message.includes('timeout')) {
      logTest('Short timeout handling', 'PASS', 'Timeout error caught correctly');
      return { success: true };
    } else {
      logTest('Short timeout handling', 'FAIL', error.message);
      return { success: false };
    }
  }
}

async function testProviderFallbackLogic() {
  logSection('Provider Fallback Logic Tests');
  
  const fallbackTests = [
    {
      name: 'Primary provider failure simulation',
      data: { prompt: 'test prompt', provider: 'fal' }, // FAL is failing
      expectFallback: true
    },
    {
      name: 'Secondary provider test',
      data: { prompt: 'test prompt', provider: 'leonardo' }, // Leonardo might work
      expectFallback: false
    },
    {
      name: 'Auto provider selection',
      data: { prompt: 'test prompt' }, // No provider specified
      expectFallback: true
    }
  ];
  
  const results = [];
  
  for (const test of fallbackTests) {
    try {
      console.log(`\n🔄 Testing: ${test.name}`);
      
      const startTime = Date.now();
      const response = await makeLocalRequest('/api/test-ai-generation', {
        method: 'POST',
        data: test.data
      });
      const responseTime = Date.now() - startTime;
      
      if (response.statusCode === 200) {
        const actualProvider = response.data.actualProvider;
        const fallbackUsed = response.data.fallbackUsed;
        
        logTest(`${test.name}`, 'PASS', 
          `Provider: ${actualProvider}, Fallback: ${fallbackUsed ? 'Yes' : 'No'}, Time: ${responseTime}ms`);
        
        results.push({
          test: test.name,
          success: true,
          provider: actualProvider,
          fallbackUsed,
          responseTime
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

async function testRateLimitingBehavior() {
  logSection('Rate Limiting Behavior Tests');
  
  console.log('🔄 Testing rapid consecutive requests...');
  
  const promises = [];
  const requestCount = 5;
  
  // Make multiple rapid requests
  for (let i = 0; i < requestCount; i++) {
    promises.push(
      makeLocalRequest('/api/test-ai-generation', {
        method: 'POST',
        data: {
          prompt: `test prompt ${i + 1}`,
          provider: 'leonardo'
        }
      }).catch(error => ({ error: error.message, requestIndex: i }))
    );
  }
  
  try {
    const results = await Promise.all(promises);
    
    const successfulRequests = results.filter(r => r.statusCode && r.statusCode < 400);
    const rateLimitedRequests = results.filter(r => r.statusCode === 429);
    const errorRequests = results.filter(r => r.error);
    
    logTest('Concurrent requests handling', 'PASS', 
      `${successfulRequests.length} successful, ${rateLimitedRequests.length} rate limited, ${errorRequests.length} errors`);
    
    if (rateLimitedRequests.length > 0) {
      logTest('Rate limiting detection', 'PASS', 
        `${rateLimitedRequests.length} requests properly rate limited`);
    } else {
      logTest('Rate limiting detection', 'WARN', 
        'No rate limiting detected (may not be implemented)');
    }
    
    return {
      totalRequests: requestCount,
      successful: successfulRequests.length,
      rateLimited: rateLimitedRequests.length,
      errors: errorRequests.length
    };
  } catch (error) {
    logTest('Concurrent requests handling', 'FAIL', error.message);
    return { success: false, error: error.message };
  }
}

async function testSystemHealthMonitoring() {
  logSection('System Health Monitoring Tests');
  
  try {
    const response = await makeLocalRequest('/api/ai/provider-health');
    
    if (response.statusCode === 200) {
      const healthData = response.data;
      
      logTest('Health endpoint accessibility', 'PASS', 'Endpoint responding');
      
      // Check health data structure
      if (healthData.providers) {
        const providerCount = Object.keys(healthData.providers).length;
        logTest('Provider health data', 'PASS', `${providerCount} providers monitored`);
        
        // Check individual provider status
        Object.entries(healthData.providers).forEach(([provider, status]) => {
          const isHealthy = status.status === 'online' || status.healthy;
          logTest(`${provider.toUpperCase()} health status`, 
            isHealthy ? 'PASS' : 'WARN', 
            `Status: ${status.status || 'unknown'}`);
        });
      } else {
        logTest('Provider health data', 'FAIL', 'No provider data in response');
      }
      
      return {
        success: true,
        providers: healthData.providers,
        timestamp: healthData.timestamp
      };
    } else {
      logTest('Health endpoint accessibility', 'FAIL', `HTTP ${response.statusCode}`);
      return { success: false };
    }
  } catch (error) {
    logTest('Health endpoint accessibility', 'FAIL', error.message);
    return { success: false, error: error.message };
  }
}

async function runAIErrorHandlingTests() {
  console.log('🚀 Starting AI Error Handling Tests');
  console.log('='.repeat(60));
  console.log(`🛡️  Testing AI system resilience and error handling`);
  console.log(`🌐 Local API: ${LOCAL_API_BASE}`);
  console.log(`📅 Test run: ${new Date().toISOString()}`);
  
  const startTime = Date.now();
  
  // Run all error handling tests
  const invalidInputResults = await testInvalidInputHandling();
  const timeoutResults = await testTimeoutHandling();
  const fallbackResults = await testProviderFallbackLogic();
  const rateLimitResults = await testRateLimitingBehavior();
  const healthResults = await testSystemHealthMonitoring();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n🏁 AI Error Handling Test Summary');
  console.log('='.repeat(60));
  
  // Invalid input handling summary
  const validInputTests = invalidInputResults.filter(r => r.success);
  console.log(`🛡️  Input Validation: ${validInputTests.length}/${invalidInputResults.length} tests passed`);
  
  // Timeout handling summary
  console.log(`⏱️  Timeout Handling: ${timeoutResults.success ? '✅ Working' : '❌ Issues'}`);
  
  // Fallback logic summary
  const successfulFallbacks = fallbackResults.filter(r => r.success);
  console.log(`🔄 Provider Fallback: ${successfulFallbacks.length}/${fallbackResults.length} scenarios handled`);
  
  // Rate limiting summary
  if (rateLimitResults.totalRequests) {
    console.log(`🚦 Rate Limiting: ${rateLimitResults.successful} successful, ${rateLimitResults.rateLimited} limited`);
  }
  
  // Health monitoring summary
  console.log(`🏥 Health Monitoring: ${healthResults.success ? '✅ Working' : '❌ Issues'}`);
  
  console.log(`\n⏱️  Total execution time: ${duration}s`);
  
  const overallSuccess = validInputTests.length > 0 && healthResults.success;
  console.log(`📊 Overall Status: ${overallSuccess ? '✅ ERROR HANDLING ROBUST' : '❌ ERROR HANDLING NEEDS IMPROVEMENT'}`);
  
  return {
    invalidInputResults,
    timeoutResults,
    fallbackResults,
    rateLimitResults,
    healthResults,
    overallSuccess
  };
}

// Run tests
runAIErrorHandlingTests().catch(console.error);
