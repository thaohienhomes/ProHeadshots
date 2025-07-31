'use client';

import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface LoadingSkeletonProps {
  count?: number;
  height?: number | string;
  width?: number | string;
  className?: string;
  circle?: boolean;
  borderRadius?: number | string;
}

export default function LoadingSkeleton({
  count = 1,
  height,
  width,
  className = '',
  circle = false,
  borderRadius,
}: LoadingSkeletonProps) {
  return (
    <SkeletonTheme 
      baseColor="#1e293b" 
      highlightColor="#334155"
      borderRadius={borderRadius}
    >
      <Skeleton
        count={count}
        height={height}
        width={width}
        className={className}
        circle={circle}
      />
    </SkeletonTheme>
  );
}

// Specific skeleton components for common use cases
export function ImageSkeleton({ 
  aspectRatio = 'square',
  className = '' 
}: { 
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  className?: string;
}) {
  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  return (
    <div className={`${aspectClasses[aspectRatio]} ${className}`}>
      <LoadingSkeleton height="100%" />
    </div>
  );
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 ${className}`}>
      <LoadingSkeleton height={200} className="mb-4" />
      <LoadingSkeleton height={20} className="mb-2" />
      <LoadingSkeleton height={16} width="60%" />
    </div>
  );
}

export function TextSkeleton({ 
  lines = 3,
  className = '' 
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, index) => (
        <LoadingSkeleton
          key={index}
          height={16}
          width={index === lines - 1 ? '60%' : '100%'}
          className="mb-2"
        />
      ))}
    </div>
  );
}
