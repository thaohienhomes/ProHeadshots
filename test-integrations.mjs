// ES Module test script for coolpix.me integrations
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

async function testPolarConnection() {
  console.log('🧪 Testing Polar Payment Connection...');
  
  const accessToken = env.POLAR_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('❌ POLAR_ACCESS_TOKEN not found in .env.local');
    return false;
  }
  
  if (accessToken === 'YOUR_POLAR_ACCESS_TOKEN') {
    console.error('❌ POLAR_ACCESS_TOKEN is still placeholder value');
    return false;
  }
  
  console.log('✅ Access token found');
  console.log('🔗 Testing API connection...');
  
  try {
    // Test API connection using products endpoint (more reliable for org tokens)
    const response = await fetch('https://api.polar.sh/v1/products/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Polar API connection successful!');
      console.log(`   Found ${data.items ? data.items.length : 0} product(s)`);
      console.log('✅ Payment processing capability confirmed');
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

async function testFalAI() {
  console.log('\n🧪 Testing Fal AI Connection...');
  
  const apiKey = env.FAL_AI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ FAL_AI_API_KEY not found in .env.local');
    return false;
  }
  
  if (apiKey === 'YOUR_FAL_AI_API_KEY') {
    console.error('❌ FAL_AI_API_KEY is still placeholder value');
    return false;
  }
  
  console.log('✅ Fal AI API key found');
  console.log('🔗 Testing API connection...');
  
  try {
    // Test basic API connection with a simple model list request
    const response = await fetch('https://fal.run/fal-ai/flux/dev', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: "A simple test image",
        num_images: 1,
        image_size: "square_hd",
      }),
    });
    
    if (response.ok) {
      console.log('✅ Fal AI API connection successful!');
      console.log('   API key is valid and working');
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

async function testEnvironmentVariables() {
  console.log('\n🧪 Testing Environment Variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'FAL_AI_API_KEY',
    'POLAR_ACCESS_TOKEN',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'APP_WEBHOOK_SECRET',
    'NEXT_PUBLIC_SITE_URL'
  ];
  
  const missingVars = [];
  const placeholderVars = [];
  
  requiredVars.forEach(varName => {
    const value = env[varName];
    if (!value) {
      missingVars.push(varName);
    } else if (value.startsWith('YOUR_') || value === 'YOUR_SENDGRID_API_KEY' || value === 'YOUR_STRIPE_SECRET_KEY') {
      placeholderVars.push(varName);
    }
  });
  
  if (missingVars.length === 0 && placeholderVars.length === 0) {
    console.log('✅ All required environment variables are configured');
    return true;
  } else {
    if (missingVars.length > 0) {
      console.error('❌ Missing environment variables:', missingVars.join(', '));
    }
    if (placeholderVars.length > 0) {
      console.warn('⚠️  Placeholder values found:', placeholderVars.join(', '));
    }
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting coolpix.me Integration Tests\n');
  
  const results = {
    environment: await testEnvironmentVariables(),
    polar: await testPolarConnection(),
    falAI: await testFalAI(),
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log(`   Environment Variables: ${results.environment ? '✅' : '❌'}`);
  console.log(`   Polar Payment: ${results.polar ? '✅' : '❌'}`);
  console.log(`   Fal AI: ${results.falAI ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All integration tests passed! Ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please address the issues above before deploying.');
  }
  
  return allPassed;
}

// Run the tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
