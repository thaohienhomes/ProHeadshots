// Test authentication configuration
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

async function testSupabaseAuthConfig() {
  console.log('🧪 Testing Supabase Authentication Configuration...');
  
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    console.error('❌ Missing Supabase authentication credentials');
    return false;
  }
  
  console.log('✅ Supabase URL configured');
  console.log('✅ Supabase anon key configured');
  
  try {
    // Test auth endpoint
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        'apikey': anonKey,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const settings = await response.json();
      console.log('✅ Supabase auth endpoint accessible');
      
      // Check if Google OAuth is enabled
      if (settings.external?.google?.enabled) {
        console.log('✅ Google OAuth is enabled in Supabase');
      } else {
        console.warn('⚠️  Google OAuth not enabled in Supabase');
      }
      
      return true;
    } else {
      console.error('❌ Supabase auth endpoint not accessible:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing Supabase auth:', error.message);
    return false;
  }
}

async function testGoogleOAuthConfig() {
  console.log('\n🧪 Testing Google OAuth Configuration...');
  
  const googleClientId = env.GOOGLE_CLIENT_ID;
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET;
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  
  if (!googleClientId || !googleClientSecret) {
    console.error('❌ Missing Google OAuth credentials');
    return false;
  }
  
  if (googleClientId === 'YOUR_GOOGLE_CLIENT_ID' || googleClientSecret === 'YOUR_GOOGLE_CLIENT_SECRET') {
    console.error('❌ Google OAuth credentials are placeholder values');
    return false;
  }
  
  console.log('✅ Google Client ID configured');
  console.log('✅ Google Client Secret configured');
  
  if (!siteUrl) {
    console.warn('⚠️  NEXT_PUBLIC_SITE_URL not configured - may cause redirect issues');
  } else {
    console.log('✅ Site URL configured:', siteUrl);
  }
  
  // Validate Google Client ID format
  if (!googleClientId.includes('.apps.googleusercontent.com')) {
    console.warn('⚠️  Google Client ID format looks unusual');
  }
  
  return true;
}

async function testAuthEndpoints() {
  console.log('\n🧪 Testing Authentication Endpoints...');
  
  const siteUrl = env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const endpoints = [
    '/auth',
    '/auth/callback',
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${siteUrl}${endpoint}`, {
        method: 'GET',
        redirect: 'manual', // Don't follow redirects
      });
      
      // For auth pages, we expect either 200 (page loads) or 3xx (redirect)
      if (response.status === 200 || (response.status >= 300 && response.status < 400)) {
        console.log(`✅ ${endpoint} endpoint accessible`);
        results[endpoint] = true;
      } else {
        console.log(`❌ ${endpoint} endpoint returned ${response.status}`);
        results[endpoint] = false;
      }
    } catch (error) {
      console.log(`❌ ${endpoint} endpoint not accessible: ${error.message}`);
      results[endpoint] = false;
    }
  }
  
  return Object.values(results).every(Boolean);
}

async function testSecurityHeaders() {
  console.log('\n🧪 Testing Security Headers...');
  
  const siteUrl = env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${siteUrl}/auth`, {
      method: 'GET',
      redirect: 'manual',
    });
    
    const headers = response.headers;
    const securityHeaders = {
      'x-frame-options': headers.get('x-frame-options'),
      'x-content-type-options': headers.get('x-content-type-options'),
      'x-xss-protection': headers.get('x-xss-protection'),
      'strict-transport-security': headers.get('strict-transport-security'),
    };
    
    let securityScore = 0;
    
    if (securityHeaders['x-frame-options']) {
      console.log('✅ X-Frame-Options header present');
      securityScore++;
    } else {
      console.log('⚠️  X-Frame-Options header missing');
    }
    
    if (securityHeaders['x-content-type-options']) {
      console.log('✅ X-Content-Type-Options header present');
      securityScore++;
    } else {
      console.log('⚠️  X-Content-Type-Options header missing');
    }
    
    if (securityHeaders['x-xss-protection']) {
      console.log('✅ X-XSS-Protection header present');
      securityScore++;
    } else {
      console.log('⚠️  X-XSS-Protection header missing');
    }
    
    if (securityHeaders['strict-transport-security']) {
      console.log('✅ Strict-Transport-Security header present');
      securityScore++;
    } else {
      console.log('⚠️  Strict-Transport-Security header missing (expected for HTTPS)');
    }
    
    console.log(`📊 Security headers score: ${securityScore}/4`);
    return securityScore >= 2; // At least half the security headers should be present
    
  } catch (error) {
    console.error('❌ Error testing security headers:', error.message);
    return false;
  }
}

async function runAuthTests() {
  console.log('🚀 Starting Authentication Configuration Tests\n');
  
  const results = {
    supabaseAuth: await testSupabaseAuthConfig(),
    googleOAuth: await testGoogleOAuthConfig(),
    authEndpoints: await testAuthEndpoints(),
    securityHeaders: await testSecurityHeaders(),
  };
  
  console.log('\n📊 Authentication Test Results:');
  console.log(`   Supabase Auth Config: ${results.supabaseAuth ? '✅' : '❌'}`);
  console.log(`   Google OAuth Config: ${results.googleOAuth ? '✅' : '❌'}`);
  console.log(`   Auth Endpoints: ${results.authEndpoints ? '✅' : '❌'}`);
  console.log(`   Security Headers: ${results.securityHeaders ? '✅' : '❌'}`);
  
  const criticalPassed = results.supabaseAuth && results.googleOAuth;
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All authentication tests passed! Ready for production.');
  } else if (criticalPassed) {
    console.log('\n✅ Critical authentication requirements met. Some optimizations recommended.');
  } else {
    console.log('\n⚠️  Critical authentication issues found. Please address before deploying.');
  }
  
  return criticalPassed;
}

// Run the tests
runAuthTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Authentication test execution failed:', error);
    process.exit(1);
  });
