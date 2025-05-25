"use server"

// Importing the Supabase client utility for server-side operations
import { createClient } from "@/utils/supabase/server";
import { getRequiredPhotoCount } from "@/utils/photoConfig";

// API key and domain for the external service
const API_KEY = process.env.ASTRIA_API_KEY; // Use API key from .env.local
const DOMAIN = 'https://api.astria.ai';

// Define the domain for the callback URL
const CALLBACK_DOMAIN = 'https://www.cvphoto.app';

export async function createTune(userData: any) {
  const supabase = await createClient(); // Create Supabase client for database operations
  const user = userData[0]; // Extract user information from the input array
  const userId = user.id; // Access the user ID for further processing

  // 🛡️ RACE CONDITION PROTECTION - Check current state and claim the slot atomically
  const { data: currentUser, error: fetchError } = await supabase
    .from('userTable')
    .select('apiStatus, tuneStatus, workStatus, submissionDate')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error("Error fetching current user state:", fetchError);
    return;
  }

  // 🛡️ STRONGEST PROTECTION - Exit early if ANY API call was ever made successfully
  if (currentUser.apiStatus) {
    console.log('❌ BLOCKED: API call already made for this user. ApiStatus exists:', currentUser.apiStatus);
    return;
  }

  // Exit early if already processed or in progress
  if (currentUser.tuneStatus === 'ongoing' || 
      currentUser.tuneStatus === 'completed' ||
      currentUser.workStatus !== 'ongoing') {
    console.log('Tune already in progress, completed, or user not in correct state');
    return;
  }

  // 🛡️ SUBMISSION DATE PROTECTION - Prevent multiple submissions within 24 hours
  // TEMPORARILY DISABLED FOR DEVELOPMENT TESTING
  if (process.env.NODE_ENV === 'production' && currentUser.submissionDate) {
    const lastSubmission = new Date(currentUser.submissionDate);
    const now = new Date();
    const timeDifference = now.getTime() - lastSubmission.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (timeDifference < twentyFourHours) {
      console.log('Submission blocked: Last submission was less than 24 hours ago');
      return;
    }
  }

  // 🛡️ DATA VALIDATION PROTECTION - Ensure all required data exists before expensive API call
  const { name, age, bodyType, height, ethnicity, eyeColor, styles } = user;
  const gender = user.gender;
  const userPhotos = user.userPhotos;

  // Validate personal information
  const hasPersonalInfo = name && age && bodyType && height && ethnicity && gender && eyeColor;
  if (!hasPersonalInfo) {
    console.error('Personal information incomplete - blocking API call');
    return;
  }

  // Validate photos - environment dependent
  const requiredPhotoCount = getRequiredPhotoCount();
  const hasPhotos = userPhotos?.userSelfies && Array.isArray(userPhotos.userSelfies) && userPhotos.userSelfies.length >= requiredPhotoCount;
  if (!hasPhotos) {
    console.error(`Photos incomplete - need at least ${requiredPhotoCount} photos - blocking API call`);
    return;
  }

  // Validate styles
  const hasStyles = styles && Array.isArray(styles) && styles.length > 0;
  if (!hasStyles) {
    console.error('Style selection incomplete - blocking API call');
    return;
  }

  console.log('All data validation passed - proceeding with API call');

  // 🔒 ATOMIC CLAIM - Only one process can successfully update tuneStatus from null to 'ongoing'
  const { error: claimError } = await supabase
    .from('userTable')
    .update({ tuneStatus: 'ongoing' })
    .eq('id', userId)
    .is('tuneStatus', null); // Only succeed if tuneStatus is still null

  if (claimError) {
    console.log('Another process already claimed this tune creation');
    return;
  }

  console.log('Successfully claimed tune creation for user:', userId);

  // 🛡️ FINAL SAFETY CHECK - Double-check no API call was made while we were processing
  const { data: finalCheck } = await supabase
    .from('userTable')
    .select('apiStatus')
    .eq('id', userId)
    .single();

  if (finalCheck?.apiStatus) {
    console.log('❌ FINAL BLOCK: API call detected during processing, aborting to prevent duplicate');
    // Reset tuneStatus since we're not proceeding
    await supabase
      .from('userTable')
      .update({ tuneStatus: null })
      .eq('id', userId);
    return;
  }

  console.log('🚀 PROCEEDING: Making Astria API call for user:', userId);

  const options = {
    method: 'POST',
    headers: { 
      'Authorization': 'Bearer ' + API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tune: {
        "title": userId,
        "base_tune_id": 1504944,
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

    // Update user's API status in Supabase
    const { error } = await supabase
      .from('userTable')
      .update({ 
        apiStatus: result
        // tuneStatus already set to 'ongoing' above
        // workStatus stays 'ongoing' until completion
      })
      .eq('id', userId);

    if (error) {
      console.error("Error updating apiStatus in Supabase:", error);
    } else {
      console.log('API status updated successfully');
    }

    // Note: Prompts will be created after tune training is complete via tune-webhook
    console.log('Tune creation completed. Prompts will be created when tune training finishes.');

    return result;
  } catch (error) {
    console.error("Error creating tune:", error);
    
    // Reset tuneStatus on API error so user can retry
    await supabase
      .from('userTable')
      .update({ tuneStatus: null })
      .eq('id', userId);
      
    throw error;
  }
}