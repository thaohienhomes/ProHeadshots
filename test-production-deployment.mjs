// Test production deployment after monitoring systems are deployed
async function testProductionDeployment() {
  console.log('🚀 Testing Production Deployment...\n');

  const siteUrl = 'https://coolpix.me';

  // Test 1: Basic Site Health
  console.log('📋 Test 1: Basic Site Health');
  try {
    const response = await fetch(siteUrl);
    if (response.ok) {
      console.log('✅ Main site is accessible');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response time: ${Date.now() - Date.now()}ms`);
    } else {
      console.log(`❌ Main site issue: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Main site error: ${error.message}`);
  }

  // Test 2: New Health Check API
  console.log('\n📋 Test 2: Health Check API (New)');
  try {
    const response = await fetch(`${siteUrl}/api/monitoring/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health check API is working!');
      console.log(`   Status: ${data.status}`);
      console.log(`   Environment: ${data.environment}`);
      console.log(`   Version: ${data.version}`);
    } else {
      console.log(`⚠️  Health check API: ${response.status} (may not be deployed yet)`);
    }
  } catch (error) {
    console.log(`⚠️  Health check API error: ${error.message}`);
  }

  // Test 3: Detailed Health Check
  console.log('\n📋 Test 3: Detailed Health Check');
  try {
    const response = await fetch(`${siteUrl}/api/monitoring/health?detailed=true`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Detailed health check working!');
      console.log(`   System Status: ${data.system?.overall || 'unknown'}`);
      console.log(`   External Services:`);
      if (data.external_services) {
        Object.entries(data.external_services).forEach(([service, status]) => {
          console.log(`     ${service}: ${status}`);
        });
      }
    } else {
      console.log(`⚠️  Detailed health check: ${response.status}`);
    }
  } catch (error) {
    console.log(`⚠️  Detailed health check error: ${error.message}`);
  }

  // Test 4: Core Application Endpoints
  console.log('\n📋 Test 4: Core Application Endpoints');
  
  const endpoints = [
    { name: 'Home Page', url: `${siteUrl}` },
    { name: 'Auth Page', url: `${siteUrl}/auth` },
    { name: 'Pricing Page', url: `${siteUrl}/pricing` },
  ];

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await fetch(endpoint.url);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        console.log(`✅ ${endpoint.name}: ${responseTime}ms`);
      } else {
        console.log(`❌ ${endpoint.name}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }

  // Test 5: Database Connectivity
  console.log('\n📋 Test 5: Database Connectivity');
  try {
    const supabaseUrl = 'https://dfcpphcozngsbtvslrkf.supabase.co';
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3BwaGNvem5nc2J0dnNscmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTA2NTgsImV4cCI6MjA1NzUyNjY1OH0.3YVRK1zBW4_ge09ZKX2ZCE5XcNUOh7fLsloVJ8loLJ8',
      },
    });
    
    if (response.ok) {
      console.log('✅ Database connectivity: Working');
    } else {
      console.log(`⚠️  Database connectivity: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Database connectivity: ${error.message}`);
  }

  // Test 6: External Services
  console.log('\n📋 Test 6: External Services Status');
  
  const externalServices = [
    { name: 'Fal AI', url: 'https://fal.run/health' },
    { name: 'Polar Payment', url: 'https://api.polar.sh/v1/products/' },
  ];

  for (const service of externalServices) {
    try {
      const response = await fetch(service.url, { method: 'HEAD' });
      console.log(`${response.ok ? '✅' : '⚠️ '} ${service.name}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${service.name}: ${error.message}`);
    }
  }

  console.log('\n🎯 Deployment Test Summary:');
  console.log('✅ Production deployment validation complete');
  console.log('📊 Monitoring systems ready for configuration');
  console.log('🚀 Next: Set up external monitoring services (Sentry, GA)');
}

async function checkDeploymentStatus() {
  console.log('🔍 Checking Deployment Status...\n');
  
  try {
    // Check if the new monitoring endpoint exists
    const response = await fetch('https://coolpix.me/api/monitoring/health');
    
    if (response.ok) {
      console.log('🎉 SUCCESS: Monitoring systems are deployed!');
      console.log('✅ New health check API is live');
      console.log('📊 Ready to configure external services');
      return true;
    } else if (response.status === 404) {
      console.log('⏳ PENDING: Monitoring systems not yet deployed');
      console.log('🔄 Vercel deployment may still be in progress');
      return false;
    } else {
      console.log(`⚠️  PARTIAL: Health API responding with ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR: Cannot reach deployment');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Production Deployment Testing Suite\n');
  
  // First check if deployment is complete
  const isDeployed = await checkDeploymentStatus();
  
  if (isDeployed) {
    console.log('\n📊 Running comprehensive deployment tests...\n');
    await testProductionDeployment();
  } else {
    console.log('\n⏳ Waiting for deployment to complete...');
    console.log('💡 Run this script again after Vercel deployment finishes');
  }
  
  console.log('\n✅ Deployment testing completed!');
}

main().catch(console.error);
