// This file configures the initialization of Sentry on the server side
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Error sampling
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Server-specific integrations
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: undefined }),
  ],
  
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
      app: 'coolpix-me'
    },
  },
});
