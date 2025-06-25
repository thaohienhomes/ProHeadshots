#!/usr/bin/env node

/**
 * SendGrid Template Setup Script for ProHeadshots
 * 
 * This script helps you create and upload email templates to SendGrid
 * Run with: node scripts/setup-sendgrid-templates.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template configurations
const templates = [
  {
    name: 'ProHeadshots - Welcome Email',
    subject: 'Welcome to ProHeadshots, {{firstName}}!',
    htmlFile: 'welcome.html',
    type: 'welcome',
    description: 'Welcome email for new users'
  },
  {
    name: 'ProHeadshots - Order Confirmation',
    subject: 'Order Confirmed - {{orderId}}',
    htmlFile: 'order-confirmation.html',
    type: 'order_confirmation',
    description: 'Order confirmation email after purchase'
  },
  {
    name: 'ProHeadshots - Processing Started',
    subject: 'Your headshots are being generated!',
    htmlFile: 'processing-started.html',
    type: 'processing_started',
    description: 'Notification when AI processing starts'
  },
  {
    name: 'ProHeadshots - Processing Complete',
    subject: '🎉 Your headshots are ready, {{firstName}}!',
    htmlFile: 'processing-complete.html',
    type: 'processing_complete',
    description: 'Notification when headshots are ready'
  },
  {
    name: 'ProHeadshots - Payment Confirmation',
    subject: 'Payment Confirmed - {{orderId}}',
    htmlFile: 'payment-confirmation.html',
    type: 'payment_confirmation',
    description: 'Payment confirmation and receipt'
  },
  {
    name: 'ProHeadshots - Password Reset',
    subject: 'Reset your ProHeadshots password',
    htmlFile: 'password-reset.html',
    type: 'password_reset',
    description: 'Password reset email'
  },
  {
    name: 'ProHeadshots - Promotional Offer',
    subject: '{{offerTitle}} - Limited Time!',
    htmlFile: 'promotional.html',
    type: 'promotional',
    description: 'Promotional and marketing emails'
  },
  {
    name: 'ProHeadshots - Support Response',
    subject: 'Re: {{subject}} [Ticket #{{ticketId}}]',
    htmlFile: 'support-response.html',
    type: 'support_response',
    description: 'Customer support response email'
  }
];

function loadTemplate(htmlFile) {
  const templatePath = path.join(__dirname, '..', 'src', 'templates', 'email', htmlFile);
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error loading template ${htmlFile}:`, error.message);
    return null;
  }
}

async function createSendGridTemplate(template, apiKey) {
  const htmlContent = loadTemplate(template.htmlFile);
  if (!htmlContent) {
    return null;
  }

  const templateData = {
    name: template.name,
    generation: 'dynamic'
  };

  try {
    // Create template
    const createResponse = await fetch('https://api.sendgrid.com/v3/templates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templateData)
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Failed to create template: ${error}`);
    }

    const templateResult = await createResponse.json();
    const templateId = templateResult.id;

    // Create version
    const versionData = {
      template_id: templateId,
      active: 1,
      name: template.name,
      subject: template.subject,
      html_content: htmlContent,
      generate_plain_content: true
    };

    const versionResponse = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}/versions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(versionData)
    });

    if (!versionResponse.ok) {
      const error = await versionResponse.text();
      throw new Error(`Failed to create template version: ${error}`);
    }

    return {
      id: templateId,
      name: template.name,
      type: template.type
    };
  } catch (error) {
    console.error(`❌ Error creating template ${template.name}:`, error.message);
    return null;
  }
}

function generateTemplateIdConstants(createdTemplates) {
  const constants = createdTemplates
    .filter(t => t !== null)
    .map(t => `  ${t.type}: '${t.id}'`)
    .join(',\n');

  return `export const SENDGRID_TEMPLATE_IDS = {
${constants}
} as const;`;
}

async function main() {
  console.log('🚀 ProHeadshots SendGrid Template Setup\n');

  // Check for API key
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey || apiKey === 'YOUR_SENDGRID_API_KEY' || !apiKey.startsWith('SG.')) {
    console.error('❌ SendGrid API key not found or invalid.');
    console.log('Please set SENDGRID_API_KEY environment variable with a valid SendGrid API key.');
    console.log('Example: SENDGRID_API_KEY=SG.your_api_key_here node scripts/setup-sendgrid-templates.mjs');
    process.exit(1);
  }

  console.log('✅ SendGrid API key found');
  console.log(`📧 Creating ${templates.length} email templates...\n`);

  const createdTemplates = [];

  for (const template of templates) {
    console.log(`📝 Creating template: ${template.name}`);
    const result = await createSendGridTemplate(template, apiKey);
    
    if (result) {
      console.log(`✅ Created template: ${result.id}`);
      createdTemplates.push(result);
    } else {
      console.log(`❌ Failed to create template: ${template.name}`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📋 Template Creation Summary:');
  console.log(`✅ Successfully created: ${createdTemplates.length}`);
  console.log(`❌ Failed: ${templates.length - createdTemplates.length}`);

  if (createdTemplates.length > 0) {
    console.log('\n🔧 Update your emailTemplates.ts file with these template IDs:');
    console.log('\n' + generateTemplateIdConstants(createdTemplates));
    
    // Write to file
    const outputPath = path.join(__dirname, '..', 'sendgrid-template-ids.txt');
    fs.writeFileSync(outputPath, generateTemplateIdConstants(createdTemplates));
    console.log(`\n💾 Template IDs saved to: ${outputPath}`);
  }

  console.log('\n🎉 Setup complete!');
  console.log('\nNext steps:');
  console.log('1. Update src/utils/emailTemplates.ts with the new template IDs');
  console.log('2. Test the templates in your SendGrid dashboard');
  console.log('3. Deploy your application with the updated template IDs');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the script
main().catch(console.error);
