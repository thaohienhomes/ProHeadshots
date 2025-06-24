// Script to help configure SendGrid
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testSendGridKey(apiKey) {
  console.log('🧪 Testing SendGrid API key...');
  
  try {
    const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const profile = await response.json();
      console.log('✅ SendGrid API key is valid!');
      console.log(`   Account: ${profile.username || profile.email || 'Unknown'}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ SendGrid API key validation failed:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing SendGrid key:', error.message);
    return false;
  }
}

async function updateSendGridKey(newKey) {
  const envPath = join(__dirname, '.env.local');
  
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    let updated = false;
    const updatedLines = lines.map(line => {
      if (line.startsWith('SENDGRID_API_KEY=')) {
        updated = true;
        return `SENDGRID_API_KEY=${newKey}`;
      }
      return line;
    });
    
    if (updated) {
      writeFileSync(envPath, updatedLines.join('\n'));
      console.log('✅ .env.local file updated with SendGrid key');
      return true;
    } else {
      console.error('❌ SENDGRID_API_KEY not found in .env.local');
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating .env.local:', error.message);
    return false;
  }
}

function showSendGridSetupInstructions() {
  console.log(`
📧 SendGrid Setup Instructions

Your CVPhoto app uses SendGrid for:
✉️  Welcome emails when users sign up
✉️  Processing notifications when AI training starts  
✉️  Completion notifications when headshots are ready
✉️  Email marketing campaigns

Steps to get SendGrid API key:

1. Go to https://sendgrid.com/
2. Sign up for a free account (100 emails/day free)
3. Verify your email address
4. Go to Settings → API Keys
5. Click "Create API Key"
6. Choose "Restricted Access" and enable:
   - Mail Send (Full Access)
   - Template Engine (Read Access)
   - Suppressions (Read Access)
7. Copy the API key (starts with "SG.")

Email Templates Used:
- Welcome email: d-def6b236e0a64721a3420e36b19cd379
- Processing notification: d-d966d02f4a324abeb43a1d7045da520a  
- Completion notification: d-e937e48db4b945af9279e85baa1683e4

You'll need to create these templates in SendGrid or update the template IDs in the code.

Once you have the API key, run:
node setup-sendgrid.mjs YOUR_SENDGRID_API_KEY
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🔧 SendGrid Configuration Helper\n');
    
    // Check current status
    const envPath = join(__dirname, '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const currentKeyMatch = envContent.match(/SENDGRID_API_KEY=(.+)/);
    
    if (currentKeyMatch) {
      const currentKey = currentKeyMatch[1];
      if (currentKey === 'YOUR_SENDGRID_API_KEY') {
        console.log('❌ SendGrid API key is placeholder value');
      } else if (currentKey.startsWith('SG.')) {
        console.log('🧪 Testing current SendGrid key...');
        await testSendGridKey(currentKey);
      } else {
        console.log('⚠️  SendGrid API key format looks unusual');
      }
    } else {
      console.log('❌ No SENDGRID_API_KEY found in .env.local');
    }
    
    showSendGridSetupInstructions();
    return;
  }
  
  const newKey = args[0];
  
  if (!newKey.startsWith('SG.')) {
    console.error('❌ Invalid SendGrid API key format. Keys should start with "SG."');
    process.exit(1);
  }
  
  console.log('🔧 Configuring SendGrid API key...\n');
  
  // Test the new key first
  const isValid = await testSendGridKey(newKey);
  
  if (!isValid) {
    console.log('\n❌ API key validation failed. Please check your key and try again.');
    process.exit(1);
  }
  
  // Update the .env.local file
  const updated = await updateSendGridKey(newKey);
  
  if (updated) {
    console.log('\n🎉 SendGrid API key configured successfully!');
    console.log('\nNext steps:');
    console.log('1. Create email templates in SendGrid dashboard');
    console.log('2. Update template IDs in the code if needed');
    console.log('3. Test email functionality');
    console.log('4. Restart your development server if running');
  } else {
    console.log('\n❌ Failed to update .env.local file');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});
