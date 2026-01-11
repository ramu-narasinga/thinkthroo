import type { Context } from "probot";
import { SUMMARIZE_TAG } from "@/utils/constants";
import { CommentManager } from "@/utils/comments/CommentManager";
import { CommitAnalyzer } from "@/utils/commits/CommitAnalyzer";
import { DiffFetcher } from "@/utils/diffs/DiffFetcher";
import { FileFilter } from "@/utils/files/FileFilter";
import { HunkProcessor } from "@/utils/hunks/HunkProcessor";
import { FileSummarizer } from "@/utils/summarization/FileSummarizer";

/**
 * Orchestrates the PR summary generation process
 */
export class PullRequestSummaryGenerator {
  private readonly commentManager: CommentManager;
  private readonly commitAnalyzer: CommitAnalyzer;
  private readonly diffFetcher: DiffFetcher;
  private readonly fileFilter: FileFilter;
  private readonly hunkProcessor: HunkProcessor;
  private readonly fileSummarizer: FileSummarizer;

  constructor(private readonly context: Context<"pull_request">) {
    const issueDetails = context.issue();
    const octokit = context.octokit;

    this.commentManager = new CommentManager(octokit, issueDetails);
    this.commitAnalyzer = new CommitAnalyzer(octokit, issueDetails);
    this.diffFetcher = new DiffFetcher(octokit, issueDetails);
    this.fileFilter = new FileFilter();
    this.hunkProcessor = new HunkProcessor(octokit, issueDetails);
    
    // TODO: Configure options properly
    this.fileSummarizer = new FileSummarizer(octokit, issueDetails, {
      reviewSimpleChanges: false,
      lightTokenLimits: {
        requestTokens: 4000,
      },
    });
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

    // Step 3: Fetch diffs
    const incrementalDiff = await this.diffFetcher.fetchIncrementalDiff(
      reviewStartCommit,
      pullRequest.head.sha
    );

    const targetBranchFiles = await this.diffFetcher.fetchTargetBranchDiff(
      pullRequest.base.sha,
      pullRequest.head.sha
    );

    // Step 4: Validate diff data
    if (!this.diffFetcher.validateDiffData(incrementalDiff.files, targetBranchFiles)) {
      return;
    }

    // Step 5: Filter files
    const changedFiles = this.fileFilter.filterChangedFiles(
      targetBranchFiles,
      incrementalDiff.files
    );

    if (!this.fileFilter.validateFiles(changedFiles, "files is null")) {
      return;
    }

    const filterResult = this.fileFilter.applyFileIgnoreRules(changedFiles);

    if (!this.fileFilter.validateFiles(filterResult.selected, "filterSelectedFiles is null")) {
      return;
    }

    // Step 6: Validate commits
    if (incrementalDiff.commits.length === 0) {
      console.warn("Skipped: commits is null");
      return;
    }

    // Step 7: Process files into hunks for review
    const filteredFiles = await this.hunkProcessor.processFilesIntoHunks(
      filterResult.selected,
      pullRequest.base.sha
    );

    // Step 8: Filter out null results and validate
    const filesAndChanges = filteredFiles.filter(file => file !== null) as Array<
      [string, string, string, Array<[number, number, string]>]
    >;

    if (filesAndChanges.length === 0) {
      console.error("Skipped: no files to review");
      return;
    }

    // Step 9: Generate status message
    const statusMsg = this.commentManager.generateStatusMessage(
      reviewStartCommit,
      pullRequest.head.sha,
      filesAndChanges,
      filterResult.ignored
    );

    console.info(statusMsg);

    // Step 10: Update existing comment with in-progress status
    const inProgressSummarizeCmt = this.commentManager.addInProgressStatus(
      existingCommentData.commentBody,
      statusMsg
    );

    // Step 11: Add in-progress status to the summarize comment
    await this.commentManager.comment(inProgressSummarizeCmt, SUMMARIZE_TAG, "replace");

    // Step 12: Summarize files (TODO: integrate with AI bot)
    const summaries = await this.fileSummarizer.summarizeFiles(
      filesAndChanges,
      lightBot,
      prompts,
      inputs,
      getTokenCount
    );
    const failedSummaries = this.fileSummarizer.getSummariesFailed();
  }
}
