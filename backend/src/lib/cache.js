/**
 * In-Memory High Performance Caching Engine with TTL
 * Eliminates Redis daemon requirement during local dev while providing fast sub-millisecond responses.
 */

class MemoryCache {
  constructor(defaultTTLSeconds = 300) {
    this.cache = new Map();
    this.defaultTTLMs = defaultTTLSeconds * 1000;
    this.hits = 0;
    this.misses = 0;

    // Periodic cleanup of expired entries every 2 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 2 * 60 * 1000).unref();
  }

  async get(key) {
    const item = this.cache.get(key);
    if (!item) {
      this.misses += 1;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.misses += 1;
      return null;
    }

    this.hits += 1;
    return item.value;
  }

  async set(key, value, ttlSeconds = 300) {
    const ttlMs = (ttlSeconds || 300) * 1000;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  async del(key) {
    return this.cache.delete(key);
  }

  async flush() {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(2) : 0,
    };
  }
}

const memoryCache = new MemoryCache();

export const getCache = async (key) => {
  return memoryCache.get(key);
};

export const setCache = async (key, value, ttlSeconds = 300) => {
  return memoryCache.set(key, value, ttlSeconds);
};

export const delCache = async (key) => {
  return memoryCache.del(key);
};

export const flushCache = async () => {
  return memoryCache.flush();
};

export const getCacheStats = () => {
  return memoryCache.getStats();
};

export default memoryCache;
