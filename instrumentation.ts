// TEMPORARILY DISABLED - Sentry instrumentation
export async function register() {
  // TEMPORARILY DISABLED - All Sentry initialization
  console.log('Sentry temporarily disabled for streamlined deployment');
}
      
      // Filter server-side errors
      beforeSend(event, hint) {
        // Filter out development errors
        if (process.env.NODE_ENV === 'development') {
          return event;
        }
        
        // Filter out common server errors that aren't actionable
        if (event.exception) {
          const error = hint.originalException;
          if (error && error.message) {
            // Filter out connection errors that are expected
            if (error.message.includes('ECONNRESET')) {
              return null;
            }
            if (error.message.includes('EPIPE')) {
              return null;
            }
          }
        }
        
        return event;
      },
      
      // Add server context
      initialScope: {
        tags: {
          component: 'server',
          app: 'proheadshots'
        },
      },
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime Sentry initialization
    const { init } = await import('@sentry/nextjs');
    
    init({
      dsn: process.env.SENTRY_DSN,
      
      // Environment configuration
      environment: process.env.NODE_ENV || 'development',
      release: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      
      // Performance monitoring (reduced for edge)
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.5,
      
      // Error sampling
      sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Edge-specific configuration
      beforeSend(event, hint) {
        // Filter out development errors
        if (process.env.NODE_ENV === 'development') {
          return event;
        }
        
        return event;
      },
      
      // Add edge context
      initialScope: {
        tags: {
          component: 'edge',
          app: 'proheadshots'
        },
      },
    });
  }
}

export async function onRequestError(err: unknown, request: Request, context: any) {
  // Import Sentry dynamically to avoid issues during build
  const { captureRequestError } = await import('@sentry/nextjs');

  captureRequestError(err, request, context, {
    tags: {
      component: 'request-error-handler',
    },
  });
}
