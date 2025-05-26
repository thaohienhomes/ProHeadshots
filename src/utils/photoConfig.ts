/**
 * Get the required number of photos based on environment
 * - Development: 4 photos
 * - Production: 15 photos
 */
export function getRequiredPhotoCount(): number {
  const isDevelopment = (process.env.NODE_ENV as string) === 'development' || (process.env.NODE_ENV as string) === 'DEVELOPMENT';
  return isDevelopment ? 4 : 15;
}

/**
 * Get the required number of photos for client-side components
 * This checks for common development indicators since NODE_ENV
 * might not be available in all client contexts
 */
export function getRequiredPhotoCountClient(): number {
  // Check for development environment indicators
  const isDevelopment = 
    typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('local'));
  
  return isDevelopment ? 4 : 15;
} 