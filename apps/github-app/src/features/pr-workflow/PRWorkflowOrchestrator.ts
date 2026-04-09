import type { Context } from "probot";
import { PullRequestSummaryGenerator } from "../generate-pr-summary/PullRequestSummaryGenerator";
import { PullRequestReviewGenerator } from "../generate-pr-review/PullRequestReviewGenerator";
import { ArchitectureReviewGenerator } from "../architecture-review/ArchitectureReviewGenerator";
import type { SummaryResult } from "@/services/summarization/FileSummarizer";
import { CreditService } from "@/services/credits/CreditService";
import type { BotAccumulatedUsage } from "@/services/ai/types";
import { logger } from "@/utils/logger";

/** Minimum credits required to start a PR workflow run */
const MIN_CREDIT_THRESHOLD = 1;

export interface PRWorkflowOptions {
  generateSummaries?: boolean;
  useSummaryFiltering?: boolean;
  enableArchitectureReview?: boolean;
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
    const repositoryFullName = this.context.payload.repository.full_name;
    const installationId = String(
      (this.context.payload as any).installation?.id ?? ""
    );
    const startTime = Date.now();

    logger.info("PR Workflow started", {
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
          logger.warn("Insufficient credits — skipping PR workflow", {
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
        logger.warn("Credit balance check failed, proceeding anyway", {
          prNumber: pullNumber,
          error: err.message,
        });
      }
    }

    let summaries: SummaryResult[] | undefined;
    let summaryGenerator: PullRequestSummaryGenerator | undefined;
    let reviewGenerator: PullRequestReviewGenerator | undefined;
    let architectureReviewGenerator: ArchitectureReviewGenerator | undefined;

    // Step 1: Generate summaries (if enabled)
    if (options.generateSummaries !== false) {
      logger.info("Starting summary generation phase", { prNumber: pullNumber });
      
      summaryGenerator = new PullRequestSummaryGenerator(this.context);
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

    reviewGenerator = new PullRequestReviewGenerator(this.context, {
      enableSummaryFiltering: options.useSummaryFiltering !== false && !!summaries,
      summaries,
      ...options.reviewOptions,
    });

    await reviewGenerator.generate();

    // Step 3: Architecture review (if enabled)
    if (options.enableArchitectureReview !== false) {
      logger.info("Starting architecture review phase", { prNumber: pullNumber });

      const shortSummary = (summaries ?? [])
        .map((s) => `${s.filename}: ${s.summary}`)
        .join("\n");

      try {
        architectureReviewGenerator = new ArchitectureReviewGenerator(
          this.context,
          { maxConcurrency: 3, maxFiles: options.reviewOptions?.maxFiles ?? 50 }
        );
        await architectureReviewGenerator.generate(shortSummary);
        logger.info("Architecture review phase complete", { prNumber: pullNumber });
      } catch (error: any) {
        // Architecture review failure should not break the overall PR workflow
        logger.error("Architecture review failed, continuing", {
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

      try {
        const creditService = new CreditService();
        const result = await creditService.deductCredits(
          installationId,
          repositoryFullName,
          pullNumber,
          allUsage
        );

        if (result.success) {
          logger.info("Credits deducted for PR workflow", {
            prNumber: pullNumber,
            creditsDeducted: result.creditsDeducted,
            newBalance: result.newBalance,
          });
        } else {
          logger.warn("Credit deduction was unsuccessful", {
            prNumber: pullNumber,
            reason: result.reason,
          });
        }
      } catch (err: any) {
        // Credit deduction failure must never crash the PR workflow
        logger.error("Credit deduction failed", {
          prNumber: pullNumber,
          error: err.message,
        });
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info("PR Workflow complete", {
      prNumber: pullNumber,
      durationSeconds: parseFloat(duration),
      hadSummaries: !!summaries,
    });
  }
}

