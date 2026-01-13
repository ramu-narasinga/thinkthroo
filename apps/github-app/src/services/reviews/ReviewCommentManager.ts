import type { Context } from "probot";
import type { IssueDetails } from "@/types/issue";
import { COMMENT_REPLY_TAG } from "@/services/constants-review";
import { logger } from "@/lib/logger";

/**
 * Buffered review comment for batch submission
 */
interface BufferedComment {
  path: string;
  startLine: number;
  endLine: number;
  body: string;
}

/**
 * Manages review comments - buffering, submitting, and handling comment chains
 */
export class ReviewCommentManager {
  private bufferedComments: BufferedComment[] = [];

  constructor(
    private readonly octokit: Context["octokit"],
    private readonly issueDetails: IssueDetails
  ) {}

  /**
   * Buffer a review comment for later submission
   */
  bufferReviewComment(
    path: string,
    startLine: number,
    endLine: number,
    body: string
  ): void {
    this.bufferedComments.push({
      path,
      startLine,
      endLine,
      body: `${body}\n\n${COMMENT_REPLY_TAG}`,
    });
  }

  /**
   * Get comment chains within a specific line range
   */
  async getCommentChainsWithinRange(
    pullNumber: number,
    filename: string,
    startLine: number,
    endLine: number,
    tag: string
  ): Promise<string> {
    try {
      const { data: comments } = await this.octokit.pulls.listReviewComments({
        owner: this.issueDetails.owner,
        repo: this.issueDetails.repo,
        pull_number: pullNumber,
        per_page: 100,
      });

      const relevantComments = comments.filter((comment) => {
        if (comment.path !== filename) return false;
        if (!comment.body?.includes(tag)) return false;

        const line = comment.line || comment.original_line || 0;
        return line >= startLine && line <= endLine;
      });

      if (relevantComments.length === 0) {
        return "";
      }

      // Build comment chain string
      const chains = relevantComments.map((comment) => {
        const user = comment.user?.login || "unknown";
        const body = comment.body || "";
        const line = comment.line || comment.original_line || 0;
        return `[${user} at line ${line}]: ${body}`;
      });

      return chains.join("\n---\n");
    } catch (e: any) {
      logger.warn("Failed to get comment chains", {
        pullNumber,
        filename,
        error: e.message,
      });
      return "";
    }
  }

  /**
   * Submit all buffered review comments as a PR review
   */
  async submitReview(
    pullNumber: number,
    commitSha: string,
    statusMessage: string
  ): Promise<void> {
    if (this.bufferedComments.length === 0) {
      logger.info("No review comments to submit");
      return;
    }

    try {
      // Build review comments array
      const comments = this.bufferedComments.map((comment) => ({
        path: comment.path,
        body: comment.body,
        line: comment.endLine,
        start_line: comment.startLine !== comment.endLine ? comment.startLine : undefined,
        start_side: comment.startLine !== comment.endLine ? "RIGHT" as const : undefined,
      }));

      await this.octokit.pulls.createReview({
        owner: this.issueDetails.owner,
        repo: this.issueDetails.repo,
        pull_number: pullNumber,
        commit_id: commitSha,
        event: "COMMENT",
        body: statusMessage,
        comments,
      });

      logger.info("Review submitted successfully", {
        pullNumber,
        commentCount: this.bufferedComments.length,
      });
      
      // Clear buffer after successful submission
      this.bufferedComments = [];
    } catch (e: any) {
      logger.error("Failed to submit review", {
        pullNumber,
        error: e.message,
      });
      throw e;
    }
  }

  /**
   * Get the number of buffered comments
   */
  getBufferedCommentCount(): number {
    return this.bufferedComments.length;
  }

  /**
   * Clear all buffered comments
   */
  clearBuffer(): void {
    this.bufferedComments = [];
  }
}
