import type { Context } from "probot";
import type { IssueDetails } from "@/types/issue";
import { COMMIT_ID_END_TAG, COMMIT_ID_START_TAG } from "@/services/constants";
import { logger } from "@/lib/logger";

/**
 * Analyzes commits to determine what needs to be reviewed
 */
export class CommitAnalyzer {
  constructor(
    private readonly octokit: Context["octokit"],
    private readonly issueDetails: IssueDetails
  ) {}

  async getAllCommitIds(pullNumber: number): Promise<string[]> {
    const allCommits: string[] = [];
    let page = 1;
    let commits;

    do {
      commits = await this.octokit.pulls.listCommits({
        owner: this.issueDetails.owner,
        repo: this.issueDetails.repo,
        pull_number: pullNumber,
        per_page: 100,
        page,
      });

      allCommits.push(...commits.data.map((commit) => commit.sha));
      page++;
    } while (commits.data.length > 0);

    return allCommits;
  }

  getReviewedCommitIdsBlock(commentBody: string): string {
    const start = commentBody.indexOf(COMMIT_ID_START_TAG);
    const end = commentBody.indexOf(COMMIT_ID_END_TAG);
    if (start === -1 || end === -1) {
      return "";
    }
    return commentBody.substring(start, end + COMMIT_ID_END_TAG.length);
  }

  getReviewedCommitIds(commentBody: string): string[] {
    const start = commentBody.indexOf(COMMIT_ID_START_TAG);
    const end = commentBody.indexOf(COMMIT_ID_END_TAG);

    if (start === -1 || end === -1) {
      return [];
    }

    const ids = commentBody.substring(start + COMMIT_ID_START_TAG.length, end);

    // remove the <!-- and --> markers from each id and extract the id and remove empty strings
    return ids
      .split("<!--")
      .map((id) => id.replace("-->", "").trim())
      .filter((id) => id !== "");
  }

  getHighestReviewedCommitId(
    commitIds: string[],
    reviewedCommitIds: string[]
  ): string {
    for (let i = commitIds.length - 1; i >= 0; i--) {
      if (reviewedCommitIds.includes(commitIds[i])) {
        return commitIds[i];
      }
    }
    return "";
  }

  determineReviewStartCommit(
    allCommitIds: string[],
    existingCommitIdsBlock: string,
    baseSha: string,
    headSha: string
  ): string {
    if (existingCommitIdsBlock === "") {
      logger.info("Will review from base commit", { baseSha });
      return baseSha;
    }

    const reviewedCommitIds = this.getReviewedCommitIds(existingCommitIdsBlock);
    const highestReviewedCommitId = this.getHighestReviewedCommitId(
      allCommitIds,
      reviewedCommitIds
    );

    if (highestReviewedCommitId === "" || highestReviewedCommitId === headSha) {
      logger.info("Will review from base commit", { baseSha });
      return baseSha;
    }

    logger.info("Will review from highest reviewed commit", { highestReviewedCommitId });
    return highestReviewedCommitId;
  }
}
