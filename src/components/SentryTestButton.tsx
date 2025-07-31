'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { errorTracker } from '@/utils/errorTracking';

interface SentryTestButtonProps {
  className?: string;
}

export default function SentryTestButton({ className = '' }: SentryTestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');

  const testClientError = () => {
    setIsLoading(true);
    try {
      // Test direct Sentry error
      throw new Error('Test client-side error from Sentry Test Button');
    } catch (error) {
      // Capture with our error tracking service
      const errorId = errorTracker.captureError(error as Error, {
        user: {
          id: 'test-user',
          email: 'test@coolpix.me',
          plan: 'premium'
        },
        tags: {
          component: 'SentryTestButton',
          test_type: 'client_error'
        },
        extra: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      });
      
      setLastResult(`Client error captured with ID: ${errorId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testMessage = () => {
    setIsLoading(true);
    
    const messageId = errorTracker.captureMessage('Test Sentry message', 'info', {
      user: {
        id: 'test-user',
        email: 'test@coolpix.me',
        plan: 'premium'
      },
      tags: {
        component: 'SentryTestButton',
        test_type: 'message'
      },
      extra: {
        timestamp: new Date().toISOString(),
        test_data: { foo: 'bar', number: 42 }
      }
    });
    
    setLastResult(`Message captured with ID: ${messageId}`);
    setIsLoading(false);
  };

  const testServerError = async () => {
    setIsLoading(true);
    try {
      // Test server-side error by calling an API endpoint
      const response = await fetch('/api/test-sentry-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      setLastResult(`Server test completed: ${result.message}`);
    } catch (error) {
      const errorId = errorTracker.captureError(error as Error, {
        tags: {
          component: 'SentryTestButton',
          test_type: 'server_error'
        }
      });
      setLastResult(`Server error captured with ID: ${errorId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testPerformance = () => {
    setIsLoading(true);
    
    // Test performance monitoring
    const transaction = Sentry.startTransaction({
      name: 'Test Performance Transaction',
      op: 'test'
    });
    
    Sentry.getCurrentHub().configureScope(scope => scope.setSpan(transaction));
    
    // Simulate some work
    setTimeout(() => {
      const span = transaction.startChild({
        op: 'test-operation',
        description: 'Simulated work'
      });
      
      setTimeout(() => {
        span.finish();
        transaction.finish();
        setLastResult('Performance transaction completed');
        setIsLoading(false);
      }, 1000);
    }, 500);
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className={`p-4 border border-gray-300 rounded-lg bg-gray-50 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">🔍 Sentry Error Tracking Test</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={testClientError}
          disabled={isLoading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test Client Error
        </button>
        
        <button
          onClick={testMessage}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Message
        </button>
        
        <button
          onClick={testServerError}
          disabled={isLoading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Test Server Error
        </button>
        
        <button
          onClick={testPerformance}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Performance
        </button>
      </div>
      
      {lastResult && (
        <div className="p-3 bg-gray-100 rounded text-sm text-gray-700">
          <strong>Last Result:</strong> {lastResult}
        </div>
      )}
      
      {isLoading && (
        <div className="text-center text-gray-600">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          <span className="ml-2">Testing...</span>
        </div>
      )}
    </div>
  );
}
