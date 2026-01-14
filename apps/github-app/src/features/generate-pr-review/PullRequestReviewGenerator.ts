import type { Context } from "probot";
import pLimit from "p-limit";
import { ClaudeBot } from "@/services/ai/ClaudeBot";
import { Prompts } from "@/services/ai/Prompts";
import type { TemplateData } from "@/services/ai/Prompts";
import { ReviewCommentManager } from "@/services/reviews/ReviewCommentManager";
import { FileReviewer } from "@/services/reviews/FileReviewer";
import { PRPreprocessor } from "@/services/preprocessing/PRPreprocessor";
import { ClaudeModel } from "@/services/ai/types";
import { logger } from "@/utils/logger";

export interface PullRequestReviewOptions {
  disableReview?: boolean;
  reviewCommentLGTM?: boolean;
  maxConcurrency?: number;
  maxFiles?: number;
  maxRequestTokens?: number;
  debug?: boolean;
}

/**
 * Orchestrates AI-powered PR code reviews
 */
export class PullRequestReviewGenerator {
  private readonly defaultOptions: Required<PullRequestReviewOptions> = {
    disableReview: false,
    reviewCommentLGTM: false,
    maxConcurrency: 5,
    maxFiles: 50,
    maxRequestTokens: 10000,
    debug: false,
  };

  private readonly preprocessor: PRPreprocessor;
  private readonly reviewBot: ClaudeBot;
  private readonly prompts: Prompts;
  private readonly options: Required<PullRequestReviewOptions>;

  constructor(
    private readonly context: Context<"pull_request.opened" | "pull_request.synchronize">,
    options: PullRequestReviewOptions = {}
  ) {
    this.options = { ...this.defaultOptions, ...options };
    const opts = this.options;

    const issueDetails = context.issue();
    const octokit = context.octokit;

    this.preprocessor = new PRPreprocessor(octokit, issueDetails);

    // Initialize AI bot
    this.reviewBot = new ClaudeBot({
      model: ClaudeModel.SONNET_4_5,
      tokenLimits: {
        maxTokens: 200000,
        responseTokens: 8192,
        requestTokens: opts.maxRequestTokens,
        knowledgeCutOff: "2024-10",
      },
      temperature: 0.05,
      debug: opts.debug,
    });

    this.prompts = new Prompts();
  }

  /**
   * Generate and post AI review comments
   */
  async generate(): Promise<void> {
    const startTime = Date.now();
    const opts = this.options;

    if (opts.disableReview) {
      logger.info("Review is disabled, skipping", { prNumber: this.context.payload.pull_request.number });
      return;
    }

    const pullRequest = this.context.payload.pull_request;
    const pullNumber = pullRequest.number;
    const issueDetails = this.context.issue();

    logger.info("PR Review Generation Started", {
      prNumber: pullNumber,
      prTitle: pullRequest.title,
      owner: issueDetails.owner,
      repo: issueDetails.repo,
      baseSha: pullRequest.base.sha,
      headSha: pullRequest.head.sha,
    });

    // Step 1: Preprocess - fetch diffs, filter files, process hunks
    logger.debug("Preprocessing PR for review", { prNumber: pullNumber });
    const preprocessResult = await this.preprocessor.process(
      pullRequest.base.sha,
      pullRequest.head.sha
    );

    if (!preprocessResult.success) {
      logger.warn("Preprocessing failed, skipping review", { prNumber: pullNumber });
      return;
    }

    const { filesAndChanges, filterResult } = preprocessResult;

    if (filesAndChanges.length === 0) {
      logger.info("No file changes to review", { prNumber: pullNumber });
      return;
    }

    logger.info("Files to review", { prNumber: pullNumber, fileCount: filesAndChanges.length });

    // Step 2: Initialize review-specific services
    const reviewCommentManager = new ReviewCommentManager(
      this.context.octokit,
      issueDetails
    );
    const fileReviewer = new FileReviewer(
      this.reviewBot,
      this.prompts,
      reviewCommentManager,
      {
        maxRequestTokens: opts.maxRequestTokens,
        reviewCommentLGTM: opts.reviewCommentLGTM,
        debug: opts.debug,
      }
    );

    // Step 3: Prepare template data
    const templateData: TemplateData = {
      title: pullRequest.title,
      description: pullRequest.body || "",
      rawSummary: "",
      shortSummary: "",
      filename: "",
      fileDiff: "",
      patches: "",
      fileContent: "",
      changesets: "",
      rawDiff: "",
    };

    // Step 4: Review files with concurrency control
    logger.info("Starting AI review of files", {
      prNumber: pullNumber,
      concurrency: opts.maxConcurrency,
      maxFiles: opts.maxFiles,
    });

    const openaiConcurrencyLimit = pLimit(opts.maxConcurrency);
    const reviewPromises = [];
    const skippedFiles: string[] = [];

    for (const [filename, fileContent, _fileDiff, patches] of filesAndChanges) {
      if (opts.maxFiles <= 0 || reviewPromises.length < opts.maxFiles) {
        reviewPromises.push(
          openaiConcurrencyLimit(async () =>
            fileReviewer.reviewFile(
              filename,
              fileContent,
              patches,
              templateData,
              pullNumber
            )
          )
        );
      } else {
        skippedFiles.push(filename);
      }
    }

    const results = await Promise.all(reviewPromises);

    // Step 5: Analyze results
    const totalReviews = results.reduce((sum: number, r) => sum + r.reviewCount, 0);
    const totalLGTMs = results.reduce((sum: number, r) => sum + r.lgtmCount, 0);
    const failedFiles = results.filter((r) => r.failed);
    const reviewedFiles = results.filter((r) => !r.failed);
    const reviewsFailed = fileReviewer.getReviewsFailed();

    logger.info("Review results summary", {
      prNumber: pullNumber,
      reviewedFilesCount: reviewedFiles.length,
      totalReviewComments: totalReviews,
      lgtmComments: totalLGTMs,
      lgtmIncluded: opts.reviewCommentLGTM,
      failedFilesCount: failedFiles.length,
    });

    if (failedFiles.length > 0) {
      logger.warn("Some files failed review", {
        prNumber: pullNumber,
        failedFiles: failedFiles.map((f) => ({ filename: f.filename, reason: f.reason || "unknown error" })),
      });
    }

    // Step 6: Generate status message
    let statusMsg = `<details>
<summary>Commits</summary>
Files reviewed from base ${pullRequest.base.sha.substring(0, 7)} to head ${pullRequest.head.sha.substring(0, 7)}
</details>
${
  reviewedFiles.length > 0
    ? `
<details>
<summary>Files reviewed (${reviewedFiles.length})</summary>

* ${reviewedFiles.map((r) => r.filename).join('\n* ')}
</details>
`
    : ''
}
${
  filterResult.ignored.length > 0
    ? `
<details>
<summary>Files ignored due to filter (${filterResult.ignored.length})</summary>

* ${filterResult.ignored.map((file: any) => file.filename).join('\n* ')}

</details>
`
    : ''
}
${
  skippedFiles.length > 0
    ? `
<details>
<summary>Files not processed due to max files limit (${skippedFiles.length})</summary>

* ${skippedFiles.join('\n* ')}

</details>
`
    : ''
}
${
  reviewsFailed.length > 0
    ? `
<details>
<summary>Files not reviewed due to errors (${reviewsFailed.length})</summary>

* ${reviewsFailed.join('\n* ')}

</details>
`
    : ''
}
<details>
<summary>Review comments generated (${totalReviews + totalLGTMs})</summary>

* Review: ${totalReviews}
* LGTM: ${totalLGTMs}

</details>

---

<details>
<summary>Tips</summary>

### Chat with CodeArc Bot
- Reply on review comments left by this bot to ask follow-up questions.
- The bot analyzes your codebase architecture and provides focused feedback.

### Code suggestions
- Review suggestions carefully before committing since line number ranges may need adjustment.
- You can edit comments and manually tweak suggestions if needed.

</details>
`;

    // Step 7: Submit review if we have comments
    const bufferedCount = reviewCommentManager.getBufferedCommentCount();
    logger.debug("Buffered comments ready to submit", { prNumber: pullNumber, bufferedCount });

    if (bufferedCount > 0) {
      try {
        logger.info("Submitting review to GitHub", { prNumber: pullNumber, commentCount: bufferedCount });
        await reviewCommentManager.submitReview(
          pullNumber,
          pullRequest.head.sha,
          statusMsg
        );
        logger.info("Review submitted successfully", { prNumber: pullNumber });
      } catch (error: any) {
        logger.error("Failed to submit review", { prNumber: pullNumber, error: error.message });
        throw error;
      }
    } else {
      logger.info("No review comments to submit", { prNumber: pullNumber });
    }

    // Step 8: Log completion
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info("PR Review Generation Complete", {
      prNumber: pullNumber,
      durationSeconds: parseFloat(duration),
      reviewedFiles: reviewedFiles.length,
      totalComments: totalReviews,
    });
  }
}
