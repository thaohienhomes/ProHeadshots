'use client';

import { useState } from 'react';

interface PaymentError {
  type: 'network' | 'timeout' | 'validation' | 'server' | 'unknown';
  message: string;
  code?: string;
  retryable: boolean;
}

interface PaymentErrorHandlerProps {
  error: PaymentError;
  onRetry: () => void;
  onContactSupport: () => void;
  checkoutId?: string;
}

export default function PaymentErrorHandler({ 
  error, 
  onRetry, 
  onContactSupport,
  checkoutId 
}: PaymentErrorHandlerProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return '🌐';
      case 'timeout':
        return '⏱️';
      case 'validation':
        return '⚠️';
      case 'server':
        return '🔧';
      default:
        return '❌';
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case 'network':
        return 'Connection Issue';
      case 'timeout':
        return 'Request Timed Out';
      case 'validation':
        return 'Validation Error';
      case 'server':
        return 'Server Error';
      default:
        return 'Payment Error';
    }
  };

  const getHelpText = () => {
    switch (error.type) {
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'timeout':
        return 'The request took too long. This might be due to high server load.';
      case 'validation':
        return 'There was an issue with the payment information provided.';
      case 'server':
        return 'Our servers are experiencing issues. Please try again in a moment.';
      default:
        return 'An unexpected error occurred. Please try again or contact support.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-8">
      <div className="bg-navy-800/50 backdrop-blur-sm border border-red-400/20 rounded-2xl p-8 max-w-md w-full">
        {/* Error Icon */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{getErrorIcon()}</div>
          <h2 className="text-2xl font-bold text-white mb-2">{getErrorTitle()}</h2>
          <p className="text-navy-300 mb-4">{error.message}</p>
          <p className="text-navy-400 text-sm">{getHelpText()}</p>
        </div>

        {/* Error Details */}
        {(error.code || checkoutId) && (
          <div className="bg-navy-900/50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-navy-300 mb-2">Error Details</h3>
            {error.code && (
              <p className="text-xs text-navy-400 mb-1">
                <span className="font-medium">Code:</span> {error.code}
              </p>
            )}
            {checkoutId && (
              <p className="text-xs text-navy-400">
                <span className="font-medium">Checkout ID:</span> {checkoutId}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {error.retryable && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full bg-gradient-to-r from-cyan-500 to-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Retrying...
                </div>
              ) : (
                'Try Again'
              )}
            </button>
          )}
          
          <button
            onClick={onContactSupport}
            className="w-full bg-navy-700 hover:bg-navy-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 border border-navy-600"
          >
            Contact Support
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-6 pt-6 border-t border-navy-700">
          <p className="text-navy-400 text-xs text-center">
            If this problem persists, please contact our support team with the error details above.
          </p>
        </div>
      </div>
    </div>
  );
}
