import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { errorTracker } from '@/utils/errorTracking';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoint not available in production' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    
    if (body.test) {
      // Test different types of server errors
      const errorType = body.errorType || 'generic';
      
      switch (errorType) {
        case 'database':
          throw new Error('Database connection failed - Test error');
          
        case 'api':
          throw new Error('External API call failed - Test error');
          
        case 'validation':
          throw new Error('Validation failed - Test error');
          
        case 'timeout':
          throw new Error('Request timeout - Test error');
          
        default:
          throw new Error('Generic server error - Test error from Sentry API endpoint');
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test completed successfully'
    });
    
  } catch (error) {
    // Capture error with context
    const errorId = errorTracker.captureError(error as Error, {
      tags: {
        component: 'test-sentry-api',
        endpoint: '/api/test-sentry-error'
      },
      extra: {
        requestMethod: request.method,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      }
    });
    
    // Also test direct Sentry capture
    Sentry.captureException(error, {
      tags: {
        component: 'test-api',
        direct_capture: true
      }
    });
    
    return NextResponse.json(
      { 
        error: 'Server error occurred',
        errorId,
        message: (error as Error).message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoint not available in production' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: 'Sentry test endpoint is available',
    environment: process.env.NODE_ENV,
    sentryConfigured: !!process.env.SENTRY_DSN
  });
}
