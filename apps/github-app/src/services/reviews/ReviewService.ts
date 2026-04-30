import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import type { ArchitectureFileResult } from "@/features/architecture-review/ArchitectureReviewGenerator";
import type { FileInlineReview } from "@/services/reviews/FileReviewer";

export interface SaveReviewResult {
  success: boolean;
  reviewId?: string;
}

/**
 * Calls the platform's internal reviews API to persist a PR review summary.
 */
export class ReviewService {
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

  /**
   * Parse bullet point lines from an AI-generated summary.
   * Extracts lines starting with "- " and strips the leading dash.
   */
  static parseSummaryPoints(summaryText: string): string[] {
    return summaryText
      .split("\n")
      .filter((line) => line.trimStart().startsWith("- "))
      .map((line) => line.trimStart().slice(2).trim())
      .filter(Boolean);
  }

  async saveReview(params: {
    installationId: string;
    repositoryFullName: string;
    prNumber: number;
    prTitle: string;
    prAuthor: string;
    summaryPoints: string[];
    creditsDeducted: number;
    hasArchitectureResults: boolean;
  }): Promise<SaveReviewResult> {
    const url = `${this.baseUrl}/api/reviews/save`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": this.secret,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const text = await response.text();
        logger.warn("Review save failed", {
          status: response.status,
          body: text,
          prNumber: params.prNumber,
        });
        return { success: false };
      }

      const data = (await response.json()) as { success: boolean; reviewId: string };
      return { success: true, reviewId: data.reviewId };
    } catch (err: any) {
      logger.warn("Review save request threw an error", {
        prNumber: params.prNumber,
        error: err.message,
      });
      return { success: false };
    }
  }

  async saveArchitectureResults(params: {
    prReviewId: string;
    repositoryFullName: string;
    installationId: string;
    fileResults: ArchitectureFileResult[];
  }): Promise<boolean> {
    const url = `${this.baseUrl}/api/reviews/architecture/save`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": this.secret,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const text = await response.text();
        logger.warn("Architecture results save failed", {
          status: response.status,
          body: text,
          prReviewId: params.prReviewId,
        });
        return false;
      }

      return true;
    } catch (err: any) {
      logger.warn("Architecture results save request threw an error", {
        prReviewId: params.prReviewId,
        error: err.message,
      });
      return false;
    }
  }

  async saveInlineReviews(params: {
    prReviewId: string;
    inlineReviews: FileInlineReview[];
  }): Promise<boolean> {
    if (params.inlineReviews.length === 0) return true;

    const url = `${this.baseUrl}/api/reviews/inline/save`;

    const inlineComments = params.inlineReviews.flatMap((f) =>
      f.comments.map((c) => ({
        filename: f.filename,
        startLine: c.startLine,
        endLine: c.endLine,
        comment: c.comment,
      }))
    );

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": this.secret,
        },
        body: JSON.stringify({ prReviewId: params.prReviewId, inlineComments }),
      });

      if (!response.ok) {
        const text = await response.text();
        logger.warn("Inline reviews save failed", {
          status: response.status,
          body: text,
          prReviewId: params.prReviewId,
        });
        return false;
      }

      return true;
    } catch (err: any) {
      logger.warn("Inline reviews save request threw an error", {
        prReviewId: params.prReviewId,
        error: err.message,
      });
      return false;
    }
  }
}
