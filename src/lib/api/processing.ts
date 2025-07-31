// Production API client for AI processing
import { getAuthHeaders } from '@/lib/auth/authUtils';

export interface ProcessingStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  progress: number; // 0-100
  estimatedTimeRemaining: number; // seconds
  actualTimeElapsed: number; // seconds
  startTime?: string; // ISO string
  endTime?: string; // ISO string
  metrics?: {
    gpuUsage: number;
    memoryUsage: number;
    modelAccuracy: number;
    processingSpeed: number;
  };
  logs?: string[];
  errorMessage?: string;
}

export interface ProcessingSession {
  sessionId: string;
  userId: string;
  status: 'initializing' | 'processing' | 'complete' | 'error' | 'cancelled';
  overallProgress: number;
  estimatedTotalTime: number;
  actualElapsedTime: number;
  stages: ProcessingStage[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  errorMessage?: string;
  systemLoad: {
    queuePosition: number;
    averageWaitTime: number;
    activeJobs: number;
    systemCapacity: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

class ProcessingApiClient {
  private baseUrl: string;
  private retryAttempts = 3;
  private retryDelay = 1000; // ms

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    return await getAuthHeaders();
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed (attempt ${attempt}):`, error);

      // Retry logic for network errors
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * attempt);
        return this.makeRequest<T>(endpoint, options, attempt + 1);
      }

      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      error instanceof TypeError || // Network error
      error.message.includes('timeout') ||
      (error.message.includes('HTTP 5'))
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get current processing session for user
  async getProcessingSession(userId: string): Promise<ApiResponse<ProcessingSession>> {
    return this.makeRequest<ProcessingSession>(`/processing/session/${userId}`);
  }

  // Start new processing session
  async startProcessingSession(
    userId: string,
    photoIds: string[],
    preferences?: any
  ): Promise<ApiResponse<ProcessingSession>> {
    return this.makeRequest<ProcessingSession>('/processing/session', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        photoIds,
        preferences,
      }),
    });
  }

  // Get real-time processing updates
  async getProcessingUpdates(sessionId: string): Promise<ApiResponse<ProcessingSession>> {
    return this.makeRequest<ProcessingSession>(`/processing/session/${sessionId}/updates`);
  }

  // Cancel processing session
  async cancelProcessingSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/processing/session/${sessionId}/cancel`, {
      method: 'POST',
    });
  }

  // Get system metrics
  async getSystemMetrics(): Promise<ApiResponse<{
    currentLoad: number;
    queueLength: number;
    averageProcessingTime: number;
    gpuUtilization: number;
    activeJobs: number;
    maxCapacity: number;
    peakHours: boolean;
    maintenanceMode: boolean;
  }>> {
    return this.makeRequest('/processing/system/metrics');
  }

  // Get processing history for user
  async getProcessingHistory(
    userId: string,
    limit = 10
  ): Promise<ApiResponse<ProcessingSession[]>> {
    return this.makeRequest<ProcessingSession[]>(
      `/processing/history/${userId}?limit=${limit}`
    );
  }

  // Report processing feedback
  async submitProcessingFeedback(
    sessionId: string,
    feedback: {
      satisfaction: number; // 1-5
      quality: number; // 1-5
      speed: number; // 1-5
      comments?: string;
    }
  ): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/processing/session/${sessionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }
}

// Singleton instance
export const processingApi = new ProcessingApiClient();

// Error handling utilities
export class ProcessingError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ProcessingError';
  }
}

export const handleApiError = (response: ApiResponse<any>): never => {
  if (!response.success && response.error) {
    throw new ProcessingError(
      response.error.message,
      response.error.code,
      response.error.details
    );
  }
  throw new ProcessingError('Unknown API error', 'UNKNOWN_ERROR');
};

// Utility functions for processing data
export const calculateOverallProgress = (stages: ProcessingStage[]): number => {
  if (stages.length === 0) return 0;
  
  const totalProgress = stages.reduce((sum, stage) => sum + stage.progress, 0);
  return Math.round(totalProgress / stages.length);
};

export const getActiveStage = (stages: ProcessingStage[]): ProcessingStage | null => {
  return stages.find(stage => stage.status === 'active') || null;
};

export const getTotalEstimatedTime = (stages: ProcessingStage[]): number => {
  return stages.reduce((sum, stage) => sum + stage.estimatedTimeRemaining, 0);
};

export const formatProcessingTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${Math.floor(seconds)}s`;
  }
};

// Processing status helpers
export const isProcessingComplete = (session: ProcessingSession): boolean => {
  return session.status === 'complete' || session.overallProgress >= 100;
};

export const isProcessingActive = (session: ProcessingSession): boolean => {
  return session.status === 'processing' || session.status === 'initializing';
};

export const hasProcessingError = (session: ProcessingSession): boolean => {
  return session.status === 'error' || session.stages.some(stage => stage.status === 'error');
};
