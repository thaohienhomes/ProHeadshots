import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';
import { addCredits } from '@/utils/creditSystem';

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  uses_count: number;
  max_uses?: number;
  reward_type: 'credits' | 'discount' | 'free_generation';
  reward_value: number;
  referrer_reward_type: 'credits' | 'discount' | 'commission';
  referrer_reward_value: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface ReferralUsage {
  id: string;
  referral_code_id: string;
  referrer_user_id: string;
  referred_user_id: string;
  reward_given: boolean;
  referrer_reward_given: boolean;
  order_id?: string;
  used_at: string;
}

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalRewardsEarned: number;
  conversionRate: number;
  topReferrers: Array<{
    userId: string;
    referralCount: number;
    rewardsEarned: number;
  }>;
}

/**
 * Generate a unique referral code for a user
 */
export async function generateReferralCode(
  userId: string,
  rewardType: 'credits' | 'discount' | 'free_generation' = 'credits',
  rewardValue: number = 10,
  referrerRewardType: 'credits' | 'discount' | 'commission' = 'credits',
  referrerRewardValue: number = 5,
  maxUses?: number,
  expiresAt?: string
): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Check if user already has an active referral code
    const { data: existingCode } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (existingCode) {
      return { success: true, code: existingCode.code };
    }

    // Generate unique code
    const code = await generateUniqueCode();
    
    const referralCode: Omit<ReferralCode, 'id' | 'created_at'> = {
      user_id: userId,
      code,
      uses_count: 0,
      max_uses: maxUses,
      reward_type: rewardType,
      reward_value: rewardValue,
      referrer_reward_type: referrerRewardType,
      referrer_reward_value: referrerRewardValue,
      is_active: true,
      expires_at: expiresAt
    };

    const { error } = await supabase
      .from('referral_codes')
      .insert(referralCode);

    if (error) {
      logger.error('Error creating referral code', error, 'REFERRAL', { userId });
      return { success: false, error: 'Failed to create referral code' };
    }

    logger.info('Referral code created', 'REFERRAL', { userId, code });
    return { success: true, code };

  } catch (error) {
    logger.error('Error generating referral code', error as Error, 'REFERRAL', { userId });
    return { success: false, error: 'Error generating referral code' };
  }
}

/**
 * Apply a referral code when a user signs up
 */
export async function applyReferralCode(
  referralCode: string,
  newUserId: string
): Promise<{ success: boolean; rewards?: { user: any; referrer: any }; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Get referral code details
    const { data: codeData, error: codeError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', referralCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (codeError || !codeData) {
      return { success: false, error: 'Invalid or expired referral code' };
    }

    // Check if code has expired
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return { success: false, error: 'Referral code has expired' };
    }

    // Check usage limit
    if (codeData.max_uses && codeData.uses_count >= codeData.max_uses) {
      return { success: false, error: 'Referral code usage limit reached' };
    }

    // Check if user already used a referral code
    const { data: existingUsage } = await supabase
      .from('referral_usage')
      .select('id')
      .eq('referred_user_id', newUserId)
      .single();

    if (existingUsage) {
      return { success: false, error: 'User has already used a referral code' };
    }

    // Record referral usage
    const usage: Omit<ReferralUsage, 'id'> = {
      referral_code_id: codeData.id,
      referrer_user_id: codeData.user_id,
      referred_user_id: newUserId,
      reward_given: false,
      referrer_reward_given: false,
      used_at: new Date().toISOString()
    };

    const { error: usageError } = await supabase
      .from('referral_usage')
      .insert(usage);

    if (usageError) {
      logger.error('Error recording referral usage', usageError, 'REFERRAL', { referralCode, newUserId });
      return { success: false, error: 'Failed to apply referral code' };
    }

    // Update referral code usage count
    await supabase
      .from('referral_codes')
      .update({ uses_count: codeData.uses_count + 1 })
      .eq('id', codeData.id);

    // Give immediate rewards (for signup)
    const rewards = await giveReferralRewards(codeData, newUserId);

    logger.info('Referral code applied successfully', 'REFERRAL', {
      referralCode,
      newUserId,
      referrerUserId: codeData.user_id
    });

    return { success: true, rewards };

  } catch (error) {
    logger.error('Error applying referral code', error as Error, 'REFERRAL', { referralCode, newUserId });
    return { success: false, error: 'Error applying referral code' };
  }
}

/**
 * Give referral rewards to both users
 */
async function giveReferralRewards(
  referralCode: ReferralCode,
  referredUserId: string
): Promise<{ user: any; referrer: any }> {
  const userReward = { type: referralCode.reward_type, value: referralCode.reward_value };
  const referrerReward = { type: referralCode.referrer_reward_type, value: referralCode.referrer_reward_value };

  // Give reward to referred user
  if (referralCode.reward_type === 'credits') {
    await addCredits(
      referredUserId,
      referralCode.reward_value,
      'bonus',
      'Referral signup bonus'
    );
  }

  // Give reward to referrer
  if (referralCode.referrer_reward_type === 'credits') {
    await addCredits(
      referralCode.user_id,
      referralCode.referrer_reward_value,
      'bonus',
      'Referral reward'
    );
  }

  return { user: userReward, referrer: referrerReward };
}

/**
 * Get user's referral statistics
 */
export async function getUserReferralStats(userId: string): Promise<{
  referralCode?: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingRewards: number;
  totalRewardsEarned: number;
  recentReferrals: Array<{
    referredUserId: string;
    usedAt: string;
    rewardGiven: boolean;
  }>;
}> {
  try {
    const supabase = await createClient();

    // Get user's referral code
    const { data: referralCode } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    // Get referral usage statistics
    const { data: referralUsage } = await supabase
      .from('referral_usage')
      .select('*')
      .eq('referrer_user_id', userId)
      .order('used_at', { ascending: false });

    const totalReferrals = referralUsage?.length || 0;
    const successfulReferrals = referralUsage?.filter(r => r.referrer_reward_given).length || 0;
    const pendingRewards = referralUsage?.filter(r => !r.referrer_reward_given).length || 0;

    // Mock total rewards earned (would be calculated from actual reward records)
    const totalRewardsEarned = successfulReferrals * 5; // Assuming 5 credits per referral

    const recentReferrals = (referralUsage || []).slice(0, 10).map(usage => ({
      referredUserId: usage.referred_user_id,
      usedAt: usage.used_at,
      rewardGiven: usage.referrer_reward_given
    }));

    return {
      referralCode: referralCode?.code,
      totalReferrals,
      successfulReferrals,
      pendingRewards,
      totalRewardsEarned,
      recentReferrals
    };

  } catch (error) {
    logger.error('Error getting user referral stats', error as Error, 'REFERRAL', { userId });
    return {
      totalReferrals: 0,
      successfulReferrals: 0,
      pendingRewards: 0,
      totalRewardsEarned: 0,
      recentReferrals: []
    };
  }
}

/**
 * Get overall referral system statistics
 */
export async function getReferralSystemStats(): Promise<ReferralStats> {
  try {
    const supabase = await createClient();

    // Get all referral usage
    const { data: allUsage } = await supabase
      .from('referral_usage')
      .select('*');

    const totalReferrals = allUsage?.length || 0;
    const successfulReferrals = allUsage?.filter(r => r.referrer_reward_given).length || 0;
    const conversionRate = totalReferrals > 0 ? (successfulReferrals / totalReferrals) * 100 : 0;

    // Calculate total rewards earned (mock calculation)
    const totalRewardsEarned = successfulReferrals * 5;

    // Get top referrers
    const referrerStats = allUsage?.reduce((acc, usage) => {
      const referrerId = usage.referrer_user_id;
      if (!acc[referrerId]) {
        acc[referrerId] = { referralCount: 0, rewardsEarned: 0 };
      }
      acc[referrerId].referralCount++;
      if (usage.referrer_reward_given) {
        acc[referrerId].rewardsEarned += 5; // Mock reward amount
      }
      return acc;
    }, {} as Record<string, { referralCount: number; rewardsEarned: number }>) || {};

    const topReferrers = Object.entries(referrerStats)
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, 10);

    return {
      totalReferrals,
      successfulReferrals,
      totalRewardsEarned,
      conversionRate,
      topReferrers
    };

  } catch (error) {
    logger.error('Error getting referral system stats', error as Error, 'REFERRAL');
    return {
      totalReferrals: 0,
      successfulReferrals: 0,
      totalRewardsEarned: 0,
      conversionRate: 0,
      topReferrers: []
    };
  }
}

/**
 * Generate a unique referral code
 */
async function generateUniqueCode(): Promise<string> {
  const supabase = await createClient();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateRandomCode();
    
    const { data: existing } = await supabase
      .from('referral_codes')
      .select('id')
      .eq('code', code)
      .single();

    if (!existing) {
      return code;
    }
    
    attempts++;
  }

  throw new Error('Failed to generate unique referral code');
}

/**
 * Generate a random referral code
 */
function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Database schema for referral system (run in Supabase SQL editor)
 */
export const createReferralTables = `
-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('credits', 'discount', 'free_generation')),
  reward_value INTEGER NOT NULL,
  referrer_reward_type TEXT NOT NULL CHECK (referrer_reward_type IN ('credits', 'discount', 'commission')),
  referrer_reward_value INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral_usage table
CREATE TABLE IF NOT EXISTS referral_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_given BOOLEAN DEFAULT false,
  referrer_reward_given BOOLEAN DEFAULT false,
  order_id TEXT,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_usage_referrer ON referral_usage(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_usage_referred ON referral_usage(referred_user_id);

-- Enable RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own referral codes" ON referral_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral codes" ON referral_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own referral usage" ON referral_usage
  FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);
`;
