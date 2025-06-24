// Quick test script to verify Polar Payment connection
require('dotenv').config({ path: '.env.local' });

async function testPolarConnection() {
  console.log('🧪 Testing Polar Payment Connection...');
  
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('❌ POLAR_ACCESS_TOKEN not found in .env.local');
    return false;
  }
  
  console.log('✅ Access token found');
  console.log('🔗 Testing API connection...');
  
  try {
    const response = await fetch('https://api.polar.sh/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('✅ Polar API connection successful!');
      console.log(`   Connected as: ${user.username || user.email || 'Unknown'}`);
      console.log(`   Account ID: ${user.id}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ API request failed:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

// Run the test
testPolarConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Polar Payment integration is ready!');
      console.log('Next steps:');
      console.log('1. Set up products in Polar dashboard');
      console.log('2. Test checkout flow');
      console.log('3. Configure webhooks');
    } else {
      console.log('\n⚠️  Please check your Polar configuration');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
