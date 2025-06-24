import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';

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

export interface PromoCodeUsage {
  id: string;
  promo_code_id: string;
  user_id: string;
  order_id?: string;
  discount_amount: number;
  used_at: string;
}

/**
 * Validate and apply a promo code
 */
export async function validatePromoCode(
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
    const supabase = await createClient();
    
    // Get promo code
    const { data: promoCode, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (promoError || !promoCode) {
      return { valid: false, error: 'Invalid promo code' };
    }

    // Check if expired
    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      return { valid: false, error: 'Promo code has expired' };
    }

    // Check usage limit
    if (promoCode.max_uses && promoCode.used_count >= promoCode.max_uses) {
      return { valid: false, error: 'Promo code usage limit reached' };
    }

    // Check if user already used this code
    const { data: existingUsage } = await supabase
      .from('promo_code_usage')
      .select('id')
      .eq('promo_code_id', promoCode.id)
      .eq('user_id', userId)
      .single();

    if (existingUsage) {
      return { valid: false, error: 'You have already used this promo code' };
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.type === 'percentage' && orderAmount) {
      discountAmount = Math.round((orderAmount * promoCode.value) / 100);
    } else if (promoCode.type === 'fixed_amount') {
      discountAmount = promoCode.value;
    } else if (promoCode.type === 'credits') {
      // For credit-based promos, return the credit amount
      discountAmount = promoCode.value;
    }

    return {
      valid: true,
      promoCode,
      discountAmount
    };
  } catch (error) {
    logger.error('Error validating promo code', error as Error, 'PROMO', { code, userId });
    return { valid: false, error: 'Error validating promo code' };
  }
}

/**
 * Apply a promo code (mark as used)
 */
export async function applyPromoCode(
  promoCodeId: string,
  userId: string,
  discountAmount: number,
  orderId?: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Record usage
    const { error: usageError } = await supabase
      .from('promo_code_usage')
      .insert({
        promo_code_id: promoCodeId,
        user_id: userId,
        order_id: orderId,
        discount_amount: discountAmount
      });

    if (usageError) {
      logger.error('Error recording promo code usage', usageError, 'PROMO', { 
        promoCodeId, 
        userId 
      });
      return false;
    }

    // Increment usage count
    const { error: updateError } = await supabase
      .rpc('increment_promo_code_usage', { promo_code_id: promoCodeId });

    if (updateError) {
      logger.error('Error incrementing promo code usage', updateError, 'PROMO', { 
        promoCodeId 
      });
      return false;
    }

    logger.info('Promo code applied successfully', 'PROMO', {
      promoCodeId,
      userId,
      discountAmount,
      orderId
    });

    return true;
  } catch (error) {
    logger.error('Error applying promo code', error as Error, 'PROMO', { 
      promoCodeId, 
      userId 
    });
    return false;
  }
}

/**
 * Create a new promo code (admin function)
 */
export async function createPromoCode(params: {
  code: string;
  type: 'percentage' | 'fixed_amount' | 'credits';
  value: number;
  description: string;
  maxUses?: number;
  expiresAt?: string;
}): Promise<{ success: boolean; promoCode?: PromoCode; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Check if code already exists
    const { data: existing } = await supabase
      .from('promo_codes')
      .select('id')
      .eq('code', params.code.toUpperCase())
      .single();

    if (existing) {
      return { success: false, error: 'Promo code already exists' };
    }

    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .insert({
        code: params.code.toUpperCase(),
        type: params.type,
        value: params.value,
        description: params.description,
        max_uses: params.maxUses,
        expires_at: params.expiresAt,
        is_active: true,
        used_count: 0
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating promo code', error, 'PROMO', params);
      return { success: false, error: 'Failed to create promo code' };
    }

    logger.info('Promo code created successfully', 'PROMO', { 
      code: params.code,
      type: params.type,
      value: params.value
    });

    return { success: true, promoCode };
  } catch (error) {
    logger.error('Error creating promo code', error as Error, 'PROMO', params);
    return { success: false, error: 'Error creating promo code' };
  }
}

/**
 * Get promo code usage statistics
 */
export async function getPromoCodeStats(promoCodeId: string): Promise<{
  totalUses: number;
  totalDiscount: number;
  recentUsage: PromoCodeUsage[];
} | null> {
  try {
    const supabase = await createClient();
    
    const { data: usage, error } = await supabase
      .from('promo_code_usage')
      .select('*')
      .eq('promo_code_id', promoCodeId)
      .order('used_at', { ascending: false });

    if (error) {
      logger.error('Error fetching promo code stats', error, 'PROMO', { promoCodeId });
      return null;
    }

    const totalUses = usage.length;
    const totalDiscount = usage.reduce((sum, u) => sum + u.discount_amount, 0);
    const recentUsage = usage.slice(0, 10); // Last 10 uses

    return {
      totalUses,
      totalDiscount,
      recentUsage
    };
  } catch (error) {
    logger.error('Error getting promo code stats', error as Error, 'PROMO', { promoCodeId });
    return null;
  }
}

/**
 * Database schema for promo codes (run in Supabase SQL editor)
 */
export const createPromoCodeTables = `
-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'credits')),
  value INTEGER NOT NULL, -- Percentage (0-100), amount in cents, or credit amount
  max_uses INTEGER, -- NULL means unlimited
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promo_code_usage table
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id TEXT, -- Reference to payment order
  discount_amount INTEGER NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_promo_id ON promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_user_id ON promo_code_usage(user_id);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promo_codes (public read for validation)
CREATE POLICY "Anyone can read active promo codes" ON promo_codes
  FOR SELECT USING (is_active = true);

-- RLS Policies for promo_code_usage (users can see their own usage)
CREATE POLICY "Users can view own promo code usage" ON promo_code_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Function to increment promo code usage
CREATE OR REPLACE FUNCTION increment_promo_code_usage(promo_code_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE promo_codes 
  SET used_count = used_count + 1 
  WHERE id = promo_code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;
