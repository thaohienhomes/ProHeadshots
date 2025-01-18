"use server"


// Importing the getPromptsAttributes function from the prompts file
import { getPromptsAttributes } from './prompts';

// API key and domain for the external service
const API_KEY = process.env.ASTRIA_API_KEY; // Use API key from .env.local
const headers = { Authorization: `Bearer ${API_KEY}` }

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, retries: number = 0): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }
    return response;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`Retrying... (${retries + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, retries + 1);
    }
    throw error;
  }
}

// More conservative delays
const DELAY_BETWEEN_CALLS = 10000;    // 10 seconds between API calls
const DELAY_BETWEEN_PROMPTS = 10000;  // 10 seconds between prompts
const MAX_CONCURRENT_REQUESTS = 5;    // Limit concurrent requests

// Function to create prompts
export async function createPrompt(userData: any) {
  const user = userData[0];
  const { id, planType } = user;

  const API_URL = `https://api.astria.ai/tunes/1504944/prompts`;
  const webhookSecret = process.env.APP_WEBHOOK_SECRET;

  const prompts = getPromptsAttributes(user);
  const results = [];

  const targetImagesPerPrompt = planType === "basic" ? 1 
    : planType === "professional" ? 10 
    : planType === "executive" ? 20 
    : 1;

  // Process prompts in smaller batches to avoid overwhelming Supabase
  for (let promptIndex = 0; promptIndex < prompts.length; promptIndex++) {
    const prompt = prompts[promptIndex];
    try {
      console.log(`Processing prompt ${promptIndex + 1}/${prompts.length}`);
      
      const numberOfCalls = Math.ceil(targetImagesPerPrompt / 8);
      let remainingImages = targetImagesPerPrompt;

      // Multiple API calls for each prompt if needed
      for (let i = 0; i < numberOfCalls; i++) {
        const imagesThisCall = Math.min(8, remainingImages);
        remainingImages -= imagesThisCall;
        
        const form = new FormData();
        form.append('prompt[text]', prompt.text);
        form.append('prompt[callback]', `https://aifotomagia.vercel.app/api/llm/prompt-webhook?webhook_secret=${webhookSecret}&user_id=${id}`);
        form.append('prompt[num_images]', imagesThisCall.toString());

        console.log(`Making API call ${i + 1}/${numberOfCalls} for prompt with ${imagesThisCall} images`);
        console.log('Form data:', Object.fromEntries(form.entries()));

        const response = await fetchWithRetry(API_URL, {
          method: 'POST',
          headers: headers,
          body: form
        });

        const result = await response.json();
        results.push(result);

        // Add longer delay between calls for the same prompt
        if (i < numberOfCalls - 1) {
          console.log(`Waiting ${DELAY_BETWEEN_CALLS}ms before next call...`);
          await sleep(DELAY_BETWEEN_CALLS);
        }
      }

      // Add longer delay between different prompts
      if (promptIndex < prompts.length - 1) {
        console.log(`Waiting ${DELAY_BETWEEN_PROMPTS}ms before next prompt...`);
        await sleep(DELAY_BETWEEN_PROMPTS);
      }

      // If we've processed MAX_CONCURRENT_REQUESTS prompts, take a longer break
      if ((promptIndex + 1) % MAX_CONCURRENT_REQUESTS === 0) {
        console.log('Taking a longer break to respect rate limits...');
        await sleep(DELAY_BETWEEN_PROMPTS * 2);
      }

    } catch (error) {
      console.error(`Error processing prompt ${promptIndex + 1}:`, error);
      if (error instanceof Error) {
        return { error: true, message: error.message };
      }
      return { error: true, message: 'An unknown error occurred' };
    }
  }

  console.log('All prompts initiated successfully:', results);
  return results;
}
