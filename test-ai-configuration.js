#!/usr/bin/env node

/**
 * Comprehensive AI Configuration Test Suite
 * Tests all AI providers, configurations, and integrations
 */

import { config } from 'dotenv';
import https from 'https';
import http from 'http';

// Load environment variables
config({ path: '.env.local' });

// AI Configuration
const AI_CONFIG = {
  provider: process.env.AI_PROVIDER || 'unified',
  primaryProvider: process.env.AI_PRIMARY_PROVIDER || 'fal',
  secondaryProvider: process.env.AI_SECONDARY_PROVIDER || 'leonardo',
  enabled: process.env.AI_ENABLED !== 'false',
  fallbackEnabled: process.env.AI_FALLBACK_ENABLED !== 'false',
  
  // API Keys
  falApiKey: process.env.FAL_AI_API_KEY,
  leonardoApiKey: process.env.LEONARDO_API_KEY,
  astriaApiKey: process.env.ASTRIA_API_KEY,
  
  // Performance settings
  timeout: parseInt(process.env.AI_TIMEOUT_MS || '30000'),
  maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
  batchSize: parseInt(process.env.AI_BATCH_SIZE || '10'),
  concurrentRequests: parseInt(process.env.AI_CONCURRENT_REQUESTS || '5'),
};

// API Endpoints
const API_ENDPOINTS = {
  fal: 'https://fal.run',
  leonardo: 'https://cloud.leonardo.ai/api/rest/v1',
  astria: 'https://api.astria.ai',
  local: 'http://localhost:3000'
};

// Utility functions
function logTest(testName, status, details = '') {
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : '⏳';
  console.log(`${statusIcon} ${testName}${details ? ': ' + details : ''}`);
}

function logSection(sectionName) {
  console.log(`\n🔍 ${sectionName}`);
  console.log('='.repeat(50));
}

async function makeHttpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Coolpix-AI-Test/1.0',
        ...options.headers
      },
      timeout: AI_CONFIG.timeout
    };

    if (options.data) {
      const jsonData = JSON.stringify(options.data);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(requestOptions, (res) => {
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
      }
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

    if (options.data) {
      req.write(JSON.stringify(options.data));
    }

    req.end();
  });
}

async function testEnvironmentConfiguration() {
  logSection('Environment Configuration Tests');
  
  // Test 1: Check AI provider configuration
  logTest('AI_PROVIDER configuration', AI_CONFIG.provider ? 'PASS' : 'FAIL', 
    `Provider: ${AI_CONFIG.provider}`);
  
  // Test 2: Check primary/secondary providers
  logTest('Primary provider configuration', AI_CONFIG.primaryProvider ? 'PASS' : 'FAIL',
    `Primary: ${AI_CONFIG.primaryProvider}, Secondary: ${AI_CONFIG.secondaryProvider}`);
  
  // Test 3: Check API keys
  const apiKeyTests = [
    { name: 'FAL_AI_API_KEY', key: AI_CONFIG.falApiKey, required: ['fal', 'unified'].includes(AI_CONFIG.provider) },
    { name: 'LEONARDO_API_KEY', key: AI_CONFIG.leonardoApiKey, required: ['leonardo', 'unified'].includes(AI_CONFIG.provider) },
    { name: 'ASTRIA_API_KEY', key: AI_CONFIG.astriaApiKey, required: AI_CONFIG.provider === 'astria' }
  ];
  
  apiKeyTests.forEach(test => {
    if (test.required) {
      if (test.key && test.key.length > 10) {
        logTest(`${test.name} configuration`, 'PASS', `Length: ${test.key.length}`);
      } else {
        logTest(`${test.name} configuration`, 'FAIL', 'Missing or invalid API key');
      }
    } else {
      logTest(`${test.name} configuration`, 'PASS', 'Not required for current provider');
    }
  });
  
  // Test 4: Check performance settings
  logTest('Performance configuration', 'PASS', 
    `Timeout: ${AI_CONFIG.timeout}ms, Retries: ${AI_CONFIG.maxRetries}, Batch: ${AI_CONFIG.batchSize}`);
  
  return true;
}

async function testFalAIConnectivity() {
  logSection('FAL AI Connectivity Tests');
  
  if (!AI_CONFIG.falApiKey) {
    logTest('FAL AI connectivity', 'FAIL', 'API key not configured');
    return false;
  }
  
  try {
    // Test FAL AI health endpoint
    const response = await makeHttpsRequest(`${API_ENDPOINTS.fal}/health`, {
      headers: {
        'Authorization': `Key ${AI_CONFIG.falApiKey}`
      }
    });
    
    if (response.statusCode === 200) {
      logTest('FAL AI API connectivity', 'PASS', 'Health check successful');
      return true;
    } else {
      logTest('FAL AI API connectivity', 'FAIL', `HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logTest('FAL AI API connectivity', 'FAIL', error.message);
    return false;
  }
}

async function testLeonardoAIConnectivity() {
  logSection('Leonardo AI Connectivity Tests');
  
  if (!AI_CONFIG.leonardoApiKey) {
    logTest('Leonardo AI connectivity', 'FAIL', 'API key not configured');
    return false;
  }
  
  try {
    // Test Leonardo AI user info endpoint
    const response = await makeHttpsRequest(`${API_ENDPOINTS.leonardo}/me`, {
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.leonardoApiKey}`
      }
    });
    
    if (response.statusCode === 200) {
      logTest('Leonardo AI API connectivity', 'PASS', 
        `User: ${response.data.user_details?.[0]?.user?.username || 'Unknown'}`);
      return true;
    } else {
      logTest('Leonardo AI API connectivity', 'FAIL', `HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logTest('Leonardo AI API connectivity', 'FAIL', error.message);
    return false;
  }
}

async function testAstriaAIConnectivity() {
  logSection('Astria AI Connectivity Tests');
  
  if (!AI_CONFIG.astriaApiKey) {
    logTest('Astria AI connectivity', 'WARN', 'API key not configured (legacy provider)');
    return false;
  }
  
  try {
    // Test Astria AI tunes endpoint
    const response = await makeHttpsRequest(`${API_ENDPOINTS.astria}/tunes`, {
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.astriaApiKey}`
      }
    });
    
    if (response.statusCode === 200) {
      logTest('Astria AI API connectivity', 'PASS', 'API accessible');
      return true;
    } else {
      logTest('Astria AI API connectivity', 'FAIL', `HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logTest('Astria AI API connectivity', 'FAIL', error.message);
    return false;
  }
}

async function testLocalAIEndpoints() {
  logSection('Local AI Endpoints Tests');
  
  const endpoints = [
    { path: '/api/ai/provider-health', name: 'Provider Health Check' },
    { path: '/api/ai/unified-generate', name: 'Unified Generation Endpoint' },
    { path: '/api/ai/unified-train', name: 'Unified Training Endpoint' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeLocalRequest(endpoint.path);
      
      if (response.statusCode === 200 || response.statusCode === 405) { // 405 = Method not allowed (GET on POST endpoint)
        logTest(`${endpoint.name}`, 'PASS', `Endpoint accessible (${response.statusCode})`);
      } else {
        logTest(`${endpoint.name}`, 'FAIL', `HTTP ${response.statusCode}`);
      }
    } catch (error) {
      logTest(`${endpoint.name}`, 'FAIL', error.message);
    }
  }
}

async function runAIConfigurationTests() {
  console.log('🚀 Starting AI Configuration Tests');
  console.log('='.repeat(60));
  console.log(`🤖 AI Provider: ${AI_CONFIG.provider}`);
  console.log(`🔧 Primary: ${AI_CONFIG.primaryProvider}, Secondary: ${AI_CONFIG.secondaryProvider}`);
  console.log(`⚡ Fallback: ${AI_CONFIG.fallbackEnabled ? 'Enabled' : 'Disabled'}`);
  console.log(`📅 Test run: ${new Date().toISOString()}`);
  
  const startTime = Date.now();
  
  // Run all configuration tests
  await testEnvironmentConfiguration();
  
  // Test provider connectivity based on configuration
  const connectivityResults = {};
  
  if (['fal', 'unified'].includes(AI_CONFIG.provider)) {
    connectivityResults.fal = await testFalAIConnectivity();
  }
  
  if (['leonardo', 'unified'].includes(AI_CONFIG.provider)) {
    connectivityResults.leonardo = await testLeonardoAIConnectivity();
  }
  
  if (AI_CONFIG.provider === 'astria') {
    connectivityResults.astria = await testAstriaAIConnectivity();
  }
  
  // Test local endpoints
  await testLocalAIEndpoints();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n🏁 AI Configuration Test Summary');
  console.log('='.repeat(60));
  
  // Connectivity summary
  const connectedProviders = Object.entries(connectivityResults)
    .filter(([_, connected]) => connected)
    .map(([provider, _]) => provider);
  
  console.log(`🌐 Provider Connectivity: ${connectedProviders.length}/${Object.keys(connectivityResults).length} providers online`);
  connectedProviders.forEach(provider => {
    console.log(`   ✅ ${provider.toUpperCase()}: Connected`);
  });
  
  const failedProviders = Object.entries(connectivityResults)
    .filter(([_, connected]) => !connected)
    .map(([provider, _]) => provider);
  
  if (failedProviders.length > 0) {
    console.log('\n❌ Failed Providers:');
    failedProviders.forEach(provider => {
      console.log(`   ❌ ${provider.toUpperCase()}: Connection failed`);
    });
  }
  
  console.log(`\n⏱️  Total execution time: ${duration}s`);
  console.log(`📊 Overall Status: ${connectedProviders.length > 0 ? '✅ AI SYSTEM OPERATIONAL' : '❌ AI SYSTEM OFFLINE'}`);
  
  return {
    connectedProviders,
    failedProviders,
    totalProviders: Object.keys(connectivityResults).length,
    configurationValid: true
  };
}

// Run tests if this script is executed directly
runAIConfigurationTests().catch(console.error);

export { runAIConfigurationTests };
