// Check for exposed API keys in client-side code
async function checkAPIKeySecurity() {
  console.log('🔍 Checking client-side code for exposed API keys...');
  
  try {
    // Check main page source
    const response = await fetch('https://coolpix.me');
    const content = await response.text();
    
    const sensitivePatterns = [
      'FAL_AI_API_KEY',
      'POLAR_ACCESS_TOKEN', 
      'SUPABASE_SERVICE_ROLE_KEY',
      'SENDGRID_API_KEY',
      'GOOGLE_CLIENT_SECRET',
      'APP_WEBHOOK_SECRET',
      'polar_oat_',
      'SG.',
      'sk_test_',
      'sk_live_'
    ];
    
    let foundExposures = false;
    
    sensitivePatterns.forEach(pattern => {
      if (content.includes(pattern)) {
        console.log(`❌ SECURITY RISK: Found ${pattern} in client-side code!`);
        foundExposures = true;
      }
    });
    
    if (!foundExposures) {
      console.log('✅ No sensitive API keys found in main page source');
    }
    
    // Check for public environment variables (these are expected)
    const publicVars = content.match(/NEXT_PUBLIC_[A-Z_]+/g);
    if (publicVars) {
      console.log('\n📋 Public environment variables found (expected):');
      [...new Set(publicVars)].forEach(varName => {
        console.log(`   ✅ ${varName}`);
      });
    }
    
    console.log('\n🔒 API Key Security Summary:');
    console.log(foundExposures ? '❌ SECURITY ISSUES FOUND' : '✅ CLIENT-SIDE CODE APPEARS SECURE');
    
  } catch (error) {
    console.error('Error checking API security:', error);
  }
}

checkAPIKeySecurity();
