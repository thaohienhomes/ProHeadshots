import { createClient } from '@/utils/supabase/client';

/**
 * Client-side credit system functions
 * These are simplified versions for client components
 * Actual credit operations should be handled server-side for security
 */

/**
 * Calculate credits needed for AI generation (client-side)
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
 * Get user's current credit balance (client-side)
 */
export async function getUserCreditsClient(userId: string): Promise<{
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
} | null> {
  try {
    const supabase = createClient();
    
    // Get user's credit transactions
    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching credit transactions:', error);
      return null;
    }

    // Calculate totals
    const totalCredits = transactions
      ?.filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    
    const usedCredits = Math.abs(transactions
      ?.filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0) || 0);

    const remainingCredits = totalCredits - usedCredits;

    return {
      total_credits: totalCredits,
      used_credits: usedCredits,
      remaining_credits: remainingCredits
    };
  } catch (error) {
    console.error('Error calculating user credits:', error);
    return null;
  }
}

/**
 * Check if user has enough credits (client-side check)
 * Note: This is for UI purposes only. Server-side validation is required.
 */
export async function checkCreditsAvailable(
  userId: string,
  creditsNeeded: number
): Promise<boolean> {
  try {
    const credits = await getUserCreditsClient(userId);
    return credits ? credits.remaining_credits >= creditsNeeded : false;
  } catch (error) {
    console.error('Error checking credits availability:', error);
    return false;
  }
}

/**
 * Get credit pricing based on plan (client-side)
 */
export function getCreditPricing(planType: string): { credits: number; price: number } {
  const pricing = {
    'basic': { credits: 10, price: 29 },
    'professional': { credits: 100, price: 39 },
    'executive': { credits: 200, price: 59 }
  };

  return pricing[planType.toLowerCase() as keyof typeof pricing] || pricing.basic;
}
