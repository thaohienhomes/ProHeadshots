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

// Function to create prompts
export async function createPrompt(userData: any) {
  const user = userData[0];
  const { id, planType } = user;

  const imagePerPrompt = planType === "basic" ? "1" : planType === "professional" ? "10" : planType === "executive" ? "20" : "1";

  const API_URL = `https://api.astria.ai/tunes/1504944/prompts`;
  const webhookSecret = process.env.APP_WEBHOOK_SECRET;

  const prompts = getPromptsAttributes(user);

  const results = [];

  for (const prompt of prompts) {
    try {
      const form = new FormData();
      form.append('prompt[text]', prompt.text);
      form.append('prompt[callback]', `https://www.cvphoto.app/api/llm/prompt-webhook?webhook_secret=${webhookSecret}&user_id=${id}`);
      form.append('prompt[num_images]', imagePerPrompt);

      console.log('Form data:', Object.fromEntries(form.entries()));
      console.log("API_URL", API_URL);

      const response = await fetchWithRetry(API_URL, {
        method: 'POST',
        headers: headers,
        body: form
      });

      const result = await response.json();

      results.push(result);
    } catch (error) {
      // Type-check the error before accessing its properties
      if (error instanceof Error) {
        return { error: true, message: error.message };
      }
      // Fallback for non-Error objects
      return { error: true, message: 'An unknown error occurred' };
    }
  }

  console.log('Prompts initiated successfully:', results);
  return results;
}
