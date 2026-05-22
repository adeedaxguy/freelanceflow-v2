/**
 * Simple in-memory rate limiter — no Redis dependency.
 * Suitable for single-instance Next.js deployments.
 *
 * For multi-instance deployments, swap the Map for a shared Redis store.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

// Cleanup stale buckets every 5 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt < now) store.delete(key);
  }
}, 300_000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * @param key      Unique identifier (e.g. userId + route)
 * @param limit    Max requests per window
 * @param windowMs Window size in milliseconds (default: 60 000 = 1 minute)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  let bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    store.set(key, bucket);
  }

  bucket.count += 1;
  const allowed = bucket.count <= limit;
  const remaining = Math.max(0, limit - bucket.count);
  const resetInSeconds = Math.ceil((bucket.resetAt - now) / 1000);

  return { allowed, remaining, resetInSeconds };
}
