'use server';

import { createClient } from '@supabase/supabase-js';
import { getPredictionStatus } from '@/utils/replicateAI';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ReplicatePrompt {
  id: string;
  user_id: string;
  tune_id?: string;
  prompt: string;
  negative_prompt?: string;
  replicate_prediction_id: string;
  status: string;
  image_urls?: string[];
  error_message?: string;
  created_at: string;
  updated_at: string;
  provider: string;
  model_type: string;
  generation_config: any;
}

/**
 * Get prompts from database for a specific user
 */
export async function getReplicatePromptsFromDatabase(userId: string): Promise<ReplicatePrompt[]> {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'replicate')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Replicate prompts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getReplicatePromptsFromDatabase:', error);
    return [];
  }
}

/**
 * Get a specific prompt by ID
 */
export async function getReplicatePromptById(promptId: string): Promise<ReplicatePrompt | null> {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .eq('provider', 'replicate')
      .single();

    if (error) {
      console.error('Error fetching Replicate prompt:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getReplicatePromptById:', error);
    return null;
  }
}

/**
 * Update prompt status and results from Replicate
 */
export async function updateReplicatePromptStatus(promptId: string): Promise<ReplicatePrompt | null> {
  try {
    // Get current prompt data
    const prompt = await getReplicatePromptById(promptId);
    if (!prompt) {
      return null;
    }

    // Get latest status from Replicate
    const statusResult = await getPredictionStatus(prompt.replicate_prediction_id);

    // Update database
    const { data, error } = await supabase
      .from('prompts')
      .update({
        status: statusResult.status,
        updated_at: new Date().toISOString(),
        ...(statusResult.urls && { image_urls: statusResult.urls }),
        ...(statusResult.error && { error_message: statusResult.error }),
      })
      .eq('id', promptId)
      .select()
      .single();

    if (error) {
      console.error('Error updating prompt status:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateReplicatePromptStatus:', error);
    return null;
  }
}

/**
 * Get prompts with pending status and update them
 */
export async function refreshPendingReplicatePrompts(userId: string): Promise<ReplicatePrompt[]> {
  try {
    // Get all pending prompts for user
    const { data: pendingPrompts, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'replicate')
      .in('status', ['starting', 'processing'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending prompts:', error);
      return [];
    }

    if (!pendingPrompts || pendingPrompts.length === 0) {
      return [];
    }

    // Update each pending prompt
    const updatedPrompts: ReplicatePrompt[] = [];
    for (const prompt of pendingPrompts) {
      const updated = await updateReplicatePromptStatus(prompt.id);
      if (updated) {
        updatedPrompts.push(updated);
      }
    }

    return updatedPrompts;
  } catch (error) {
    console.error('Error in refreshPendingReplicatePrompts:', error);
    return [];
  }
}

/**
 * Delete a prompt and its associated data
 */
export async function deleteReplicatePrompt(promptId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', promptId)
      .eq('user_id', userId)
      .eq('provider', 'replicate');

    if (error) {
      console.error('Error deleting prompt:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteReplicatePrompt:', error);
    return false;
  }
}

/**
 * Get prompts for a specific tune
 */
export async function getReplicatePromptsByTune(tuneId: string, userId: string): Promise<ReplicatePrompt[]> {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('tune_id', tuneId)
      .eq('user_id', userId)
      .eq('provider', 'replicate')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompts by tune:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getReplicatePromptsByTune:', error);
    return [];
  }
}

/**
 * Get generation statistics for a user
 */
export async function getReplicateGenerationStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('status, created_at')
      .eq('user_id', userId)
      .eq('provider', 'replicate');

    if (error) {
      console.error('Error fetching generation stats:', error);
      return {
        total: 0,
        succeeded: 0,
        failed: 0,
        pending: 0,
      };
    }

    const stats = {
      total: data.length,
      succeeded: data.filter(p => p.status === 'succeeded').length,
      failed: data.filter(p => p.status === 'failed').length,
      pending: data.filter(p => ['starting', 'processing'].includes(p.status)).length,
    };

    return stats;
  } catch (error) {
    console.error('Error in getReplicateGenerationStats:', error);
    return {
      total: 0,
      succeeded: 0,
      failed: 0,
      pending: 0,
    };
  }
}
