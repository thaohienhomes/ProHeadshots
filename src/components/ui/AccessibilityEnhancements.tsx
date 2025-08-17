"use client";

import React from 'react';

interface SkipToContentProps {
  targetId?: string;
  className?: string;
}

export function SkipToContent({ 
  targetId = "main-content", 
  className = "" 
}: SkipToContentProps) {
  return (
    <a
      href={`#${targetId}`}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        bg-navy-900 text-cyan-400 px-4 py-2 rounded-md border border-cyan-400/20
        z-50 font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-cyan-400/50
        ${className}
      `}
      onFocus={(e) => {
        // Announce to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('class', 'sr-only');
        announcement.textContent = 'Skip to main content link focused';
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }}
    >
      Skip to main content
    </a>
  );
}

interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
  onEscape?: () => void;
}

export function FocusTrap({ children, isActive, onEscape }: FocusTrapProps) {
  const trapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isActive || !trapRef.current) return;

    const element = trapRef.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive, onEscape]);

  if (!isActive) return <>{children}</>;

  return (
    <div ref={trapRef} className="focus-trap">
      {children}
    </div>
  );
}

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export function ScreenReaderOnly({ 
  children, 
  as: Component = 'span' 
}: ScreenReaderOnlyProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}

interface LiveRegionProps {
  children: React.ReactNode;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}

export function LiveRegion({ 
  children, 
  priority = 'polite', 
  atomic = true 
}: LiveRegionProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}
