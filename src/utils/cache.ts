/**
 * Simple in-memory cache implementation for API responses
 */

type CacheEntry = {
  data: any;
  expiresAt: number;
};

class Cache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTLMs: number = 60000; // 1 minute default TTL

  /**
   * Get an item from the cache
   * @param key The cache key
   * @returns The cached data or null if not found or expired
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if the entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set an item in the cache
   * @param key The cache key
   * @param data The data to cache
   * @param ttlMs Time to live in milliseconds (optional)
   */
  set(key: string, data: any, ttlMs: number = this.defaultTTLMs): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Remove an item from the cache
   * @param key The cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get an item from cache or set it if not found
   * @param key The cache key
   * @param fetchFn Function to fetch data if not in cache
   * @param ttlMs Time to live in milliseconds (optional)
   * @returns The cached or freshly fetched data
   */
  async getOrSet(
    key: string,
    fetchFn: () => Promise<any>,
    ttlMs: number = this.defaultTTLMs
  ): Promise<any> {
    const cachedData = this.get(key);

    if (cachedData !== null) {
      return cachedData;
    }

    // Fetch the data
    const freshData = await fetchFn();

    // Cache the fresh data
    this.set(key, freshData, ttlMs);

    return freshData;
  }
}

// Export a single instance to be used across the application
export const cache = new Cache();
