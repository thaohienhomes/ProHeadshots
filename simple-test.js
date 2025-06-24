// Simple test to check environment variables
const fs = require('fs');

console.log('🧪 Testing Environment Setup...');

// Check if .env.local exists
if (fs.existsSync('.env.local')) {
  console.log('✅ .env.local file exists');
  
  // Read the file
  const content = fs.readFileSync('.env.local', 'utf8');
  
  // Check for required variables
  const hasFalAI = content.includes('FAL_AI_API_KEY=b33325f9');
  const hasPolar = content.includes('POLAR_ACCESS_TOKEN=polar_oat');
  const hasAIProvider = content.includes('AI_PROVIDER=fal');
  const hasPaymentProvider = content.includes('PAYMENT_PROVIDER=polar');

  console.log('✅ Fal AI API Key:', hasFalAI ? 'Configured' : 'Missing');
  console.log('✅ Polar Access Token:', hasPolar ? 'Configured' : 'Missing');
  console.log('✅ AI Provider:', hasAIProvider ? 'Set to fal' : 'Not set');
  console.log('✅ Payment Provider:', hasPaymentProvider ? 'Set to polar' : 'Not set');
  
  if (hasFalAI && hasPolar && hasAIProvider && hasPaymentProvider) {
    console.log('\n🎉 Configuration looks good!');
    console.log('✅ Ready to proceed to next steps');
  } else {
    console.log('\n⚠️  Some configuration is missing');
  }
} else {
  console.log('❌ .env.local file not found');
}

console.log('\n📋 Next Steps:');
console.log('1. Test Polar Payment dashboard access');
console.log('2. Set up products in Polar');
console.log('3. Test checkout flow');
console.log('4. Configure webhooks');
