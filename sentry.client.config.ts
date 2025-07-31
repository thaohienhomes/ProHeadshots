// This file configures the initialization of Sentry on the browser/client side
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Error sampling
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay for debugging (optional)
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Integration configuration
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
    new Sentry.BrowserTracing({
      // Set up automatic route change tracking for Next.js App Router
      routingInstrumentation: Sentry.nextRouterInstrumentation({
        // Add any custom routing configuration here
      }),
    }),
  ],
  
  // Filter out noise
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return event;
    }
    
    // Filter out common browser extension errors
    if (event.exception) {
      const error = hint.originalException;
      if (error && error.message) {
        // Filter out extension-related errors
        if (error.message.includes('Non-Error promise rejection captured')) {
          return null;
        }
        if (error.message.includes('ResizeObserver loop limit exceeded')) {
          return null;
        }
        if (error.message.includes('Script error')) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Add user context
  initialScope: {
    tags: {
      component: 'client',
      app: 'coolpix-me'
    },
  },
});
