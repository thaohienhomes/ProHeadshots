// Polar Payment utility functions
// Use production API since we have production access token and products
import crypto from 'crypto';

const POLAR_API_BASE = 'https://api.polar.sh';

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

  const response = await fetch(`${POLAR_API_BASE}/v1/checkouts/${checkoutId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to retrieve Polar checkout session: ${response.status} ${errorText}`);
  }

  return response.json();
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
    // Polar uses HMAC-SHA256 for webhook signatures
    // The signature format is typically: sha256=<hash>
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    // Handle different signature formats
    let receivedSignature = signature;
    if (signature.startsWith('sha256=')) {
      receivedSignature = signature.substring(7);
    }

    // Use timing-safe comparison to prevent timing attacks
    // Ensure both buffers have the same length to avoid errors
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
  // Product ID to Plan Type mapping (verified 2025-06-24)
  const productIdMapping: Record<string, string> = {
    '5b26fbdf-87ee-4002-aecf-82f6278a4831': 'Basic',      // $29
    '2e38da8b-460f-4bb6-b7ab-e6e0056d99f5': 'Professional', // $39
    '4fb38fdf-ebd1-484e-9f42-07781504af78': 'Executive',   // $59
  };

  return productIdMapping[productId] || 'Basic'; // Default fallback
}
