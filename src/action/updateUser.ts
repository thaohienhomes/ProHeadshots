'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from 'next/navigation';

interface UserFormData {
  name?: string;
  age?: string;
  ethnicity?: string;
  height?: string;
  bodyType?: string;
  eyeColor?: string;
  gender?: string;
  userPhotos?: {
    userSelfies?: string[];
  };
  promptsResult?: any[];
}

export async function updateUser(formData: UserFormData) {
  const supabase = createClient();
  
  // Get the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    console.error("No authenticated user found");
    return { error: "User not authenticated" };
  }

  let updatedFormData = { ...formData };

  // If userPhotos is provided, merge it with existing data
  if (formData.userPhotos) {
    const { data: existingData } = await supabase
      .from('userTable')
      .select('userPhotos')
      .eq('id', userId)
      .single();

    updatedFormData.userPhotos = {
      ...existingData?.userPhotos,
      ...formData.userPhotos
    };
  }

  // Update the user data in the 'userTable'
  const { data, error } = await supabase
    .from('userTable')
    .update(updatedFormData)
    .eq('id', userId);

  if (error) {
    console.error("Error updating user data in Supabase:", error);
    return { error: "Failed to update user data" };
  }

  // Only redirect if it's not an image upload or promptsResult update
  if (!formData.userPhotos && !formData.promptsResult) {
    redirect('/upload/styles');
  }
}