#!/usr/bin/env node

/**
 * Verify SendGrid Templates for ProHeadshots
 * Run with: SENDGRID_API_KEY=your_key node scripts/verify-sendgrid-templates.mjs
 */

const TEMPLATE_IDS = {
  welcome: 'd-709841e3498344fba8a981d8be9666ba',
  order_confirmation: 'd-85b5b99d09684408ba908abfe98537f5',
  processing_started: 'd-db27d729c9ef4a2ebb176451e3ab266a',
  processing_complete: 'd-ee3bde9d6dec4c928eec5422300840f6',
  payment_confirmation: 'd-7dcd6ecde3dc4a1c990d388c283e38f0',
  password_reset: 'd-1b85a5df63c94e23ac388415916c1598',
  promotional: 'd-3aafb72ab3474fcfb9a7da04b3afb2a1',
  support_response: 'd-266b25ccb7ec4ff4a19135d64a50b66f'
};

async function verifyTemplate(templateId, templateName, apiKey) {
  try {
    const response = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const template = await response.json();
      console.log(`✅ ${templateName}: ${template.name} (Active versions: ${template.versions?.length || 0})`);
      return true;
    } else {
      console.log(`❌ ${templateName}: Template not found or inaccessible`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${templateName}: Error - ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Verifying ProHeadshots SendGrid Templates\n');

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey || !apiKey.startsWith('SG.')) {
    console.error('❌ SendGrid API key not found or invalid.');
    console.log('Run with: SENDGRID_API_KEY=your_key node scripts/verify-sendgrid-templates.mjs');
    process.exit(1);
  }

  console.log('✅ SendGrid API key found');
  console.log('📧 Checking templates...\n');

  let successCount = 0;
  const totalTemplates = Object.keys(TEMPLATE_IDS).length;

  for (const [key, templateId] of Object.entries(TEMPLATE_IDS)) {
    const templateName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const success = await verifyTemplate(templateId, templateName, apiKey);
    if (success) successCount++;
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Verification Summary:');
  console.log(`✅ Templates verified: ${successCount}/${totalTemplates}`);
  
  if (successCount === totalTemplates) {
    console.log('\n🎉 All templates are properly configured!');
    console.log('\nNext steps:');
    console.log('1. Preview templates in SendGrid dashboard: https://app.sendgrid.com/dynamic_templates');
    console.log('2. Send test emails using the test script');
    console.log('3. Test email integration in your application');
  } else {
    console.log('\n⚠️  Some templates may need attention. Check your SendGrid dashboard.');
  }
}

main().catch(console.error);
