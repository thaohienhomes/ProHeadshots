// Polar Payment utility functions
// Use sandbox API for development/testing
const POLAR_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api.polar.sh'
  : 'https://sandbox-api.polar.sh'; // Use sandbox API for development

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
 * Verify webhook signature (if Polar provides webhook signatures)
 */
export function verifyPolarWebhook(payload: string, signature: string, secret: string): boolean {
  // This is a placeholder - implement actual signature verification based on Polar's webhook documentation
  // For now, we'll just check if the secret matches
  return signature === secret;
}

/**
 * Extract plan type from Polar product ID
 */
export function extractPlanTypeFromProductId(productId: string): string {
  if (productId.includes('basic')) return 'Basic';
  if (productId.includes('professional')) return 'Professional';
  if (productId.includes('executive')) return 'Executive';
  return 'Basic'; // Default fallback
}
