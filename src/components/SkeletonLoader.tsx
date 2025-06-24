"use client";

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export function Skeleton({ 
  className = '', 
  width, 
  height, 
  rounded = false, 
  animate = true 
}: SkeletonProps) {
  const baseClasses = `bg-navy-700/30 ${animate ? 'animate-pulse' : ''} ${rounded ? 'rounded-full' : 'rounded-lg'}`;
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`${baseClasses} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components for common use cases

export function SkeletonText({ 
  lines = 1, 
  className = '',
  lastLineWidth = '75%' 
}: { 
  lines?: number; 
  className?: string;
  lastLineWidth?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={16}
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ 
  hasImage = true, 
  hasTitle = true, 
  hasDescription = true,
  className = '' 
}: {
  hasImage?: boolean;
  hasTitle?: boolean;
  hasDescription?: boolean;
  className?: string;
}) {
  return (
    <div className={`bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6 ${className}`}>
      {hasImage && (
        <Skeleton height={200} className="mb-4" />
      )}
      
      {hasTitle && (
        <Skeleton height={24} width="60%" className="mb-3" />
      )}
      
      {hasDescription && (
        <SkeletonText lines={3} />
      )}
    </div>
  );
}

export function SkeletonAvatar({ 
  size = 40,
  className = '' 
}: { 
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      rounded
      className={className}
    />
  );
}

export function SkeletonButton({ 
  width = 120,
  height = 40,
  className = '' 
}: {
  width?: number | string;
  height?: number;
  className?: string;
}) {
  return (
    <Skeleton
      width={width}
      height={height}
      className={`rounded-xl ${className}`}
    />
  );
}

export function SkeletonTable({ 
  rows = 5, 
  columns = 4,
  className = '' 
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} height={20} />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`}
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} height={16} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonGallery({ 
  items = 6,
  columns = 3,
  className = '' 
}: {
  items?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div 
      className={`grid gap-6 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton height={200} className="aspect-square" />
          <Skeleton height={16} width="80%" />
          <Skeleton height={14} width="60%" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm({ 
  fields = 4,
  hasSubmitButton = true,
  className = '' 
}: {
  fields?: number;
  hasSubmitButton?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton height={16} width="25%" />
          <Skeleton height={48} className="rounded-xl" />
        </div>
      ))}
      
      {hasSubmitButton && (
        <SkeletonButton width="100%" height={48} className="mt-8" />
      )}
    </div>
  );
}

export function SkeletonDashboard({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton height={32} width={300} />
          <Skeleton height={16} width={200} />
        </div>
        <SkeletonButton width={120} />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
            <Skeleton height={20} width="60%" className="mb-2" />
            <Skeleton height={36} width="40%" className="mb-4" />
            <Skeleton height={14} width="80%" />
          </div>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SkeletonCard hasImage hasTitle hasDescription />
        <SkeletonCard hasImage hasTitle hasDescription />
      </div>
    </div>
  );
}

export function SkeletonUploadArea({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 ${className}`}>
      <div className="text-center space-y-4">
        <Skeleton height={64} width={64} rounded className="mx-auto" />
        <Skeleton height={24} width="60%" className="mx-auto" />
        <SkeletonText lines={2} className="max-w-md mx-auto" />
        <SkeletonButton width={150} className="mx-auto" />
      </div>
    </div>
  );
}

export default Skeleton;
