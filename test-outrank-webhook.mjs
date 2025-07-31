#!/usr/bin/env node

/**
 * Test script for Outrank.so webhook integration
 * 
 * Usage:
 *   node test-outrank-webhook.mjs
 *   node test-outrank-webhook.mjs --endpoint http://localhost:3001
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
let env = {};
try {
  const envContent = readFileSync(join(__dirname, '.env.local'), 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (error) {
  console.error('❌ Could not load .env.local file:', error.message);
  process.exit(1);
}

// Configuration
const baseUrl = process.argv.includes('--endpoint') 
  ? process.argv[process.argv.indexOf('--endpoint') + 1]
  : env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

const accessToken = env.OUTRANK_WEBHOOK_ACCESS_TOKEN;

if (!accessToken || accessToken === 'your_secure_outrank_access_token_here') {
  console.error('❌ OUTRANK_WEBHOOK_ACCESS_TOKEN not configured in .env.local');
  console.log('Please set a secure access token in your .env.local file');
  process.exit(1);
}

// Test data
const testPayload = {
  event_type: 'publish_articles',
  timestamp: new Date().toISOString(),
  data: {
    articles: [
      {
        id: 'test-article-001',
        title: 'Test Article: Webhook Integration Guide',
        content_markdown: '# Webhook Integration Guide\n\nThis is a test article to verify the Outrank.so webhook integration.\n\n## Features\n\n- Secure authentication\n- Article storage\n- Tag management\n\n## Conclusion\n\nThe webhook integration is working correctly!',
        content_html: '<h1>Webhook Integration Guide</h1><p>This is a test article to verify the Outrank.so webhook integration.</p><h2>Features</h2><ul><li>Secure authentication</li><li>Article storage</li><li>Tag management</li></ul><h2>Conclusion</h2><p>The webhook integration is working correctly!</p>',
        meta_description: 'A comprehensive guide to testing webhook integration with Outrank.so',
        created_at: new Date().toISOString(),
        image_url: 'https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Test+Article',
        slug: 'test-webhook-integration-guide',
        tags: ['webhook', 'integration', 'test', 'outrank']
      },
      {
        id: 'test-article-002',
        title: 'Advanced API Testing Strategies',
        content_markdown: '# Advanced API Testing Strategies\n\nLearn how to effectively test your API integrations.\n\n## Best Practices\n\n1. Use proper authentication\n2. Validate all inputs\n3. Handle errors gracefully\n4. Monitor performance\n\n## Tools\n\n- Postman\n- curl\n- Custom test scripts',
        content_html: '<h1>Advanced API Testing Strategies</h1><p>Learn how to effectively test your API integrations.</p><h2>Best Practices</h2><ol><li>Use proper authentication</li><li>Validate all inputs</li><li>Handle errors gracefully</li><li>Monitor performance</li></ol><h2>Tools</h2><ul><li>Postman</li><li>curl</li><li>Custom test scripts</li></ul>',
        meta_description: 'Master API testing with these advanced strategies and best practices',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        image_url: 'https://via.placeholder.com/800x400/059669/FFFFFF?text=API+Testing',
        slug: 'advanced-api-testing-strategies',
        tags: ['api', 'testing', 'best-practices', 'development']
      }
    ]
  }
};

async function testWebhookEndpoint() {
  console.log('🧪 Testing Outrank.so Webhook Integration');
  console.log('=' .repeat(50));
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log(`🔑 Access Token: ${accessToken.substring(0, 10)}...`);
  console.log('');

  try {
    // Test 1: GET request to check endpoint info
    console.log('1️⃣ Testing webhook endpoint info (GET)...');
    const infoResponse = await fetch(`${baseUrl}/api/outrank-webhook`);
    const infoData = await infoResponse.json();
    
    if (infoResponse.ok) {
      console.log('✅ Endpoint info retrieved successfully');
      console.log(`   Configuration: ${JSON.stringify(infoData.configuration, null, 2)}`);
    } else {
      console.log('❌ Failed to get endpoint info');
      console.log(`   Status: ${infoResponse.status}`);
      console.log(`   Response: ${JSON.stringify(infoData, null, 2)}`);
    }
    console.log('');

    // Test 2: POST request without authentication
    console.log('2️⃣ Testing webhook without authentication...');
    const noAuthResponse = await fetch(`${baseUrl}/api/outrank-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    if (noAuthResponse.status === 401) {
      console.log('✅ Authentication properly rejected (401)');
    } else {
      console.log('❌ Expected 401 but got:', noAuthResponse.status);
    }
    console.log('');

    // Test 3: POST request with valid authentication
    console.log('3️⃣ Testing webhook with valid authentication...');
    const validResponse = await fetch(`${baseUrl}/api/outrank-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(testPayload)
    });

    const validData = await validResponse.json();
    
    if (validResponse.ok) {
      console.log('✅ Webhook processed successfully');
      console.log(`   Status: ${validResponse.status}`);
      console.log(`   Processed: ${validData.processed_articles} articles`);
      console.log(`   Message: ${validData.message}`);
    } else {
      console.log('❌ Webhook processing failed');
      console.log(`   Status: ${validResponse.status}`);
      console.log(`   Response: ${JSON.stringify(validData, null, 2)}`);
    }
    console.log('');

    // Test 4: Test articles API
    console.log('4️⃣ Testing articles API...');
    const articlesResponse = await fetch(`${baseUrl}/api/articles?action=list&limit=5`);
    const articlesData = await articlesResponse.json();
    
    if (articlesResponse.ok && articlesData.success) {
      console.log('✅ Articles API working');
      console.log(`   Total articles: ${articlesData.data.total}`);
      console.log(`   Returned: ${articlesData.data.articles.length} articles`);
      
      if (articlesData.data.articles.length > 0) {
        const firstArticle = articlesData.data.articles[0];
        console.log(`   Latest article: "${firstArticle.title}"`);
        console.log(`   Slug: ${firstArticle.slug}`);
        console.log(`   Tags: ${firstArticle.tags.join(', ')}`);
      }
    } else {
      console.log('❌ Articles API failed');
      console.log(`   Status: ${articlesResponse.status}`);
      console.log(`   Response: ${JSON.stringify(articlesData, null, 2)}`);
    }
    console.log('');

    // Test 5: Test article by slug
    if (articlesData.success && articlesData.data.articles.length > 0) {
      const testSlug = articlesData.data.articles[0].slug;
      console.log(`5️⃣ Testing individual article API (slug: ${testSlug})...`);
      
      const articleResponse = await fetch(`${baseUrl}/api/articles/${testSlug}`);
      const articleData = await articleResponse.json();
      
      if (articleResponse.ok && articleData.success) {
        console.log('✅ Individual article API working');
        console.log(`   Article: "${articleData.data.title}"`);
        console.log(`   Content length: ${articleData.data.content_html.length} characters`);
      } else {
        console.log('❌ Individual article API failed');
        console.log(`   Status: ${articleResponse.status}`);
        console.log(`   Response: ${JSON.stringify(articleData, null, 2)}`);
      }
    } else {
      console.log('5️⃣ Skipping individual article test (no articles found)');
    }

    console.log('');
    console.log('🎉 Webhook integration test completed!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Configure your Outrank.so webhook with:');
    console.log(`   - Endpoint: ${baseUrl}/api/outrank-webhook`);
    console.log(`   - Access Token: ${accessToken}`);
    console.log('2. Publish an article in Outrank.so to test the integration');
    console.log('3. Check your database for the received articles');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Run the test
testWebhookEndpoint();
