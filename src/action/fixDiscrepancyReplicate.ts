'use server';

import { createClient } from '@supabase/supabase-js';
import { getPredictionStatus, getTrainingStatus } from '@/utils/replicateAI';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface DiscrepancyResult {
  success: boolean;
  message: string;
  updated_count: number;
  errors: string[];
}

/**
 * Fix discrepancies between Replicate API and local database for prompts
 */
export async function fixDiscrepancyReplicate(userId?: string): Promise<DiscrepancyResult> {
  const errors: string[] = [];
  let updatedCount = 0;

  try {
    // Build query for prompts
    let query = supabase
      .from('prompts')
      .select('*')
      .eq('provider', 'replicate')
      .in('status', ['starting', 'processing']); // Only check pending ones

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: prompts, error: promptError } = await query;

    if (promptError) {
      errors.push(`Error fetching prompts: ${promptError.message}`);
      return {
        success: false,
        message: 'Failed to fetch prompts from database',
        updated_count: 0,
        errors,
      };
    }

    // Update each prompt
    for (const prompt of prompts || []) {
      try {
        const statusResult = await getPredictionStatus(prompt.replicate_prediction_id);
        
        // Only update if status has changed
        if (statusResult.status !== prompt.status) {
          const { error: updateError } = await supabase
            .from('prompts')
            .update({
              status: statusResult.status,
              updated_at: new Date().toISOString(),
              ...(statusResult.urls && { image_urls: statusResult.urls }),
              ...(statusResult.error && { error_message: statusResult.error }),
            })
            .eq('id', prompt.id);

          if (updateError) {
            errors.push(`Error updating prompt ${prompt.id}: ${updateError.message}`);
          } else {
            updatedCount++;
          }
        }
      } catch (error) {
        errors.push(`Error checking prompt ${prompt.id}: ${error}`);
      }
    }

    // Fix discrepancies for tunes as well
    const tuneResult = await fixTuneDiscrepancies(userId);
    updatedCount += tuneResult.updated_count;
    errors.push(...tuneResult.errors);

    return {
      success: errors.length === 0,
      message: `Updated ${updatedCount} records${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
      updated_count: updatedCount,
      errors,
    };

  } catch (error) {
    errors.push(`Unexpected error: ${error}`);
    return {
      success: false,
      message: 'Unexpected error occurred',
      updated_count: updatedCount,
      errors,
    };
  }
}

/**
 * Fix discrepancies for training/tunes
 */
async function fixTuneDiscrepancies(userId?: string): Promise<DiscrepancyResult> {
  const errors: string[] = [];
  let updatedCount = 0;

  try {
    // Build query for tunes
    let query = supabase
      .from('tunes')
      .select('*')
      .eq('provider', 'replicate')
      .in('status', ['starting', 'processing']); // Only check pending ones

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: tunes, error: tuneError } = await query;

    if (tuneError) {
      errors.push(`Error fetching tunes: ${tuneError.message}`);
      return {
        success: false,
        message: 'Failed to fetch tunes from database',
        updated_count: 0,
        errors,
      };
    }

    // Update each tune
    for (const tune of tunes || []) {
      try {
        const statusResult = await getTrainingStatus(tune.replicate_training_id);
        
        // Only update if status has changed
        if (statusResult.status !== tune.status) {
          const { error: updateError } = await supabase
            .from('tunes')
            .update({
              status: statusResult.status,
              updated_at: new Date().toISOString(),
              ...(statusResult.output && { model_url: statusResult.output.weights }),
              ...(statusResult.error && { error_message: statusResult.error }),
            })
            .eq('id', tune.id);

          if (updateError) {
            errors.push(`Error updating tune ${tune.id}: ${updateError.message}`);
          } else {
            updatedCount++;
          }
        }
      } catch (error) {
        errors.push(`Error checking tune ${tune.id}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      message: `Updated ${updatedCount} tune records`,
      updated_count: updatedCount,
      errors,
    };

  } catch (error) {
    errors.push(`Unexpected error in tune discrepancy fix: ${error}`);
    return {
      success: false,
      message: 'Unexpected error occurred',
      updated_count: 0,
      errors,
    };
  }
}

/**
 * Fix discrepancies for a specific prompt
 */
export async function fixPromptDiscrepancy(promptId: string): Promise<DiscrepancyResult> {
  try {
    const { data: prompt, error: fetchError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .eq('provider', 'replicate')
      .single();

    if (fetchError || !prompt) {
      return {
        success: false,
        message: 'Prompt not found',
        updated_count: 0,
        errors: [fetchError?.message || 'Prompt not found'],
      };
    }

    const statusResult = await getPredictionStatus(prompt.replicate_prediction_id);

    const { error: updateError } = await supabase
      .from('prompts')
      .update({
        status: statusResult.status,
        updated_at: new Date().toISOString(),
        ...(statusResult.urls && { image_urls: statusResult.urls }),
        ...(statusResult.error && { error_message: statusResult.error }),
      })
      .eq('id', promptId);

    if (updateError) {
      return {
        success: false,
        message: 'Failed to update prompt',
        updated_count: 0,
        errors: [updateError.message],
      };
    }

    return {
      success: true,
      message: 'Prompt updated successfully',
      updated_count: 1,
      errors: [],
    };

  } catch (error) {
    return {
      success: false,
      message: 'Unexpected error occurred',
      updated_count: 0,
      errors: [String(error)],
    };
  }
}

/**
 * Fix discrepancies for a specific tune
 */
export async function fixTuneDiscrepancy(tuneId: string): Promise<DiscrepancyResult> {
  try {
    const { data: tune, error: fetchError } = await supabase
      .from('tunes')
      .select('*')
      .eq('id', tuneId)
      .eq('provider', 'replicate')
      .single();

    if (fetchError || !tune) {
      return {
        success: false,
        message: 'Tune not found',
        updated_count: 0,
        errors: [fetchError?.message || 'Tune not found'],
      };
    }

    const statusResult = await getTrainingStatus(tune.replicate_training_id);

    const { error: updateError } = await supabase
      .from('tunes')
      .update({
        status: statusResult.status,
        updated_at: new Date().toISOString(),
        ...(statusResult.output && { model_url: statusResult.output.weights }),
        ...(statusResult.error && { error_message: statusResult.error }),
      })
      .eq('id', tuneId);

    if (updateError) {
      return {
        success: false,
        message: 'Failed to update tune',
        updated_count: 0,
        errors: [updateError.message],
      };
    }

    return {
      success: true,
      message: 'Tune updated successfully',
      updated_count: 1,
      errors: [],
    };

  } catch (error) {
    return {
      success: false,
      message: 'Unexpected error occurred',
      updated_count: 0,
      errors: [String(error)],
    };
  }
}
