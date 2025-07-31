import { createClient } from './supabase/server';
import { logger } from './logger';
import { FalAIModelId, FalAIImageGenerationResult } from './falAI';
import { LeonardoAIModelId } from './leonardoAI';
import { UnifiedImageGenerationResult, AIProvider } from './unifiedAI';
import { ProviderStatus } from './providerHealthMonitoring';

export interface CacheEntry {
  id: string;
  cache_key: string;
  cache_type: 'generation' | 'model_selection' | 'user_preference' | 'model_performance' | 'provider_health' | 'unified_generation';
  data: any;
  metadata: {
    model_id?: FalAIModelId | LeonardoAIModelId | string;
    user_id?: string;
    prompt_hash?: string;
    parameters_hash?: string;
    quality_score?: number;
    generation_time?: number;
    cost?: number;
    provider?: AIProvider;
    fallback_used?: boolean;
  };
  created_at: string;
  expires_at: string;
  access_count: number;
  last_accessed: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  maxSize?: number;
  enableCompression?: boolean;
  enablePersistence?: boolean;
}

export interface GenerationCacheKey {
  prompt: string;
  modelId: FalAIModelId | LeonardoAIModelId | string;
  parameters: Record<string, any>;
  userId?: string;
  provider?: AIProvider;
}

export interface UnifiedGenerationCacheKey {
  prompt: string;
  requirements?: any;
  parameters: Record<string, any>;
  userId?: string;
}

export interface ProviderHealthCacheKey {
  provider: AIProvider;
  timestamp?: number;
}

export interface ModelSelectionCacheKey {
  requirements: any;
  imageCharacteristics?: any;
  userId?: string;
}

/**
 * Advanced AI-specific caching system with intelligent cache management
 */
export class AICache {
  private memoryCache = new Map<string, CacheEntry>();
  private cacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
  };

  constructor(private options: CacheOptions = {}) {
    this.options = {
      ttl: 3600, // 1 hour default
      maxSize: 1000,
      enableCompression: true,
      enablePersistence: true,
      ...options,
    };

    // Start cleanup interval
    setInterval(() => this.cleanup(), 300000); // 5 minutes
  }

  /**
   * Cache AI generation results with intelligent deduplication
   */
  async cacheGeneration(
    key: GenerationCacheKey,
    result: FalAIImageGenerationResult,
    metadata: {
      generationTime: number;
      cost: number;
      qualityScore?: number;
    }
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey('generation', key);
      const entry: CacheEntry = {
        id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cache_key: cacheKey,
        cache_type: 'generation',
        data: this.compressData(result),
        metadata: {
          model_id: key.modelId,
          user_id: key.userId,
          prompt_hash: this.hashString(key.prompt),
          parameters_hash: this.hashString(JSON.stringify(key.parameters)),
          quality_score: metadata.qualityScore,
          generation_time: metadata.generationTime,
          cost: metadata.cost,
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (this.options.ttl! * 1000)).toISOString(),
        access_count: 0,
        last_accessed: new Date().toISOString(),
      };

      // Store in memory cache
      this.memoryCache.set(cacheKey, entry);

      // Store in persistent cache if enabled
      if (this.options.enablePersistence) {
        await this.persistCacheEntry(entry);
      }

      // Enforce cache size limits
      await this.enforceCacheSize();

      logger.info('AI generation result cached', {
        cacheKey,
        modelId: key.modelId,
        promptLength: key.prompt.length,
        generationTime: metadata.generationTime,
      }, 'AI_CACHE');

    } catch (error) {
      logger.error('Error caching AI generation', error, 'AI_CACHE');
    }
  }

  /**
   * Retrieve cached generation result
   */
  async getCachedGeneration(key: GenerationCacheKey): Promise<FalAIImageGenerationResult | null> {
    try {
      this.cacheStats.totalRequests++;
      const cacheKey = this.generateCacheKey('generation', key);
      
      // Check memory cache first
      let entry = this.memoryCache.get(cacheKey);
      
      // Check persistent cache if not in memory
      if (!entry && this.options.enablePersistence) {
        entry = await this.getPersistentCacheEntry(cacheKey);
        if (entry) {
          this.memoryCache.set(cacheKey, entry);
        }
      }

      if (!entry) {
        this.cacheStats.misses++;
        return null;
      }

      // Check if expired
      if (new Date() > new Date(entry.expires_at)) {
        await this.removeCacheEntry(cacheKey);
        this.cacheStats.misses++;
        return null;
      }

      // Update access statistics
      entry.access_count++;
      entry.last_accessed = new Date().toISOString();
      await this.updateCacheEntry(entry);

      this.cacheStats.hits++;
      
      logger.info('AI generation cache hit', {
        cacheKey,
        accessCount: entry.access_count,
        age: Date.now() - new Date(entry.created_at).getTime(),
      }, 'AI_CACHE');

      return this.decompressData(entry.data);

    } catch (error) {
      logger.error('Error retrieving cached generation', error, 'AI_CACHE');
      this.cacheStats.misses++;
      return null;
    }
  }

  /**
   * Cache model selection results
   */
  async cacheModelSelection(
    key: ModelSelectionCacheKey,
    selection: any,
    confidence: number
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey('model_selection', key);
      const entry: CacheEntry = {
        id: `sel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cache_key: cacheKey,
        cache_type: 'model_selection',
        data: this.compressData(selection),
        metadata: {
          user_id: key.userId,
          quality_score: confidence,
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (this.options.ttl! * 1000)).toISOString(),
        access_count: 0,
        last_accessed: new Date().toISOString(),
      };

      this.memoryCache.set(cacheKey, entry);

      if (this.options.enablePersistence) {
        await this.persistCacheEntry(entry);
      }

    } catch (error) {
      logger.error('Error caching model selection', error, 'AI_CACHE');
    }
  }

  /**
   * Get cached model selection
   */
  async getCachedModelSelection(key: ModelSelectionCacheKey): Promise<any | null> {
    try {
      const cacheKey = this.generateCacheKey('model_selection', key);
      const entry = await this.getCacheEntry(cacheKey);
      
      if (!entry) return null;
      
      return this.decompressData(entry.data);
    } catch (error) {
      logger.error('Error retrieving cached model selection', error, 'AI_CACHE');
      return null;
    }
  }

  /**
   * Cache user preferences for faster model selection
   */
  async cacheUserPreferences(userId: string, preferences: any): Promise<void> {
    try {
      const cacheKey = `user_pref_${userId}`;
      const entry: CacheEntry = {
        id: `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cache_key: cacheKey,
        cache_type: 'user_preference',
        data: preferences,
        metadata: {
          user_id: userId,
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (86400 * 1000)).toISOString(), // 24 hours
        access_count: 0,
        last_accessed: new Date().toISOString(),
      };

      this.memoryCache.set(cacheKey, entry);

      if (this.options.enablePersistence) {
        await this.persistCacheEntry(entry);
      }

    } catch (error) {
      logger.error('Error caching user preferences', error, 'AI_CACHE');
    }
  }

  /**
   * Get cached user preferences
   */
  async getCachedUserPreferences(userId: string): Promise<any | null> {
    try {
      const cacheKey = `user_pref_${userId}`;
      const entry = await this.getCacheEntry(cacheKey);

      if (!entry) return null;

      return entry.data;
    } catch (error) {
      logger.error('Error retrieving cached user preferences', error, 'AI_CACHE');
      return null;
    }
  }

  /**
   * Cache unified AI generation results
   */
  async cacheUnifiedGeneration(
    key: UnifiedGenerationCacheKey,
    result: UnifiedImageGenerationResult,
    metadata: {
      generationTime: number;
      cost: number;
      qualityScore?: number;
    }
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey('unified_generation', key);
      const entry: CacheEntry = {
        id: `unified_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cache_key: cacheKey,
        cache_type: 'unified_generation',
        data: this.compressData(result),
        metadata: {
          model_id: result.metadata.model,
          user_id: key.userId,
          prompt_hash: this.hashString(key.prompt),
          parameters_hash: this.hashString(JSON.stringify(key.parameters)),
          quality_score: metadata.qualityScore,
          generation_time: metadata.generationTime,
          cost: metadata.cost,
          provider: result.metadata.provider,
          fallback_used: result.metadata.fallbackUsed,
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (this.options.ttl! * 1000)).toISOString(),
        access_count: 0,
        last_accessed: new Date().toISOString(),
      };

      this.memoryCache.set(cacheKey, entry);

      if (this.options.enablePersistence) {
        await this.persistCacheEntry(entry);
      }

      await this.enforceCacheSize();

      logger.info('Unified AI generation result cached', {
        cacheKey,
        provider: result.metadata.provider,
        model: result.metadata.model,
        promptLength: key.prompt.length,
        generationTime: metadata.generationTime,
        fallbackUsed: result.metadata.fallbackUsed,
      }, 'AI_CACHE');

    } catch (error) {
      logger.error('Error caching unified AI generation', error, 'AI_CACHE');
    }
  }

  /**
   * Get cached unified generation result
   */
  async getCachedUnifiedGeneration(key: UnifiedGenerationCacheKey): Promise<{
    result: UnifiedImageGenerationResult;
    metadata: any;
    timestamp: string;
  } | null> {
    try {
      this.cacheStats.totalRequests++;
      const cacheKey = this.generateCacheKey('unified_generation', key);
      const entry = await this.getCacheEntry(cacheKey);

      if (!entry) {
        this.cacheStats.misses++;
        return null;
      }

      this.cacheStats.hits++;

      logger.info('Unified AI generation cache hit', {
        cacheKey,
        provider: entry.metadata.provider,
        accessCount: entry.access_count,
        age: Date.now() - new Date(entry.created_at).getTime(),
      }, 'AI_CACHE');

      return {
        result: this.decompressData(entry.data),
        metadata: entry.metadata,
        timestamp: entry.created_at,
      };

    } catch (error) {
      logger.error('Error retrieving cached unified generation', error, 'AI_CACHE');
      this.cacheStats.misses++;
      return null;
    }
  }

  /**
   * Cache provider health status
   */
  async cacheProviderHealth(
    key: ProviderHealthCacheKey,
    healthStatus: ProviderStatus
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey('provider_health', key);
      const entry: CacheEntry = {
        id: `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cache_key: cacheKey,
        cache_type: 'provider_health',
        data: healthStatus,
        metadata: {
          provider: key.provider,
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (300 * 1000)).toISOString(), // 5 minutes
        access_count: 0,
        last_accessed: new Date().toISOString(),
      };

      this.memoryCache.set(cacheKey, entry);

      if (this.options.enablePersistence) {
        await this.persistCacheEntry(entry);
      }

    } catch (error) {
      logger.error('Error caching provider health', error, 'AI_CACHE');
    }
  }

  /**
   * Get cached provider health status
   */
  async getCachedProviderHealth(key: ProviderHealthCacheKey): Promise<ProviderStatus | null> {
    try {
      const cacheKey = this.generateCacheKey('provider_health', key);
      const entry = await this.getCacheEntry(cacheKey);

      if (!entry) return null;

      return entry.data as ProviderStatus;
    } catch (error) {
      logger.error('Error retrieving cached provider health', error, 'AI_CACHE');
      return null;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const hitRate = this.cacheStats.totalRequests > 0 
      ? (this.cacheStats.hits / this.cacheStats.totalRequests) * 100 
      : 0;

    return {
      ...this.cacheStats,
      hitRate: Math.round(hitRate * 100) / 100,
      memorySize: this.memoryCache.size,
      maxSize: this.options.maxSize,
    };
  }

  /**
   * Clear cache by type or all
   */
  async clearCache(type?: string): Promise<void> {
    try {
      if (type) {
        // Clear specific type
        for (const [key, entry] of this.memoryCache.entries()) {
          if (entry.cache_type === type) {
            this.memoryCache.delete(key);
          }
        }

        if (this.options.enablePersistence) {
          const supabase = await createClient();
          await supabase
            .from('ai_cache')
            .delete()
            .eq('cache_type', type);
        }
      } else {
        // Clear all
        this.memoryCache.clear();
        
        if (this.options.enablePersistence) {
          const supabase = await createClient();
          await supabase
            .from('ai_cache')
            .delete()
            .neq('id', ''); // Delete all
        }
      }

      logger.info('Cache cleared', { type }, 'AI_CACHE');
    } catch (error) {
      logger.error('Error clearing cache', error, 'AI_CACHE');
    }
  }

  /**
   * Generate cache key from object
   */
  private generateCacheKey(type: string, key: any): string {
    const keyString = JSON.stringify(key, Object.keys(key).sort());
    const hash = this.hashString(keyString);
    return `${type}_${hash}`;
  }

  /**
   * Hash string for cache keys
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Compress data if enabled
   */
  private compressData(data: any): any {
    if (!this.options.enableCompression) return data;
    
    // Simple compression - in production, use a proper compression library
    return JSON.stringify(data);
  }

  /**
   * Decompress data if needed
   */
  private decompressData(data: any): any {
    if (!this.options.enableCompression) return data;
    
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return data;
    }
  }

  /**
   * Get cache entry from memory or persistent storage
   */
  private async getCacheEntry(cacheKey: string): Promise<CacheEntry | null> {
    // Check memory first
    let entry = this.memoryCache.get(cacheKey);
    
    // Check persistent storage
    if (!entry && this.options.enablePersistence) {
      entry = await this.getPersistentCacheEntry(cacheKey);
      if (entry) {
        this.memoryCache.set(cacheKey, entry);
      }
    }

    if (!entry) return null;

    // Check expiration
    if (new Date() > new Date(entry.expires_at)) {
      await this.removeCacheEntry(cacheKey);
      return null;
    }

    // Update access stats
    entry.access_count++;
    entry.last_accessed = new Date().toISOString();
    
    return entry;
  }

  /**
   * Persist cache entry to database
   */
  private async persistCacheEntry(entry: CacheEntry): Promise<void> {
    try {
      const supabase = await createClient();
      await supabase
        .from('ai_cache')
        .upsert(entry);
    } catch (error) {
      logger.error('Error persisting cache entry', error, 'AI_CACHE');
    }
  }

  /**
   * Get cache entry from persistent storage
   */
  private async getPersistentCacheEntry(cacheKey: string): Promise<CacheEntry | null> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('ai_cache')
        .select('*')
        .eq('cache_key', cacheKey)
        .single();

      if (error || !data) return null;
      
      return data as CacheEntry;
    } catch (error) {
      logger.error('Error getting persistent cache entry', error, 'AI_CACHE');
      return null;
    }
  }

  /**
   * Update cache entry
   */
  private async updateCacheEntry(entry: CacheEntry): Promise<void> {
    try {
      this.memoryCache.set(entry.cache_key, entry);
      
      if (this.options.enablePersistence) {
        const supabase = await createClient();
        await supabase
          .from('ai_cache')
          .update({
            access_count: entry.access_count,
            last_accessed: entry.last_accessed,
          })
          .eq('cache_key', entry.cache_key);
      }
    } catch (error) {
      logger.error('Error updating cache entry', error, 'AI_CACHE');
    }
  }

  /**
   * Remove cache entry
   */
  private async removeCacheEntry(cacheKey: string): Promise<void> {
    try {
      this.memoryCache.delete(cacheKey);
      
      if (this.options.enablePersistence) {
        const supabase = await createClient();
        await supabase
          .from('ai_cache')
          .delete()
          .eq('cache_key', cacheKey);
      }
    } catch (error) {
      logger.error('Error removing cache entry', error, 'AI_CACHE');
    }
  }

  /**
   * Enforce cache size limits
   */
  private async enforceCacheSize(): Promise<void> {
    if (this.memoryCache.size <= this.options.maxSize!) return;

    // Remove least recently used entries
    const entries = Array.from(this.memoryCache.entries())
      .sort(([,a], [,b]) => new Date(a.last_accessed).getTime() - new Date(b.last_accessed).getTime());

    const toRemove = entries.slice(0, entries.length - this.options.maxSize!);
    
    for (const [key] of toRemove) {
      await this.removeCacheEntry(key);
      this.cacheStats.evictions++;
    }
  }

  /**
   * Cleanup expired entries
   */
  private async cleanup(): Promise<void> {
    try {
      const now = new Date();
      const expiredKeys: string[] = [];

      for (const [key, entry] of this.memoryCache.entries()) {
        if (now > new Date(entry.expires_at)) {
          expiredKeys.push(key);
        }
      }

      for (const key of expiredKeys) {
        await this.removeCacheEntry(key);
      }

      if (expiredKeys.length > 0) {
        logger.info('Cache cleanup completed', {
          expiredEntries: expiredKeys.length,
          remainingEntries: this.memoryCache.size,
        }, 'AI_CACHE');
      }
    } catch (error) {
      logger.error('Error during cache cleanup', error, 'AI_CACHE');
    }
  }
}

// Export singleton instances for different cache types
export const aiGenerationCache = new AICache({
  ttl: 3600, // 1 hour
  maxSize: 500,
  enableCompression: true,
  enablePersistence: true,
});

export const aiModelSelectionCache = new AICache({
  ttl: 1800, // 30 minutes
  maxSize: 200,
  enableCompression: false,
  enablePersistence: true,
});

export const aiUserPreferenceCache = new AICache({
  ttl: 86400, // 24 hours
  maxSize: 100,
  enableCompression: false,
  enablePersistence: true,
});

export const aiUnifiedGenerationCache = new AICache({
  ttl: 3600, // 1 hour
  maxSize: 300,
  enableCompression: true,
  enablePersistence: true,
});

export const aiProviderHealthCache = new AICache({
  ttl: 300, // 5 minutes
  maxSize: 50,
  enableCompression: false,
  enablePersistence: true,
});

/**
 * Convenience functions for common caching operations
 */
export async function cacheGenerationResult(
  key: GenerationCacheKey,
  result: FalAIImageGenerationResult,
  metadata: { generationTime: number; cost: number; qualityScore?: number }
): Promise<void> {
  return aiGenerationCache.cacheGeneration(key, result, metadata);
}

export async function getCachedGenerationResult(
  key: GenerationCacheKey
): Promise<FalAIImageGenerationResult | null> {
  return aiGenerationCache.getCachedGeneration(key);
}

export async function cacheModelSelectionResult(
  key: ModelSelectionCacheKey,
  selection: any,
  confidence: number
): Promise<void> {
  return aiModelSelectionCache.cacheModelSelection(key, selection, confidence);
}

export async function getCachedModelSelectionResult(
  key: ModelSelectionCacheKey
): Promise<any | null> {
  return aiModelSelectionCache.getCachedModelSelection(key);
}

/**
 * Convenience functions for unified AI caching
 */
export async function cacheUnifiedGenerationResult(
  key: UnifiedGenerationCacheKey,
  result: UnifiedImageGenerationResult,
  metadata: { generationTime: number; cost: number; qualityScore?: number }
): Promise<void> {
  return aiUnifiedGenerationCache.cacheUnifiedGeneration(key, result, metadata);
}

export async function getCachedUnifiedGenerationResult(
  key: UnifiedGenerationCacheKey
): Promise<{
  result: UnifiedImageGenerationResult;
  metadata: any;
  timestamp: string;
} | null> {
  return aiUnifiedGenerationCache.getCachedUnifiedGeneration(key);
}

/**
 * Convenience functions for provider health caching
 */
export async function cacheProviderHealthStatus(
  key: ProviderHealthCacheKey,
  healthStatus: ProviderStatus
): Promise<void> {
  return aiProviderHealthCache.cacheProviderHealth(key, healthStatus);
}

export async function getCachedProviderHealthStatus(
  key: ProviderHealthCacheKey
): Promise<ProviderStatus | null> {
  return aiProviderHealthCache.getCachedProviderHealth(key);
}

/**
 * Get comprehensive cache statistics across all cache types
 */
export function getAllCacheStats() {
  return {
    generation: aiGenerationCache.getCacheStats(),
    modelSelection: aiModelSelectionCache.getCacheStats(),
    userPreference: aiUserPreferenceCache.getCacheStats(),
    unifiedGeneration: aiUnifiedGenerationCache.getCacheStats(),
    providerHealth: aiProviderHealthCache.getCacheStats(),
  };
}

/**
 * Clear all caches or specific cache types
 */
export async function clearAllCaches(type?: string): Promise<void> {
  const caches = [
    aiGenerationCache,
    aiModelSelectionCache,
    aiUserPreferenceCache,
    aiUnifiedGenerationCache,
    aiProviderHealthCache,
  ];

  await Promise.all(caches.map(cache => cache.clearCache(type)));
}
