import { createClient } from '@/utils/supabase/client';

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'credits';
  value: number; // Percentage (0-100), fixed amount in cents, or credit amount
  max_uses?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
  description: string;
  created_at: string;
}

/**
 * Client-side promo code validation
 * This calls the server-side API for secure validation
 */
export async function validatePromoCodeClient(
  code: string,
  userId: string,
  orderAmount?: number
): Promise<{
  valid: boolean;
  promoCode?: PromoCode;
  discountAmount?: number;
  error?: string;
}> {
  try {
    // Call the server-side API for secure validation
    const response = await fetch('/api/promo-code/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code.toUpperCase(),
        userId,
        orderAmount
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to validate promo code');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error validating promo code:', error);
    return { valid: false, error: 'Error validating promo code' };
  }
}
