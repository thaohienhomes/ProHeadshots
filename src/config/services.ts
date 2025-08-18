// Service configuration for switching between providers
// This allows easy switching between old and new integrations

export interface ServiceConfig {
  ai: {
    provider: 'replicate' | 'runpod' | 'unified';
    enabled: boolean;
    fallbackEnabled?: boolean;
    primaryProvider?: 'replicate' | 'runpod';
    secondaryProvider?: 'replicate' | 'runpod';
  };
  payment: {
    provider: 'stripe' | 'polar';
    enabled: boolean;
  };
}

// Default configuration - can be overridden by environment variables
const defaultConfig: ServiceConfig = {
  ai: {
    provider: 'replicate', // Phase 1: Replicate only
    enabled: true,
    fallbackEnabled: true,
    primaryProvider: 'replicate',
    secondaryProvider: 'runpod', // Phase 2: RunPod for scaling
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
      provider: (process.env.AI_PROVIDER as 'replicate' | 'runpod' | 'unified') || defaultConfig.ai.provider,
      enabled: process.env.AI_ENABLED !== 'false',
      fallbackEnabled: process.env.AI_FALLBACK_ENABLED !== 'false',
      primaryProvider: (process.env.AI_PRIMARY_PROVIDER as 'replicate' | 'runpod') || defaultConfig.ai.primaryProvider,
      secondaryProvider: (process.env.AI_SECONDARY_PROVIDER as 'replicate' | 'runpod') || defaultConfig.ai.secondaryProvider,
    },
    payment: {
      provider: (process.env.PAYMENT_PROVIDER as 'stripe' | 'polar') || defaultConfig.payment.provider,
      enabled: process.env.PAYMENT_ENABLED !== 'false',
    },
  };
}

// Helper functions to check which service to use
export function isReplicateEnabled(): boolean {
  const config = getServiceConfig();
  return (config.ai.provider === 'replicate' || config.ai.provider === 'unified') && config.ai.enabled;
}

export function isRunPodEnabled(): boolean {
  const config = getServiceConfig();
  return (config.ai.provider === 'runpod' || config.ai.provider === 'unified') && config.ai.enabled;
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
    if ((config.ai.provider === 'replicate' || config.ai.provider === 'unified') && !process.env.REPLICATE_API_TOKEN) {
      errors.push('REPLICATE_API_TOKEN is required when using Replicate or unified service');
    }
    if ((config.ai.provider === 'runpod' || config.ai.provider === 'unified') && !process.env.RUNPOD_API_KEY) {
      errors.push('RUNPOD_API_KEY is required when using RunPod or unified service');
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

  if (isReplicateEnabled()) {
    return {
      createTune: () => import('../app/api/llm/tune/createTuneReplicate').then(m => m.createTuneReplicate),
      createPrompt: () => import('../app/api/llm/prompt/createPromptReplicate').then(m => m.createPromptReplicate),
      getPrompts: () => import('../action/getReplicatePrompts').then(m => m.getReplicatePromptsFromDatabase),
      fixDiscrepancy: () => import('../action/fixDiscrepancyReplicate').then(m => m.fixDiscrepancyReplicate),
    };
  } else if (isRunPodEnabled()) {
    return {
      createTune: () => import('../utils/runpodAI').then(m => m.trainModel),
      createPrompt: () => import('../utils/runpodAI').then(m => m.generateImages),
      getPrompts: () => import('../action/getReplicatePrompts').then(m => m.getReplicatePromptsFromDatabase), // Fallback to replicate
      fixDiscrepancy: () => import('../action/fixDiscrepancyReplicate').then(m => m.fixDiscrepancyReplicate), // Fallback to replicate
    };
  } else if (isUnifiedAIEnabled()) {
    // Phase 2: Unified Replicate + RunPod
    return {
      createTune: () => import('../utils/unifiedAI').then(m => m.unifiedAI.trainModel),
      createPrompt: () => import('../utils/unifiedAI').then(m => m.unifiedAI.generateImages),
      getPrompts: () => import('../action/getReplicatePrompts').then(m => m.getReplicatePromptsFromDatabase),
      fixDiscrepancy: () => import('../action/fixDiscrepancyReplicate').then(m => m.fixDiscrepancyReplicate),
    };
  } else {
    // Fallback to Replicate
    return {
      createTune: () => import('../app/api/llm/tune/createTuneReplicate').then(m => m.createTuneReplicate),
      createPrompt: () => import('../app/api/llm/prompt/createPromptReplicate').then(m => m.createPromptReplicate),
      getPrompts: () => import('../action/getReplicatePrompts').then(m => m.getReplicatePromptsFromDatabase),
      fixDiscrepancy: () => import('../action/fixDiscrepancyReplicate').then(m => m.fixDiscrepancyReplicate),
    };
  }
}

export function getPaymentService() {
  if (isPolarEnabled()) {
    return {
      verifyPayment: () => import('../action/verifyPaymentPolar').then(m => m.verifyPaymentPolar),
      checkoutComponent: () => import('../app/checkout/CheckoutPagePolar').then(m => m.default),
      pricingPlans: () => {
        // Use explicit imports to avoid webpack dynamic import warnings
        if (process.env.NODE_ENV === 'production') {
          return import('../app/checkout/pricingPlansPolar.json');
        } else {
          return import('../app/checkout/pricingPlansPolar.dev.json');
        }
      },
    };
  } else {
    return {
      verifyPayment: () => import('../action/verifyPayment').then(m => m.verifyPayment),
      checkoutComponent: () => import('../app/checkout/page').then(m => m.default),
      pricingPlans: () => import('../app/checkout/pricingPlans.json'),
    };
  }
}
