"use server"

// Importing the getPromptsAttributes function from the prompts file
// This function always returns 10 prompts (one per style), which determines total images:
// - Basic Plan: 1 image × 10 prompts = 10 total images
// - Professional Plan: 10 images × 10 prompts = 100 total images
// - Executive Plan: 20 images × 10 prompts = 200 total images
import { getPromptsAttributes } from './prompts';
import { generateWithLora } from '@/utils/falAI';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateWithRetry(
  prompt: string,
  loraUrl: string,
  options: any,
  retries: number = 0
): Promise<any> {
  try {
    const result = await generateWithLora(prompt, loraUrl, options);
    return result;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`Retrying... (${retries + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY);
      return generateWithRetry(prompt, loraUrl, options, retries + 1);
    }
    throw error;
  }
}

// Single delay constant for rate limiting
const DELAY = 2000; // 2 seconds between API calls for Fal AI

/// Function to create prompts using Fal AI
export async function createPromptFal(userData: any) {
  const user = userData[0];
  const { id, planType, apiStatus } = user;

  // Extract the LoRA URL from apiStatus
  const loraUrl = apiStatus?.lora_url || apiStatus?.result?.diffusers_lora_file?.url;
  if (!loraUrl) {
    return { error: true, message: 'No LoRA URL found in user apiStatus' };
  }

  const webhookSecret = process.env.APP_WEBHOOK_SECRET;
  const basePrompts = getPromptsAttributes(user);
  
  // Add the custom LoRA trigger word to each prompt
  const prompts = basePrompts.map((prompt: any) => ({
    ...prompt,
    text: `ohwx ${prompt.text}` // Using the trigger word from training
  }));

  const results = [];

  // Images per prompt based on plan type, will be multiplied by 10 prompts
  const targetImagesPerPrompt = planType === "basic" ? 1 
    : planType === "professional" ? 10 
    : planType === "executive" ? 20 
    : 1;

  // Process prompts
  for (let promptIndex = 0; promptIndex < prompts.length; promptIndex++) {
    const prompt = prompts[promptIndex];
    try {
      console.log(`Processing Fal AI prompt ${promptIndex + 1}/${prompts.length}`);
      
      // Fal AI can generate multiple images in one call, but we'll batch them for reliability
      const maxImagesPerCall = 4; // Conservative batch size for Fal AI
      const numberOfCalls = Math.ceil(targetImagesPerPrompt / maxImagesPerCall);
      let remainingImages = targetImagesPerPrompt;

      // Multiple API calls for each prompt if needed
      for (let i = 0; i < numberOfCalls; i++) {
        const imagesThisCall = Math.min(maxImagesPerCall, remainingImages);
        remainingImages -= imagesThisCall;
        
        const options = {
          num_images: imagesThisCall,
          image_size: "portrait_4_3", // Good for headshots
          guidance_scale: 3.5,
          num_inference_steps: 28,
          enable_safety_checker: true,
        };

        const result = await generateWithRetry(prompt.text, loraUrl, options);
        
        // Transform Fal AI result to match expected format
        const transformedResult = {
          id: `fal-${Date.now()}-${i}`,
          text: prompt.text,
          images: result.images.map((img: any) => img.url),
          num_images: imagesThisCall,
          created_at: new Date().toISOString(),
          provider: "fal-ai",
          prompt: {
            id: `fal-prompt-${promptIndex}-${i}`,
            text: prompt.text,
            num_images: imagesThisCall,
          },
          // Simulate webhook callback for compatibility
          callback_data: {
            user_id: id,
            webhook_secret: webhookSecret,
            prompt_index: promptIndex,
            call_index: i,
          }
        };

        results.push(transformedResult);

        // Simulate webhook call to maintain compatibility with existing flow
        try {
          const webhookUrl = `https://www.cvphoto.app/api/llm/prompt-webhook-fal?webhook_secret=${webhookSecret}&user_id=${id}`;
          
          // We'll call our own webhook handler to process the result
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transformedResult),
          });
        } catch (webhookError) {
          console.error('Error calling webhook:', webhookError);
          // Don't fail the entire process for webhook errors
        }

        // Delay between API calls
        if (i < numberOfCalls - 1 || promptIndex < prompts.length - 1) {
          await sleep(DELAY);
        }
      }
    } catch (error) {
      console.error(`Error processing Fal AI prompt ${promptIndex + 1}:`, error);
      if (error instanceof Error) {
        return { error: true, message: error.message };
      }
      return { error: true, message: 'An unknown error occurred' };
    }
  }

  console.log('All Fal AI prompts initiated successfully:', results.length, 'results');
  return results;
}
