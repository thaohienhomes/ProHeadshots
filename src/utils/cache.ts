// Cache utility for API responses and data
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
  persistent?: boolean; // Whether to persist to localStorage
}

class Cache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private maxSize: number;
  private defaultTTL: number;
  private persistent: boolean;
  private storageKey: string;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.persistent = options.persistent || false;
    this.storageKey = 'app_cache';

    if (this.persistent && typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });

    if (this.persistent) {
      this.saveToStorage();
    }
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      if (this.persistent) {
        this.saveToStorage();
      }
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      if (this.persistent) {
        this.saveToStorage();
      }
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const result = this.cache.delete(key);
    
    if (this.persistent && result) {
      this.saveToStorage();
    }
    
    return result;
  }

  clear(): void {
    this.cache.clear();
    
    if (this.persistent) {
      this.saveToStorage();
    }
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));

    if (this.persistent && expiredKeys.length > 0) {
      this.saveToStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data);
        this.cleanup(); // Clean up expired items on load
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }
}

// Create cache instances for different types of data
export const apiCache = new Cache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 50,
  persistent: true,
});

export const imageCache = new Cache({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 100,
  persistent: true,
});

export const userCache = new Cache({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 10,
  persistent: true,
});

// Cached fetch function
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  cacheOptions: { ttl?: number; cache?: Cache<T> } = {}
): Promise<T> {
  const { ttl, cache = apiCache } = cacheOptions;
  const cacheKey = `${url}_${JSON.stringify(options)}`;

  // Try to get from cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Store in cache
  cache.set(cacheKey, data, ttl);
  
  return data;
}

// Cache invalidation utilities
export function invalidateCache(pattern: string): void {
  const keys = apiCache.keys().filter(key => key.includes(pattern));
  keys.forEach(key => apiCache.delete(key));
}

export function invalidateUserCache(userId: string): void {
  const keys = userCache.keys().filter(key => key.includes(userId));
  keys.forEach(key => userCache.delete(key));
}

// Cache warming - preload frequently accessed data
export async function warmCache(urls: string[]): Promise<void> {
  const promises = urls.map(url => 
    cachedFetch(url).catch(error => 
      console.warn(`Failed to warm cache for ${url}:`, error)
    )
  );
  
  await Promise.allSettled(promises);
}

// Cache statistics
export function getCacheStats() {
  return {
    api: {
      size: apiCache.size(),
      keys: apiCache.keys(),
    },
    image: {
      size: imageCache.size(),
      keys: imageCache.keys(),
    },
    user: {
      size: userCache.size(),
      keys: userCache.keys(),
    },
  };
}

// Cleanup all caches
export function cleanupAllCaches(): void {
  apiCache.cleanup();
  imageCache.cleanup();
  userCache.cleanup();
}

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupAllCaches, 5 * 60 * 1000);
}
