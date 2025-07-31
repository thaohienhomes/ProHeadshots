// This file configures the initialization of Sentry for edge runtime
import * as Sentry from "@sentry/nextjs";

Sentry.init({
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
      app: 'coolpix-me'
    },
  },
});
