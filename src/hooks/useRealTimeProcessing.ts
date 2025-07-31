'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  processingApi,
  ProcessingSession,
  ProcessingStage,
  handleApiError,
  ProcessingError,
  isProcessingActive,
  isProcessingComplete,
  hasProcessingError,
  getActiveStage,
  calculateOverallProgress,
  formatProcessingTime
} from '@/lib/api/processing';

interface UseRealTimeProcessingOptions {
  pollingInterval?: number; // ms, default 5000
  maxRetries?: number; // default 3
  onError?: (error: ProcessingError) => void;
  onComplete?: (session: ProcessingSession) => void;
  onProgress?: (session: ProcessingSession) => void;
}

export const useRealTimeProcessing = (
  userId?: string,
  options: UseRealTimeProcessingOptions = {}
) => {
  const {
    pollingInterval = 5000,
    maxRetries = 3,
    onError,
    onComplete,
    onProgress
  } = options;

  const [session, setSession] = useState<ProcessingSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ProcessingError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Fetch processing session data
  const fetchSession = useCallback(async () => {
    if (!userId || !mountedRef.current) return;

    try {
      setIsConnected(true);
      const response = await processingApi.getProcessingSession(userId);

      if (!mountedRef.current) return;

      if (response.success && response.data) {
        const newSession = response.data;
        setSession(newSession);
        setError(null);
        setRetryCount(0);

        // Trigger callbacks
        if (onProgress) {
          onProgress(newSession);
        }

        if (isProcessingComplete(newSession) && onComplete) {
          onComplete(newSession);
        }
      } else {
        handleApiError(response);
      }
    } catch (err) {
      if (!mountedRef.current) return;

      const processingError = err instanceof ProcessingError
        ? err
        : new ProcessingError('Failed to fetch processing session', 'FETCH_ERROR', err);

      setError(processingError);
      setIsConnected(false);

      if (onError) {
        onError(processingError);
      }

      // Retry logic
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          if (mountedRef.current) {
            fetchSession();
          }
        }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [userId, retryCount, maxRetries, onError, onComplete, onProgress]);

  // Start polling when userId is available
  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchSession();

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      if (mountedRef.current && session && isProcessingActive(session)) {
        fetchSession();
      }
    }, pollingInterval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [userId, fetchSession, pollingInterval, session]);

  // Stop polling when processing is complete
  useEffect(() => {
    if (session && isProcessingComplete(session) && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [session]);

  // Manual refresh function
  const refreshSession = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    await fetchSession();
  }, [userId, fetchSession]);

  // Cancel processing session
  const cancelSession = useCallback(async () => {
    if (!session?.sessionId) return;

    try {
      const response = await processingApi.cancelProcessingSession(session.sessionId);
      if (response.success) {
        setSession(prev => prev ? { ...prev, status: 'cancelled' } : null);
      } else {
        handleApiError(response);
      }
    } catch (err) {
      const processingError = err instanceof ProcessingError
        ? err
        : new ProcessingError('Failed to cancel session', 'CANCEL_ERROR', err);

      setError(processingError);
      if (onError) {
        onError(processingError);
      }
    }
  }, [session?.sessionId, onError]);

  // Utility functions
  const getCurrentStage = useCallback(() => {
    return session ? getActiveStage(session.stages) : null;
  }, [session]);

  const getCompletedStages = useCallback(() => {
    return session?.stages.filter(stage => stage.status === 'complete') || [];
  }, [session]);

  const getPendingStages = useCallback(() => {
    return session?.stages.filter(stage => stage.status === 'pending') || [];
  }, [session]);

  const getEstimatedCompletionTime = useCallback(() => {
    if (!session) return null;

    const totalRemainingTime = session.stages.reduce(
      (sum, stage) => sum + stage.estimatedTimeRemaining,
      0
    );

    const now = new Date();
    return new Date(now.getTime() + (totalRemainingTime * 1000));
  }, [session]);

  // Connection status
  const connectionStatus = useCallback(() => {
    if (error) return 'error';
    if (isLoading) return 'connecting';
    if (isConnected) return 'connected';
    return 'disconnected';
  }, [error, isLoading, isConnected]);

  return {
    // Session data
    session,
    isLoading,
    isConnected,
    error,

    // Session status helpers
    isComplete: session ? isProcessingComplete(session) : false,
    isActive: session ? isProcessingActive(session) : false,
    hasError: session ? hasProcessingError(session) : false,

    // Utility functions
    getCurrentStage,
    getCompletedStages,
    getPendingStages,
    getEstimatedCompletionTime,
    formatTimeRemaining: formatProcessingTime,
    connectionStatus,

    // Actions
    refreshSession,
    cancelSession,

    // Retry info
    retryCount,
    maxRetries
  };
};
