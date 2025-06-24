"use client";

import React, { useEffect, useState } from 'react';
import { Activity, Zap, Clock, Wifi, WifiOff } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  connectionType: string;
  isOnline: boolean;
  memoryUsage?: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      
      // Get LCP using PerformanceObserver
      let lcp = 0;
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            lcp = lastEntry.startTime;
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('LCP observation failed:', e);
        }
      }

      // Get CLS using PerformanceObserver
      let cls = 0;
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value;
              }
            }
          });
          observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.warn('CLS observation failed:', e);
        }
      }

      // Get FID using PerformanceObserver
      let fid = 0;
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              fid = (entry as any).processingStart - entry.startTime;
            }
          });
          observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.warn('FID observation failed:', e);
        }
      }

      // Get connection info
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const connectionType = connection ? connection.effectiveType || connection.type || 'unknown' : 'unknown';

      // Get memory usage (Chrome only)
      const memory = (performance as any).memory;
      const memoryUsage = memory ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : undefined;

      const newMetrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.navigationStart,
        firstContentfulPaint: fcp,
        largestContentfulPaint: lcp,
        cumulativeLayoutShift: cls,
        firstInputDelay: fid,
        connectionType,
        isOnline: navigator.onLine,
        memoryUsage,
      };

      setMetrics(newMetrics);
    };

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      setTimeout(collectMetrics, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(collectMetrics, 1000);
      });
    }

    // Listen for online/offline events
    const handleOnline = () => setMetrics(prev => prev ? { ...prev, isOnline: true } : null);
    const handleOffline = () => setMetrics(prev => prev ? { ...prev, isOnline: false } : null);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !metrics || !isVisible) {
    return null;
  }

  const getScoreColor = (value: number, thresholds: { good: number; needs: number }) => {
    if (value <= thresholds.good) return 'text-green-400';
    if (value <= thresholds.needs) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatTime = (time: number) => {
    if (time < 1000) return `${Math.round(time)}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 backdrop-blur-sm border border-gray-600 rounded-lg p-4 text-white text-xs font-mono max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold">Performance</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="space-y-2">
        {/* Core Web Vitals */}
        <div className="border-b border-gray-600 pb-2">
          <div className="text-gray-300 mb-1">Core Web Vitals</div>
          
          <div className="flex justify-between">
            <span>LCP:</span>
            <span className={getScoreColor(metrics.largestContentfulPaint, { good: 2500, needs: 4000 })}>
              {formatTime(metrics.largestContentfulPaint)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>FID:</span>
            <span className={getScoreColor(metrics.firstInputDelay, { good: 100, needs: 300 })}>
              {formatTime(metrics.firstInputDelay)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>CLS:</span>
            <span className={getScoreColor(metrics.cumulativeLayoutShift * 1000, { good: 100, needs: 250 })}>
              {metrics.cumulativeLayoutShift.toFixed(3)}
            </span>
          </div>
        </div>

        {/* Other Metrics */}
        <div className="border-b border-gray-600 pb-2">
          <div className="text-gray-300 mb-1">Loading</div>
          
          <div className="flex justify-between">
            <span>Load Time:</span>
            <span className={getScoreColor(metrics.loadTime, { good: 2000, needs: 4000 })}>
              {formatTime(metrics.loadTime)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>FCP:</span>
            <span className={getScoreColor(metrics.firstContentfulPaint, { good: 1800, needs: 3000 })}>
              {formatTime(metrics.firstContentfulPaint)}
            </span>
          </div>
        </div>

        {/* Connection & Memory */}
        <div>
          <div className="flex justify-between items-center">
            <span>Connection:</span>
            <div className="flex items-center gap-1">
              {metrics.isOnline ? (
                <Wifi className="w-3 h-3 text-green-400" />
              ) : (
                <WifiOff className="w-3 h-3 text-red-400" />
              )}
              <span className="text-gray-300">{metrics.connectionType}</span>
            </div>
          </div>
          
          {metrics.memoryUsage && (
            <div className="flex justify-between">
              <span>Memory:</span>
              <span className={getScoreColor(metrics.memoryUsage, { good: 50, needs: 80 })}>
                {metrics.memoryUsage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-600 text-gray-400 text-xs">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}

// Hook for component-level performance monitoring
export function useComponentPerformance(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log to console with color coding
      const color = renderTime > 100 ? 'color: red' : renderTime > 50 ? 'color: orange' : 'color: green';
      console.log(`%c${componentName} render: ${renderTime.toFixed(2)}ms`, color);
      
      // Store in performance buffer for analysis
      if ('performance' in window && 'mark' in performance) {
        performance.mark(`${componentName}-render-${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}

// Performance budget checker
export function checkPerformanceBudget() {
  if (process.env.NODE_ENV !== 'development') return;

  const budget = {
    loadTime: 3000, // 3 seconds
    fcp: 1800, // 1.8 seconds
    lcp: 2500, // 2.5 seconds
    cls: 0.1, // 0.1
    fid: 100, // 100ms
  };

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  const loadTime = navigation.loadEventEnd - navigation.navigationStart;
  const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;

  const violations = [];
  
  if (loadTime > budget.loadTime) {
    violations.push(`Load time: ${loadTime}ms (budget: ${budget.loadTime}ms)`);
  }
  
  if (fcp > budget.fcp) {
    violations.push(`FCP: ${fcp}ms (budget: ${budget.fcp}ms)`);
  }

  if (violations.length > 0) {
    console.warn('Performance budget violations:', violations);
  } else {
    console.log('✅ Performance budget met');
  }
}
