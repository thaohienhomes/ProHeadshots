'use server'

//The purpose of this file is to fix discrepancy for Fal AI

import { getFalPromptsFromDatabase } from './getFalPrompts';
import { updateUser } from './updateUser';

interface UserData {
  id: string;
  name: string;
  planType: "Basic" | "Professional" | "Executive";
  promptsResult: any[];
  apiStatus: {
    id: string;
    lora_url?: string;
    result?: {
      diffusers_lora_file?: {
        url: string;
      };
    };
  };
}

interface FalPrompt {
  id: string;
  text: string;
  images: string[];
  created_at: string;
  provider: string;
  num_images: number;
  status: string;
}

function getPlanLimit(planType: string): number {
  switch (planType.toLowerCase()) {
    case 'basic':
      return 10;
    case 'professional':
      return 100;
    case 'executive':
      return 200;
    default:
      return 10;
  }
}

export async function fixDiscrepancyFal(userData: UserData) {
  console.log("=== STARTING FAL AI DISCREPANCY FIX ===");
  console.log("User ID:", userData.id);
  console.log("Plan Type:", userData.planType);
  console.log("Current promptsResult count:", userData.promptsResult?.length || 0);

  const planLimit = getPlanLimit(userData.planType);
  const currentCount = userData.promptsResult?.length || 0;
  const missingImages = planLimit - currentCount;

  if (missingImages > 0) {
    console.log(`Missing ${missingImages} images for ${userData.planType} plan`);

    // Check if we have a LoRA URL to work with
    const loraUrl = userData.apiStatus?.lora_url || userData.apiStatus?.result?.diffusers_lora_file?.url;
    
    if (loraUrl) {
      try {
        // Get prompts from database (Fal AI stores results immediately)
        const falPrompts = await getFalPromptsFromDatabase(userData.id);
        
        // Log unique images from Fal AI prompts
        const uniqueFalImages = new Set(
          falPrompts.flatMap(prompt => prompt.images || [])
        );
        console.log("Total unique Fal AI images:", uniqueFalImages.size);

        // Get existing prompt IDs from promptsResult
        const existingPromptIds = new Set(
          userData.promptsResult?.map(item => item.data?.id) || []
        );

        console.log("Existing prompt IDs:", Array.from(existingPromptIds));

        // Find new prompts that aren't in promptsResult yet
        const newPrompts = falPrompts.filter(prompt => !existingPromptIds.has(prompt.id));
        
        console.log("New prompts found:", newPrompts.length);

        if (newPrompts.length > 0) {
          // Convert new prompts to the expected format
          const newPromptResults = newPrompts.map(prompt => ({
            timestamp: prompt.created_at,
            data: {
              id: prompt.id,
              text: prompt.text,
              images: prompt.images,
              num_images: prompt.num_images,
              provider: 'fal-ai',
              created_at: prompt.created_at,
              prompt: {
                id: prompt.id,
                text: prompt.text,
                num_images: prompt.num_images,
              }
            }
          }));

          // Combine existing and new results
          const updatedPromptsResult = [
            ...(userData.promptsResult || []),
            ...newPromptResults.slice(0, missingImages) // Only add what we need
          ];

          console.log("Updating user with new prompts. New total:", updatedPromptsResult.length);

          // Update the user with the new prompts
          const updateResult = await updateUser({
            promptsResult: updatedPromptsResult,
            workStatus: updatedPromptsResult.length >= planLimit ? 'complete' : 'ongoing'
          });

          if (updateResult.success) {
            console.log("✅ Successfully updated user with new Fal AI prompts");
            return {
              success: true,
              message: `Added ${newPromptResults.slice(0, missingImages).length} new prompts`,
              addedPrompts: newPromptResults.slice(0, missingImages).length,
              totalPrompts: updatedPromptsResult.length
            };
          } else {
            console.error("❌ Failed to update user:", updateResult.error);
            return {
              success: false,
              message: "Failed to update user with new prompts",
              error: updateResult.error
            };
          }
        } else {
          console.log("No new prompts found to add");
          return {
            success: true,
            message: "No new prompts found",
            addedPrompts: 0,
            totalPrompts: currentCount
          };
        }
      } catch (error) {
        console.error("Error fetching Fal AI prompts:", error);
        return {
          success: false,
          message: "Error fetching Fal AI prompts",
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      console.log("No LoRA URL found - cannot fetch Fal AI prompts");
      return {
        success: false,
        message: "No LoRA URL found in apiStatus",
        error: "Missing LoRA URL"
      };
    }
  } else {
    console.log("No missing images - user has sufficient prompts");
    return {
      success: true,
      message: "User already has sufficient prompts",
      addedPrompts: 0,
      totalPrompts: currentCount
    };
  }
}
