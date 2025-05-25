import { useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { updateUser } from '@/action/updateUser';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = async (images: Array<{ file: File; pixels: number }>) => {
    if (images.length === 0) {
      setError("Please upload at least one image before continuing.");
      return false;
    }

    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // First try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.log("Session refresh failed:", refreshError.message);
        // Continue with existing session check if refresh fails
      }
      
      // Check authentication with better session handling
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session) {
        console.error("No session found - redirecting to login");
        window.location.href = '/login';
        throw new Error("Please log in to upload images");
      }

      const user = session.user;
      if (!user) {
        console.error("No user in session - redirecting to login");
        window.location.href = '/login';
        throw new Error("Please log in to upload images");
      }

      console.log("User authenticated:", user.id);
      const uploadedUrls: string[] = [];

      for (const { file } of images) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${user.id}/selfies/${fileName}`;

        const { error } = await supabase.storage
          .from("userphotos")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        // Get the public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from("userphotos")
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      // Update the user's data with the new image URLs
      await updateUser({ userPhotos: { userSelfies: uploadedUrls } });

      return true;
    } catch (error: any) {
      console.error("Error uploading images:", error);
      
      // Provide user-friendly error messages
      let errorMessage = "Failed to upload images";
      if (error.message.includes("Session error") || error.message.includes("Please log in")) {
        errorMessage = "Your session has expired. Please log in again.";
      } else if (error.message.includes("storage")) {
        errorMessage = "Storage error. Please try again.";
      } else {
        errorMessage = `Upload failed: ${error.message || "Unknown error"}`;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImages, isUploading, error };
};