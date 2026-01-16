import type { Context } from "probot";
import type { IssueDetails } from "@/types/issue";
import { logger } from "@/utils/logger";

export interface DiffData {
  files: any[];
  commits: any[];
}

/**
 * Fetches and compares diffs between commits
 */
export class DiffFetcher {
  constructor(
    private readonly octokit: Context["octokit"],
    private readonly issueDetails: IssueDetails
  ) {
    logger.debug("DiffFetcher initialized", {
      owner: issueDetails.owner,
      repo: issueDetails.repo,
    });
  }

  async fetchIncrementalDiff(
    baseSha: string,
    headSha: string
  ): Promise<DiffData> {
    logger.debug("Fetching incremental diff", {
      baseSha,
      headSha,
      owner: this.issueDetails.owner,
      repo: this.issueDetails.repo,
    });

    try {
      const diff = await this.octokit.repos.compareCommits({
        owner: this.issueDetails.owner,
        repo: this.issueDetails.repo,
        base: baseSha,
        head: headSha,
      });

      const result = {
        files: diff.data.files || [],
        commits: diff.data.commits || [],
      };

      logger.info("Incremental diff fetched successfully", {
        baseSha,
        headSha,
        filesCount: result.files.length,
        commitsCount: result.commits.length,
        status: diff.data.status,
        aheadBy: diff.data.ahead_by,
        behindBy: diff.data.behind_by,
      });

      return result;
    } catch (e: any) {
      logger.error("Failed to fetch incremental diff", {
        baseSha,
        headSha,
        error: e.message,
        stack: e.stack,
      });
      throw e;
    }
  }

  async fetchTargetBranchDiff(
    baseSha: string,
    headSha: string
  ): Promise<any[]> {
    logger.debug("Fetching target branch diff", {
      baseSha,
      headSha,
      owner: this.issueDetails.owner,
      repo: this.issueDetails.repo,
    });

    try {
      const diff = await this.octokit.repos.compareCommits({
        owner: this.issueDetails.owner,
        repo: this.issueDetails.repo,
        base: baseSha,
        head: headSha,
      });

      const files = diff.data.files || [];

      logger.info("Target branch diff fetched successfully", {
        baseSha,
        headSha,
        filesCount: files.length,
        status: diff.data.status,
      });

      return files;
    } catch (e: any) {
      logger.error("Failed to fetch target branch diff", {
        baseSha,
        headSha,
        error: e.message,
        stack: e.stack,
      });
      throw e;
    }
  }

  validateDiffData(
    incrementalFiles: any[],
    targetBranchFiles: any[]
  ): boolean {
    logger.debug("Validating diff data", {
      hasIncrementalFiles: !!incrementalFiles,
      hasTargetBranchFiles: !!targetBranchFiles,
      incrementalFilesCount: incrementalFiles?.length || 0,
      targetBranchFilesCount: targetBranchFiles?.length || 0,
    });

    if (!incrementalFiles || !targetBranchFiles) {
      logger.warn("Diff data validation failed: files data is missing", {
        hasIncrementalFiles: !!incrementalFiles,
        hasTargetBranchFiles: !!targetBranchFiles,
      });
      return false;
    }

    logger.debug("Diff data validation passed", {
      incrementalFilesCount: incrementalFiles.length,
      targetBranchFilesCount: targetBranchFiles.length,
    });

    return true;
  }
}
