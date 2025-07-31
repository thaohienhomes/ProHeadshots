'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class WaitPageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Wait Page Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to analytics if available
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: error.message,
          fatal: false,
        });
      }
    } catch (analyticsError) {
      console.warn('Failed to log error to analytics:', analyticsError);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-navy-800/50 backdrop-blur-sm border border-red-400/20 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-navy-200 mb-6 leading-relaxed">
              We encountered an unexpected error while loading your wait page. 
              Don&apos;t worry - your headshot processing is still running in the background.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-red-400 text-sm cursor-pointer mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-navy-900/50 border border-red-400/20 rounded p-3 text-xs text-red-300 font-mono">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-navy-700 hover:bg-navy-600 text-navy-300 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-navy-600">
              <p className="text-navy-400 text-sm">
                Your AI headshots are still being processed. You&apos;ll receive an email when they&apos;re ready.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <WaitPageErrorBoundary fallback={fallback}>
        <Component {...props} />
      </WaitPageErrorBoundary>
    );
  };
}

export default WaitPageErrorBoundary;
