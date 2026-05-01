import type { Context } from "probot";
import { PullRequestSummaryGenerator } from "../generate-pr-summary/PullRequestSummaryGenerator";
import { PullRequestReviewGenerator } from "../generate-pr-review/PullRequestReviewGenerator";
import { ArchitectureReviewGenerator } from "../architecture-review/ArchitectureReviewGenerator";
import type { SummaryResult } from "@/services/summarization/FileSummarizer";
import { CreditService } from "@/services/credits/CreditService";
import { ReviewService } from "@/services/reviews/ReviewService";
import { computeMinCreditThreshold, MIN_CREDITS_REVIEW_PHASE, MIN_CREDITS_ARCHITECTURE_PHASE } from "@/services/ai/pricing";
import { CommitAnalyzer } from "@/services/commits/CommitAnalyzer";
import { CommentManager } from "@/services/comments/CommentManager";
import { SUMMARIZE_TAG } from "@/services/constants";
import { ReviewSettingsService } from "@/services/settings/ReviewSettingsService";
import { RateLimitService } from "@/services/rate-limits/RateLimitService";
import { logger } from "@/utils/logger";

export interface PRWorkflowOptions {
  generateSummaries?: boolean;
  useSummaryFiltering?: boolean;
  forceReview?: boolean;
  fullReview?: boolean;
  summaryOnly?: boolean;
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

    const postPhaseFailureNotice = async (phase: string): Promise<void> => {
      try {
        await this.context.octokit.issues.createComment({
          owner,
          repo: this.context.payload.repository.name,
          issue_number: pullNumber,
          body: `ThinkThroo could not complete the **${phase}** phase for this PR due to an internal error. Please retry with @thinkthroo review. If this keeps happening, contact support at support@thinkthroo.com.`,
        });
      } catch (err: any) {
        prLogger.warn("Failed to post phase failure notice", {
          prNumber: pullNumber,
          phase,
          error: err.message,
        });
      }
    };

    prLogger.info("PR Workflow started", {
      prNumber: pullNumber,
      generateSummaries: options.generateSummaries ?? true,
      useSummaryFiltering: options.useSummaryFiltering ?? true,
    });

    // Fetch effective review settings from the platform (non-fatal — falls back to safe defaults)
    let reviewSettings = {
      enableReviews: true,
      enablePrSummary: true,
      enableInlineReviewComments: false,
      enableArchitectureReview: false,
      reviewLanguage: null as string | null,
      toneInstructions: null as string | null,
      pathFilters: [] as string[],
      autoPauseAfterReviewedCommits: 5,
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

    // Pre-flight: check credit balance against the computed threshold for enabled phases
    let currentBalance: number | null = null;
    let totalCreditsDeducted = 0;
    if (installationId) {
      try {
        const creditService = new CreditService();
        const balance = await creditService.getBalance(installationId);
        currentBalance = balance;
        const threshold = computeMinCreditThreshold({
          enablePrSummary: reviewSettings.enablePrSummary,
          enableInlineReviewComments: reviewSettings.enableInlineReviewComments,
          enableArchitectureReview: reviewSettings.enableArchitectureReview,
        });
        if (balance !== null && balance < threshold) {
          prLogger.warn("Insufficient credits — skipping PR workflow", {
            prNumber: pullNumber,
            balance,
            threshold,
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

    // Rate limit check — must pass before any AI work begins
    let filesPerReview = 50; // safe default
    if (installationId) {
      try {
        const rateLimitService = new RateLimitService();
        const rateLimit = await rateLimitService.check(installationId, repositoryFullName);

        if (!rateLimit.allowed) {
          const minutes = rateLimit.retryAfterSeconds
            ? Math.ceil(rateLimit.retryAfterSeconds / 60)
            : null;
          const retryMsg = minutes
            ? ` The next review slot opens in approximately **${minutes} minute${minutes === 1 ? "" : "s"}**.`
            : "";
          prLogger.warn("Rate limit reached — skipping PR workflow", {
            prNumber: pullNumber,
            reviewsPerHour: rateLimit.reviewsPerHour,
            retryAfterSeconds: rateLimit.retryAfterSeconds,
          });
          await this.context.octokit.issues.createComment({
            owner: this.context.payload.repository.owner.login,
            repo: this.context.payload.repository.name,
            issue_number: pullNumber,
            body: `Review skipped — your organisation has reached the limit of **${rateLimit.reviewsPerHour} reviews per hour** on your current plan.${retryMsg} Upgrade your plan at [https://app.thinkthroo.com/account](https://app.thinkthroo.com/account).`,
          });
          return;
        }

        filesPerReview = rateLimit.filesPerReview;
        prLogger.info("Rate limit check passed", {
          prNumber: pullNumber,
          reviewsPerHour: rateLimit.reviewsPerHour,
          filesPerReview: rateLimit.filesPerReview,
          remaining: rateLimit.remaining,
        });
      } catch (err: any) {
        // Rate limit check failure is non-fatal — proceed with the workflow
        prLogger.warn("Rate limit check failed, proceeding anyway", {
          prNumber: pullNumber,
          error: err.message,
        });
      }
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
    let _commitAnalyzer: CommitAnalyzer | undefined;
    let _commentManager: CommentManager | undefined;
    let _existingCommentBody = "";
    let _existingComment: any | null = null;

    try {
      const commitAnalyzer = new CommitAnalyzer(octokit, issueDetails);
      const commentManager = new CommentManager(octokit, issueDetails);
      _commitAnalyzer = commitAnalyzer;
      _commentManager = commentManager;
      const existingCommentData = await commentManager.getExistingCommentData(
        pullNumber,
        SUMMARIZE_TAG,
        commitAnalyzer.getReviewedCommitIdsBlock.bind(commitAnalyzer)
      );
      _existingCommentBody = existingCommentData.commentBody;
      _existingComment = existingCommentData.comment;
      const allCommitIds = await commitAnalyzer.getAllCommitIds(pullNumber);
      if (options.fullReview) {
        reviewStartSha = pullRequest.base.sha;
        prLogger.info("Full review mode — starting from base SHA", { prNumber: pullNumber, reviewStartSha });
      } else {
        reviewStartSha = commitAnalyzer.determineReviewStartCommit(
          allCommitIds,
          existingCommentData.commitIdsBlock,
          pullRequest.base.sha,
          pullRequest.head.sha
        );
        prLogger.info("Review start SHA determined independently", { prNumber: pullNumber, reviewStartSha });
      }
    } catch (err: any) {
      prLogger.warn("Failed to determine review start SHA, will fall back to full review", {
        prNumber: pullNumber,
        error: err.message,
      });
    }

    // Pause check — only on synchronize events (not opened/reopened), skipped when forceReview is set
    const isSynchronize = (this.context.payload as any).action === "synchronize";
    if (
      isSynchronize &&
      !options.forceReview &&
      reviewSettings.autoPauseAfterReviewedCommits > 0 &&
      _commitAnalyzer &&
      _commentManager &&
      _existingCommentBody
    ) {
      const reviewedCount = _commitAnalyzer.getReviewedCountSinceEpoch(_existingCommentBody);
      if (reviewedCount >= reviewSettings.autoPauseAfterReviewedCommits) {
        prLogger.info("Auto-pause threshold reached — skipping review cycle", {
          prNumber: pullNumber,
          reviewedCount,
          autoPause: reviewSettings.autoPauseAfterReviewedCommits,
        });
        if (_existingComment && !_commentManager.isPauseNoticePosted(_existingCommentBody)) {
          try {
            await this.context.octokit.issues.createComment({
              owner,
              repo: this.context.payload.repository.name,
              issue_number: pullNumber,
              body: `Reviews have been paused after **${reviewSettings.autoPauseAfterReviewedCommits}** reviewed commits in this push cycle.\nComment \`@thinkthroo review\` to run an immediate review and reset the counter.`,
            });
            const updatedBody = _commentManager.setPauseNoticePosted(_existingCommentBody);
            await octokit.issues.updateComment({
              owner,
              repo: this.context.payload.repository.name,
              comment_id: _existingComment.id,
              body: updatedBody,
            });
          } catch (err: any) {
            prLogger.warn("Failed to post auto-pause notice", {
              prNumber: pullNumber,
              reviewedCount,
              autoPause: reviewSettings.autoPauseAfterReviewedCommits,
              commentId: _existingComment.id,
              error: err.message,
            });
          }
        }
        return;
      }
    }

    // Manual pause check — explicit @thinkthroo pause command
    if (
      !options.forceReview &&
      _commentManager &&
      _existingCommentBody &&
      _commentManager.isPaused(_existingCommentBody)
    ) {
      prLogger.info("PR reviews are manually paused — skipping workflow", { prNumber: pullNumber });
      return;
    }

    // Step 1: Generate summaries (if enabled by settings)
    if (reviewSettings.enablePrSummary) {
      prLogger.info("Starting summary generation phase", { prNumber: pullNumber });

      try {
        summaryGenerator = new PullRequestSummaryGenerator(this.context, prLogger);
        summaries = await summaryGenerator.generate();

        prLogger.info("Summary generation complete", {
          prNumber: pullNumber,
          summariesCount: summaries?.length ?? 0,
        });

        // Deduct Phase 1 credits immediately after completion
        if (installationId) {
          try {
            const creditService = new CreditService();
            const result = await creditService.deductCredits(
              installationId,
              repositoryFullName,
              pullNumber,
              summaryGenerator.getAccumulatedUsage(),
              "summary"
            );
            if (result.success) {
              totalCreditsDeducted += result.creditsDeducted ?? 0;
              currentBalance = result.newBalance ?? currentBalance;
              prLogger.info("Phase 1 credits deducted", {
                prNumber: pullNumber,
                creditsDeducted: result.creditsDeducted,
                newBalance: result.newBalance,
              });
            }
          } catch (err: any) {
            prLogger.error("Phase 1 credit deduction failed", { prNumber: pullNumber, error: err.message });
          }
        }
      } catch (err: any) {
        prLogger.error("Summary generation failed, continuing without summaries", {
          prNumber: pullNumber,
          error: err.message,
        });
        await postPhaseFailureNotice("summary");
        summaries = undefined;
      }
    } else {
      prLogger.info("Summary generation disabled", { prNumber: pullNumber });
    }

    // Step 2: Generate review (with optional summary filtering)
    if (options.summaryOnly) {
      prLogger.info("Summary-only mode — skipping review and architecture phases", { prNumber: pullNumber });
    } else {
      // Guard #1: check balance before Phase 2 (inline review)
      if (installationId && reviewSettings.enableInlineReviewComments && currentBalance !== null && currentBalance < MIN_CREDITS_REVIEW_PHASE) {
        prLogger.warn("Insufficient credits for inline review phase — skipping phases 2 and 3", {
          prNumber: pullNumber,
          currentBalance,
          required: MIN_CREDITS_REVIEW_PHASE,
        });
        await this.context.octokit.issues.createComment({
          owner: this.context.payload.repository.owner.login,
          repo: this.context.payload.repository.name,
          issue_number: pullNumber,
          body: `Your organisation has insufficient credits to run the inline review (current balance: **${currentBalance}**). Please top up your credits at [https://app.thinkthroo.com/account](https://app.thinkthroo.com/account).`,
        });
      } else {
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
          // Cap files per review to the plan/override limit resolved from the rate limit check
          maxFiles: filesPerReview ?? options.reviewOptions?.maxFiles,
        }, prLogger);

        try {
          await reviewGenerator.generate();

          // Deduct Phase 2 credits immediately after completion
          if (installationId) {
            try {
              const creditService = new CreditService();
              const result = await creditService.deductCredits(
                installationId,
                repositoryFullName,
                pullNumber,
                reviewGenerator.getAccumulatedUsage(),
                "review"
              );
              if (result.success) {
                totalCreditsDeducted += result.creditsDeducted ?? 0;
                currentBalance = result.newBalance ?? currentBalance;
                prLogger.info("Phase 2 credits deducted", {
                  prNumber: pullNumber,
                  creditsDeducted: result.creditsDeducted,
                  newBalance: result.newBalance,
                });
              }
            } catch (err: any) {
              prLogger.error("Phase 2 credit deduction failed", { prNumber: pullNumber, error: err.message });
            }
          }
        } catch (err: any) {
          prLogger.error("Review generation failed, continuing workflow", {
            prNumber: pullNumber,
            error: err.message,
          });
          await postPhaseFailureNotice("inline review");
        }

        // Step 3: Architecture review (controlled by platform settings)
        if (reviewSettings.enableArchitectureReview) {
          // Guard #2: check balance before Phase 3 (architecture review)
          if (installationId && currentBalance !== null && currentBalance < MIN_CREDITS_ARCHITECTURE_PHASE) {
            prLogger.warn("Insufficient credits for architecture review — skipping phase 3", {
              prNumber: pullNumber,
              currentBalance,
              required: MIN_CREDITS_ARCHITECTURE_PHASE,
            });
          } else {
            prLogger.info("Starting architecture review phase", { prNumber: pullNumber });

            try {
              architectureReviewGenerator = new ArchitectureReviewGenerator(
                this.context,
                { maxConcurrency: 3, maxFiles: options.reviewOptions?.maxFiles ?? 50, reviewStartSha },
                prLogger
              );
              await architectureReviewGenerator.generate();
              prLogger.info("Architecture review phase complete", { prNumber: pullNumber });

              // Deduct Phase 3 credits immediately after completion
              if (installationId) {
                try {
                  const creditService = new CreditService();
                  const result = await creditService.deductCredits(
                    installationId,
                    repositoryFullName,
                    pullNumber,
                    architectureReviewGenerator.getAccumulatedUsage(),
                    "architecture"
                  );
                  if (result.success) {
                    totalCreditsDeducted += result.creditsDeducted ?? 0;
                    currentBalance = result.newBalance ?? currentBalance;
                    prLogger.info("Phase 3 credits deducted", {
                      prNumber: pullNumber,
                      creditsDeducted: result.creditsDeducted,
                      newBalance: result.newBalance,
                    });
                  }
                } catch (err: any) {
                  prLogger.error("Phase 3 credit deduction failed", { prNumber: pullNumber, error: err.message });
                }
              }
            } catch (error: any) {
              // Architecture review failure should not break the overall PR workflow
              prLogger.error("Architecture review failed, continuing", {
                prNumber: pullNumber,
                error: error.message,
              });
            }
          }
        }
      }
    } // end !options.summaryOnly

    // Persist the review summary for the platform dashboard
    if (installationId) {
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
            creditsDeducted: totalCreditsDeducted,
            hasArchitectureResults: fileResults.length > 0,
          });
          prLogger.info("PR review summary saved to platform", { prNumber: pullNumber });

          // Step 6: Persist architecture file results if we have them
          if (saveResult.success && saveResult.reviewId && fileResults.length > 0) {
            const architectureSaved = await reviewService.saveArchitectureResults({
              prReviewId: saveResult.reviewId,
              repositoryFullName,
              installationId,
              fileResults,
            });
            if (architectureSaved) {
              prLogger.info("Architecture file results saved to platform", {
                prNumber: pullNumber,
                fileCount: fileResults.length,
              });
            } else {
              prLogger.warn("Architecture file results save failed", {
                prNumber: pullNumber,
                fileCount: fileResults.length,
              });
            }
          }

          // Step 7: Persist inline review comments if any were generated
          const inlineReviews = reviewGenerator?.getInlineFileReviews() ?? [];
          if (saveResult.success && saveResult.reviewId && inlineReviews.length > 0) {
            try {
              const inlineSaved = await reviewService.saveInlineReviews({
                prReviewId: saveResult.reviewId,
                inlineReviews,
              });
              if (inlineSaved) {
                prLogger.info("Inline review comments saved to platform", {
                  prNumber: pullNumber,
                  fileCount: inlineReviews.length,
                  totalComments: inlineReviews.reduce((sum, f) => sum + f.comments.length, 0),
                });
              } else {
                prLogger.warn("Inline review comments save failed", {
                  prNumber: pullNumber,
                  fileCount: inlineReviews.length,
                  totalComments: inlineReviews.reduce((sum, f) => sum + f.comments.length, 0),
                });
              }
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

