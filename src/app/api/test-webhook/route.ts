import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { verifyPolarWebhook, extractPlanTypeFromProductId } from "@/utils/polarPayment";

export const dynamic = "force-dynamic";

// Environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const polarWebhookSecret = process.env.POLAR_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("polar-signature") || "";

    console.log('🔍 Webhook test received:', {
      bodyLength: body.length,
      hasSignature: !!signature,
      hasSecret: !!polarWebhookSecret
    });

    // Verify webhook signature if secret is configured
    if (polarWebhookSecret && signature) {
      const isValidSignature = verifyPolarWebhook(body, signature, polarWebhookSecret);
      console.log('🔐 Signature verification:', isValidSignature ? 'VALID' : 'INVALID');
      
      if (!isValidSignature) {
        return NextResponse.json({
          success: false,
          error: 'Invalid webhook signature'
        }, { status: 401 });
      }
    } else if (polarWebhookSecret && !signature) {
      return NextResponse.json({
        success: false,
        error: 'Missing webhook signature'
      }, { status: 401 });
    }

    // Parse the webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      console.error('❌ Failed to parse webhook JSON:', error);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON payload'
      }, { status: 400 });
    }

    console.log('📨 Webhook event:', {
      type: webhookData.type,
      dataKeys: Object.keys(webhookData.data || {}),
      productId: webhookData.data?.product_id,
      metadata: webhookData.data?.metadata
    });

    // Test plan type extraction
    if (webhookData.data?.product_id) {
      const planType = extractPlanTypeFromProductId(webhookData.data.product_id);
      console.log('📋 Plan type extracted:', planType);
    }

    // Test Supabase connection (without actually updating data)
    if (supabaseUrl && supabaseServiceRoleKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
        
        // Test connection by checking if we can access the userTable
        const { data, error } = await supabase
          .from('userTable')
          .select('count')
          .limit(1);
          
        if (error) {
          console.log('⚠️ Supabase connection test failed:', error.message);
        } else {
          console.log('✅ Supabase connection test successful');
        }
      } catch (error) {
        console.log('❌ Supabase connection error:', error);
      }
    }

    // Return success response with test results
    return NextResponse.json({
      success: true,
      message: 'Webhook test completed successfully',
      results: {
        signatureVerified: polarWebhookSecret ? !!signature : 'No secret configured',
        eventType: webhookData.type,
        productId: webhookData.data?.product_id,
        planType: webhookData.data?.product_id ? extractPlanTypeFromProductId(webhookData.data.product_id) : null,
        hasMetadata: !!webhookData.data?.metadata,
        supabaseConfigured: !!(supabaseUrl && supabaseServiceRoleKey),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Webhook test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Webhook test endpoint - use POST to test webhook functionality',
    configuration: {
      supabaseConfigured: !!(supabaseUrl && supabaseServiceRoleKey),
      webhookSecretConfigured: !!polarWebhookSecret,
      environment: process.env.NODE_ENV || 'development'
    }
  });
}
