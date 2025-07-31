// Initialize the hybrid AI system
// This should be called when the application starts

import { unifiedAI } from './unifiedAI';
import { healthMonitor } from './providerHealthMonitoring';
import { logger } from './logger';
import { getServiceConfig } from '../config/services';

let initialized = false;

/**
 * Initialize the hybrid AI system
 */
export async function initializeAISystem(): Promise<void> {
  if (initialized) {
    logger.info('AI system already initialized', {}, 'AI_INIT');
    return;
  }

  try {
    const config = getServiceConfig();
    
    logger.info('Initializing hybrid AI system', {
      provider: config.ai.provider,
      primaryProvider: config.ai.primaryProvider,
      secondaryProvider: config.ai.secondaryProvider,
      fallbackEnabled: config.ai.fallbackEnabled,
    }, 'AI_INIT');

    // Start health monitoring if using unified service
    if (config.ai.provider === 'unified') {
      logger.info('Starting provider health monitoring', {}, 'AI_INIT');
      healthMonitor.startMonitoring();
      
      // Wait a moment for initial health checks
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log initial system health
      const systemHealth = healthMonitor.getSystemHealth();
      logger.info('Initial system health check completed', {
        overall: systemHealth.overall,
        providers: Object.keys(systemHealth.providers),
        recommendations: systemHealth.recommendations,
      }, 'AI_INIT');
    }

    initialized = true;
    logger.info('Hybrid AI system initialized successfully', {}, 'AI_INIT');

  } catch (error) {
    logger.error('Failed to initialize AI system', error, 'AI_INIT_ERROR');
    throw error;
  }
}

/**
 * Shutdown the AI system gracefully
 */
export async function shutdownAISystem(): Promise<void> {
  if (!initialized) {
    return;
  }

  try {
    logger.info('Shutting down AI system', {}, 'AI_SHUTDOWN');
    
    // Stop health monitoring
    healthMonitor.stopMonitoring();
    
    // Cleanup unified AI service
    unifiedAI.destroy();
    
    initialized = false;
    logger.info('AI system shutdown completed', {}, 'AI_SHUTDOWN');

  } catch (error) {
    logger.error('Error during AI system shutdown', error, 'AI_SHUTDOWN_ERROR');
  }
}

/**
 * Get the initialization status
 */
export function isAISystemInitialized(): boolean {
  return initialized;
}

/**
 * Force re-initialization (useful for configuration changes)
 */
export async function reinitializeAISystem(): Promise<void> {
  logger.info('Forcing AI system re-initialization', {}, 'AI_REINIT');
  
  await shutdownAISystem();
  await initializeAISystem();
}

/**
 * Get comprehensive system status
 */
export function getAISystemStatus() {
  const config = getServiceConfig();
  
  return {
    initialized,
    configuration: {
      provider: config.ai.provider,
      enabled: config.ai.enabled,
      fallbackEnabled: config.ai.fallbackEnabled,
      primaryProvider: config.ai.primaryProvider,
      secondaryProvider: config.ai.secondaryProvider,
    },
    systemHealth: initialized && config.ai.provider === 'unified' 
      ? healthMonitor.getSystemHealth() 
      : null,
    unifiedAIHealth: initialized && config.ai.provider === 'unified'
      ? unifiedAI.getSystemHealth()
      : null,
  };
}

// Auto-initialize in production environments
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // Only auto-initialize in server-side production
  initializeAISystem().catch(error => {
    logger.error('Auto-initialization failed', error, 'AI_AUTO_INIT_ERROR');
  });
}
