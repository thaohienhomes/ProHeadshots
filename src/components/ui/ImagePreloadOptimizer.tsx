"use client";

import { useEffect, useRef } from 'react';

interface ImagePreloadOptimizerProps {
  images: string[];
  maxPreload?: number;
}

/**
 * Component to optimize image preloading and prevent duplicate preloads
 * This helps reduce the "preloaded but not used" warnings
 */
export default function ImagePreloadOptimizer({ 
  images, 
  maxPreload = 3 
}: ImagePreloadOptimizerProps) {
  const preloadedImages = useRef(new Set<string>());

  useEffect(() => {
    // Only preload unique images up to the limit
    const uniqueImages = [...new Set(images)].slice(0, maxPreload);
    
    uniqueImages.forEach((src) => {
      if (!preloadedImages.current.has(src)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
        preloadedImages.current.add(src);
        
        // Clean up after a reasonable time to prevent memory leaks
        setTimeout(() => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        }, 10000); // 10 seconds
      }
    });
  }, [images, maxPreload]);

  return null; // This component doesn't render anything
}
