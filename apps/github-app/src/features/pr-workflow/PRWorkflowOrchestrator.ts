import type { Context } from "probot";
import { PullRequestSummaryGenerator } from "../generate-pr-summary/PullRequestSummaryGenerator";
import { PullRequestReviewGenerator } from "../generate-pr-review/PullRequestReviewGenerator";
import { ArchitectureReviewGenerator } from "../architecture-review/ArchitectureReviewGenerator";
import type { SummaryResult } from "@/services/summarization/FileSummarizer";
import { CreditService } from "@/services/credits/CreditService";
import { ReviewService } from "@/services/reviews/ReviewService";
import type { BotAccumulatedUsage } from "@/services/ai/types";
import { CommitAnalyzer } from "@/services/commits/CommitAnalyzer";
import { CommentManager } from "@/services/comments/CommentManager";
import { SUMMARIZE_TAG } from "@/services/constants";
import { ReviewSettingsService } from "@/services/settings/ReviewSettingsService";
import { logger } from "@/utils/logger";

/** Minimum credits required to start a PR workflow run */
const MIN_CREDIT_THRESHOLD = 1;

export interface PRWorkflowOptions {
  generateSummaries?: boolean;
  useSummaryFiltering?: boolean;
  enableArchitectureReview?: boolean;
  reviewOptions?: {
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
    const repositoryFullName = this.context.payload.repository.full_name;
    const owner = this.context.payload.repository.owner.login;
    const installationId = String(
      (this.context.payload as any).installation?.id ?? ""
    );
    const startTime = Date.now();

    // Create a child logger that stamps every log line with PR identity
    const prLogger = logger.child({
      prNumber: pullNumber,
      repo: repositoryFullName,
      owner,
      installationId,
    });

    prLogger.info("PR Workflow started", {
      prNumber: pullNumber,
      generateSummaries: options.generateSummaries ?? true,
      useSummaryFiltering: options.useSummaryFiltering ?? true,
    });

    // Pre-flight: check credit balance before running any AI
    if (installationId) {
      try {
        const creditService = new CreditService();
        const balance = await creditService.getBalance(installationId);

        if (balance !== null && balance < MIN_CREDIT_THRESHOLD) {
          prLogger.warn("Insufficient credits — skipping PR workflow", {
            prNumber: pullNumber,
            balance,
          });
          await this.context.octokit.issues.createComment({
            owner: this.context.payload.repository.owner.login,
            repo: this.context.payload.repository.name,
            issue_number: pullNumber,
            body: `Your organisation has insufficient credits to run an AI review (current balance: **${balance}**). Please top up your credits at [https://app.thinkthroo.com/account](https://app.thinkthroo.com/account).`,
          });
          return;
        }
      } catch (err: any) {
        // Balance check failure is non-fatal — proceed with the workflow
        prLogger.warn("Credit balance check failed, proceeding anyway", {
          prNumber: pullNumber,
          error: err.message,
        });
      }
    }

    // Fetch effective review settings from the platform (non-fatal — falls back to safe defaults)
    let reviewSettings = {
      enableReviews: true,
      enablePrSummary: true,
      enableInlineReviewComments: false,
      enableArchitectureReview: false,
      reviewLanguage: null as string | null,
      toneInstructions: null as string | null,
      pathFilters: [] as string[],
    };

    if (installationId) {
      try {
        const reviewSettingsService = new ReviewSettingsService();
        reviewSettings = await reviewSettingsService.getSettings(installationId, repositoryFullName);
        prLogger.info("Review settings fetched", { prNumber: pullNumber, ...reviewSettings });
      } catch (err: any) {
        prLogger.warn("ReviewSettingsService init failed, using defaults", {
          prNumber: pullNumber,
          error: err.message,
        });
      }
    }

    // Master on/off — skip entire workflow if reviews are disabled for this repo
    if (!reviewSettings.enableReviews) {
      prLogger.info("Reviews disabled for this repository — skipping PR workflow", { prNumber: pullNumber });
      return;
    }

    let summaries: SummaryResult[] | undefined;
    let summaryGenerator: PullRequestSummaryGenerator | undefined;
    let reviewGenerator: PullRequestReviewGenerator | undefined;
    let architectureReviewGenerator: ArchitectureReviewGenerator | undefined;

    // Step 0: Determine the incremental review start point independently of summary generation
    const pullRequest = this.context.payload.pull_request;
    const issueDetails = this.context.issue();
    const octokit = this.context.octokit;
    let reviewStartSha: string | undefined;

    try {
      const commitAnalyzer = new CommitAnalyzer(octokit, issueDetails);
      const commentManager = new CommentManager(octokit, issueDetails);
      const existingCommentData = await commentManager.getExistingCommentData(
        pullNumber,
        SUMMARIZE_TAG,
        commitAnalyzer.getReviewedCommitIdsBlock.bind(commitAnalyzer)
      );
      const allCommitIds = await commitAnalyzer.getAllCommitIds(pullNumber);
      reviewStartSha = commitAnalyzer.determineReviewStartCommit(
        allCommitIds,
        existingCommentData.commitIdsBlock,
        pullRequest.base.sha,
        pullRequest.head.sha
      );
      prLogger.info("Review start SHA determined independently", { prNumber: pullNumber, reviewStartSha });
    } catch (err: any) {
      prLogger.warn("Failed to determine review start SHA, will fall back to full review", {
        prNumber: pullNumber,
        error: err.message,
      });
    }

    // Step 1: Generate summaries (if enabled by settings)
    if (reviewSettings.enablePrSummary) {
      prLogger.info("Starting summary generation phase", { prNumber: pullNumber });
      
      summaryGenerator = new PullRequestSummaryGenerator(this.context, prLogger);
      summaries = await summaryGenerator.generate();

      prLogger.info("Summary generation complete", {
        prNumber: pullNumber,
        summariesCount: summaries?.length ?? 0,
      });
    } else {
      prLogger.info("Summary generation disabled", { prNumber: pullNumber });
    }

    // Step 2: Generate review (with optional summary filtering)
    prLogger.info("Starting review generation phase", {
      prNumber: pullNumber,
      useSummaryFiltering: options.useSummaryFiltering ?? true,
      hasSummaries: !!summaries,
    });

    reviewGenerator = new PullRequestReviewGenerator(this.context, {
      enableSummaryFiltering: options.useSummaryFiltering !== false && !!summaries,
      summaries,
      shortSummary: summaryGenerator?.getShortSummary(),
      reviewStartSha,
      disableReview: !reviewSettings.enableInlineReviewComments,
      ...options.reviewOptions,
    }, prLogger);

    await reviewGenerator.generate();

    // Step 3: Architecture review (if enabled by settings)
    if (reviewSettings.enableArchitectureReview) {
      prLogger.info("Starting architecture review phase", { prNumber: pullNumber });

      const shortSummary = (summaries ?? [])
        .map((s) => `${s.filename}: ${s.summary}`)
        .join("\n");

      try {
        architectureReviewGenerator = new ArchitectureReviewGenerator(
          this.context,
          { maxConcurrency: 3, maxFiles: options.reviewOptions?.maxFiles ?? 50, reviewStartSha },
          prLogger
        );
        await architectureReviewGenerator.generate(shortSummary);
        prLogger.info("Architecture review phase complete", { prNumber: pullNumber });
      } catch (error: any) {
        // Architecture review failure should not break the overall PR workflow
        prLogger.error("Architecture review failed, continuing", {
          prNumber: pullNumber,
          error: error.message,
        });
      }
    }

    // Step 4: Deduct credits for all AI usage accumulated across the workflow
    if (installationId) {
      const allUsage: BotAccumulatedUsage[] = [
        ...(summaryGenerator?.getAccumulatedUsage() ?? []),
        ...(reviewGenerator?.getAccumulatedUsage() ?? []),
        ...(architectureReviewGenerator?.getAccumulatedUsage() ?? []),
      ];

      let creditsDeducted = 0;

      try {
        const creditService = new CreditService();
        const result = await creditService.deductCredits(
          installationId,
          repositoryFullName,
          pullNumber,
          allUsage
        );

        if (result.success) {
          creditsDeducted = result.creditsDeducted ?? 0;
          prLogger.info("Credits deducted for PR workflow", {
            prNumber: pullNumber,
            creditsDeducted: result.creditsDeducted,
            newBalance: result.newBalance,
          });
        } else {
          prLogger.warn("Credit deduction was unsuccessful", {
            prNumber: pullNumber,
            reason: result.reason,
          });
        }
      } catch (err: any) {
        // Credit deduction failure must never crash the PR workflow
        prLogger.error("Credit deduction failed", {
          prNumber: pullNumber,
          error: err.message,
        });
      }

      // Step 5: Persist the review summary for the platform dashboard
      try {
        const finalSummaryText = summaryGenerator?.getFinalSummary() ?? "";
        const summaryPoints = ReviewService.parseSummaryPoints(finalSummaryText);
        const prAuthor = this.context.payload.pull_request.user.login;

        if (summaryPoints.length > 0) {
          const reviewService = new ReviewService();
          const fileResults = architectureReviewGenerator?.getFileResults() ?? [];
          const saveResult = await reviewService.saveReview({
            installationId,
            repositoryFullName,
            prNumber: pullNumber,
            prTitle: this.context.payload.pull_request.title,
            prAuthor,
            summaryPoints,
            creditsDeducted,
            hasArchitectureResults: fileResults.length > 0,
          });
          prLogger.info("PR review summary saved to platform", { prNumber: pullNumber });

          // Step 6: Persist architecture file results if we have them
          if (saveResult.success && saveResult.reviewId && fileResults.length > 0) {
            await reviewService.saveArchitectureResults({
              prReviewId: saveResult.reviewId,
              repositoryFullName,
              installationId,
              fileResults,
            });
            prLogger.info("Architecture file results saved to platform", {
              prNumber: pullNumber,
              fileCount: fileResults.length,
            });
          }

          // Step 7: Persist inline review comments if any were generated
          const inlineReviews = reviewGenerator?.getInlineFileReviews() ?? [];
          if (saveResult.success && saveResult.reviewId && inlineReviews.length > 0) {
            try {
              await reviewService.saveInlineReviews({
                prReviewId: saveResult.reviewId,
                inlineReviews,
              });
              prLogger.info("Inline review comments saved to platform", {
                prNumber: pullNumber,
                fileCount: inlineReviews.length,
                totalComments: inlineReviews.reduce((sum, f) => sum + f.comments.length, 0),
              });
            } catch (err: any) {
              prLogger.error("Inline reviews save failed, continuing", {
                prNumber: pullNumber,
                error: err.message,
              });
            }
          }
        } else {
          prLogger.info("No summary points to save, skipping review persistence", { prNumber: pullNumber });
        }
      } catch (err: any) {
        // Review save failure must never crash the PR workflow
        prLogger.error("PR review save failed", {
          prNumber: pullNumber,
          error: err.message,
        });
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    prLogger.info("PR Workflow complete", {
      prNumber: pullNumber,
      durationSeconds: parseFloat(duration),
      hadSummaries: !!summaries,
    });
  }
}

