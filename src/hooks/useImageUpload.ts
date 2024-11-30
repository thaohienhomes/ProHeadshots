import { useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { updateUser } from '@/action/updateUser';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const uploadImages = async (images: Array<{ file: File; pixels: number }>) => {
    if (images.length === 0) {
      setError("Please upload at least one image before continuing.");
      return false;
    }

    setIsUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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
      setError(`Failed to upload images: ${error.message || "Unknown error"}`);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImages, isUploading, error };
};