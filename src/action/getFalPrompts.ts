'use server'

import { z } from 'zod';

// Schema for validating request ID
const requestIdSchema = z.string().min(1, "Request ID is required");

export interface FalPrompt {
  id: string;
  text: string;
  images: string[];
  created_at: string;
  provider: string;
  num_images: number;
  status: string;
}

/**
 * Get prompts from Fal AI - this function simulates the Astria API behavior
 * but works with Fal AI's different architecture where prompts are generated immediately
 * rather than being stored and retrieved later.
 * 
 * In the Fal AI workflow, prompts are processed immediately and results are stored
 * in the user's promptsResult array in the database, so this function primarily
 * serves as a compatibility layer.
 */
export async function getFalPrompts(requestId: string): Promise<FalPrompt[]> {
  try {
    const validRequestId = requestIdSchema.parse(requestId);
    
    // For Fal AI, we don't have a direct API to fetch prompts like Astria
    // Instead, prompts are generated immediately and stored in the database
    // This function serves as a compatibility layer
    
    console.log(`Getting Fal AI prompts for request ID: ${validRequestId}`);
    
    // Since Fal AI doesn't store prompts in the same way as Astria,
    // we'll return an empty array or fetch from our database
    // In a real implementation, you might want to:
    // 1. Query your database for stored prompt results
    // 2. Use Fal AI's queue status API to check job status
    // 3. Return cached results
    
    // For now, return empty array as prompts are handled differently in Fal AI
    const prompts: FalPrompt[] = [];
    
    console.log(`Found ${prompts.length} Fal AI prompts`);
    return prompts;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid request ID: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    console.error('Error fetching Fal AI prompts:', error);
    throw new Error(`Failed to fetch Fal AI prompts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Alternative function to get prompts from database for Fal AI workflow
 * This is more appropriate for the Fal AI architecture where results are stored immediately
 */
export async function getFalPromptsFromDatabase(userId: string): Promise<FalPrompt[]> {
  try {
    // This would typically query your Supabase database
    // to get the promptsResult array for the user
    
    // Import Supabase client
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();
    
    const { data: userData, error } = await supabase
      .from('userTable')
      .select('promptsResult')
      .eq('id', userId)
      .single();
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!userData?.promptsResult) {
      return [];
    }
    
    // Transform database results to match expected format
    const prompts: FalPrompt[] = userData.promptsResult
      .filter((result: any) => result.data?.provider === 'fal-ai')
      .map((result: any, index: number) => ({
        id: result.data?.id || `fal-${index}`,
        text: result.data?.text || '',
        images: result.data?.images || [],
        created_at: result.timestamp || result.data?.created_at || new Date().toISOString(),
        provider: 'fal-ai',
        num_images: result.data?.num_images || result.data?.images?.length || 0,
        status: 'completed',
      }));
    
    console.log(`Found ${prompts.length} Fal AI prompts in database for user ${userId}`);
    return prompts;
    
  } catch (error) {
    console.error('Error fetching Fal AI prompts from database:', error);
    throw new Error(`Failed to fetch Fal AI prompts from database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
