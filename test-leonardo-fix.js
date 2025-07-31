#!/usr/bin/env node

/**
 * Test Leonardo AI Fix
 * Quick test to verify the guidance_scale fix works
 */

import { config } from 'dotenv';
import http from 'http';

// Load environment variables
config({ path: '.env.local' });

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
      timeout: 30000
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

async function testLeonardoFix() {
  console.log('🚀 Testing Leonardo AI Fix');
  console.log('='.repeat(40));
  console.log(`📅 Test run: ${new Date().toISOString()}`);
  
  try {
    console.log('🎨 Testing Leonardo AI with fixed parameters...');
    
    const testData = {
      prompt: 'professional headshot test for Leonardo AI fix',
      provider: 'leonardo',
      num_images: 1,
      image_size: 'portrait',
      guidance_scale: 7 // Integer value
    };
    
    console.log(`   📝 Prompt: "${testData.prompt}"`);
    console.log(`   🔧 Provider: ${testData.provider}`);
    console.log(`   📏 Guidance Scale: ${testData.guidance_scale} (integer)`);
    
    const startTime = Date.now();
    const response = await makeLocalRequest('/api/test-ai-generation', {
      method: 'POST',
      data: testData
    });
    const responseTime = Date.now() - startTime;
    
    console.log(`\n📊 Response: HTTP ${response.statusCode}`);
    console.log(`⏱️  Response Time: ${responseTime}ms`);
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('✅ Leonardo AI Fix: SUCCESS');
      console.log(`   🤖 Provider Used: ${response.data.actualProvider}`);
      console.log(`   🔄 Fallback Used: ${response.data.fallbackUsed ? 'Yes' : 'No'}`);
      console.log(`   🖼️  Images Generated: ${response.data.images?.length || 0}`);
      
      if (response.data.metadata) {
        console.log(`   💰 Cost: ${response.data.metadata.cost || 'Unknown'}`);
        console.log(`   ⏱️  Processing Time: ${response.data.metadata.processingTime || 'Unknown'}ms`);
      }
      
      return { success: true, provider: response.data.actualProvider };
    } else {
      console.log('❌ Leonardo AI Fix: FAILED');
      console.log(`   🚨 Error: ${response.data.error || 'Unknown error'}`);
      
      // Check if it's still the same parameter error
      if (response.data.error && response.data.error.includes('guidance_scale')) {
        console.log('   ⚠️  Still having guidance_scale parameter issues');
      } else if (response.data.error && response.data.error.includes('Forbidden')) {
        console.log('   ⚠️  API access issues (credentials/permissions)');
      } else {
        console.log('   ⚠️  Different error - parameter fix may have worked');
      }
      
      return { success: false, error: response.data.error };
    }
  } catch (error) {
    console.log('❌ Leonardo AI Fix: NETWORK ERROR');
    console.log(`   🚨 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testHealthAfterFix() {
  console.log('\n🏥 Testing AI Health After Fix');
  console.log('='.repeat(40));
  
  try {
    const response = await makeLocalRequest('/api/ai/provider-health');
    
    if (response.statusCode === 200) {
      console.log('✅ Health Check: SUCCESS');
      
      if (response.data.providers) {
        Object.entries(response.data.providers).forEach(([provider, status]) => {
          const isHealthy = status.status === 'online' || status.healthy;
          console.log(`   ${isHealthy ? '✅' : '❌'} ${provider.toUpperCase()}: ${status.status || 'unknown'}`);
        });
      }
      
      return { success: true, providers: response.data.providers };
    } else {
      console.log('❌ Health Check: FAILED');
      console.log(`   🚨 HTTP ${response.statusCode}`);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Health Check: NETWORK ERROR');
    console.log(`   🚨 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runLeonardoFixTest() {
  const startTime = Date.now();
  
  // Test the fix
  const fixResult = await testLeonardoFix();
  const healthResult = await testHealthAfterFix();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n🏁 Leonardo AI Fix Test Summary');
  console.log('='.repeat(50));
  console.log(`🔧 Parameter Fix: ${fixResult.success ? '✅ Working' : '❌ Still Issues'}`);
  console.log(`🏥 Health Status: ${healthResult.success ? '✅ Working' : '❌ Issues'}`);
  console.log(`⏱️  Total Time: ${duration}s`);
  
  if (fixResult.success) {
    console.log('\n🎉 Leonardo AI integration is now working!');
    console.log(`   🤖 Provider: ${fixResult.provider}`);
  } else {
    console.log('\n⚠️  Leonardo AI still has issues:');
    console.log(`   🚨 Error: ${fixResult.error}`);
  }
  
  return { fixResult, healthResult };
}

// Run the test
runLeonardoFixTest().catch(console.error);
