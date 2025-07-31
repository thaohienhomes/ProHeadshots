#!/usr/bin/env node

/**
 * AI Model Training Test Suite
 * Tests the AI training pipeline and fine-tuning capabilities
 */

import { config } from 'dotenv';
import http from 'http';
import https from 'https';

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
      timeout: 60000
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

async function testFalAIDirectly() {
  logSection('Direct FAL AI API Tests');
  
  const falApiKey = process.env.FAL_AI_API_KEY;
  if (!falApiKey) {
    logTest('FAL AI API Key', 'FAIL', 'API key not configured');
    return false;
  }
  
  logTest('FAL AI API Key', 'PASS', `Length: ${falApiKey.length}`);
  
  try {
    // Test FAL AI with a simple request
    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'fal.run',
        port: 443,
        path: '/fal-ai/flux/dev',
        method: 'POST',
        headers: {
          'Authorization': `Key ${falApiKey}`,
          'Content-Type': 'application/json',
        }
      };

      const postData = JSON.stringify({
        prompt: 'test prompt for API validation',
        image_size: 'square',
        num_images: 1,
        enable_safety_checker: true
      });

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              data: JSON.parse(data)
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              data: data
            });
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    if (response.statusCode === 200) {
      logTest('FAL AI Direct API', 'PASS', 'API accessible');
      return true;
    } else if (response.statusCode === 402) {
      logTest('FAL AI Direct API', 'FAIL', 'Payment required - insufficient credits');
      return false;
    } else if (response.statusCode === 403) {
      logTest('FAL AI Direct API', 'FAIL', 'Forbidden - invalid API key or permissions');
      return false;
    } else {
      logTest('FAL AI Direct API', 'FAIL', `HTTP ${response.statusCode}: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logTest('FAL AI Direct API', 'FAIL', error.message);
    return false;
  }
}

async function testLeonardoAIDirectly() {
  logSection('Direct Leonardo AI API Tests');
  
  const leonardoApiKey = process.env.LEONARDO_API_KEY;
  if (!leonardoApiKey) {
    logTest('Leonardo AI API Key', 'FAIL', 'API key not configured');
    return false;
  }
  
  logTest('Leonardo AI API Key', 'PASS', `Length: ${leonardoApiKey.length}`);
  
  try {
    // Test Leonardo AI user info endpoint
    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'cloud.leonardo.ai',
        port: 443,
        path: '/api/rest/v1/me',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${leonardoApiKey}`,
          'Content-Type': 'application/json',
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              data: JSON.parse(data)
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              data: data
            });
          }
        });
      });

      req.on('error', reject);
      req.end();
    });

    if (response.statusCode === 200) {
      const userInfo = response.data.user_details?.[0];
      logTest('Leonardo AI Direct API', 'PASS', 
        `User: ${userInfo?.user?.username || 'Unknown'}, Credits: ${userInfo?.tokenRenewalDate ? 'Available' : 'Unknown'}`);
      return true;
    } else if (response.statusCode === 401) {
      logTest('Leonardo AI Direct API', 'FAIL', 'Unauthorized - invalid API key');
      return false;
    } else {
      logTest('Leonardo AI Direct API', 'FAIL', `HTTP ${response.statusCode}: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logTest('Leonardo AI Direct API', 'FAIL', error.message);
    return false;
  }
}

async function testTrainingEndpoints() {
  logSection('Training Endpoint Tests');
  
  const endpoints = [
    { path: '/api/ai/unified-train', name: 'Unified Training Endpoint' },
    { path: '/api/llm/tune/createTuneFal', name: 'FAL Training Endpoint' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeLocalRequest(endpoint.path);
      
      if (response.statusCode === 200) {
        logTest(`${endpoint.name}`, 'PASS', 'Endpoint accessible');
      } else if (response.statusCode === 401) {
        logTest(`${endpoint.name}`, 'WARN', 'Requires authentication (expected)');
      } else if (response.statusCode === 405) {
        logTest(`${endpoint.name}`, 'PASS', 'Method not allowed (GET on POST endpoint)');
      } else {
        logTest(`${endpoint.name}`, 'FAIL', `HTTP ${response.statusCode}`);
      }
    } catch (error) {
      logTest(`${endpoint.name}`, 'FAIL', error.message);
    }
  }
}

async function testAIServiceConfiguration() {
  logSection('AI Service Configuration Tests');
  
  // Test environment variables
  const requiredEnvVars = [
    { name: 'AI_PROVIDER', value: process.env.AI_PROVIDER, expected: ['fal', 'leonardo', 'unified', 'astria'] },
    { name: 'AI_PRIMARY_PROVIDER', value: process.env.AI_PRIMARY_PROVIDER, expected: ['fal', 'leonardo'] },
    { name: 'AI_ENABLED', value: process.env.AI_ENABLED, expected: ['true', 'false'] },
    { name: 'AI_FALLBACK_ENABLED', value: process.env.AI_FALLBACK_ENABLED, expected: ['true', 'false'] }
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envVar.value && envVar.expected.includes(envVar.value)) {
      logTest(`${envVar.name} configuration`, 'PASS', `Value: ${envVar.value}`);
    } else if (envVar.value) {
      logTest(`${envVar.name} configuration`, 'WARN', `Unexpected value: ${envVar.value}`);
    } else {
      logTest(`${envVar.name} configuration`, 'FAIL', 'Not configured');
    }
  });
  
  // Test performance settings
  const performanceSettings = [
    { name: 'AI_TIMEOUT_MS', value: process.env.AI_TIMEOUT_MS || '30000' },
    { name: 'AI_MAX_RETRIES', value: process.env.AI_MAX_RETRIES || '3' },
    { name: 'AI_BATCH_SIZE', value: process.env.AI_BATCH_SIZE || '10' }
  ];
  
  performanceSettings.forEach(setting => {
    const numValue = parseInt(setting.value);
    if (!isNaN(numValue) && numValue > 0) {
      logTest(`${setting.name} configuration`, 'PASS', `Value: ${setting.value}`);
    } else {
      logTest(`${setting.name} configuration`, 'FAIL', `Invalid value: ${setting.value}`);
    }
  });
}

async function runAITrainingTests() {
  console.log('🚀 Starting AI Training & Configuration Tests');
  console.log('='.repeat(60));
  console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'Not configured'}`);
  console.log(`🔧 Primary: ${process.env.AI_PRIMARY_PROVIDER || 'Not configured'}`);
  console.log(`📅 Test run: ${new Date().toISOString()}`);
  
  const startTime = Date.now();
  
  // Run all tests
  await testAIServiceConfiguration();
  const falWorking = await testFalAIDirectly();
  const leonardoWorking = await testLeonardoAIDirectly();
  await testTrainingEndpoints();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n🏁 AI Training Test Summary');
  console.log('='.repeat(60));
  
  // Provider status
  console.log(`🌐 Provider Status:`);
  console.log(`   ${falWorking ? '✅' : '❌'} FAL AI: ${falWorking ? 'Working' : 'Issues detected'}`);
  console.log(`   ${leonardoWorking ? '✅' : '❌'} Leonardo AI: ${leonardoWorking ? 'Working' : 'Issues detected'}`);
  
  const workingProviders = [falWorking, leonardoWorking].filter(Boolean).length;
  console.log(`\n📊 Overall Status: ${workingProviders > 0 ? '✅ AI TRAINING SYSTEM OPERATIONAL' : '❌ AI TRAINING SYSTEM OFFLINE'}`);
  console.log(`⏱️  Total execution time: ${duration}s`);
  
  return {
    falWorking,
    leonardoWorking,
    workingProviders,
    configurationValid: true
  };
}

// Run tests
runAITrainingTests().catch(console.error);
