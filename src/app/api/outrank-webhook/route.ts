import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { OutrankWebhookPayload, OutrankArticle, WebhookResponse } from '@/types/outrank';

export const dynamic = "force-dynamic";

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const outrankAccessToken = process.env.OUTRANK_WEBHOOK_ACCESS_TOKEN;

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error("MISSING NEXT_PUBLIC_SUPABASE_URL!");
}

if (!supabaseServiceRoleKey) {
  throw new Error("MISSING SUPABASE_SERVICE_ROLE_KEY!");
}

if (!outrankAccessToken) {
  throw new Error("MISSING OUTRANK_WEBHOOK_ACCESS_TOKEN!");
}

// Create Supabase client with service role key for database operations
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Simple in-memory rate limiting (for production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiting: max 10 requests per minute per IP
 */
function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  const current = requestCounts.get(clientIp);

  if (!current || now > current.resetTime) {
    // Reset or initialize
    requestCounts.set(clientIp, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  current.count++;
  return true;
}

/**
 * Validates the access token from the Authorization header
 */
function validateAccessToken(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.split(" ")[1];
  return token === outrankAccessToken;
}

/**
 * Stores an article in the database
 */
async function storeArticle(article: OutrankArticle): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('articles')
      .upsert({
        outrank_article_id: article.id,
        title: article.title,
        content_markdown: article.content_markdown,
        content_html: article.content_html,
        meta_description: article.meta_description || null,
        image_url: article.image_url || null,
        slug: article.slug,
        tags: article.tags || [],
        outrank_created_at: article.created_at,
        received_at: new Date().toISOString(),
      }, {
        onConflict: 'outrank_article_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('❌ Error storing article:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Exception storing article:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * POST handler for Outrank.so webhook
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Outrank webhook received');

    // Log request details for debugging
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    console.log(`📊 Request from IP: ${clientIp}, User-Agent: ${userAgent}`);

    // Check rate limiting
    if (!checkRateLimit(clientIp)) {
      console.log(`⚠️ Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json({
        success: false,
        message: 'Rate limit exceeded. Maximum 10 requests per minute.',
        error_type: 'rate_limit',
        timestamp: new Date().toISOString()
      } as WebhookResponse, { status: 429 });
    }

    // Validate access token
    if (!validateAccessToken(request)) {
      console.log('❌ Invalid access token');
      return NextResponse.json({
        success: false,
        message: 'Invalid access token',
        timestamp: new Date().toISOString()
      } as WebhookResponse, { status: 401 });
    }

    // Parse the webhook payload
    let webhookData: OutrankWebhookPayload;
    try {
      webhookData = await request.json();
    } catch (error) {
      console.error('❌ Failed to parse webhook JSON:', error);
      return NextResponse.json({
        success: false,
        message: 'Invalid JSON payload',
        timestamp: new Date().toISOString()
      } as WebhookResponse, { status: 400 });
    }

    // Validate event type
    if (webhookData.event_type !== 'publish_articles') {
      console.log('⚠️ Unsupported event type:', webhookData.event_type);
      return NextResponse.json({
        success: false,
        message: `Unsupported event type: ${webhookData.event_type}`,
        timestamp: new Date().toISOString()
      } as WebhookResponse, { status: 400 });
    }

    // Validate payload structure
    if (!webhookData.data || !Array.isArray(webhookData.data.articles)) {
      console.error('❌ Invalid payload structure');
      return NextResponse.json({
        success: false,
        message: 'Invalid payload structure - missing articles array',
        timestamp: new Date().toISOString()
      } as WebhookResponse, { status: 400 });
    }

    const articles = webhookData.data.articles;
    console.log(`📝 Processing ${articles.length} articles`);

    // Process each article
    const results = await Promise.allSettled(
      articles.map(article => storeArticle(article))
    );

    // Count successes and collect errors
    let successCount = 0;
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successCount++;
      } else {
        const errorMsg = result.status === 'rejected' 
          ? result.reason 
          : result.value.error || 'Unknown error';
        errors.push(`Article ${index + 1}: ${errorMsg}`);
      }
    });

    console.log(`✅ Successfully processed ${successCount}/${articles.length} articles`);
    if (errors.length > 0) {
      console.log('❌ Errors:', errors);
    }

    // Return response
    const response: WebhookResponse = {
      success: successCount > 0,
      message: `Processed ${successCount}/${articles.length} articles successfully`,
      processed_articles: successCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { 
      status: successCount === articles.length ? 200 : 207 // 207 = Multi-Status for partial success
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);

    // Check if it's a rate limiting error
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const isRateLimitError = errorMessage.toLowerCase().includes('rate limit') ||
                            errorMessage.toLowerCase().includes('too many requests');

    return NextResponse.json({
      success: false,
      message: errorMessage,
      error_type: isRateLimitError ? 'rate_limit' : 'internal_error',
      timestamp: new Date().toISOString()
    } as WebhookResponse, { status: isRateLimitError ? 429 : 500 });
  }
}

/**
 * GET handler for webhook endpoint information
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Outrank.so Webhook Endpoint',
    description: 'This endpoint receives article publication notifications from Outrank.so',
    status: 'active',
    version: '1.0.1',
    usage: {
      method: 'POST',
      authentication: 'Bearer token in Authorization header',
      contentType: 'application/json',
      supportedEvents: ['publish_articles']
    },
    configuration: {
      supabaseConfigured: !!(supabaseUrl && supabaseServiceRoleKey),
      accessTokenConfigured: !!outrankAccessToken,
      environment: process.env.NODE_ENV || 'development'
    },
    timestamp: new Date().toISOString()
  });
}
