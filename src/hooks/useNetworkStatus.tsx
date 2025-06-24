"use client";

import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      let isSlowConnection = false;
      let connectionType = 'unknown';
      let effectiveType = 'unknown';
      let downlink = 0;
      let rtt = 0;

      // Check for Network Information API support
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      if (connection) {
        connectionType = connection.type || 'unknown';
        effectiveType = connection.effectiveType || 'unknown';
        downlink = connection.downlink || 0;
        rtt = connection.rtt || 0;

        // Determine if connection is slow
        isSlowConnection = effectiveType === 'slow-2g' || 
                          effectiveType === '2g' || 
                          (downlink > 0 && downlink < 1.5);
      }

      const newStatus = {
        isOnline,
        isSlowConnection,
        connectionType,
        effectiveType,
        downlink,
        rtt,
      };

      setNetworkStatus(prevStatus => {
        // Log network status changes
        if (prevStatus.isOnline !== isOnline) {
          logger.info(
            `Network status changed: ${isOnline ? 'online' : 'offline'}`,
            'NETWORK',
            newStatus
          );
        }

        if (prevStatus.isSlowConnection !== isSlowConnection) {
          logger.info(
            `Connection speed changed: ${isSlowConnection ? 'slow' : 'normal'}`,
            'NETWORK',
            { effectiveType, downlink }
          );
        }

        return newStatus;
      });
    };

    // Initial check
    updateNetworkStatus();

    // Listen for online/offline events
    const handleOnline = () => {
      logger.info('Network connection restored', 'NETWORK');
      updateNetworkStatus();
    };

    const handleOffline = () => {
      logger.warn('Network connection lost', 'NETWORK');
      updateNetworkStatus();
    };

    // Listen for connection changes
    const handleConnectionChange = () => {
      updateNetworkStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes if supported
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return networkStatus;
}

// Hook for showing network status notifications
export function useNetworkNotifications() {
  const networkStatus = useNetworkStatus();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [showSlowConnectionMessage, setShowSlowConnectionMessage] = useState(false);

  useEffect(() => {
    if (!networkStatus.isOnline) {
      setShowOfflineMessage(true);
      setShowSlowConnectionMessage(false);
    } else {
      setShowOfflineMessage(false);
      
      if (networkStatus.isSlowConnection) {
        setShowSlowConnectionMessage(true);
        // Auto-hide slow connection message after 5 seconds
        const timer = setTimeout(() => {
          setShowSlowConnectionMessage(false);
        }, 5000);
        return () => clearTimeout(timer);
      } else {
        setShowSlowConnectionMessage(false);
      }
    }
  }, [networkStatus.isOnline, networkStatus.isSlowConnection]);

  return {
    networkStatus,
    showOfflineMessage,
    showSlowConnectionMessage,
    dismissOfflineMessage: () => setShowOfflineMessage(false),
    dismissSlowConnectionMessage: () => setShowSlowConnectionMessage(false),
  };
}

// Component for displaying network status
export function NetworkStatusIndicator() {
  const { 
    showOfflineMessage, 
    showSlowConnectionMessage,
    dismissOfflineMessage,
    dismissSlowConnectionMessage 
  } = useNetworkNotifications();

  if (!showOfflineMessage && !showSlowConnectionMessage) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {showOfflineMessage && (
        <div className="bg-red-500/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📡</span>
              <div>
                <p className="font-semibold">No Internet Connection</p>
                <p className="text-sm opacity-90">
                  Please check your connection and try again.
                </p>
              </div>
            </div>
            <button
              onClick={dismissOfflineMessage}
              className="text-white/80 hover:text-white ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {showSlowConnectionMessage && (
        <div className="bg-yellow-500/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐌</span>
              <div>
                <p className="font-semibold">Slow Connection Detected</p>
                <p className="text-sm opacity-90">
                  Some features may load slowly.
                </p>
              </div>
            </div>
            <button
              onClick={dismissSlowConnectionMessage}
              className="text-white/80 hover:text-white ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default useNetworkStatus;
