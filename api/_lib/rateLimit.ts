/**
 * Best-effort in-memory rate limiter (fixed window, per key).
 *
 * Limits: state lives in a single serverless instance, so the limit is NOT
 * global — concurrent instances each keep their own counters and a cold start
 * resets them. It reduces casual abuse of the Groq quota; it is not a
 * substitute for a platform-level rule (e.g. Vercel Firewall).
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
  maxKeys?: number;
}

export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
  maxKeys = 5000,
}: RateLimiterOptions) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  function prune(t: number) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= t) hits.delete(key);
    }
    // Still too large (many distinct live keys): drop oldest insertions.
    while (hits.size > maxKeys) {
      const oldest = hits.keys().next().value;
      if (oldest === undefined) break;
      hits.delete(oldest);
    }
  }

  return function check(key: string): RateLimitResult {
    const t = now();
    if (hits.size >= maxKeys) prune(t);

    const entry = hits.get(key);
    if (!entry || entry.resetAt <= t) {
      hits.set(key, { count: 1, resetAt: t + windowMs });
      return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
    }

    if (entry.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - t) / 1000)),
      };
    }

    entry.count += 1;
    return { allowed: true, remaining: limit - entry.count, retryAfterSec: 0 };
  };
}
