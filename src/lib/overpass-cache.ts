interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
}

export class OverpassCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expires) {
      return entry.data;
    }
    return null;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + this.CACHE_DURATION,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  remove(key: string): void {
    this.cache.delete(key);
  }
}
