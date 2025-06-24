'use server'

import { createPolarCheckoutSession } from '@/utils/polarPayment';

export interface CreateCheckoutParams {
  productId: string;
  successUrl: string;
  customerEmail: string;
  metadata: {
    user_id: string;
    plan_type: string;
  };
}

export interface CreateCheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  checkoutId?: string;
  error?: string;
}

/**
 * Server action to create a Polar checkout session
 * This runs on the server and has access to environment variables
 */
export async function createPolarCheckoutAction(
  params: CreateCheckoutParams
): Promise<CreateCheckoutResult> {
  try {
    console.log('🔄 Creating Polar checkout session (server action):', {
      productId: params.productId,
      customerEmail: params.customerEmail,
      planType: params.metadata.plan_type,
      userId: params.metadata.user_id
    });

    const checkoutSession = await createPolarCheckoutSession({
      productId: params.productId,
      successUrl: params.successUrl,
      customerEmail: params.customerEmail,
      metadata: params.metadata,
    });

    console.log('✅ Polar checkout session created:', {
      id: checkoutSession.id,
      url: checkoutSession.url,
      status: checkoutSession.status
    });

    return {
      success: true,
      checkoutUrl: checkoutSession.url,
      checkoutId: checkoutSession.id,
    };
  } catch (error) {
    console.error('❌ Failed to create Polar checkout session:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Server action to validate Polar configuration
 * This helps debug configuration issues
 */
export async function validatePolarConfigAction(): Promise<{
  isConfigured: boolean;
  environment: string;
  error?: string;
}> {
  try {
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    console.log('🔍 Validating Polar configuration:', {
      hasAccessToken: !!accessToken,
      tokenLength: accessToken?.length || 0,
      environment: nodeEnv,
    });

    if (!accessToken) {
      return {
        isConfigured: false,
        environment: nodeEnv,
        error: 'POLAR_ACCESS_TOKEN environment variable is not set',
      };
    }

    if (!accessToken.startsWith('polar_')) {
      return {
        isConfigured: false,
        environment: nodeEnv,
        error: 'POLAR_ACCESS_TOKEN does not appear to be a valid Polar token (should start with "polar_")',
      };
    }

    // In development, we'll allow the token to be invalid and use mock checkout
    if (nodeEnv === 'development') {
      console.log('🧪 Development mode: Polar token validation relaxed for testing');
      return {
        isConfigured: true,
        environment: nodeEnv,
      };
    }

    return {
      isConfigured: true,
      environment: nodeEnv,
    };
  } catch (error) {
    return {
      isConfigured: false,
      environment: process.env.NODE_ENV || 'development',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
