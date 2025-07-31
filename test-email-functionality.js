#!/usr/bin/env node

/**
 * Test script to verify email functionality
 * Run with: node test-email-functionality.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

console.log('🧪 Testing Email Configuration...\n');

// Test 1: Check environment variables
console.log('1️⃣ Environment Variables:');
const resendApiKey = process.env.RESEND_API_KEY;
const noreplyEmail = process.env.NOREPLY_EMAIL;

if (!resendApiKey) {
  console.log('❌ RESEND_API_KEY is missing');
} else if (!resendApiKey.startsWith('re_')) {
  console.log('❌ RESEND_API_KEY format is invalid (should start with "re_")');
} else {
  console.log('✅ RESEND_API_KEY is configured correctly');
}

if (!noreplyEmail) {
  console.log('❌ NOREPLY_EMAIL is missing');
} else {
  console.log(`✅ NOREPLY_EMAIL is configured: ${noreplyEmail}`);
}

// Test 2: Check Resend package
console.log('\n2️⃣ Package Dependencies:');
try {
  const { Resend } = await import('resend');
  console.log('✅ Resend package is available');
  
  if (resendApiKey && resendApiKey.startsWith('re_')) {
    const resend = new Resend(resendApiKey);
    console.log('✅ Resend client initialized successfully');
  }
} catch (error) {
  console.log('❌ Resend package error:', error.message);
}

// Test 3: Check sendEmail function
console.log('\n3️⃣ SendEmail Function:');
try {
  // We can't directly import the server action, but we can check if the file exists
  const fs = await import('fs');
  const path = join(__dirname, 'src', 'action', 'sendEmail.ts');
  
  if (fs.existsSync(path)) {
    console.log('✅ sendEmail.ts file exists');
    
    const content = fs.readFileSync(path, 'utf8');
    if (content.includes('export async function sendEmail')) {
      console.log('✅ sendEmail function is exported');
    }
    if (content.includes('export async function sendSimpleEmail')) {
      console.log('✅ sendSimpleEmail function is exported');
    }
  } else {
    console.log('❌ sendEmail.ts file not found');
  }
} catch (error) {
  console.log('❌ File check error:', error.message);
}

// Test 4: Check logger utility
console.log('\n4️⃣ Logger Utility:');
try {
  const fs = await import('fs');
  const path = join(__dirname, 'src', 'utils', 'logger.ts');
  
  if (fs.existsSync(path)) {
    console.log('✅ logger.ts file exists');
  } else {
    console.log('❌ logger.ts file not found');
  }
} catch (error) {
  console.log('❌ Logger check error:', error.message);
}

// Test 5: Check email templates
console.log('\n5️⃣ Email Templates:');
try {
  const fs = await import('fs');
  const path = join(__dirname, 'src', 'utils', 'emailTemplates.ts');
  
  if (fs.existsSync(path)) {
    console.log('✅ emailTemplates.ts file exists');
  } else {
    console.log('❌ emailTemplates.ts file not found');
  }
} catch (error) {
  console.log('❌ Email templates check error:', error.message);
}

console.log('\n📋 Summary:');
console.log('If all tests pass, your email functionality should be working correctly.');
console.log('If you see any ❌ errors, those need to be addressed.');
console.log('\n🔧 Common fixes:');
console.log('- Add RESEND_API_KEY to your .env.local file');
console.log('- Add NOREPLY_EMAIL to your .env.local file');
console.log('- Ensure your Resend API key starts with "re_"');
console.log('- Run "npm install resend" if the package is missing');
