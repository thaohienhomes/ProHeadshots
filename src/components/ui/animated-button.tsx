'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BorderBeam } from './border-beam';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showBeam?: boolean;
  beamSize?: number;
  beamDuration?: number;
  beamDelay?: number;
  asChild?: boolean;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    showBeam = true,
    beamSize = 200,
    beamDuration = 15,
    beamDelay = 0,
    asChild = false,
    ...props
  }, ref) => {
    const baseClasses = "relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden";

    const variants = {
      primary: "bg-gradient-to-r from-cyan-500 to-primary-600 text-white hover:from-cyan-600 hover:to-primary-700 focus:ring-cyan-500 shadow-lg hover:shadow-xl",
      secondary: "bg-navy-800 text-white border border-cyan-400/30 hover:border-cyan-400/50 hover:bg-navy-700 focus:ring-cyan-500",
      outline: "border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-navy-900 focus:ring-cyan-500"
    };

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-lg",
      md: "px-6 py-3 text-base rounded-xl",
      lg: "px-8 py-4 text-lg rounded-2xl"
    };

    const buttonClasses = cn(
      baseClasses,
      variants[variant],
      sizes[size],
      className
    );

    if (asChild) {
      return (
        <div className={buttonClasses} ref={ref}>
          {children}
          {showBeam && (
            <BorderBeam
              size={beamSize}
              duration={beamDuration}
              delay={beamDelay}
            />
          )}
        </div>
      );
    }

    return (
      <button className={buttonClasses} ref={ref} {...props}>
        {children}
        {showBeam && (
          <BorderBeam
            size={beamSize}
            duration={beamDuration}
            delay={beamDelay}
          />
        )}
      </button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";
