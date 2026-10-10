interface RateLimiterRecord {
  timestamps: number[];
}

/**
 * In-memory sliding window rate limiter.
 * In a multi-instance production environment, Redis (Upstash) can back this,
 * but an in-memory implementation provides zero-latency protection without external dependencies.
 */
class InMemoryRateLimiter {
  private store: Map<string, RateLimiterRecord> = new Map();
  private lastCleanup: number = Date.now();

  /**
   * Checks if an action with the given key is permitted within the rate limit.
   *
   * @param key Unique key (e.g., client IP or identifier)
   * @param maxRequests Maximum allowed requests in the time window
   * @param windowMs Time window in milliseconds
   * @returns { allowed: boolean, remaining: number, resetMs: number }
   */
  public check(
    key: string,
    maxRequests: number = 10,
    windowMs: number = 60_000
  ): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();

    // Occasional cleanup of stale entries every 5 minutes
    if (now - this.lastCleanup > 300_000) {
      this.cleanup(windowMs);
      this.lastCleanup = now;
    }

    const record = this.store.get(key) || { timestamps: [] };
    const windowStart = now - windowMs;

    // Filter out timestamps outside the active window
    const validTimestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (validTimestamps.length >= maxRequests) {
      const oldestTimestamp = validTimestamps[0] || now;
      const resetMs = Math.max(0, oldestTimestamp + windowMs - now);

      return {
        allowed: false,
        remaining: 0,
        resetMs,
      };
    }

    // Add current timestamp
    validTimestamps.push(now);
    this.store.set(key, { timestamps: validTimestamps });

    return {
      allowed: true,
      remaining: maxRequests - validTimestamps.length,
      resetMs: windowMs,
    };
  }

  /**
   * Resets rate limit for a specific key (useful for tests)
   */
  public reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clears all records
   */
  public clear(): void {
    this.store.clear();
  }

  private cleanup(windowMs: number): void {
    const cutoff = Date.now() - Math.max(windowMs, 600_000);
    for (const [key, record] of this.store.entries()) {
      const active = record.timestamps.filter((ts) => ts > cutoff);
      if (active.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, { timestamps: active });
      }
    }
  }
}

export const rateLimiter = new InMemoryRateLimiter();
