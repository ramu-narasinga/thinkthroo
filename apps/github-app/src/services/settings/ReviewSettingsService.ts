import { env } from "@/utils/env";
import { logger } from "@/utils/logger";

export interface EffectiveReviewSettings {
  enableReviews: boolean;
  enablePrSummary: boolean;
  enableInlineReviewComments: boolean;
  enableArchitectureReview: boolean;
  reviewLanguage: string | null;
  toneInstructions: string | null;
  pathFilters: string[];
  autoPauseAfterReviewedCommits: number;
}

/** Safe defaults used when the platform API is unreachable or the repo is not configured. */
const DEFAULTS: EffectiveReviewSettings = {
  enableReviews: true,
  enablePrSummary: true,
  enableInlineReviewComments: false,
  enableArchitectureReview: false,
  reviewLanguage: null,
  toneInstructions: null,
  pathFilters: [],
  autoPauseAfterReviewedCommits: 5,
};

/**
 * Fetches the effective review settings for a repository from the platform API.
 * Falls back to safe defaults on any error so the PR workflow is never blocked.
 */
export class ReviewSettingsService {
  private readonly baseUrl: string;
  private readonly secret: string;

  constructor() {
    if (!env.PLATFORM_API_URL) {
      throw new Error("PLATFORM_API_URL environment variable is not set");
    }
    if (!env.PLATFORM_API_SECRET) {
      throw new Error("PLATFORM_API_SECRET environment variable is not set");
    }
    this.baseUrl = env.PLATFORM_API_URL;
    this.secret = env.PLATFORM_API_SECRET;
  }

  async getSettings(
    installationId: string,
    repoFullName: string,
  ): Promise<EffectiveReviewSettings> {
    const url = `${this.baseUrl}/api/review-settings?installationId=${encodeURIComponent(installationId)}&repoFullName=${encodeURIComponent(repoFullName)}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "x-internal-secret": this.secret },
      });

      if (response.status === 404) {
        logger.info("Review settings not found, using defaults", { repoFullName });
        return { ...DEFAULTS };
      }

      if (!response.ok) {
        const text = await response.text();
        logger.warn("Review settings fetch failed, using defaults", {
          repoFullName,
          status: response.status,
          body: text,
        });
        return { ...DEFAULTS };
      }

      return (await response.json()) as EffectiveReviewSettings;
    } catch (err: any) {
      logger.warn("Review settings fetch threw, using defaults", {
        repoFullName,
        error: err.message,
      });
      return { ...DEFAULTS };
    }
  }
}
