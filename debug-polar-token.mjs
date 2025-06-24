// Debug Polar token permissions and endpoints
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
function loadEnvVars() {
  try {
    const envPath = join(__dirname, '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Error loading .env.local:', error.message);
    return {};
  }
}

const env = loadEnvVars();

async function testPolarEndpoint(endpoint, method = 'GET', body = null) {
  const accessToken = env.POLAR_ACCESS_TOKEN;
  
  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`https://api.polar.sh/v1${endpoint}`, options);
    
    const result = {
      endpoint,
      method,
      status: response.status,
      ok: response.ok,
    };
    
    if (response.ok) {
      try {
        result.data = await response.json();
      } catch (e) {
        result.data = 'Success (no JSON response)';
      }
    } else {
      try {
        result.error = await response.json();
      } catch (e) {
        result.error = await response.text();
      }
    }
    
    return result;
  } catch (error) {
    return {
      endpoint,
      method,
      status: 'ERROR',
      error: error.message,
    };
  }
}

async function debugPolarToken() {
  console.log('🔍 Debugging Polar Access Token Permissions');
  console.log('============================================\n');
  
  const accessToken = env.POLAR_ACCESS_TOKEN;
  console.log(`Token: ${accessToken.substring(0, 20)}...${accessToken.substring(accessToken.length - 10)}`);
  console.log('');
  
  // Test various endpoints
  const endpoints = [
    { path: '/users/me', method: 'GET', description: 'Get current user info' },
    { path: '/organizations', method: 'GET', description: 'List organizations' },
    { path: '/products/', method: 'GET', description: 'List products' },
    { path: '/checkouts/', method: 'GET', description: 'List checkouts' },
    { path: '/orders/', method: 'GET', description: 'List orders' },
    { path: '/webhooks/endpoints/', method: 'GET', description: 'List webhook endpoints' },
  ];
  
  console.log('Testing Polar API endpoints:\n');
  
  for (const endpoint of endpoints) {
    console.log(`🧪 ${endpoint.description}`);
    console.log(`   ${endpoint.method} ${endpoint.path}`);
    
    const result = await testPolarEndpoint(endpoint.path, endpoint.method);
    
    if (result.ok) {
      console.log(`   ✅ Success (${result.status})`);
      if (result.data && typeof result.data === 'object') {
        if (Array.isArray(result.data.items)) {
          console.log(`   📊 Found ${result.data.items.length} items`);
        } else if (result.data.id) {
          console.log(`   📋 ID: ${result.data.id}`);
        }
      }
    } else {
      console.log(`   ❌ Failed (${result.status})`);
      if (result.error) {
        if (typeof result.error === 'object' && result.error.error) {
          console.log(`   💬 Error: ${result.error.error}`);
          if (result.error.error_description) {
            console.log(`   📝 Description: ${result.error.error_description}`);
          }
        } else {
          console.log(`   💬 Error: ${JSON.stringify(result.error).substring(0, 100)}`);
        }
      }
    }
    console.log('');
  }
  
  // Test checkout creation with minimal data
  console.log('🧪 Testing checkout creation');
  console.log('   POST /checkouts/');
  
  // First get a product to use for checkout
  const productsResult = await testPolarEndpoint('/products/');
  
  if (productsResult.ok && productsResult.data.items && productsResult.data.items.length > 0) {
    const testProduct = productsResult.data.items[0];
    console.log(`   Using product: ${testProduct.name} (${testProduct.id})`);
    
    const checkoutData = {
      product_id: testProduct.id,
      success_url: 'https://cvphoto.app/postcheckout-polar',
      customer_email: 'test@cvphoto.app',
    };
    
    const checkoutResult = await testPolarEndpoint('/checkouts/', 'POST', checkoutData);
    
    if (checkoutResult.ok) {
      console.log(`   ✅ Checkout creation successful (${checkoutResult.status})`);
      console.log(`   🔗 Checkout URL: ${checkoutResult.data.url || 'N/A'}`);
    } else {
      console.log(`   ❌ Checkout creation failed (${checkoutResult.status})`);
      if (checkoutResult.error) {
        console.log(`   💬 Error: ${JSON.stringify(checkoutResult.error)}`);
      }
    }
  } else {
    console.log('   ⚠️  No products available for checkout test');
  }
  
  console.log('\n📊 Summary:');
  console.log('If some endpoints work but others fail, the token might have limited permissions.');
  console.log('Check your Polar dashboard to ensure the token has all required scopes.');
}

debugPolarToken().catch(error => {
  console.error('Debug script failed:', error);
  process.exit(1);
});
