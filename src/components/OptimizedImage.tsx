"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, AlertCircle } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  showSkeleton?: boolean;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  onLoad,
  onError,
  lazy = true,
  showSkeleton = true,
  fallbackSrc = '/placeholder-image.jpg',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback image if available
    if (currentSrc !== fallbackSrc && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
      return;
    }
    
    onError?.();
  };

  // Generate blur data URL for placeholder
  const generateBlurDataURL = (w: number = 10, h: number = 10) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  const defaultBlurDataURL = blurDataURL || generateBlurDataURL();

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div 
      className={`animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] ${className}`}
      style={{ 
        width: fill ? '100%' : width, 
        height: fill ? '100%' : height,
        aspectRatio: width && height ? `${width}/${height}` : undefined
      }}
    >
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div 
      className={`bg-slate-800 border border-slate-600 rounded-lg flex items-center justify-center ${className}`}
      style={{ 
        width: fill ? '100%' : width, 
        height: fill ? '100%' : height,
        aspectRatio: width && height ? `${width}/${height}` : undefined
      }}
    >
      <div className="text-center text-slate-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">Failed to load image</p>
      </div>
    </div>
  );

  return (
    <div ref={imgRef} className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {!isInView ? (
        showSkeleton ? <SkeletonLoader /> : <div className={className} />
      ) : hasError ? (
        <ErrorState />
      ) : (
        <div className="relative">
          {isLoading && showSkeleton && (
            <div className="absolute inset-0 z-10">
              <SkeletonLoader />
            </div>
          )}
          
          <Image
            src={currentSrc}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            className={`transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            } ${className}`}
            style={{ objectFit: fill ? objectFit : undefined }}
            priority={priority}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={placeholder === 'blur' ? defaultBlurDataURL : undefined}
            sizes={sizes}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      )}
    </div>
  );
}

// Utility function to generate responsive image sizes
export function generateImageSizes(breakpoints: { [key: string]: number }) {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => `(max-width: ${breakpoint}) ${size}px`)
    .join(', ');
}

// Common image size configurations
export const imageSizes = {
  thumbnail: generateImageSizes({
    '640px': 150,
    '768px': 200,
    '1024px': 250,
    '1280px': 300,
  }),
  card: generateImageSizes({
    '640px': 300,
    '768px': 400,
    '1024px': 500,
    '1280px': 600,
  }),
  hero: generateImageSizes({
    '640px': 640,
    '768px': 768,
    '1024px': 1024,
    '1280px': 1280,
  }),
  gallery: generateImageSizes({
    '640px': 320,
    '768px': 384,
    '1024px': 512,
    '1280px': 640,
  }),
};

// Progressive image loading hook
export function useProgressiveImage(src: string, fallbackSrc?: string) {
  const [currentSrc, setCurrentSrc] = useState(fallbackSrc || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
      setHasError(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setHasError(false);
      }
    };
    
    img.src = src;
  }, [src, fallbackSrc, currentSrc]);

  return { src: currentSrc, isLoading, hasError };
}
