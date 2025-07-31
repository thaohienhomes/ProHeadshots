"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}

// Mobile-first responsive wrapper component
export const MobileOptimized: React.FC<MobileOptimizedProps> = ({
  children,
  className,
  mobileClassName,
  tabletClassName,
  desktopClassName
}) => {
  return (
    <div className={cn(
      // Base mobile styles
      'w-full',
      mobileClassName,
      // Tablet styles
      tabletClassName && `md:${tabletClassName}`,
      // Desktop styles  
      desktopClassName && `lg:${desktopClassName}`,
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-optimized grid component
interface MobileGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: string;
  className?: string;
}

export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'gap-6',
  className
}) => {
  const gridClasses = cn(
    'grid',
    gap,
    // Mobile columns
    cols.mobile === 1 && 'grid-cols-1',
    cols.mobile === 2 && 'grid-cols-2',
    // Tablet columns
    cols.tablet === 2 && 'md:grid-cols-2',
    cols.tablet === 3 && 'md:grid-cols-3',
    // Desktop columns
    cols.desktop === 2 && 'lg:grid-cols-2',
    cols.desktop === 3 && 'lg:grid-cols-3',
    cols.desktop === 4 && 'lg:grid-cols-4',
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// Mobile-optimized text component
interface MobileTextProps {
  children: React.ReactNode;
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
}

export const MobileText: React.FC<MobileTextProps> = ({
  children,
  size = 'base',
  weight = 'normal',
  className
}) => {
  const textClasses = cn(
    // Base mobile sizes
    size === 'sm' && 'text-sm md:text-base',
    size === 'base' && 'text-base md:text-lg',
    size === 'lg' && 'text-lg md:text-xl',
    size === 'xl' && 'text-xl md:text-2xl',
    size === '2xl' && 'text-2xl md:text-3xl lg:text-4xl',
    size === '3xl' && 'text-3xl md:text-4xl lg:text-5xl',
    // Font weights
    weight === 'normal' && 'font-normal',
    weight === 'medium' && 'font-medium',
    weight === 'semibold' && 'font-semibold',
    weight === 'bold' && 'font-bold',
    className
  );

  return (
    <span className={textClasses}>
      {children}
    </span>
  );
};

// Mobile-optimized button component
interface MobileButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  onClick,
  disabled = false
}) => {
  const buttonClasses = cn(
    // Base styles
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
    
    // Variants
    variant === 'primary' && 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-lg hover:shadow-xl transform hover:scale-105',
    variant === 'secondary' && 'border border-white/30 text-white hover:bg-white/10',
    variant === 'outline' && 'border border-slate-200 text-slate-700 hover:bg-slate-100',
    
    // Sizes - mobile first
    size === 'sm' && 'px-4 py-2 text-sm md:px-6 md:py-3',
    size === 'md' && 'px-6 py-3 text-base md:px-8 md:py-4',
    size === 'lg' && 'px-8 py-4 text-lg md:px-10 md:py-5',
    
    // Full width on mobile
    fullWidth && 'w-full md:w-auto',
    
    // Disabled state
    disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
    
    className
  );

  return (
    <button 
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Mobile-optimized spacing component
interface MobileSpacingProps {
  children: React.ReactNode;
  padding?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  margin?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  className?: string;
}

export const MobileSpacing: React.FC<MobileSpacingProps> = ({
  children,
  padding,
  margin,
  className
}) => {
  const spacingClasses = cn(
    // Mobile padding
    padding?.mobile,
    // Tablet padding
    padding?.tablet && `md:${padding.tablet}`,
    // Desktop padding
    padding?.desktop && `lg:${padding.desktop}`,
    // Mobile margin
    margin?.mobile,
    // Tablet margin
    margin?.tablet && `md:${margin.tablet}`,
    // Desktop margin
    margin?.desktop && `lg:${margin.desktop}`,
    className
  );

  return (
    <div className={spacingClasses}>
      {children}
    </div>
  );
};

// Mobile-optimized container
interface MobileContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  className?: string;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  maxWidth = 'lg',
  padding = true,
  className
}) => {
  const containerClasses = cn(
    'w-full mx-auto',
    // Max widths
    maxWidth === 'sm' && 'max-w-sm',
    maxWidth === 'md' && 'max-w-md',
    maxWidth === 'lg' && 'max-w-4xl',
    maxWidth === 'xl' && 'max-w-6xl',
    maxWidth === '2xl' && 'max-w-7xl',
    maxWidth === 'full' && 'max-w-full',
    // Responsive padding
    padding && 'px-4 md:px-6 lg:px-8',
    className
  );

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

// Hook for mobile detection
export const useMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};
