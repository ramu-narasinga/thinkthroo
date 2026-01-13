import type { Context } from "probot";
import { 
  SUMMARIZE_TAG, 
  RAW_SUMMARY_START_TAG, 
  RAW_SUMMARY_END_TAG,
  SHORT_SUMMARY_START_TAG,
  SHORT_SUMMARY_END_TAG
} from "@/services/constants";
import { CommentManager } from "@/services/comments/CommentManager";
import { CommitAnalyzer } from "@/services/commits/CommitAnalyzer";
import { PRPreprocessor } from "@/services/preprocessing/PRPreprocessor";
import { FileSummarizer } from "@/services/summarization/FileSummarizer";
import { ClaudeBot } from "@/services/ai/ClaudeBot";
import { Prompts } from "@/services/ai/Prompts";
import type { TemplateData } from "@/services/ai/Prompts";
import { getDefaultAIOptions, ClaudeModel, type AIOptions } from "@/services/ai/types";
import pLimit from "p-limit";
import { logger } from "@/lib/logger";

/**
 * Orchestrates the PR summary generation process
 */
export class PullRequestSummaryGenerator {
  private readonly commentManager: CommentManager;
  private readonly commitAnalyzer: CommitAnalyzer;
  private readonly preprocessor: PRPreprocessor;
  private readonly summaryBot: ClaudeBot;
  private readonly reviewBot: ClaudeBot;
  private readonly prompts: Prompts;
  private readonly fileSummarizer: FileSummarizer;
  private readonly aiOptions: AIOptions;

  constructor(private readonly context: Context<"pull_request">) {
    const issueDetails = context.issue();
    const octokit = context.octokit;

    this.commentManager = new CommentManager(octokit, issueDetails);
    this.commitAnalyzer = new CommitAnalyzer(octokit, issueDetails);
    this.preprocessor = new PRPreprocessor(octokit, issueDetails);

    // Initialize AI options
    this.aiOptions = getDefaultAIOptions();

    // Initialize AI bots with proper error handling
    try {
      this.summaryBot = new ClaudeBot(this.aiOptions.summaryBot);
      logger.info("Summary bot initialized", { model: ClaudeModel.HAIKU_3_5 });
    } catch (e: any) {
      logger.error("Failed to create summary bot", {
        error: e.message,
        stack: e.stack,
      });
      throw e;
    }

    try {
      this.reviewBot = new ClaudeBot(this.aiOptions.reviewBot);
      logger.info("Review bot initialized", { model: ClaudeModel.SONNET_3_5 });
    } catch (e: any) {
      logger.error("Failed to create review bot", {
        error: e.message,
        stack: e.stack,
      });
      throw e;
    }

    // Initialize prompts
    this.prompts = new Prompts();

    // Initialize file summarizer with DI
    this.fileSummarizer = new FileSummarizer(
      this.summaryBot,
      this.prompts,
      {
        reviewSimpleChanges: this.aiOptions.reviewSimpleChanges,
        maxRequestTokens: this.aiOptions.summaryBot.tokenLimits.requestTokens,
      }
    );
  }

  async generate(): Promise<void> {
    const pullRequest = this.context.payload.pull_request;
    const pullNumber = pullRequest.number;

    // Step 1: Get existing comment data
    const existingCommentData = await this.commentManager.getExistingCommentData(
      pullNumber,
      SUMMARIZE_TAG,
      this.commitAnalyzer.getReviewedCommitIdsBlock.bind(this.commitAnalyzer)
    );

    // Step 2: Analyze commits to determine review start point
    const allCommitIds = await this.commitAnalyzer.getAllCommitIds(pullNumber);
    const reviewStartCommit = this.commitAnalyzer.determineReviewStartCommit(
      allCommitIds,
      existingCommentData.commitIdsBlock,
      pullRequest.base.sha,
      pullRequest.head.sha
    );

    // Step 3: Preprocess - fetch diffs, filter files, process hunks
    const preprocessResult = await this.preprocessor.process(
      pullRequest.base.sha,
      pullRequest.head.sha,
      reviewStartCommit
    );

    if (!preprocessResult.success) {
      return;
    }

    const { filesAndChanges, filterResult, commits } = preprocessResult;

    // Step 4: Validate commits
    if (commits.length === 0) {
      logger.warn("Skipping PR summary: no commits found", { prNumber: pullNumber });
      return;
    }

    if (filesAndChanges.length === 0) {
      logger.warn("Skipping PR summary: no files to review", { prNumber: pullNumber });
      return;
    }

    // Step 5: Generate status message
    const statusMsg = this.commentManager.generateStatusMessage(
      reviewStartCommit,
      pullRequest.head.sha,
      filesAndChanges,
      filterResult.ignored
    );

    logger.debug("PR summary status", {
      prNumber: pullNumber,
      reviewStartCommit,
      headSha: pullRequest.head.sha,
      filesCount: filesAndChanges.length,
      ignoredFilesCount: filterResult.ignored.length,
    });

    // Step 6: Update existing comment with in-progress status
    const inProgressSummarizeCmt = this.commentManager.addInProgressStatus(
      existingCommentData.commentBody,
      statusMsg
    );

    // Step 7: Add in-progress status to the summarize comment
    await this.commentManager.comment(inProgressSummarizeCmt, SUMMARIZE_TAG, "replace");

    // Step 8: Summarize files using Claude with concurrency control
    const claudeConcurrencyLimit = pLimit(this.aiOptions.maxConcurrency);
    const summaryPromises: Array<Promise<{ filename: string; summary: string; needsReview: boolean } | null>> = [];
    const skippedFiles: string[] = [];
    
    // Prepare shared template data for all files
    const templateData: TemplateData = {
      title: pullRequest.title,
      description: pullRequest.body || "",
    };

    // Process files with concurrency control and max file limit
    for (const [filename, fileContent, fileDiff] of filesAndChanges) {
      if (this.aiOptions.maxFiles <= 0 || summaryPromises.length < this.aiOptions.maxFiles) {
        summaryPromises.push(
          claudeConcurrencyLimit(async () => 
            await this.fileSummarizer.summarizeFile(
              filename,
              fileContent,
              fileDiff,
              templateData
            )
          )
        );
      } else {
        skippedFiles.push(filename);
      }
    }

    // Wait for all summaries to complete
    const summaryResults = await Promise.all(summaryPromises);
    const summaries = summaryResults.filter(
      (summary): summary is { filename: string; summary: string; needsReview: boolean } => 
        summary !== null
    );

    const failedSummaries = this.fileSummarizer.getSummariesFailed();

    // Log summary results
    logger.info("File summarization completed", {
      prNumber: pullNumber,
      successCount: summaries.length,
      failedCount: failedSummaries.length,
      skippedCount: skippedFiles.length,
    });

    if (failedSummaries.length > 0) {
      logger.warn("Some files failed summarization", {
        prNumber: pullNumber,
        failedFiles: failedSummaries,
      });
    }
    if (skippedFiles.length > 0) {
      logger.warn("Some files skipped due to maxFiles limit", {
        prNumber: pullNumber,
        skippedFiles,
      });
    }

    // Step 9: Batch process summaries and create grouped changeset summaries
    let rawSummary = "";
    
    if (summaries.length > 0) {
      const batchSize = this.aiOptions.summaryBatchSize;
      
      // Process summaries in batches to group related changes
      for (let i = 0; i < summaries.length; i += batchSize) {
        const summariesBatch = summaries.slice(i, i + batchSize);
        
        // Build raw summary for this batch
        let batchSummary = "";
        for (const { filename, summary } of summariesBatch) {
          batchSummary += `---\n${filename}: ${summary}\n`;
        }
        
        // Ask review bot to group and deduplicate related changes
        const groupedResponse = await this.reviewBot.chat(
          this.prompts.renderSummarizeChangesets({
            raw_summary: batchSummary,
          })
        );
        
        if (groupedResponse.text === "") {
          logger.warn("Summarize changesets: nothing obtained from AI", { prNumber: pullNumber });
          rawSummary += batchSummary;
        } else {
          rawSummary = groupedResponse.text;
        }
      }
    }

    // Step 10: Generate final PR summary
    const finalSummaryResponse = await this.reviewBot.chat(
      this.prompts.renderSummarize({
        raw_summary: rawSummary,
      })
    );

    if (finalSummaryResponse.text === "") {
      logger.warn("Final summary: nothing obtained from AI", { prNumber: pullNumber });
    }

    const summarizeFinalResponse = finalSummaryResponse.text;

    // Step 11: Generate release notes (if enabled)
    if (this.aiOptions.disableReleaseNotes === false) {
      const releaseNotesResponse = await this.reviewBot.chat(
        this.prompts.renderSummarizeReleaseNotes({
          raw_summary: rawSummary,
        })
      );

      if (releaseNotesResponse.text === "") {
        logger.warn("Release notes: nothing obtained from AI", { prNumber: pullNumber });
      } else {
        let message = "### Summary by Think Throo Bot\n\n";
        message += releaseNotesResponse.text;
        try {
          await this.commentManager.updateDescription(
            pullRequest.number,
            message
          );
        } catch (e: any) {
          logger.warn("Failed to update PR description with release notes", {
            prNumber: pullNumber,
            error: e.message,
          });
        }
      }
    }

    // Step 12: Generate short summary for context
    const summarizeShortResponse = await this.reviewBot.chat(
      this.prompts.renderSummarizeShort({
        raw_summary: rawSummary,
      })
    );
    const shortSummary = summarizeShortResponse.text;

    // Step 13: Build final summary comment
    let summarizeComment = `${summarizeFinalResponse}
${RAW_SUMMARY_START_TAG}
${rawSummary}
${RAW_SUMMARY_END_TAG}
${SHORT_SUMMARY_START_TAG}
${shortSummary}
${SHORT_SUMMARY_END_TAG}

---

<details>
<summary>Uplevel your code reviews with Think Throo</summary>

### Think Throo

If you like this project, please support us by starring the repository. This tool uses advanced AI context and superior noise reduction to provide high-quality code reviews.

</details>
`;

    // Step 14: Add status information for skipped and failed files
    let finalStatusMsg = statusMsg;
    
    if (skippedFiles.length > 0) {
      finalStatusMsg += `\n<details>
<summary>Files not processed due to max files limit (${skippedFiles.length})</summary>

* ${skippedFiles.join('\n* ')}

</details>
`;
    }

    if (failedSummaries.length > 0) {
      finalStatusMsg += `\n<details>
<summary>Files not summarized due to errors (${failedSummaries.length})</summary>

* ${failedSummaries.join('\n* ')}

</details>
`;
    }

    // Add final status to comment
    summarizeComment = `${finalStatusMsg}\n\n${summarizeComment}`;

    // Step 15: Post the final summary comment
    await this.commentManager.comment(summarizeComment, SUMMARIZE_TAG, "replace");

    logger.info("PR summary generation completed successfully", {
      prNumber: pullNumber,
      summarizedFilesCount: summaries.length,
    });
  }
}
