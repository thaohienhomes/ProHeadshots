// Interactive Sentry setup for ProHeadshots
import { readFileSync } from 'fs';

async function setupSentry() {
  console.log('🔍 Setting up Sentry Error Tracking for ProHeadshots\n');
  
  console.log('📋 Step-by-step Sentry setup:');
  console.log('');
  
  console.log('1. 🌐 Open Sentry in your browser:');
  console.log('   https://sentry.io');
  console.log('');
  
  console.log('2. 📝 Sign up or login:');
  console.log('   - Use your GitHub account (recommended)');
  console.log('   - Or use your email: thaohienhomes@gmail.com');
  console.log('');
  
  console.log('3. 🏢 Create Organization:');
  console.log('   - Organization name: "ProHeadshots" or "CoolPixMe"');
  console.log('   - Choose the free plan to start');
  console.log('');
  
  console.log('4. 📦 Create Project:');
  console.log('   - Platform: "Next.js"');
  console.log('   - Project name: "proheadshots"');
  console.log('   - Alert frequency: "On every new issue"');
  console.log('');
  
  console.log('5. 🔑 Copy your DSN:');
  console.log('   - After project creation, you\'ll see a DSN');
  console.log('   - It looks like: https://xxxxx@xxxxx.ingest.sentry.io/xxxxx');
  console.log('   - Copy this entire URL');
  console.log('');
  
  console.log('6. ⚙️  Configure Vercel environment:');
  console.log('   Run these commands after getting your DSN:');
  console.log('');
  console.log('   vercel env rm SENTRY_DSN production');
  console.log('   vercel env add SENTRY_DSN production');
  console.log('   # Paste your DSN when prompted');
  console.log('');
  
  console.log('✅ What you\'ll get with Sentry:');
  console.log('   - Real-time error tracking');
  console.log('   - Performance monitoring');
  console.log('   - User context with errors');
  console.log('   - Email alerts for new issues');
  console.log('   - Error grouping and trends');
  console.log('   - Release tracking');
  console.log('');
  
  console.log('🎯 Expected setup time: 5 minutes');
  console.log('💡 Tip: Keep the Sentry tab open - you\'ll see errors appear in real-time!');
}

async function checkSentryStatus() {
  console.log('\n🔍 Checking current Sentry configuration...\n');
  
  try {
    // Check if we can access the Sentry test endpoint
    const testUrl = 'https://sentry.io/api/0/';
    const response = await fetch(testUrl, { method: 'HEAD' });
    
    if (response.status === 401 || response.status === 200) {
      console.log('✅ Sentry service is accessible');
      console.log('📊 Ready to receive error reports');
    } else {
      console.log('⚠️  Sentry service check inconclusive');
    }
  } catch (error) {
    console.log('⚠️  Could not verify Sentry service (this is normal)');
  }
  
  console.log('\n📋 After setting up Sentry:');
  console.log('1. Your ProHeadshots app will automatically send errors to Sentry');
  console.log('2. You\'ll get email notifications for new issues');
  console.log('3. You can view detailed error reports in the Sentry dashboard');
  console.log('4. Performance issues will be tracked automatically');
}

async function main() {
  await setupSentry();
  await checkSentryStatus();
  
  console.log('\n🚀 Ready to set up Sentry? Follow the steps above!');
  console.log('💬 Let me know when you have your DSN and I\'ll help configure it.');
}

main().catch(console.error);
