'use server'

import { z } from 'zod';

// Type for the prompt response
export type Prompt = {
  id: number;
  text: string;
  images: string[];
  created_at: string;
};

// Schema validation for the tune ID
const tuneIdSchema = z.string().min(1);

export async function getAstriaPrompts(tuneId: string) {
  try {
    const validTuneId = tuneIdSchema.parse(tuneId);
    const API_KEY = process.env.ASTRIA_API_KEY;
    let allPrompts: Prompt[] = [];
    let offset = 0;
    const PAGE_SIZE = 20;

    while (true) {
      const response = await fetch(
        `https://api.astria.ai/tunes/${validTuneId}/prompts?offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch prompts: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      if (data.length === 0) break; // No more prompts to fetch

      allPrompts = [...allPrompts, ...data];
      offset += PAGE_SIZE;
    }

    const uniqueUrls = new Set(allPrompts.flatMap((prompt: Prompt) => prompt.images)).size;
    console.log("Total Unique URLs from Astria:", uniqueUrls);
    return allPrompts;
  } catch (error) {
    console.error("Error fetching Astria prompts:", error);
    throw error;
  }
} 
