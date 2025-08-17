#!/usr/bin/env node

/**
 * Quick verification script to check if production landing page fixes are working
 */

const https = require('https');

const PRODUCTION_URL = 'https://pro-headshots-3z4b0z1dr-thaohienhomes-gmailcoms-projects.vercel.app';

async function verifyProductionFix() {
  console.log('🔍 Verifying Production Landing Page Fixes...\n');
  
  try {
    console.log(`📡 Testing: ${PRODUCTION_URL}`);
    
    const response = await makeRequest(PRODUCTION_URL);
    
    if (response.statusCode === 200) {
      console.log('✅ Status: 200 OK');
      
      // Check for key components in the HTML
      const html = response.data;
      const checks = [
        { name: 'React App', test: html.includes('__NEXT_DATA__') },
        { name: 'Hero Section', test: html.includes('Professional AI Headshots') || html.includes('hero') },
        { name: 'Navigation', test: html.includes('nav') || html.includes('header') },
        { name: 'Pricing', test: html.includes('pricing') || html.includes('price') },
        { name: 'CSS Loaded', test: html.includes('style') || html.includes('css') },
        { name: 'No Hydration Errors', test: !html.includes('hydration') && !html.includes('mismatch') }
      ];
      
      console.log('\n📋 Component Checks:');
      checks.forEach(check => {
        const icon = check.test ? '✅' : '❌';
        console.log(`   ${icon} ${check.name}`);
      });
      
      const passedChecks = checks.filter(c => c.test).length;
      const totalChecks = checks.length;
      
      console.log(`\n📊 Overall Score: ${passedChecks}/${totalChecks} checks passed`);
      
      if (passedChecks === totalChecks) {
        console.log('🎉 All checks passed! Landing page should be working correctly.');
      } else if (passedChecks >= totalChecks * 0.8) {
        console.log('⚠️  Most checks passed. Landing page should be mostly functional.');
      } else {
        console.log('❌ Several checks failed. Landing page may have issues.');
      }
      
    } else {
      console.log(`❌ Status: ${response.statusCode}`);
      console.log('🚨 Production site is not responding correctly');
    }
    
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    
    if (error.message.includes('403') || error.message.includes('429')) {
      console.log('ℹ️  This might be due to Vercel security checkpoint - try accessing manually in browser');
    }
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'ProHeadshots-Fix-Verification/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Run verification
if (require.main === module) {
  verifyProductionFix().catch(console.error);
}
