import type { Context } from "probot";
import { PullRequestSummaryGenerator } from "../generate-pr-summary/PullRequestSummaryGenerator";
import { PullRequestReviewGenerator } from "../generate-pr-review/PullRequestReviewGenerator";
import type { SummaryResult } from "@/services/summarization/FileSummarizer";
import { logger } from "@/utils/logger";

export interface PRWorkflowOptions {
  generateSummaries?: boolean;
  useSummaryFiltering?: boolean;
  reviewOptions?: {
    reviewCommentLGTM?: boolean;
    maxConcurrency?: number;
    maxFiles?: number;
    debug?: boolean;
  };
}

export class PRWorkflowOrchestrator {
  constructor(
    private readonly context: Context<"pull_request.opened" | "pull_request.reopened" | "pull_request.synchronize">
  ) {}

  async execute(options: PRWorkflowOptions = {}): Promise<void> {
    const pullNumber = this.context.payload.pull_request.number;
    const startTime = Date.now();

    logger.info("PR Workflow started", {
      prNumber: pullNumber,
      generateSummaries: options.generateSummaries ?? true,
      useSummaryFiltering: options.useSummaryFiltering ?? true,
    });

    let summaries: SummaryResult[] | undefined;

    // Step 1: Generate summaries (if enabled)
    if (options.generateSummaries !== false) {
      logger.info("Starting summary generation phase", { prNumber: pullNumber });
      
      const summaryGenerator = new PullRequestSummaryGenerator(this.context);
      summaries = await summaryGenerator.generate();

      logger.info("Summary generation complete", {
        prNumber: pullNumber,
        summariesCount: summaries?.length ?? 0,
      });
    } else {
      logger.info("Summary generation disabled", { prNumber: pullNumber });
    }

    // Step 2: Generate review (with optional summary filtering)
    logger.info("Starting review generation phase", {
      prNumber: pullNumber,
      useSummaryFiltering: options.useSummaryFiltering ?? true,
      hasSummaries: !!summaries,
    });

    const reviewGenerator = new PullRequestReviewGenerator(this.context, {
      enableSummaryFiltering: options.useSummaryFiltering !== false && !!summaries,
      summaries,
      ...options.reviewOptions,
    });

    await reviewGenerator.generate();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info("PR Workflow complete", {
      prNumber: pullNumber,
      durationSeconds: parseFloat(duration),
      hadSummaries: !!summaries,
    });
  }
}
