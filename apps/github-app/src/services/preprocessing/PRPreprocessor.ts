import type { Context } from "probot";
import { DiffFetcher } from "@/services/diffs/DiffFetcher";
import { FileFilter } from "@/services/files/FileFilter";
import { HunkProcessor } from "@/services/hunks/HunkProcessor";
import type { IssueDetails } from "@/types/issue";
import { logger } from "@/lib/logger";

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
    this.diffFetcher = new DiffFetcher(octokit, issueDetails);
    this.fileFilter = new FileFilter();
    this.hunkProcessor = new HunkProcessor(octokit, issueDetails);
  }

  /**
   * Fetch and process PR files into reviewable hunks
   */
  async process(
    baseSha: string,
    headSha: string,
    reviewStartSha?: string
  ): Promise<PreprocessResult> {
    const emptyResult: PreprocessResult = {
      filesAndChanges: [],
      filterResult: { selected: [], ignored: [] },
      commits: [],
      success: false,
    };

    // Use reviewStartSha for incremental diff if provided, otherwise use baseSha
    const incrementalBase = reviewStartSha ?? baseSha;

    // Step 1: Fetch diffs
    const incrementalDiff = await this.diffFetcher.fetchIncrementalDiff(
      incrementalBase,
      headSha
    );

    const targetBranchFiles = await this.diffFetcher.fetchTargetBranchDiff(
      baseSha,
      headSha
    );

    // Step 2: Validate diff data
    if (!this.diffFetcher.validateDiffData(incrementalDiff.files, targetBranchFiles)) {
      logger.warn("Invalid diff data during preprocessing", { baseSha, headSha });
      return emptyResult;
    }

    // Step 3: Filter files
    const changedFiles = this.fileFilter.filterChangedFiles(
      targetBranchFiles,
      incrementalDiff.files
    );

    if (!this.fileFilter.validateFiles(changedFiles, "files is null")) {
      return emptyResult;
    }

    const filterResult = this.fileFilter.applyFileIgnoreRules(changedFiles);

    if (!this.fileFilter.validateFiles(filterResult.selected, "filterSelectedFiles is null")) {
      return emptyResult;
    }

    if (filterResult.selected.length === 0) {
      logger.info("No files to process after filtering", { baseSha, headSha });
      return { ...emptyResult, filterResult, success: true };
    }

    // Step 4: Process files into hunks
    const filteredFiles = await this.hunkProcessor.processFilesIntoHunks(
      filterResult.selected,
      baseSha
    );

    // Step 5: Filter out null results
    const filesAndChanges = filteredFiles.filter(
      (file): file is FileWithHunks => file !== null
    );

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
