/**
 * Workn Sliding-Window In-Memory Rate Limiter (Task 4 Step 8)
 *
 * Enforces request ceilings across sensitive authentication endpoints:
 * - Login: 5 attempts per 15 minutes (900 seconds)
 * - Registration: 3 attempts per 15 minutes (900 seconds)
 * - Password Reset: 3 attempts per 15 minutes (900 seconds)
 */

export interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter: number; // in seconds
  resetTime: number; // unix timestamp ms
}

// In-memory sliding log store: maps key -> array of request timestamps (ms)
interface RateLimitRecord {
  timestamps: number[];
}

const store = new Map<string, RateLimitRecord>();

// Default Rate Limit Policies (recorded in Docs/numbers-register.md)
export const RATE_LIMIT_POLICIES = {
  login: { limit: 5, windowSeconds: 15 * 60 }, // 5 attempts per 15 mins
  register: { limit: 3, windowSeconds: 15 * 60 }, // 3 attempts per 15 mins
  forgotPassword: { limit: 3, windowSeconds: 15 * 60 }, // 3 attempts per 15 mins
} as const;

/**
 * Extracts the real client IP from standard HTTP forwarding headers
 */
export function extractClientIp(headers: Headers | Record<string, string | string[] | undefined>): string {
  let forwardedFor: string | null = null;

  if (typeof (headers as Headers).get === 'function') {
    forwardedFor = (headers as Headers).get('x-forwarded-for');
    if (!forwardedFor) forwardedFor = (headers as Headers).get('x-real-ip');
  } else {
    const raw = (headers as Record<string, string | string[] | undefined>)['x-forwarded-for'];
    if (typeof raw === 'string') forwardedFor = raw;
    else if (Array.isArray(raw)) forwardedFor = raw[0];
    if (!forwardedFor) {
      const real = (headers as Record<string, string | string[] | undefined>)['x-real-ip'];
      if (typeof real === 'string') forwardedFor = real;
    }
  }

  if (forwardedFor) {
    // Return first IP in X-Forwarded-For chain
    const clientIp = forwardedFor.split(',')[0].trim();
    if (clientIp) return clientIp;
  }

  return '127.0.0.1';
}

/**
 * Checks and records an attempt against a key using the sliding-window log algorithm
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const thresholdTime = now - windowMs;

  let record = store.get(key);
  if (!record) {
    record = { timestamps: [] };
    store.set(key, record);
  }

  // Purge expired timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > thresholdTime);

  const currentCount = record.timestamps.length;
  const remaining = Math.max(0, config.limit - currentCount);

  if (currentCount >= config.limit) {
    // Oldest timestamp in window determines when the next slot opens
    const oldestTimestamp = record.timestamps[0];
    const resetTime = oldestTimestamp + windowMs;
    const retryAfter = Math.max(1, Math.ceil((resetTime - now) / 1000));

    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      retryAfter,
      resetTime,
    };
  }

  // Record this attempt
  record.timestamps.push(now);

  const resetTime = now + windowMs;
  return {
    allowed: true,
    limit: config.limit,
    remaining: Math.max(0, config.limit - record.timestamps.length),
    retryAfter: 0,
    resetTime,
  };
}

/**
 * Formats standard HTTP 429 rate limit headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
  };

  if (!result.allowed) {
    headers['Retry-After'] = String(result.retryAfter);
  }

  return headers;
}

/**
 * Reset a specific rate limit key (used for administrative resets or test isolation)
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

