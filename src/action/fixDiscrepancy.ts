'use server'

//The purpose of this file is to fix discrepancy

import { getAstriaPrompts } from './getAstriaPrompts';
import { updateUser } from './updateUser';

interface UserData {
  id: string;
  name: string;
  planType: "Basic" | "Professional" | "Executive";
  promptsResult: any[];
  apiStatus: {
    id: number;
  };
}

interface Prompt {
  id: number;
  text: string;
  steps: number | null;
  images: string[];
  tune_id: number;
  created_at: string;
  trained_at: string;
  updated_at: string;
  negative_prompt: string;
  started_training_at: string;
  callback?: string;
}

async function getFinalImageUrl(redirectUrl: string): Promise<string> {
  try {
    const response = await fetch(redirectUrl, {
      redirect: 'follow',
      method: 'HEAD'
    });
    return response.url;
  } catch (error) {
    console.error('Error resolving image URL:', error);
    return redirectUrl; // Fallback to original URL if resolution fails
  }
}

export async function fixDiscrepancy(userData: UserData | null) {
  if (!userData) {
    console.log("No user data available to fix discrepancy");
    return;
  }

  const getPlanLimit = (planType: string) => {
    switch (planType.toLowerCase()) {
      case "basic":
        return 10;
      case "professional":
        return 100;
      case "executive":
        return 200;
      default:
        return 0;
    }
  };

  const planLimit = getPlanLimit(userData.planType);
  const currentCount = userData.promptsResult?.length || 0;
  const missingImages = planLimit - currentCount;

  if (missingImages > 0) {


    if (userData.apiStatus?.id) {
      try {
        const astriaPrompts = await getAstriaPrompts(userData.apiStatus.id.toString());
        
        // Get existing prompt IDs from promptsResult
        const existingPromptIds = new Set(
          userData.promptsResult?.map(item => item.data.prompt.id) || []
        );

        // Find unique prompts from Astria
        const uniqueAstriaPrompts = astriaPrompts.filter(
          prompt => !existingPromptIds.has(prompt.id)
        );

        // Create new entries in promptsResult format
        // @ts-expect-error Ignoring type mismatch for Astria API response
        const newPromptEntries = await Promise.all(uniqueAstriaPrompts.map(async (prompt: Prompt) => {
          // Resolve all image URLs
          const resolvedImages = await Promise.all(prompt.images.map(getFinalImageUrl));
          
          return {
            data: {
              prompt: {
                id: prompt.id,
                text: prompt.text,
                steps: prompt.steps,
                images: resolvedImages, // Use the resolved URLs
                tune_id: prompt.tune_id,
                created_at: prompt.created_at,
                trained_at: prompt.trained_at,
                updated_at: prompt.updated_at,
                negative_prompt: prompt.negative_prompt,
                started_training_at: prompt.started_training_at
              }
            },
            timestamp: new Date().toISOString()
          };
        }));

        // Combine existing and new prompts
        const updatedPromptsResult = [
          ...(userData.promptsResult || []),
          ...newPromptEntries
        ];

        await updateUser({
          promptsResult: updatedPromptsResult
        });

        return updatedPromptsResult;
      } catch (error) {
        console.error("Error in fixDiscrepancy:", error);
      }
    }
  }
} 