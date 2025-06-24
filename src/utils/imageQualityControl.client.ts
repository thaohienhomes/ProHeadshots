/**
 * Client-side image quality validation
 * This is a simplified version for client components
 * Full quality analysis should be done server-side for security
 */

/**
 * Validate image meets minimum requirements (client-side)
 */
export async function validateImageRequirements(imageUrl: string): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  try {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Create image element to get dimensions
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        // Check minimum resolution
        if (img.width < 256 || img.height < 256) {
          errors.push('Image resolution is too low (minimum 256x256)');
        }

        // Check if resolution is below recommended
        if (img.width < 512 || img.height < 512) {
          warnings.push('Higher resolution recommended for better results');
        }

        // Check aspect ratio (warn if too extreme)
        const aspectRatio = img.width / img.height;
        if (aspectRatio > 3 || aspectRatio < 0.33) {
          warnings.push('Extreme aspect ratio may affect results');
        }

        resolve({
          valid: errors.length === 0,
          errors,
          warnings
        });
      };

      img.onerror = () => {
        resolve({
          valid: false,
          errors: ['Unable to load image'],
          warnings: []
        });
      };

      img.src = imageUrl;
    });
  } catch (error) {
    return {
      valid: false,
      errors: ['Error analyzing image'],
      warnings: []
    };
  }
}

/**
 * Check file size and format (client-side)
 */
export function validateFileRequirements(file: File): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Unsupported file format. Please use JPEG, PNG, or WebP');
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('File size too large. Maximum size is 10MB');
  }

  // Warn about large files
  const warnSize = 5 * 1024 * 1024; // 5MB
  if (file.size > warnSize) {
    warnings.push('Large file size may slow down processing');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
