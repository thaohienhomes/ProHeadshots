"use server"

// Importing the Supabase client utility for server-side operations
import { createClient } from "@/utils/supabase/server";

// API key and domain for the external service
const API_KEY = process.env.ASTRIA_API_KEY; // Use API key from .env.local
const DOMAIN = 'https://api.astria.ai';

// Define the domain for the callback URL
const CALLBACK_DOMAIN = 'https://www.cvphoto.app';

export async function createTune(userData: any) {
  const supabase = createClient(); // Create Supabase client for database operations
  const user = userData[0]; // Extract user information from the input array
  const userId = user.id; // Access the user ID for further processing
  const { gender, userPhotos } = user; // Deconstruct gender and userPhotos

  const options = {
    method: 'POST',
    headers: { 
      'Authorization': 'Bearer ' + API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tune: {
        "title": userId,
        "branch": "flux1",
        "token": "ohwx",
        "model_type": "lora",
        "name": gender,
        "image_urls": userPhotos.userSelfies,
        "callback": `${CALLBACK_DOMAIN}/api/llm/tune-webhook?webhook_secret=${process.env.APP_WEBHOOK_SECRET}&user_id=${userId}`
      }
    })
  };

  try {
    const response = await fetch(DOMAIN + '/tunes', options);
    const result = await response.json();
    console.log("Response from Astria:", result);

    // Update user's API status and tuneStatus in Supabase
    const { error } = await supabase
      .from('userTable')
      .update({ 
        apiStatus: result,
        tuneStatus: 'ongoing'
      })
      .eq('id', userId);

    if (error) {
      console.error("Error updating apiStatus and tuneStatus in Supabase:", error);
    } else {
      console.log('API status and tuneStatus updated successfully');
    }

    return result;
  } catch (error) {
    console.error("Error creating tune:", error);
    throw error;
  }
}