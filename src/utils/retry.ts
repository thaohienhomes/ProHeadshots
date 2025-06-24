import { logger } from './logger';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error: any) => {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error.name === 'NetworkError' || error.name === 'TimeoutError') {
      return true;
    }
    if (error.status >= 500 && error.status < 600) {
      return true;
    }
    // Retry on specific error codes
    if (error.status === 429) { // Rate limited
      return true;
    }
    return false;
  },
  onRetry: () => {},
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const data = await operation();
      
      if (attempt > 1) {
        logger.info(`Operation succeeded after ${attempt} attempts`, 'RETRY');
      }
      
      return {
        success: true,
        data,
        attempts: attempt,
      };
    } catch (error: any) {
      lastError = error;
      
      logger.warn(
        `Operation failed on attempt ${attempt}/${opts.maxAttempts}`,
        'RETRY',
        { error: error.message, status: error.status }
      );

      // Check if we should retry
      if (attempt === opts.maxAttempts || !opts.retryCondition(error)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      );

      logger.debug(`Retrying in ${delay}ms...`, 'RETRY');
      
      // Call retry callback
      opts.onRetry(attempt, error);

      // Wait before retrying
      await sleep(delay);
    }
  }

  logger.error(
    `Operation failed after ${opts.maxAttempts} attempts`,
    lastError,
    'RETRY'
  );

  return {
    success: false,
    error: lastError,
    attempts: opts.maxAttempts,
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Specialized retry functions for common use cases

export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  return withRetry(apiCall, {
    maxAttempts: 3,
    baseDelay: 1000,
    retryCondition: (error) => {
      // Retry on network errors and 5xx errors
      return error.status >= 500 || error.name === 'NetworkError' || error.name === 'TimeoutError';
    },
    ...options,
  });
}

export async function retryUpload<T>(
  uploadOperation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  return withRetry(uploadOperation, {
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    retryCondition: (error) => {
      // Retry on network errors, timeouts, and specific upload errors
      if (error.name === 'NetworkError' || error.name === 'TimeoutError') {
        return true;
      }
      if (error.status === 413) { // Payload too large - don't retry
        return false;
      }
      if (error.status >= 500) {
        return true;
      }
      return false;
    },
    ...options,
  });
}

export async function retryPayment<T>(
  paymentOperation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  return withRetry(paymentOperation, {
    maxAttempts: 2, // Be conservative with payment retries
    baseDelay: 3000,
    retryCondition: (error) => {
      // Only retry on network errors and 5xx errors
      // Don't retry on 4xx errors (client errors)
      return error.status >= 500 || error.name === 'NetworkError';
    },
    ...options,
  });
}

export async function retryAiGeneration<T>(
  aiOperation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  return withRetry(aiOperation, {
    maxAttempts: 4,
    baseDelay: 5000,
    maxDelay: 60000,
    retryCondition: (error) => {
      // Retry on network errors, timeouts, and rate limits
      if (error.name === 'NetworkError' || error.name === 'TimeoutError') {
        return true;
      }
      if (error.status === 429 || error.status >= 500) {
        return true;
      }
      return false;
    },
    ...options,
  });
}

// Utility for creating timeout promises
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        const error = new Error(timeoutMessage);
        error.name = 'TimeoutError';
        reject(error);
      }, timeoutMs);
    }),
  ]);
}

export default withRetry;
