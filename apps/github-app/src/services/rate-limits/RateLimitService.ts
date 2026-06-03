import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { platformFetch } from "@/utils/platformFetch";

export interface RateLimitResult {
  allowed: boolean;
  reviewsPerHour: number;
  filesPerReview: number;
  remaining?: number;
  retryAfterSeconds?: number;
}

/** Fail-open defaults used when the platform API is unreachable */
const FAIL_OPEN_DEFAULTS: RateLimitResult = {
  allowed: true,
  reviewsPerHour: 3,
  filesPerReview: 50,
};

/**
 * Calls the platform's internal rate-limits API to check whether an org/repo
 * is allowed to run a new PR review based on their plan and any overrides.
 *
 * Fails open on any error so a platform outage never blocks the PR workflow.
 */
export class RateLimitService {
  private readonly baseUrl: string;

  constructor() {
    if (!env.PLATFORM_API_URL) {
      throw new Error("PLATFORM_API_URL environment variable is not set");
    }
    this.baseUrl = env.PLATFORM_API_URL;
  }

  /**
   * Check whether the org linked to the given installation is allowed to run
   * a review on the given repository right now.
   *
   * Returns fail-open defaults if the platform API is unreachable so the
   * PR workflow is never blocked by an infrastructure issue.
   */
  async check(installationId: string, repoFullName: string): Promise<RateLimitResult> {
    const url = `${this.baseUrl}/api/rate-limits/check`;

    try {
      const response = await platformFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ installationId, repoFullName }),
      });

      if (!response.ok) {
        const text = await response.text();
        logger.warn("Rate limit check failed, failing open", {
          installationId,
          repoFullName,
          status: response.status,
          body: text,
        });
        return { ...FAIL_OPEN_DEFAULTS };
      }

      return (await response.json()) as RateLimitResult;
    } catch (err: any) {
      logger.warn("Rate limit check threw, failing open", {
        installationId,
        repoFullName,
        error: err.message,
      });
      return { ...FAIL_OPEN_DEFAULTS };
    }
  }
}
