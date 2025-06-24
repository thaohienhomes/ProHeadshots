"use client";

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  minHeight?: string;
  showSkeleton?: boolean;
  delay?: number;
}

export default function LazySection({
  children,
  fallback,
  rootMargin = '100px',
  threshold = 0.1,
  className = '',
  minHeight = '200px',
  showSkeleton = true,
  delay = 0,
}: LazySectionProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsInView(true);
              setTimeout(() => setIsLoaded(true), 100);
            }, delay);
          } else {
            setIsInView(true);
            setTimeout(() => setIsLoaded(true), 100);
          }
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold, delay]);

  const DefaultSkeleton = () => (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ minHeight }}
    >
      {showSkeleton ? (
        <div className="space-y-4 w-full max-w-md">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-32 bg-slate-700 rounded mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          </div>
        </div>
      ) : (
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      )}
    </div>
  );

  return (
    <div ref={sectionRef} className={className}>
      {!isInView ? (
        fallback || <DefaultSkeleton />
      ) : (
        <div 
          className={`transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// Specialized lazy loading components
export function LazyGallery({ 
  children, 
  className = '',
  columns = 3 
}: { 
  children: ReactNode; 
  className?: string;
  columns?: number;
}) {
  const skeletonItems = Array.from({ length: columns * 2 }, (_, i) => (
    <div key={i} className="animate-pulse">
      <div className="aspect-[3/4] bg-slate-700 rounded-lg"></div>
    </div>
  ));

  return (
    <LazySection
      className={className}
      fallback={
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
          {skeletonItems}
        </div>
      }
      showSkeleton={false}
    >
      {children}
    </LazySection>
  );
}

export function LazyCard({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <LazySection
      className={className}
      fallback={
        <div className="animate-pulse bg-slate-700 rounded-xl p-6">
          <div className="h-6 bg-slate-600 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-slate-600 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-600 rounded w-2/3"></div>
        </div>
      }
      showSkeleton={false}
    >
      {children}
    </LazySection>
  );
}

export function LazyChart({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <LazySection
      className={className}
      fallback={
        <div className="animate-pulse bg-slate-700 rounded-xl p-6">
          <div className="h-6 bg-slate-600 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-slate-600 rounded"></div>
        </div>
      }
      showSkeleton={false}
    >
      {children}
    </LazySection>
  );
}

// Hook for lazy loading with custom logic
export function useLazyLoading(
  rootMargin: string = '100px',
  threshold: number = 0.1
) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Add a small delay for smooth loading
          setTimeout(() => setIsLoaded(true), 100);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, isInView, isLoaded };
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log performance metrics (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
        
        // Warn if render time is too long
        if (renderTime > 100) {
          console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render (>100ms)`);
        }
      }
    };
  }, [componentName]);
}
