/**
 * Simple in-memory cache for rate limiting and temporary data
 * For production, consider using Redis
 */

interface CacheItem {
  value: any;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheItem> = new Map();

  set(key: string, value: any, ttlSeconds: number = 3600) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Cleanup expired entries periodically
  startCleanup(intervalMs: number = 60000) {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, intervalMs);
  }
}

export default new MemoryCache();