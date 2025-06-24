import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number; // Positive for credits added, negative for credits used
  type: 'purchase' | 'usage' | 'bonus' | 'refund';
  description: string;
  order_id?: string;
  created_at: string;
}

export interface UserCredits {
  user_id: string;
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
  last_updated: string;
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<UserCredits | null> {
  try {
    const supabase = await createClient();
    
    // Get user's credit transactions
    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching credit transactions', error, 'CREDITS', { userId });
      return null;
    }

    // Calculate totals
    const totalCredits = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const usedCredits = Math.abs(transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    const remainingCredits = totalCredits - usedCredits;

    return {
      user_id: userId,
      total_credits: totalCredits,
      used_credits: usedCredits,
      remaining_credits: remainingCredits,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error calculating user credits', error as Error, 'CREDITS', { userId });
    return null;
  }
}

/**
 * Add credits to user account (e.g., after purchase)
 */
export async function addCredits(
  userId: string, 
  amount: number, 
  type: 'purchase' | 'bonus' | 'refund',
  description: string,
  orderId?: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const transaction: Omit<CreditTransaction, 'id' | 'created_at'> = {
      user_id: userId,
      amount: Math.abs(amount), // Ensure positive
      type,
      description,
      order_id: orderId
    };

    const { error } = await supabase
      .from('credit_transactions')
      .insert(transaction);

    if (error) {
      logger.error('Error adding credits', error, 'CREDITS', { userId, amount, type });
      return false;
    }

    logger.info('Credits added successfully', 'CREDITS', { 
      userId, 
      amount, 
      type, 
      description 
    });
    
    return true;
  } catch (error) {
    logger.error('Error adding credits', error as Error, 'CREDITS', { userId, amount });
    return false;
  }
}

/**
 * Deduct credits (e.g., for AI generation)
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; remainingCredits?: number }> {
  try {
    const supabase = await createClient();
    
    // Check if user has enough credits
    const currentCredits = await getUserCredits(userId);
    if (!currentCredits || currentCredits.remaining_credits < amount) {
      logger.warn('Insufficient credits', 'CREDITS', { 
        userId, 
        requested: amount, 
        available: currentCredits?.remaining_credits || 0 
      });
      return { success: false };
    }

    // Deduct credits
    const transaction: Omit<CreditTransaction, 'id' | 'created_at'> = {
      user_id: userId,
      amount: -Math.abs(amount), // Negative for usage
      type: 'usage',
      description
    };

    const { error } = await supabase
      .from('credit_transactions')
      .insert(transaction);

    if (error) {
      logger.error('Error using credits', error, 'CREDITS', { userId, amount });
      return { success: false };
    }

    const newBalance = currentCredits.remaining_credits - amount;
    
    logger.info('Credits used successfully', 'CREDITS', { 
      userId, 
      amount, 
      description,
      remainingCredits: newBalance
    });
    
    return { success: true, remainingCredits: newBalance };
  } catch (error) {
    logger.error('Error using credits', error as Error, 'CREDITS', { userId, amount });
    return { success: false };
  }
}

/**
 * Get credit pricing based on plan
 */
export function getCreditPricing(planType: string): { credits: number; price: number } {
  const pricing = {
    'basic': { credits: 10, price: 29 },
    'professional': { credits: 100, price: 39 },
    'executive': { credits: 200, price: 59 }
  };

  return pricing[planType.toLowerCase() as keyof typeof pricing] || pricing.basic;
}

/**
 * Calculate credits needed for AI generation
 */
export function calculateCreditsNeeded(
  imageCount: number = 1,
  modelType: string = 'standard',
  qualityLevel: string = 'standard'
): number {
  let baseCredits = 1; // Base cost per image
  
  // Model type multiplier
  const modelMultipliers = {
    'flux-pro-ultra': 2,
    'imagen4': 1.5,
    'recraft-v3': 1.2,
    'standard': 1
  };
  
  // Quality multiplier
  const qualityMultipliers = {
    'ultra': 2,
    'high': 1.5,
    'standard': 1
  };
  
  const modelMultiplier = modelMultipliers[modelType as keyof typeof modelMultipliers] || 1;
  const qualityMultiplier = qualityMultipliers[qualityLevel as keyof typeof qualityMultipliers] || 1;
  
  return Math.ceil(baseCredits * imageCount * modelMultiplier * qualityMultiplier);
}

/**
 * Create credit transaction table (run this in Supabase SQL editor)
 */
export const createCreditTransactionTable = `
-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for credits added, negative for credits used
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus', 'refund')),
  description TEXT NOT NULL,
  order_id TEXT, -- Reference to payment order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);

-- Enable RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own credit transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to get user credit balance
CREATE OR REPLACE FUNCTION get_user_credit_balance(user_uuid UUID)
RETURNS TABLE(
  total_credits INTEGER,
  used_credits INTEGER,
  remaining_credits INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0)::INTEGER as total_credits,
    COALESCE(ABS(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END)), 0)::INTEGER as used_credits,
    COALESCE(SUM(amount), 0)::INTEGER as remaining_credits
  FROM credit_transactions 
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;
