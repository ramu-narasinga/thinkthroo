import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * Upstash Redis client singleton.
 * Reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env.
 * Server-side only.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Creates a sliding window rate limiter for a given hourly limit.
 * Each call creates a new Ratelimit instance scoped to the provided limit,
 * so the limit can be resolved dynamically per org/repo from the DB.
 */
export function createRateLimiter(reviewsPerHour: number): Ratelimit {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(reviewsPerHour, '1 h'),
    prefix: 'thinkthroo:rate_limit',
  });
}
