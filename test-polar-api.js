// Test Polar API connection
const POLAR_ACCESS_TOKEN = 'polar_oat_zhaelLk161LKg4unHLQOErxjD1htT05x439OF2IFWoN';

async function testPolarAPI() {
  console.log('🧪 Testing Polar API Connection...');
  
  try {
    // Test 1: Get user info
    console.log('1. Testing user authentication...');
    const userResponse = await fetch('https://api.polar.sh/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (userResponse.ok) {
      const user = await userResponse.json();
      console.log('✅ User authentication successful');
      console.log(`   Username: ${user.username || 'N/A'}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   ID: ${user.id}`);
    } else {
      console.error('❌ User authentication failed:', userResponse.status);
      const errorText = await userResponse.text();
      console.error('   Error:', errorText);
      return false;
    }
    
    // Test 2: List organizations
    console.log('\n2. Testing organizations access...');
    const orgsResponse = await fetch('https://api.polar.sh/v1/organizations/', {
      headers: {
        'Authorization': `Bearer ${POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (orgsResponse.ok) {
      const orgs = await orgsResponse.json();
      console.log('✅ Organizations access successful');
      console.log(`   Found ${orgs.items?.length || 0} organizations`);
      if (orgs.items && orgs.items.length > 0) {
        console.log(`   First org: ${orgs.items[0].name} (${orgs.items[0].id})`);
      }
    } else {
      console.error('❌ Organizations access failed:', orgsResponse.status);
    }
    
    // Test 3: List products (this might fail if no products exist yet)
    console.log('\n3. Testing products access...');
    const productsResponse = await fetch('https://api.polar.sh/v1/products/', {
      headers: {
        'Authorization': `Bearer ${POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      console.log('✅ Products access successful');
      console.log(`   Found ${products.items?.length || 0} products`);
      if (products.items && products.items.length > 0) {
        products.items.forEach((product, index) => {
          console.log(`   Product ${index + 1}: ${product.name} (${product.id})`);
        });
      } else {
        console.log('   No products found - you need to create products in Polar dashboard');
      }
    } else {
      console.error('❌ Products access failed:', productsResponse.status);
    }
    
    console.log('\n🎉 Polar API connection test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Create products in Polar dashboard (https://polar.sh/dashboard)');
    console.log('2. Update pricingPlansPolar.json with actual product IDs');
    console.log('3. Test checkout flow');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testPolarAPI();
