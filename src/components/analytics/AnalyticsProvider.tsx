'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAnalytics } from '@/lib/analytics/engagementTracker';
import { useAuthStatus } from '@/lib/auth/authUtils';

interface AnalyticsContextType {
  trackEvent: (eventType: string, eventName: string, properties?: Record<string, any>) => void;
  trackConversion: (step: string, properties?: Record<string, any>) => void;
  trackPerformance: (metricType: string, value: number, context?: Record<string, any>) => void;
  trackHeatmap: (elementId: string, elementType: string, action: string, x: number, y: number) => void;
  trackLearningModuleExpansion: (moduleId: string, sectionId?: string) => void;
  trackVideoInteraction: (videoId: string, action: string, currentTime?: number) => void;
  trackNotificationPermission: (granted: boolean) => void;
  trackProcessingComplete: (sessionId: string, processingTime: number) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const analytics = useAnalytics();
  const { user } = useAuthStatus();
  const startTime = useRef(Date.now());

  // Set user ID when auth status changes
  useEffect(() => {
    try {
      if (user?.id && analytics?.setUserId) {
        analytics.setUserId(user.id);
      }
    } catch (error) {
      console.warn('Failed to set analytics user ID:', error);
    }
  }, [user?.id, analytics]);

  useEffect(() => {
    try {
      // Track page load performance
      const loadTime = Date.now() - startTime.current;
      if (analytics?.trackPerformance) {
        analytics.trackPerformance('page_load', loadTime, {
          page: 'wait_page',
          timestamp: new Date().toISOString(),
        });
      }

      // Track page unload
      const handleBeforeUnload = () => {
        try {
          const sessionDuration = Date.now() - startTime.current;
          if (analytics?.trackEvent) {
            analytics.trackEvent('interaction', 'page_unload', {
              sessionDuration,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.warn('Failed to track page unload:', error);
        }
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', handleBeforeUnload);
      }

      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        }
      };
    } catch (error) {
      console.warn('Failed to initialize analytics tracking:', error);
    }
  }, [analytics]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}

// Higher-order component for automatic click tracking
interface TrackableProps {
  trackingId?: string;
  trackingType?: 'button' | 'link' | 'video' | 'module' | 'other';
  trackingProperties?: Record<string, any>;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent) => void;
  className?: string;
}

export function Trackable({
  trackingId,
  trackingType = 'other',
  trackingProperties = {},
  children,
  onClick,
  className,
  ...props
}: TrackableProps) {
  const analytics = useAnalyticsContext();

  const handleClick = (event: React.MouseEvent) => {
    // Track the click
    if (trackingId) {
      analytics.trackEvent('interaction', 'click', {
        elementId: trackingId,
        elementType: trackingType,
        ...trackingProperties,
        timestamp: new Date().toISOString(),
      });

      // Track heatmap data
      analytics.trackHeatmap(
        trackingId,
        trackingType,
        'click',
        event.clientX,
        event.clientY
      );
    }

    // Call original onClick handler
    if (onClick) {
      onClick(event);
    }
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (trackingId) {
      analytics.trackHeatmap(
        trackingId,
        trackingType,
        'hover',
        event.clientX,
        event.clientY
      );
    }
  };

  return (
    <div
      {...props}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </div>
  );
}

// Hook for tracking scroll events
export function useScrollTracking(elementId: string) {
  const analytics = useAnalyticsContext();
  const lastScrollY = useRef(0);
  const scrollStartTime = useRef(Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
      const scrollDistance = Math.abs(currentScrollY - lastScrollY.current);

      if (scrollDistance > 100) { // Only track significant scrolls
        analytics.trackEvent('interaction', 'scroll', {
          elementId,
          scrollDirection,
          scrollDistance,
          scrollY: currentScrollY,
          timestamp: new Date().toISOString(),
        });

        lastScrollY.current = currentScrollY;
      }
    };

    const handleScrollStart = () => {
      scrollStartTime.current = Date.now();
    };

    const handleScrollEnd = () => {
      const scrollDuration = Date.now() - scrollStartTime.current;
      analytics.trackEvent('interaction', 'scroll_end', {
        elementId,
        scrollDuration,
        finalScrollY: window.scrollY,
        timestamp: new Date().toISOString(),
      });
    };

    let scrollTimer: NodeJS.Timeout;
    const debouncedScrollEnd = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(handleScrollEnd, 150);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScrollStart, { once: true });
    window.addEventListener('scroll', debouncedScrollEnd);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScrollStart);
      window.removeEventListener('scroll', debouncedScrollEnd);
      clearTimeout(scrollTimer);
    };
  }, [analytics, elementId]);
}

// Hook for tracking time spent on elements
export function useTimeTracking(elementId: string, threshold: number = 5000) {
  const analytics = useAnalyticsContext();
  const startTime = useRef<number | null>(null);
  const isVisible = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible.current) {
            // Element became visible
            isVisible.current = true;
            startTime.current = Date.now();
          } else if (!entry.isIntersecting && isVisible.current) {
            // Element became hidden
            isVisible.current = false;
            if (startTime.current) {
              const timeSpent = Date.now() - startTime.current;
              if (timeSpent >= threshold) {
                analytics.trackEvent('interaction', 'time_spent', {
                  elementId,
                  timeSpent,
                  threshold,
                  timestamp: new Date().toISOString(),
                });
              }
              startTime.current = null;
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    if (typeof document !== 'undefined') {
      const element = document.getElementById(elementId);
      if (element) {
        observer.observe(element);
      }
    }

    return () => {
      observer.disconnect();
      // Track final time if element was visible when component unmounts
      if (isVisible.current && startTime.current) {
        const timeSpent = Date.now() - startTime.current;
        if (timeSpent >= threshold) {
          analytics.trackEvent('interaction', 'time_spent_final', {
            elementId,
            timeSpent,
            threshold,
            timestamp: new Date().toISOString(),
          });
        }
      }
    };
  }, [analytics, elementId, threshold]);
}

// Hook for tracking form interactions
export function useFormTracking(formId: string) {
  const analytics = useAnalyticsContext();

  const trackFieldInteraction = (fieldName: string, action: 'focus' | 'blur' | 'change') => {
    analytics.trackEvent('interaction', `form_${action}`, {
      formId,
      fieldName,
      timestamp: new Date().toISOString(),
    });
  };

  const trackFormSubmission = (success: boolean, errors?: string[]) => {
    analytics.trackEvent('interaction', 'form_submit', {
      formId,
      success,
      errors,
      timestamp: new Date().toISOString(),
    });

    if (success) {
      analytics.trackConversion('form_complete', { formId });
    }
  };

  return {
    trackFieldInteraction,
    trackFormSubmission,
  };
}
