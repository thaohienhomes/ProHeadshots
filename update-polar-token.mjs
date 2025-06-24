// Script to update and test Polar access token
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testPolarToken(token) {
  console.log('🧪 Testing Polar access token...');
  
  try {
    const response = await fetch('https://api.polar.sh/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('✅ Token is valid!');
      console.log(`   Connected as: ${user.username || user.email || 'Unknown'}`);
      console.log(`   Account ID: ${user.id}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Token validation failed:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing token:', error.message);
    return false;
  }
}

async function updateEnvFile(newToken) {
  const envPath = join(__dirname, '.env.local');
  
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    let updated = false;
    const updatedLines = lines.map(line => {
      if (line.startsWith('POLAR_ACCESS_TOKEN=')) {
        updated = true;
        return `POLAR_ACCESS_TOKEN=${newToken}`;
      }
      return line;
    });
    
    if (updated) {
      writeFileSync(envPath, updatedLines.join('\n'));
      console.log('✅ .env.local file updated successfully');
      return true;
    } else {
      console.error('❌ POLAR_ACCESS_TOKEN not found in .env.local');
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating .env.local:', error.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔧 Polar Access Token Updater

Usage: node update-polar-token.mjs <new_token>

Steps to get a new token:
1. Go to https://polar.sh/dashboard
2. Navigate to Settings → API Keys
3. Create a new access token with appropriate permissions
4. Copy the token and run: node update-polar-token.mjs <your_new_token>

Current token status:`);
    
    // Test current token
    const envPath = join(__dirname, '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const currentTokenMatch = envContent.match(/POLAR_ACCESS_TOKEN=(.+)/);
    
    if (currentTokenMatch) {
      const currentToken = currentTokenMatch[1];
      await testPolarToken(currentToken);
    } else {
      console.log('❌ No POLAR_ACCESS_TOKEN found in .env.local');
    }
    
    return;
  }
  
  const newToken = args[0];
  
  console.log('🔧 Updating Polar access token...\n');
  
  // Test the new token first
  const isValid = await testPolarToken(newToken);
  
  if (!isValid) {
    console.log('\n❌ Token validation failed. Please check your token and try again.');
    process.exit(1);
  }
  
  // Update the .env.local file
  const updated = await updateEnvFile(newToken);
  
  if (updated) {
    console.log('\n🎉 Polar access token updated successfully!');
    console.log('\nNext steps:');
    console.log('1. Restart your development server if running');
    console.log('2. Test the payment flow: node test-polar-integration.mjs');
    console.log('3. Deploy to production with the new token');
  } else {
    console.log('\n❌ Failed to update .env.local file');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});
