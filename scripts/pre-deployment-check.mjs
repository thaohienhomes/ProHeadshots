#!/usr/bin/env node

/**
 * Pre-deployment checklist for ProHeadshots email integration
 * Run with: node scripts/pre-deployment-check.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checks = [];

function addCheck(name, status, message, critical = false) {
  checks.push({ name, status, message, critical });
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  addCheck(
    description,
    exists ? 'PASS' : 'FAIL',
    exists ? `✅ ${filePath} exists` : `❌ ${filePath} missing`,
    true
  );
  return exists;
}

function checkEnvVariable(varName, description, critical = true) {
  // Check in .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  let hasVar = false;
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    hasVar = envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=YOUR_`);
  }
  
  addCheck(
    description,
    hasVar ? 'PASS' : 'FAIL',
    hasVar ? `✅ ${varName} configured` : `❌ ${varName} not configured`,
    critical
  );
  return hasVar;
}

function checkTemplateIds() {
  const templatePath = path.join(__dirname, '..', 'src', 'utils', 'emailTemplates.ts');
  if (!fs.existsSync(templatePath)) {
    addCheck('Template IDs', 'FAIL', '❌ emailTemplates.ts not found', true);
    return false;
  }
  
  const content = fs.readFileSync(templatePath, 'utf8');
  const hasRealIds = content.includes('d-') && !content.includes('d-1234567890abcdef');
  
  addCheck(
    'Template IDs',
    hasRealIds ? 'PASS' : 'FAIL',
    hasRealIds ? '✅ SendGrid template IDs updated' : '❌ Template IDs still contain placeholder values',
    true
  );
  return hasRealIds;
}

function checkPackageJson() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  if (!fs.existsSync(packagePath)) {
    addCheck('Package.json', 'FAIL', '❌ package.json not found', true);
    return false;
  }
  
  const content = fs.readFileSync(packagePath, 'utf8');
  const pkg = JSON.parse(content);
  
  const requiredDeps = ['@sendgrid/mail', 'dotenv'];
  const missingDeps = requiredDeps.filter(dep => !pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]);
  
  addCheck(
    'Dependencies',
    missingDeps.length === 0 ? 'PASS' : 'WARN',
    missingDeps.length === 0 ? '✅ All required dependencies installed' : `⚠️ Missing dependencies: ${missingDeps.join(', ')}`,
    false
  );
  
  return missingDeps.length === 0;
}

function checkProductionEnv() {
  const prodEnvPath = path.join(__dirname, '..', '.env.production');
  const exists = fs.existsSync(prodEnvPath);
  
  if (exists) {
    const content = fs.readFileSync(prodEnvPath, 'utf8');
    const hasEmailConfig = content.includes('SENDGRID_API_KEY=') && content.includes('NOREPLY_EMAIL=');
    
    addCheck(
      'Production Environment',
      hasEmailConfig ? 'PASS' : 'WARN',
      hasEmailConfig ? '✅ Production email config found' : '⚠️ Production email config incomplete',
      false
    );
  } else {
    addCheck(
      'Production Environment',
      'WARN',
      '⚠️ .env.production file not found',
      false
    );
  }
}

function checkVercelConfig() {
  const vercelPath = path.join(__dirname, '..', 'vercel-env-vars.txt');
  const exists = fs.existsSync(vercelPath);
  
  if (exists) {
    const content = fs.readFileSync(vercelPath, 'utf8');
    const hasEmailVars = content.includes('SENDGRID_API_KEY') && content.includes('NOREPLY_EMAIL');
    
    addCheck(
      'Vercel Configuration',
      hasEmailVars ? 'PASS' : 'WARN',
      hasEmailVars ? '✅ Vercel email variables documented' : '⚠️ Vercel email variables missing',
      false
    );
  } else {
    addCheck(
      'Vercel Configuration',
      'INFO',
      'ℹ️ Vercel config file not found (optional)',
      false
    );
  }
}

async function main() {
  console.log('🔍 ProHeadshots Pre-Deployment Checklist\n');
  
  // Core file checks
  checkFileExists('src/utils/emailTemplates.ts', 'Email Templates Utility');
  checkFileExists('src/utils/emailWorkflowIntegration.ts', 'Email Workflow Integration');
  checkFileExists('src/templates/email/welcome.html', 'Welcome Email Template');
  checkFileExists('src/templates/email/order-confirmation.html', 'Order Confirmation Template');
  checkFileExists('src/templates/email/processing-complete.html', 'Processing Complete Template');
  
  // Environment variable checks
  checkEnvVariable('SENDGRID_API_KEY', 'SendGrid API Key', true);
  checkEnvVariable('NOREPLY_EMAIL', 'No-Reply Email Address', true);
  checkEnvVariable('NEXT_PUBLIC_SITE_URL', 'Site URL', true);
  checkEnvVariable('FAL_AI_API_KEY', 'Fal AI API Key', true);
  checkEnvVariable('POLAR_ACCESS_TOKEN', 'Polar Payment Token', true);
  
  // Configuration checks
  checkTemplateIds();
  checkPackageJson();
  checkProductionEnv();
  checkVercelConfig();
  
  // Summary
  console.log('\n📊 Deployment Readiness Report:\n');
  
  const critical = checks.filter(c => c.critical);
  const criticalFails = critical.filter(c => c.status === 'FAIL');
  const warnings = checks.filter(c => c.status === 'WARN');
  const passes = checks.filter(c => c.status === 'PASS');
  
  checks.forEach(check => {
    const icon = check.status === 'PASS' ? '✅' : 
                 check.status === 'FAIL' ? '❌' : 
                 check.status === 'WARN' ? '⚠️' : 'ℹ️';
    console.log(`${icon} ${check.name}: ${check.message.replace(/[✅❌⚠️ℹ️] /, '')}`);
  });
  
  console.log('\n📈 Summary:');
  console.log(`✅ Passed: ${passes.length}`);
  console.log(`⚠️ Warnings: ${warnings.length}`);
  console.log(`❌ Critical Issues: ${criticalFails.length}`);
  
  if (criticalFails.length === 0) {
    console.log('\n🎉 Ready for deployment!');
    console.log('\nNext steps:');
    console.log('1. Update production environment variables');
    console.log('2. Deploy to your hosting platform');
    console.log('3. Test email functionality in production');
  } else {
    console.log('\n🚨 Critical issues must be resolved before deployment:');
    criticalFails.forEach(check => {
      console.log(`   • ${check.name}: ${check.message}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️ Warnings (recommended to address):');
    warnings.forEach(check => {
      console.log(`   • ${check.name}: ${check.message}`);
    });
  }
}

main().catch(console.error);
