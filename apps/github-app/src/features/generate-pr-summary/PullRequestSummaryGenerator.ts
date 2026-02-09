import type { Context } from "probot";
import { 
  SUMMARIZE_TAG,
} from "@/services/constants";
import { CommentManager } from "@/services/comments/CommentManager";
import { CommitAnalyzer } from "@/services/commits/CommitAnalyzer";
import { PRPreprocessor } from "@/services/preprocessing/PRPreprocessor";
import { FileSummarizer, type SummaryResult } from "@/services/summarization/FileSummarizer";
import { ClaudeBot } from "@/services/ai/ClaudeBot";
import { Prompts } from "@/services/ai/Prompts";
import type { TemplateData } from "@/services/ai/Prompts";
import { getDefaultAIOptions, ClaudeModel, type AIOptions } from "@/services/ai/types";
import pLimit from "p-limit";
import { logger } from "@/utils/logger";

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

    this.aiOptions = getDefaultAIOptions();

    try {
      this.summaryBot = new ClaudeBot(this.aiOptions.summaryBot);
      logger.info("Summary bot initialized", { model: ClaudeModel.HAIKU_4_5 });
    } catch (e: any) {
      logger.error("Failed to create summary bot", {
        error: e.message,
        stack: e.stack,
      });
      throw e;
    }

    try {
      this.reviewBot = new ClaudeBot(this.aiOptions.reviewBot);
      logger.info("Review bot initialized", { model: ClaudeModel.SONNET_4_5 });
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

  async generate(): Promise<SummaryResult[]> {
    const pullRequest = this.context.payload.pull_request;
    const pullNumber = pullRequest.number;

    // Step 1: Get existing comment data
    const existingCommentData = await this.commentManager.getExistingCommentData(
      pullNumber,
      SUMMARIZE_TAG,
      this.commitAnalyzer.getReviewedCommitIdsBlock.bind(this.commitAnalyzer)
    );

    // Step 2: Analyze commits to determine review start point
    logger.debug("Starting commit analysis", { 
      prNumber: pullNumber, 
      baseSha: pullRequest.base.sha, 
      headSha: pullRequest.head.sha 
    });
    
    const allCommitIds = await this.commitAnalyzer.getAllCommitIds(pullNumber);
    logger.debug("Retrieved all commit IDs", { 
      prNumber: pullNumber, 
      commitCount: allCommitIds.length,
      commitIds: allCommitIds 
    });
    
    const reviewStartCommit = this.commitAnalyzer.determineReviewStartCommit(
      allCommitIds,
      existingCommentData.commitIdsBlock,
      pullRequest.base.sha,
      pullRequest.head.sha
    );
    
    logger.info("Determined review start commit", { 
      prNumber: pullNumber, 
      reviewStartCommit,
      totalCommits: allCommitIds.length,
      hasExistingComment: !!existingCommentData.commentBody
    });

    // Step 3: Preprocess - fetch diffs, filter files, process hunks
    logger.info("Starting PR preprocessing", {
      prNumber: pullNumber,
      baseSha: pullRequest.base.sha,
      headSha: pullRequest.head.sha,
      reviewStartCommit,
    });

    const preprocessResult = await this.preprocessor.process(
      pullRequest.base.sha,
      pullRequest.head.sha,
      reviewStartCommit
    );
    
    if (!preprocessResult.success) {
      logger.error("PR preprocessing failed", {
        prNumber: pullNumber,
        baseSha: pullRequest.base.sha,
        headSha: pullRequest.head.sha,
        reviewStartCommit,
      });
      return [];
    }

    const { filesAndChanges, filterResult, commits } = preprocessResult;

    logger.info("PR preprocessing completed successfully", {
      prNumber: pullNumber,
      filesAndChangesCount: filesAndChanges.length,
      selectedFilesCount: filterResult.selected.length,
      ignoredFilesCount: filterResult.ignored.length,
      commitsCount: commits.length,
    });

    // Step 4: Validate commits
    if (commits.length === 0) {
      logger.warn("Skipping PR summary: no commits found", { prNumber: pullNumber });
      return [];
    }

    if (filesAndChanges.length === 0) {
      logger.warn("Skipping PR summary: no files to review", { prNumber: pullNumber });
      return [];
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
    logger.debug("Adding in-progress status to comment", {
      prNumber: pullNumber,
      hasExistingComment: !!existingCommentData.commentBody,
      existingCommentLength: existingCommentData.commentBody.length,
    });

    const inProgressSummarizeCmt = this.commentManager.addInProgressStatus(
      existingCommentData.commentBody,
      statusMsg
    );

    logger.debug("In-progress comment prepared", {
      prNumber: pullNumber,
      commentLength: inProgressSummarizeCmt.length,
    });

    // Step 7: Add in-progress status to the summarize comment
    logger.info("Posting in-progress comment to PR", {
      prNumber: pullNumber,
      tag: SUMMARIZE_TAG,
      mode: "replace",
    });

    await this.commentManager.comment(inProgressSummarizeCmt, SUMMARIZE_TAG, "replace");

    logger.info("In-progress comment posted successfully", {
      prNumber: pullNumber,
    });

    // Step 8: Summarize files using Claude with concurrency control
    logger.info("Starting file summarization", {
      prNumber: pullNumber,
      totalFiles: filesAndChanges.length,
      maxConcurrency: this.aiOptions.maxConcurrency,
      maxFiles: this.aiOptions.maxFiles,
      reviewSimpleChanges: this.aiOptions.reviewSimpleChanges,
    });

    const claudeConcurrencyLimit = pLimit(this.aiOptions.maxConcurrency);
    const summaryPromises: Array<Promise<{ filename: string; summary: string; needsReview: boolean } | null>> = [];
    const skippedFiles: string[] = [];
    
    // Prepare shared template data for all files
    const templateData: TemplateData = {
      title: pullRequest.title,
      description: pullRequest.body || "",
    };

    logger.debug("Template data prepared for summarization", {
      prNumber: pullNumber,
      hasTitle: !!pullRequest.title,
      hasDescription: !!pullRequest.body,
      titleLength: pullRequest.title?.length || 0,
      descriptionLength: pullRequest.body?.length || 0,
    });

    // Process files with concurrency control and max file limit
    for (const [filename, fileContent, fileDiff] of filesAndChanges) {
      if (this.aiOptions.maxFiles <= 0 || summaryPromises.length < this.aiOptions.maxFiles) {
        logger.debug("Queuing file for summarization", {
          prNumber: pullNumber,
          filename,
          fileContentLength: fileContent.length,
          fileDiffLength: fileDiff.length,
          queuePosition: summaryPromises.length + 1,
        });

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
        logger.debug("Skipping file due to maxFiles limit", {
          prNumber: pullNumber,
          filename,
          maxFiles: this.aiOptions.maxFiles,
          currentQueueSize: summaryPromises.length,
        });
        skippedFiles.push(filename);
      }
    }

    logger.info("File summarization queue prepared", {
      prNumber: pullNumber,
      queuedFiles: summaryPromises.length,
      skippedFiles: skippedFiles.length,
      totalFiles: filesAndChanges.length,
    });

    // Wait for all summaries to complete
    logger.info("Starting concurrent file summarization", {
      prNumber: pullNumber,
      concurrentTasks: summaryPromises.length,
    });

    const startTime = Date.now();
    const summaryResults = await Promise.all(summaryPromises);
    const duration = Date.now() - startTime;

    logger.info("All file summarizations completed", {
      prNumber: pullNumber,
      totalTasks: summaryPromises.length,
      durationMs: duration,
      avgTimePerFile: summaryPromises.length > 0 ? (duration / summaryPromises.length).toFixed(2) + 'ms' : 'N/A',
    });
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
    logger.info("Starting batch processing of summaries", {
      prNumber: pullNumber,
      totalSummaries: summaries.length,
      batchSize: this.aiOptions.summaryBatchSize,
      expectedBatches: Math.ceil(summaries.length / this.aiOptions.summaryBatchSize),
    });

    let rawSummary = "";
    
    if (summaries.length > 0) {
      const batchSize = this.aiOptions.summaryBatchSize;
      const totalBatches = Math.ceil(summaries.length / batchSize);
      
      // Process summaries in batches to group related changes
      for (let i = 0; i < summaries.length; i += batchSize) {
        const batchNumber = Math.floor(i / batchSize) + 1;
        const summariesBatch = summaries.slice(i, i + batchSize);
        
        logger.debug("Processing summary batch", {
          prNumber: pullNumber,
          batchNumber,
          totalBatches,
          batchSize: summariesBatch.length,
          filesInBatch: summariesBatch.map(s => s.filename),
        });

        // Build raw summary for this batch
        let batchSummary = "";
        for (const { filename, summary } of summariesBatch) {
          batchSummary += `---\n${filename}: ${summary}\n`;
        }

        logger.debug("Batch summary prepared", {
          prNumber: pullNumber,
          batchNumber,
          batchSummaryLength: batchSummary.length,
        });
        
        // Ask review bot to group and deduplicate related changes
        logger.debug("Requesting changeset grouping from AI", {
          prNumber: pullNumber,
          batchNumber,
          inputLength: batchSummary.length,
        });

        const startTime = Date.now();
        const groupedResponse = await this.reviewBot.chat(
          this.prompts.renderSummarizeChangesets({
            raw_summary: batchSummary,
          })
        );
        const duration = Date.now() - startTime;

        logger.info("Changeset grouping response received", {
          prNumber: pullNumber,
          batchNumber,
          hasResponse: groupedResponse.text.length > 0,
          responseLength: groupedResponse.text.length,
          durationMs: duration,
        });
        
        if (groupedResponse.text === "") {
          logger.warn("Summarize changesets: nothing obtained from AI", { 
            prNumber: pullNumber,
            batchNumber,
            fallbackToBatchSummary: true,
          });
          rawSummary += batchSummary;
        } else {
          rawSummary = groupedResponse.text;
        }
      }

      logger.info("Batch processing completed", {
        prNumber: pullNumber,
        totalBatches,
        rawSummaryLength: rawSummary.length,
      });
    } else {
      logger.info("No summaries to batch process", {
        prNumber: pullNumber,
      });
    }

    // Step 10: Generate final PR summary
    logger.info("Generating final PR summary", {
      prNumber: pullNumber,
      rawSummaryLength: rawSummary.length,
      hasRawSummary: rawSummary.length > 0,
    });

    const finalSummaryStartTime = Date.now();
    const finalSummaryResponse = await this.reviewBot.chat(
      this.prompts.renderSummarize({
        raw_summary: rawSummary,
      })
    );
    const finalSummaryDuration = Date.now() - finalSummaryStartTime;

    logger.info("Final PR summary generated", {
      prNumber: pullNumber,
      hasResponse: finalSummaryResponse.text.length > 0,
      responseLength: finalSummaryResponse.text.length,
      durationMs: finalSummaryDuration,
    });

    if (finalSummaryResponse.text === "") {
      logger.warn("Final summary: nothing obtained from AI", { prNumber: pullNumber });
    }

    const summarizeFinalResponse = finalSummaryResponse.text;

    // Step 11: Generate release notes (if enabled)
    if (this.aiOptions.disableReleaseNotes === false) {
      logger.info("Generating release notes", {
        prNumber: pullNumber,
        rawSummaryLength: rawSummary.length,
      });

      const releaseNotesStartTime = Date.now();
      const releaseNotesResponse = await this.reviewBot.chat(
        this.prompts.renderSummarizeReleaseNotes({
          raw_summary: rawSummary,
        })
      );
      const releaseNotesDuration = Date.now() - releaseNotesStartTime;

      logger.info("Release notes generated", {
        prNumber: pullNumber,
        hasResponse: releaseNotesResponse.text.length > 0,
        responseLength: releaseNotesResponse.text.length,
        durationMs: releaseNotesDuration,
      });

      if (releaseNotesResponse.text === "") {
        logger.warn("Release notes: nothing obtained from AI", { prNumber: pullNumber });
      } else {
        let message = "### Summary by ThinkThroo Bot\n\n";
        message += releaseNotesResponse.text;
        
        logger.debug("Updating PR description with release notes", {
          prNumber: pullNumber,
          messageLength: message.length,
        });

        try {
          await this.commentManager.updateDescription(
            pullRequest.number,
            message
          );
          logger.info("PR description updated with release notes", {
            prNumber: pullNumber,
          });
        } catch (e: any) {
          logger.warn("Failed to update PR description with release notes", {
            prNumber: pullNumber,
            error: e.message,
          });
        }
      }
    } else {
      logger.debug("Release notes generation disabled", {
        prNumber: pullNumber,
      });
    }

    // Step 12: Generate short summary for context
    logger.info("Generating short summary for context", {
      prNumber: pullNumber,
      rawSummaryLength: rawSummary.length,
    });

    const shortSummaryStartTime = Date.now();
    const summarizeShortResponse = await this.reviewBot.chat(
      this.prompts.renderSummarizeShort({
        raw_summary: rawSummary,
      })
    );
    const shortSummaryDuration = Date.now() - shortSummaryStartTime;
    const shortSummary = summarizeShortResponse.text;

    logger.info("Short summary generated", {
      prNumber: pullNumber,
      shortSummaryLength: shortSummary.length,
      durationMs: shortSummaryDuration,
    });

    // Step 13: Build final summary comment
    logger.info("Building final summary comment", {
      prNumber: pullNumber,
      finalResponseLength: summarizeFinalResponse.length,
      rawSummaryLength: rawSummary.length,
      shortSummaryLength: shortSummary.length,
      skippedFilesCount: skippedFiles.length,
      failedSummariesCount: failedSummaries.length,
    });

    const summarizeComment = this.commentManager.buildFinalSummaryComment(
      summarizeFinalResponse,
      rawSummary,
      shortSummary,
      statusMsg,
      skippedFiles,
      failedSummaries
    );

    logger.info("Final summary comment built", {
      prNumber: pullNumber,
      commentLength: summarizeComment.length,
    });

    // Step 15: Post the final summary comment
    logger.info("Posting final summary comment to PR", {
      prNumber: pullNumber,
      commentLength: summarizeComment.length,
      tag: SUMMARIZE_TAG,
    });

    await this.commentManager.comment(summarizeComment, SUMMARIZE_TAG, "replace");

    logger.info("Final summary comment posted successfully", {
      prNumber: pullNumber,
    });

    logger.info("PR summary generation completed successfully", {
      prNumber: pullNumber,
      summarizedFilesCount: summaries.length,
      totalDurationSinceStart: Date.now() - startTime,
    });

    // Return summaries for use in review filtering
    return summaries;
  }
}
