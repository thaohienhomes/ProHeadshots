import { useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { updateUser } from '@/action/updateUser';
import { logger } from '@/utils/logger';
import { retryUpload, withTimeout } from '@/utils/retry';

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
        logger.warn("Session refresh failed", 'UPLOAD', { error: refreshError.message });
        // Continue with existing session check if refresh fails
      }

      // Check authentication with better session handling
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        logger.error("Session error during upload", sessionError, 'UPLOAD');
        throw new Error(`Session error: ${sessionError.message}`);
      }

      if (!session) {
        logger.warn("No session found during upload - redirecting to login", 'UPLOAD');
        window.location.href = '/login';
        throw new Error("Please log in to upload images");
      }

      const user = session.user;
      if (!user) {
        logger.warn("No user in session during upload - redirecting to login", 'UPLOAD');
        window.location.href = '/login';
        throw new Error("Please log in to upload images");
      }

      logger.info("User authenticated for upload", 'UPLOAD', { userId: user.id, imageCount: images.length });
      const uploadedUrls: string[] = [];
      const startTime = Date.now();

      for (let i = 0; i < images.length; i++) {
        const { file } = images[i];
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
        const filePath = `${user.id}/selfies/${fileName}`;

        logger.info(`Uploading image ${i + 1}/${images.length}`, 'UPLOAD', {
          fileName,
          fileSize: file.size,
          fileType: file.type
        });

        // Upload with retry mechanism and timeout
        const uploadResult = await retryUpload(async () => {
          return withTimeout(
            supabase.storage
              .from("userphotos")
              .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
              }),
            30000, // 30 second timeout
            `Upload timeout for file: ${fileName}`
          );
        }, {
          maxAttempts: 3,
          onRetry: (attempt, error) => {
            logger.warn(`Retrying upload for ${fileName}`, 'UPLOAD', {
              attempt,
              error: error.message
            });
          }
        });

        if (!uploadResult.success) {
          throw uploadResult.error || new Error(`Failed to upload ${fileName}`);
        }

        const { error } = uploadResult.data;
        if (error) {
          logger.error(`Upload failed for ${fileName}`, error, 'UPLOAD');
          throw error;
        }

        // Get the public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from("userphotos")
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);

        logger.info(`Successfully uploaded image ${i + 1}/${images.length}`, 'UPLOAD', {
          fileName,
          publicUrl
        });
      }

      const uploadDuration = Date.now() - startTime;
      logger.info('All images uploaded successfully', 'UPLOAD', {
        totalImages: images.length,
        duration: uploadDuration,
        averageTimePerImage: Math.round(uploadDuration / images.length)
      });

      // Update the user's data with the new image URLs
      logger.info('Updating user data with uploaded images', 'UPLOAD', {
        userId: user.id,
        imageCount: uploadedUrls.length
      });

      await updateUser({ userPhotos: { userSelfies: uploadedUrls } });

      logger.info('Upload process completed successfully', 'UPLOAD', {
        userId: user.id,
        totalImages: uploadedUrls.length
      });

      return true;
    } catch (error: any) {
      logger.error("Error uploading images", error, 'UPLOAD', {
        imageCount: images.length,
        errorType: error.name,
        errorMessage: error.message
      });

      // Provide user-friendly error messages based on error type
      let errorMessage = "Failed to upload images. Please try again.";

      if (error.message.includes("Session error") || error.message.includes("Please log in")) {
        errorMessage = "Your session has expired. Please log in again.";
      } else if (error.message.includes("storage") || error.message.includes("bucket")) {
        errorMessage = "Storage error occurred. Please check your connection and try again.";
      } else if (error.message.includes("timeout") || error.name === 'TimeoutError') {
        errorMessage = "Upload timed out. Please check your connection and try again.";
      } else if (error.message.includes("413") || error.message.includes("too large")) {
        errorMessage = "One or more files are too large. Please use smaller images.";
      } else if (error.message.includes("network") || error.name === 'NetworkError') {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = `Upload failed: ${error.message}`;
      }

      setError(errorMessage);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImages, isUploading, error };
};