// Service configuration for switching between providers
// This allows easy switching between old and new integrations

export interface ServiceConfig {
  ai: {
    provider: 'astria' | 'fal' | 'leonardo' | 'unified';
    enabled: boolean;
    fallbackEnabled?: boolean;
    primaryProvider?: 'fal' | 'leonardo';
    secondaryProvider?: 'fal' | 'leonardo';
  };
  payment: {
    provider: 'stripe' | 'polar';
    enabled: boolean;
  };
}

// Default configuration - can be overridden by environment variables
const defaultConfig: ServiceConfig = {
  ai: {
    provider: 'unified', // Default to unified AI service
    enabled: true,
    fallbackEnabled: true,
    primaryProvider: 'fal',
    secondaryProvider: 'leonardo',
  },
  payment: {
    provider: 'polar', // Default to Polar Payment
    enabled: true,
  },
};

// Get configuration from environment variables or use defaults
export function getServiceConfig(): ServiceConfig {
  return {
    ai: {
      provider: (process.env.AI_PROVIDER as 'astria' | 'fal' | 'leonardo' | 'unified') || defaultConfig.ai.provider,
      enabled: process.env.AI_ENABLED !== 'false',
      fallbackEnabled: process.env.AI_FALLBACK_ENABLED !== 'false',
      primaryProvider: (process.env.AI_PRIMARY_PROVIDER as 'fal' | 'leonardo') || defaultConfig.ai.primaryProvider,
      secondaryProvider: (process.env.AI_SECONDARY_PROVIDER as 'fal' | 'leonardo') || defaultConfig.ai.secondaryProvider,
    },
    payment: {
      provider: (process.env.PAYMENT_PROVIDER as 'stripe' | 'polar') || defaultConfig.payment.provider,
      enabled: process.env.PAYMENT_ENABLED !== 'false',
    },
  };
}

// Helper functions to check which service to use
export function isAstriaEnabled(): boolean {
  const config = getServiceConfig();
  return config.ai.provider === 'astria' && config.ai.enabled;
}

export function isFalAIEnabled(): boolean {
  const config = getServiceConfig();
  return (config.ai.provider === 'fal' || config.ai.provider === 'unified') && config.ai.enabled;
}

export function isLeonardoAIEnabled(): boolean {
  const config = getServiceConfig();
  return (config.ai.provider === 'leonardo' || config.ai.provider === 'unified') && config.ai.enabled;
}

export function isUnifiedAIEnabled(): boolean {
  const config = getServiceConfig();
  return config.ai.provider === 'unified' && config.ai.enabled;
}

export function isStripeEnabled(): boolean {
  const config = getServiceConfig();
  return config.payment.provider === 'stripe' && config.payment.enabled;
}

export function isPolarEnabled(): boolean {
  const config = getServiceConfig();
  // For testing purposes, allow Polar even if token is invalid
  // In production, you should validate the token
  return config.payment.provider === 'polar' && config.payment.enabled;
}

// Validation functions
export function validateServiceConfig(): { valid: boolean; errors: string[] } {
  const config = getServiceConfig();
  const errors: string[] = [];

  // Validate AI service configuration
  if (config.ai.enabled) {
    if (config.ai.provider === 'astria' && !process.env.ASTRIA_API_KEY) {
      errors.push('ASTRIA_API_KEY is required when using Astria AI');
    }
    if ((config.ai.provider === 'fal' || config.ai.provider === 'unified') && !process.env.FAL_AI_API_KEY) {
      errors.push('FAL_AI_API_KEY is required when using Fal AI or unified service');
    }
    if ((config.ai.provider === 'leonardo' || config.ai.provider === 'unified') && !process.env.LEONARDO_API_KEY) {
      errors.push('LEONARDO_API_KEY is required when using Leonardo AI or unified service');
    }
    if (config.ai.provider === 'unified') {
      if (!config.ai.primaryProvider || !config.ai.secondaryProvider) {
        errors.push('PRIMARY_PROVIDER and SECONDARY_PROVIDER must be set when using unified AI service');
      }
      if (config.ai.primaryProvider === config.ai.secondaryProvider) {
        errors.push('PRIMARY_PROVIDER and SECONDARY_PROVIDER must be different');
      }
    }
  }

  // Validate payment service configuration
  if (config.payment.enabled) {
    if (config.payment.provider === 'stripe') {
      if (!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_TEST_SECRET_KEY) {
        errors.push('STRIPE_SECRET_KEY or STRIPE_TEST_SECRET_KEY is required when using Stripe');
      }
    }
    if (config.payment.provider === 'polar' && !process.env.POLAR_ACCESS_TOKEN) {
      errors.push('POLAR_ACCESS_TOKEN is required when using Polar Payment');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Get the appropriate service functions based on configuration
export function getAIService() {
  const config = getServiceConfig();

  // Temporarily disable unified provider to avoid server-side import issues
  // TODO: Fix server-side import issues in unified AI provider
  if (false && config.ai.provider === 'unified') {
    return {
      createTune: () => Promise.resolve({ POST: () => Promise.resolve(new Response('Service temporarily disabled', { status: 503 })) }),
      createPrompt: () => Promise.resolve({ POST: () => Promise.resolve(new Response('Service temporarily disabled', { status: 503 })) }),
      getPrompts: () => import('../action/getFalPrompts').then(m => m.getFalPromptsFromDatabase), // Use fal for now
      fixDiscrepancy: () => import('../action/fixDiscrepancyFal').then(m => m.fixDiscrepancyFal), // Use fal for now
      healthCheck: () => Promise.resolve({ GET: () => Promise.resolve(new Response('Service temporarily disabled', { status: 503 })) }),
    };
  } else if (isFalAIEnabled()) {
    return {
      createTune: () => import('../app/api/llm/tune/createTuneFal').then(m => m.createTuneFal),
      createPrompt: () => import('../app/api/llm/prompt/createPromptFal').then(m => m.createPromptFal),
      getPrompts: () => import('../action/getFalPrompts').then(m => m.getFalPromptsFromDatabase),
      fixDiscrepancy: () => import('../action/fixDiscrepancyFal').then(m => m.fixDiscrepancyFal),
    };
  } else if (isLeonardoAIEnabled()) {
    return {
      createTune: () => import('../utils/leonardoAI').then(m => m.trainModel),
      createPrompt: () => import('../utils/leonardoAI').then(m => m.generateImages),
      getPrompts: () => import('../action/getFalPrompts').then(m => m.getFalPromptsFromDatabase), // Fallback to fal
      fixDiscrepancy: () => import('../action/fixDiscrepancyFal').then(m => m.fixDiscrepancyFal), // Fallback to fal
    };
  } else {
    return {
      createTune: () => import('../app/api/llm/tune/createTune').then(m => m.createTune),
      createPrompt: () => import('../app/api/llm/prompt/createPrompt').then(m => m.createPrompt),
      getPrompts: () => import('../action/getAstriaPrompts').then(m => m.getAstriaPrompts),
      fixDiscrepancy: () => import('../action/fixDiscrepancy').then(m => m.fixDiscrepancy),
    };
  }
}

export function getPaymentService() {
  if (isPolarEnabled()) {
    // Use development pricing for non-production environments
    const pricingFile = process.env.NODE_ENV === 'production'
      ? '../app/checkout/pricingPlansPolar.json'
      : '../app/checkout/pricingPlansPolar.dev.json';

    return {
      verifyPayment: () => import('../action/verifyPaymentPolar').then(m => m.verifyPaymentPolar),
      checkoutComponent: () => import('../app/checkout/CheckoutPagePolar').then(m => m.default),
      pricingPlans: () => import(pricingFile),
    };
  } else {
    return {
      verifyPayment: () => import('../action/verifyPayment').then(m => m.verifyPayment),
      checkoutComponent: () => import('../app/checkout/page').then(m => m.default),
      pricingPlans: () => import('../app/checkout/pricingPlans.json'),
    };
  }
}
