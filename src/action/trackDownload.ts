'use server'

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with admin rights
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function trackDownload(imageUrl: string, userData: any) {
  const userId = userData.id;
  console.log("downloading", imageUrl)

  // Fetch the latest downloadHistory
  const { data: latestData, error: fetchError } = await supabase
    .from('userTable')
    .select('downloadHistory')
    .eq('id', userId)
    .single()

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  // Ensure downloadHistory is an array
  let downloadHistory = Array.isArray(latestData.downloadHistory) ? latestData.downloadHistory : [];

  // Add the new imageUrl to the downloadHistory
  const updatedDownloadHistory = [...downloadHistory, imageUrl];

  // Update the user's download history in the database
  const { data, error: updateError } = await supabase
    .from('userTable')
    .update({ downloadHistory: updatedDownloadHistory })
    .eq('id', userId)

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Return only the downloadHistory on success
  return { success: true, downloadHistory: updatedDownloadHistory };
}