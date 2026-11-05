export type RateLimitDecision = { allowed: true } | { allowed: false; retryAfterSeconds: number }

type RateLimitOptions = { limit: number; windowMs: number; now: () => Date }

/**
 * Counts hits per key inside a sliding window.
 * ponytail: lives in this process's memory, so a restart resets it and a second instance would not share it; move to SQLite if the app ever runs more than one.
 */
export const createRateLimiter = ({ limit, windowMs, now }: RateLimitOptions) => {
  const hits = new Map<string, number[]>()
  return (key: string): RateLimitDecision => {
    const current = now().getTime()
    const recent = (hits.get(key) ?? []).filter((time) => current - time < windowMs)
    if (recent.length >= limit) {
      hits.set(key, recent)
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + windowMs - current) / 1000)) }
    }
    hits.set(key, [...recent, current])
    return { allowed: true }
  }
}
