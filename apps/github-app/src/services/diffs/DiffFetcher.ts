import type { Context } from "probot";
import type { IssueDetails } from "@/types/issue";
import { logger } from "@/lib/logger";

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
  ) {}

  async fetchIncrementalDiff(
    baseSha: string,
    headSha: string
  ): Promise<DiffData> {
    const diff = await this.octokit.repos.compareCommits({
      owner: this.issueDetails.owner,
      repo: this.issueDetails.repo,
      base: baseSha,
      head: headSha,
    });

    return {
      files: diff.data.files || [],
      commits: diff.data.commits || [],
    };
  }

  async fetchTargetBranchDiff(
    baseSha: string,
    headSha: string
  ): Promise<any[]> {
    const diff = await this.octokit.repos.compareCommits({
      owner: this.issueDetails.owner,
      repo: this.issueDetails.repo,
      base: baseSha,
      head: headSha,
    });

    return diff.data.files || [];
  }

  validateDiffData(
    incrementalFiles: any[],
    targetBranchFiles: any[]
  ): boolean {
    if (!incrementalFiles || !targetBranchFiles) {
      logger.warn("Skipping: files data is missing", {
        hasIncrementalFiles: !!incrementalFiles,
        hasTargetBranchFiles: !!targetBranchFiles,
      });
      return false;
    }
    return true;
  }
}
