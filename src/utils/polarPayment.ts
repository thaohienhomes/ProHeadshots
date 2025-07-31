// Polar Payment utility functions
// Use appropriate API based on environment
import crypto from 'crypto';

// Use sandbox API for development, production API for production
const POLAR_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api.polar.sh'
  : 'https://sandbox-api.polar.sh';

export interface PolarCheckoutSession {
  id: string;
  url: string;
  customer_id?: string;
  customer_email?: string;
  customer_name?: string;
  product_id: string;
  product_price_id?: string;
  success_url: string;
  metadata?: Record<string, string>;
  created_at: string;
  expires_at: string;
  status: 'open' | 'complete' | 'expired';
}

export interface PolarOrder {
  id: string;
  amount: number;
  tax_amount: number;
  currency: string;
  customer_id: string;
  product_id: string;
  product_price_id?: string;
  subscription_id?: string;
  checkout_id?: string;
  metadata?: Record<string, string>;
  created_at: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'refunded';
}

export interface PolarCustomer {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  modified_at: string;
}

/**
 * Create a checkout session with Polar
 */
export async function createPolarCheckoutSession(params: {
  productId: string;
  successUrl: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, string>;
}): Promise<PolarCheckoutSession> {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('POLAR_ACCESS_TOKEN is not configured');
  }

  // For development/testing, try real API first, then fallback to mock
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 Development mode: Testing real Polar API first...');

    try {
      // Try the real API first
      const response = await fetch(`${POLAR_API_BASE}/v1/checkouts/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: params.productId,
          success_url: params.successUrl,
          customer_email: params.customerEmail,
          customer_name: params.customerName,
          metadata: params.metadata,
        }),
      });

      if (response.ok) {
        console.log('✅ Real Polar API worked in development!');
        return response.json();
      } else {
        const errorText = await response.text();
        console.log('⚠️ Real Polar API failed, falling back to mock:', response.status, errorText);
      }
    } catch (error) {
      console.log('⚠️ Real Polar API error, falling back to mock:', error);
    }

    // Fallback to mock for development
    console.log('🧪 Creating mock Polar checkout session for testing...');
    const mockCheckoutSession: PolarCheckoutSession = {
      id: `mock_checkout_${Date.now()}`,
      url: `https://polar.sh/checkout/mock?product=${params.productId}&user=${params.metadata?.user_id}`,
      customer_email: params.customerEmail,
      customer_name: params.customerName,
      product_id: params.productId,
      success_url: params.successUrl,
      metadata: params.metadata,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      status: 'open',
    };

    console.log('Mock checkout session created:', mockCheckoutSession.id);
    return mockCheckoutSession;
  }

  const response = await fetch(`${POLAR_API_BASE}/v1/checkouts/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: params.productId,
      success_url: params.successUrl,
      customer_email: params.customerEmail,
      customer_name: params.customerName,
      metadata: params.metadata,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Polar checkout session: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Retrieve a checkout session by ID
 */
export async function getPolarCheckoutSession(checkoutId: string): Promise<PolarCheckoutSession> {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('POLAR_ACCESS_TOKEN is not configured');
  }

  // Handle mock checkout sessions in development
  if (process.env.NODE_ENV === 'development' && checkoutId.startsWith('mock_checkout_')) {
    console.log('🧪 Development mode: Creating mock checkout session response for:', checkoutId);

    // Create a mock completed checkout session
    const mockCheckoutSession: PolarCheckoutSession = {
      id: checkoutId,
      url: `https://polar.sh/checkout/mock?product=28d871b5-be69-4594-af59-737fa189d5df&user=00000000-0000-0000-0000-000000000001`,
      customer_email: 'test@coolpix.me',
      customer_name: 'Test User',
      product_id: '28d871b5-be69-4594-af59-737fa189d5df', // Development Basic plan
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005'}/postcheckout-polar?checkout_id={CHECKOUT_ID}`,
      metadata: {
        user_id: '00000000-0000-0000-0000-000000000001', // Use proper UUID format
        plan_type: 'Basic'
      },
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      status: 'succeeded', // Mock as succeeded for testing (matches real Polar API)
    };

    console.log('Mock checkout session created for verification:', mockCheckoutSession.id);
    return mockCheckoutSession;
  }

  // For production or real checkout IDs, use the real API with timeout
  console.log('🌐 Making API call to Polar for checkout session:', checkoutId);

  // Create AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${POLAR_API_BASE}/v1/checkouts/${checkoutId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Polar API error:', response.status, errorText);

      // Handle specific error cases
      if (response.status === 404) {
        throw new Error(`Checkout session not found. This checkout may have expired or is invalid.`);
      } else if (response.status === 401) {
        throw new Error(`Authentication failed. Please check your Polar API credentials.`);
      } else {
        throw new Error(`Failed to retrieve Polar checkout session: ${response.status} ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('✅ Successfully retrieved checkout session from Polar API');
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ Polar API request timed out after 10 seconds');
      throw new Error('Request timed out. Please try again or contact support if the issue persists.');
    }

    console.error('❌ Error calling Polar API:', error);
    throw error;
  }
}

/**
 * Retrieve an order by ID
 */
export async function getPolarOrder(orderId: string): Promise<PolarOrder> {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('POLAR_ACCESS_TOKEN is not configured');
  }

  const response = await fetch(`${POLAR_API_BASE}/v1/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to retrieve Polar order: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * List orders for a customer
 */
export async function getPolarCustomerOrders(customerId: string): Promise<PolarOrder[]> {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('POLAR_ACCESS_TOKEN is not configured');
  }

  const response = await fetch(`${POLAR_API_BASE}/v1/orders/?customer_id=${customerId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to retrieve Polar customer orders: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Get customer by email
 */
export async function getPolarCustomerByEmail(email: string): Promise<PolarCustomer | null> {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('POLAR_ACCESS_TOKEN is not configured');
  }

  const response = await fetch(`${POLAR_API_BASE}/v1/customers/?email=${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to retrieve Polar customer: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.items?.[0] || null;
}

/**
 * Verify Polar webhook signature using HMAC-SHA256
 * Based on Polar's webhook security documentation
 */
export function verifyPolarWebhook(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret || !payload) {
    console.error('Missing required parameters for webhook verification');
    return false;
  }

  try {
    // Handle different signature formats

    // Format 1: Timestamp-based signature (t=timestamp,v1=signature)
    if (signature.includes('t=') && signature.includes('v1=')) {
      const parts = signature.split(',');
      const timestampPart = parts.find(part => part.startsWith('t='));
      const signaturePart = parts.find(part => part.startsWith('v1='));

      if (!timestampPart || !signaturePart) {
        console.error('Invalid timestamp-based signature format');
        return false;
      }

      const timestamp = timestampPart.split('=')[1];
      const receivedSignature = signaturePart.split('=')[1];

      // Create expected signature with timestamp
      const signaturePayload = `${timestamp}.${payload}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signaturePayload, 'utf8')
        .digest('hex');

      // Use timing-safe comparison
      if (expectedSignature.length !== receivedSignature.length) {
        return false;
      }

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex')
      );
    }

    // Format 2: Simple sha256=<hash> format
    let receivedSignature = signature;
    if (signature.startsWith('sha256=')) {
      receivedSignature = signature.substring(7);
    }

    // Create expected signature without timestamp
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    if (expectedSignature.length !== receivedSignature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying Polar webhook signature:', error);
    return false;
  }
}

/**
 * Extract plan type from Polar product ID using proper mapping
 * Product IDs are UUIDs, so we need to map them to plan types
 */
export function extractPlanTypeFromProductId(productId: string): string {
  // Environment-specific Product ID to Plan Type mapping
  const productIdMapping: Record<string, string> = process.env.NODE_ENV === 'production'
    ? {
        // Production Product IDs (verified 2025-06-24)
        '5b26fbdf-87ee-4002-aecf-82f6278a4831': 'Basic',      // $29
        '2e38da8b-460f-4bb6-b7ab-e6e0056d99f5': 'Professional', // $39
        '4fb38fdf-ebd1-484e-9f42-07781504af78': 'Executive',   // $59
      }
    : {
        // Sandbox Product IDs (verified 2025-07-24)
        '28d871b5-be69-4594-af59-737fa189d5df': 'Basic',      // $29/month
        'aff54590-b4c6-4e24-a966-8945f2ae2e19': 'Professional', // $59/month
        'e2696f0f-213f-4b15-9c78-e8b4e7d83116': 'Executive',   // $99/month
      };

  return productIdMapping[productId] || 'Basic'; // Default fallback
}
