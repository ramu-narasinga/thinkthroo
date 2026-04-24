import type { Context } from "probot";
import pLimit from "p-limit";
import { ClaudeBot } from "@/services/ai/ClaudeBot";
import { Prompts } from "@/services/ai/Prompts";
import type { TemplateData } from "@/services/ai/Prompts";
import { ReviewCommentManager } from "@/services/reviews/ReviewCommentManager";
import { FileReviewer, type FileInlineReview } from "@/services/reviews/FileReviewer";
import { FileReviewFilter } from "@/services/reviews/FileReviewFilter";
import { PRPreprocessor } from "@/services/preprocessing/PRPreprocessor";
import type { SummaryResult } from "@/services/summarization/FileSummarizer";
import { getDefaultAIOptions, ClaudeModel, type AIOptions, type BotAccumulatedUsage } from "@/services/ai/types";
import { logger, type Logger } from "@/utils/logger";

export interface PullRequestReviewOptions {
  disableReview?: boolean;
  maxConcurrency?: number;
  maxFiles?: number;
  maxRequestTokens?: number;
  debug?: boolean;
  enableSummaryFiltering?: boolean;
  summaries?: SummaryResult[];
  reviewStartSha?: string;
  shortSummary?: string;
}

export class PullRequestReviewGenerator {
  private readonly defaultOptions: Omit<Required<PullRequestReviewOptions>, 'summaries' | 'reviewStartSha' | 'shortSummary'> = {
    disableReview: false,
    maxConcurrency: 5,
    maxFiles: 50,
    maxRequestTokens: 10000,
    debug: false,
    enableSummaryFiltering: true,
  };

  private readonly preprocessor: PRPreprocessor;
  private readonly reviewBot: ClaudeBot;
  private readonly prompts: Prompts;
  private readonly fileReviewFilter: FileReviewFilter;
  private readonly options: PullRequestReviewOptions;
  private readonly aiOptions: AIOptions;
  private readonly log: Logger;
  private fileReviewer: FileReviewer | null = null;

  constructor(
    private readonly context: Context<"pull_request.opened" | "pull_request.synchronize">,
    options: PullRequestReviewOptions = {},
    log?: Logger
  ) {
    this.log = log ?? logger;
    const prNumber = context.payload.pull_request.number;
    this.log.info("Initializing PullRequestReviewGenerator", {
      prNumber,
      providedOptions: Object.keys(options),
      event: context.name,
    });

    this.options = { ...this.defaultOptions, ...options };

    this.log.debug("Merged options", {
      prNumber,
      options: this.options,
    });

    const issueDetails = context.issue();
    const octokit = context.octokit;

    this.log.debug("Creating service instances", {
      prNumber,
      owner: issueDetails.owner,
      repo: issueDetails.repo,
    });

    this.preprocessor = new PRPreprocessor(octokit, issueDetails);
    this.fileReviewFilter = new FileReviewFilter();

    this.aiOptions = getDefaultAIOptions();

    this.log.debug("AI options configured", {
      prNumber,
      reviewBotModel: this.aiOptions.reviewBot.model,
      maxRetries: this.aiOptions.reviewBot.maxRetries,
      requestTokens: this.aiOptions.reviewBot.tokenLimits.requestTokens,
      responseTokens: this.aiOptions.reviewBot.tokenLimits.responseTokens,
    });

    try {
      this.reviewBot = new ClaudeBot(this.aiOptions.reviewBot, undefined, this.log);
      this.log.info("Review bot initialized successfully", {
        prNumber,
        model: ClaudeModel.SONNET_4_5,
      });
    } catch (e: any) {
      this.log.error("Failed to create review bot", {
        prNumber,
        error: e.message,
        stack: e.stack,
      });
      throw e;
    }

    this.prompts = new Prompts();

    this.log.info("PullRequestReviewGenerator initialized successfully", {
      prNumber,
      owner: issueDetails.owner,
      repo: issueDetails.repo,
    });
  }
  
  async generate(): Promise<void> {
    const startTime = Date.now();
    const opts = this.options;

    if (opts.disableReview) {
      this.log.info("Review is disabled, skipping", { prNumber: this.context.payload.pull_request.number });
      return;
    }

    const pullRequest = this.context.payload.pull_request;
    const pullNumber = pullRequest.number;
    const issueDetails = this.context.issue();

    this.log.info("PR Review Generation Started", {
      prNumber: pullNumber,
      prTitle: pullRequest.title,
      owner: issueDetails.owner,
      repo: issueDetails.repo,
      baseSha: pullRequest.base.sha,
      headSha: pullRequest.head.sha,
    });

    // Step 1: Preprocess - fetch diffs, filter files, process hunks
    this.log.debug("Preprocessing PR for review", { prNumber: pullNumber });
    const preprocessResult = await this.preprocessor.process(
      pullRequest.base.sha,
      pullRequest.head.sha,
      opts.reviewStartSha
    );

    if (!preprocessResult.success) {
      this.log.warn("Preprocessing failed, skipping review", { prNumber: pullNumber });
      return;
    }

    const { filesAndChanges, filterResult } = preprocessResult;

    if (filesAndChanges.length === 0) {
      this.log.info("No file changes to review", { prNumber: pullNumber });
      return;
    }

    // Step 1.5: Apply summary-based filtering if enabled
    let filesToReview = filesAndChanges;
    let reviewsSkipped: string[] = [];

    if (opts.enableSummaryFiltering && opts.summaries) {
      this.log.debug("Applying summary-based filtering", {
        prNumber: pullNumber,
        totalFiles: filesAndChanges.length,
        summariesCount: opts.summaries.length,
      });

      const filterResult = this.fileReviewFilter.filter(filesAndChanges, opts.summaries);
      filesToReview = filterResult.filesToReview;
      reviewsSkipped = filterResult.reviewsSkipped;

      this.log.info("Summary-based filtering complete", {
        prNumber: pullNumber,
        originalFiles: filesAndChanges.length,
        filesToReview: filesToReview.length,
        reviewsSkipped: reviewsSkipped.length,
      });
    } else {
      this.log.debug("Summary-based filtering disabled", { prNumber: pullNumber });
    }

    if (filesToReview.length === 0) {
      this.log.info("No files need review after filtering", { prNumber: pullNumber });
      return;
    }

    this.log.info("Files to review", { prNumber: pullNumber, fileCount: filesToReview.length });

    // Step 2: Initialize review-specific services
    const reviewCommentManager = new ReviewCommentManager(
      this.context.octokit,
      issueDetails
    );
    this.fileReviewer = new FileReviewer(
      this.reviewBot,
      this.prompts,
      reviewCommentManager,
      {
        maxRequestTokens: this.aiOptions.reviewBot.tokenLimits.requestTokens,
        debug: opts.debug ?? false,
      }
    );
    const fileReviewer = this.fileReviewer;

    // Step 3: Prepare template data
    const templateData: TemplateData = {
      title: pullRequest.title,
      description: pullRequest.body || "",
      rawSummary: "",
      shortSummary: opts.shortSummary ?? "",
      filename: "",
      fileDiff: "",
      patches: "",
      fileContent: "",
      changesets: "",
      rawDiff: "",
    };

    // Step 4: Review files with concurrency control
    this.log.info("Starting AI review of files", {
      prNumber: pullNumber,
      concurrency: opts.maxConcurrency ?? 5,
      maxFiles: opts.maxFiles ?? 50,
    });

    const claudeConcurrencyLimit = pLimit(opts.maxConcurrency ?? 5);
    const reviewPromises = [];
    const skippedFiles: string[] = [];
    // FIXME: What happens if there's more than 50 files?x
    const maxFiles = opts.maxFiles ?? 50;

    for (const [filename, fileContent, _fileDiff, patches] of filesToReview) {
      if (maxFiles <= 0 || reviewPromises.length < maxFiles) {
        reviewPromises.push(
          claudeConcurrencyLimit(async () =>
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

    // Notify when files were truncated due to the plan's files-per-review limit
    if (skippedFiles.length > 0) {
      try {
        await this.context.octokit.issues.createComment({
          owner: issueDetails.owner,
          repo: issueDetails.repo,
          issue_number: pullNumber,
          body: `**${skippedFiles.length} file${skippedFiles.length === 1 ? " was" : "s were"} skipped** because your plan allows a maximum of **${maxFiles} files per review**. Upgrade your plan at [https://app.thinkthroo.com/account](https://app.thinkthroo.com/account) to review more files per PR.`,
        });
      } catch (err: any) {
        this.log.warn("Failed to post skipped-files comment", {
          prNumber: pullNumber,
          skippedCount: skippedFiles.length,
          error: err.message,
        });
      }
    }

    // Step 5: Analyze results
    const totalReviews = results.reduce((sum: number, r) => sum + r.reviewCount, 0);
    const failedFiles = results.filter((r) => r.failed);
    const reviewedFiles = results.filter((r) => !r.failed);
    const reviewsFailed = fileReviewer.getReviewsFailed();

    this.log.info("Review results summary", {
      prNumber: pullNumber,
      reviewedFilesCount: reviewedFiles.length,
      totalReviewComments: totalReviews,
      failedFilesCount: failedFiles.length,
    });

    if (failedFiles.length > 0) {
      this.log.warn("Some files failed review", {
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
    ? `<details>
<summary>Files not reviewed due to errors (${reviewsFailed.length})</summary>

* ${reviewsFailed.join('\n* ')}

</details>
`
    : ''
}
${
  reviewsSkipped.length > 0
    ? `<details>
<summary>Files skipped from review due to trivial changes (${reviewsSkipped.length})</summary>

* ${reviewsSkipped.join('\n* ')}

</details>
`
    : ''
}
<details>
<summary>Review comments generated (${totalReviews})</summary>

* Review: ${totalReviews}

</details>

---

<details>
<summary>Tips</summary>

### Chat with ThinkThroo
- Reply on review comments left by this bot to ask follow-up questions. A review comment is a comment on a diff or a file.
- Invite the bot into a review comment chain by tagging the bot in a reply.

### Code suggestions
- The bot may make code suggestions, but please review them carefully before committing since the line number ranges may be misaligned.
- You can edit the comment made by the bot and manually tweak the suggestion if it is slightly off.

### Pausing incremental reviews
- Add \`@thinkthroo: ignore\` anywhere in the PR description to pause further reviews from the bot.

</details>
`;

    // Step 7: Submit review if we have comments
    const bufferedCount = reviewCommentManager.getBufferedCommentCount();
    this.log.debug("Buffered comments ready to submit", { prNumber: pullNumber, bufferedCount });

    if (bufferedCount > 0) {
      try {
        this.log.info("Submitting review to GitHub", { prNumber: pullNumber, commentCount: bufferedCount });
        await reviewCommentManager.submitReview(
          pullNumber,
          pullRequest.head.sha,
          statusMsg
        );
        this.log.info("Review submitted successfully", { prNumber: pullNumber });
      } catch (error: any) {
        this.log.error("Failed to submit review", { prNumber: pullNumber, error: error.message });
        throw error;
      }
    } else {
      this.log.info("No review comments to submit", { prNumber: pullNumber });
    }

    // Step 8: Log completion
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    this.log.info("PR Review Generation Complete", {
      prNumber: pullNumber,
      durationSeconds: parseFloat(duration),
      reviewedFiles: reviewedFiles.length,
      totalComments: totalReviews,
    });
  }

  /**
   * Returns the accumulated AI token usage for this generator's review bot.
   */
  getAccumulatedUsage(): BotAccumulatedUsage[] {
    return [this.reviewBot.getAccumulatedUsage()];
  }

  /**
   * Returns the inline review comments collected per file after generate() runs.
   */
  getInlineFileReviews(): FileInlineReview[] {
    return this.fileReviewer?.getFileInlineReviews() ?? [];
  }
}
