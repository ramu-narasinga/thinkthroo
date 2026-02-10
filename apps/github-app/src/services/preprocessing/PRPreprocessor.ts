import type { Context } from "probot";
import { DiffFetcher } from "@/services/diffs/DiffFetcher";
import { FileFilter } from "@/services/files/FileFilter";
import { HunkProcessor } from "@/services/hunks/HunkProcessor";
import type { IssueDetails } from "@/types/issue";
import { logger } from "@/utils/logger";

export type FileWithHunks = [string, string, string, Array<[number, number, string]>];

export interface FilterResult {
  selected: any[];
  ignored: any[];
}

export interface PreprocessResult {
  filesAndChanges: FileWithHunks[];
  filterResult: FilterResult;
  commits: any[];
  success: boolean;
}

/**
 * Handles common PR preprocessing: fetching diffs, filtering files, processing hunks.
 * Used by both summary and review generators to avoid duplication.
 */
export class PRPreprocessor {
  private readonly diffFetcher: DiffFetcher;
  private readonly fileFilter: FileFilter;
  private readonly hunkProcessor: HunkProcessor;

  constructor(
    octokit: Context["octokit"],
    issueDetails: IssueDetails
  ) {
    logger.debug("PRPreprocessor initialized", {
      owner: issueDetails.owner,
      repo: issueDetails.repo,
    });
    this.diffFetcher = new DiffFetcher(octokit, issueDetails);
    this.fileFilter = new FileFilter();
    this.hunkProcessor = new HunkProcessor(octokit, issueDetails);
    logger.debug("PRPreprocessor services created");
  }

  /**
   * Fetch and process PR files into reviewable hunks
   */
  async process(
    baseSha: string,
    headSha: string,
    reviewStartSha?: string
  ): Promise<PreprocessResult> {
    logger.info("Starting PR preprocessing", {
      baseSha,
      headSha,
      reviewStartSha,
      isIncrementalReview: !!reviewStartSha,
    });

    const emptyResult: PreprocessResult = {
      filesAndChanges: [],
      filterResult: { selected: [], ignored: [] },
      commits: [],
      success: false,
    };

    // Use reviewStartSha for incremental diff if provided, otherwise use baseSha
    const incrementalBase = reviewStartSha ?? baseSha;
    logger.debug("Determined incremental base", {
      incrementalBase,
      usingReviewStart: incrementalBase === reviewStartSha,
    });

    // Step 1: Fetch diffs
    logger.debug("Fetching diffs", {
      incrementalBase,
      headSha,
      baseSha,
    });

    const incrementalDiff = await this.diffFetcher.fetchIncrementalDiff(
      incrementalBase,
      headSha
    );

    const targetBranchFiles = await this.diffFetcher.fetchTargetBranchDiff(
      baseSha,
      headSha
    );

    logger.info("Diffs fetched successfully", {
      incrementalFilesCount: incrementalDiff.files.length,
      targetBranchFilesCount: targetBranchFiles.length,
      commitsCount: incrementalDiff.commits.length,
    });

    // Step 2: Validate diff data
    logger.debug("Validating diff data");
    if (!this.diffFetcher.validateDiffData(incrementalDiff.files, targetBranchFiles)) {
      logger.warn("Invalid diff data during preprocessing", { baseSha, headSha });
      return emptyResult;
    }
    logger.debug("Diff data validated successfully");

    // Step 3: Filter files
    logger.debug("Filtering changed files");
    const changedFiles = this.fileFilter.filterChangedFiles(
      targetBranchFiles,
      incrementalDiff.files
    );

    logger.info("Changed files filtered", {
      changedFilesCount: changedFiles.length,
      targetBranchFilesCount: targetBranchFiles.length,
      incrementalFilesCount: incrementalDiff.files.length,
    });

    if (!this.fileFilter.validateFiles(changedFiles, "files is null")) {
      logger.warn("No changed files after filtering");
      return emptyResult;
    }

    logger.debug("Applying file ignore rules");
    const filterResult = this.fileFilter.applyFileIgnoreRules(changedFiles);

    logger.info("File ignore rules applied", {
      selectedCount: filterResult.selected.length,
      ignoredCount: filterResult.ignored.length,
      totalFiles: changedFiles.length,
    });

    if (!this.fileFilter.validateFiles(filterResult.selected, "filterSelectedFiles is null")) {
      logger.warn("No files selected after applying ignore rules");
      return emptyResult;
    }

    if (filterResult.selected.length === 0) {
      logger.info("No files to process after filtering", { baseSha, headSha });
      return { ...emptyResult, filterResult, success: true };
    }

    // Step 4: Process files into hunks
    logger.debug("Processing files into hunks", {
      filesCount: filterResult.selected.length,
      baseSha,
    });

    const filteredFiles = await this.hunkProcessor.processFilesIntoHunks(
      filterResult.selected,
      baseSha
    );

    // Step 5: Filter out null results
    const filesAndChanges = filteredFiles.filter(
      (file): file is FileWithHunks => file !== null
    );

    logger.info("PR preprocessing completed successfully", {
      filesWithHunksCount: filesAndChanges.length,
      nullFilesCount: filteredFiles.length - filesAndChanges.length,
      totalCommits: incrementalDiff.commits.length,
    });

    return {
      filesAndChanges,
      filterResult,
      commits: incrementalDiff.commits,
      success: true,
    };
  }

  /**
   * Get the underlying diff fetcher for direct access if needed
   */
  getDiffFetcher(): DiffFetcher {
    return this.diffFetcher;
  }
}
