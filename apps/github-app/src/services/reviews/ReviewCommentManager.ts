import type { Context } from "probot";
import type { IssueDetails } from "@/types/issue";
import { COMMENT_GREETING, COMMENT_TAG } from "@/services/constants";
import { logger } from "@/utils/logger";

/**
 * Buffered review comment for batch submission
 */
interface BufferedComment {
  path: string;
  startLine: number;
  endLine: number;
  message: string;
}

/**
 * Manages review comments - buffering, submitting, and handling comment chains
 */
export class ReviewCommentManager {
  private readonly reviewCommentsBuffer: BufferedComment[] = [];
  private reviewCommentsCache: Record<number, any[]> = {};

  constructor(
    private readonly octokit: Context["octokit"],
    private readonly issueDetails: IssueDetails
  ) {
    logger.debug("ReviewCommentManager initialized", {
      owner: issueDetails.owner,
      repo: issueDetails.repo,
    });
  }

  /**
   * Buffer a review comment for later submission
   */
  async bufferReviewComment(
    path: string,
    startLine: number,
    endLine: number,
    message: string
  ): Promise<void> {
    logger.debug("Buffering review comment", {
      path,
      startLine,
      endLine,
      messageLength: message.length,
      currentBufferSize: this.reviewCommentsBuffer.length,
    });

    message = `${COMMENT_GREETING}

${message}

${COMMENT_TAG}`;
    this.reviewCommentsBuffer.push({
      path,
      startLine,
      endLine,
      message,
    });

    logger.debug("Review comment buffered successfully", {
      path,
      lineRange: `${startLine}-${endLine}`,
      newBufferSize: this.reviewCommentsBuffer.length,
    });
  }

  /**
   * Get comment chains within a specific line range
   */
  async getCommentChainsWithinRange(
    pullNumber: number,
    path: string,
    startLine: number,
    endLine: number,
    tag = ''
  ): Promise<string> {
    logger.debug("Getting comment chains within range", {
      pullNumber,
      path,
      startLine,
      endLine,
      tag,
    });

    const existingComments = await this.getCommentsWithinRange(
      pullNumber,
      path,
      startLine,
      endLine
    );

    logger.debug("Existing comments retrieved", {
      pullNumber,
      path,
      commentCount: existingComments.length,
    });

    // find all top most comments
    const topLevelComments = [];
    for (const comment of existingComments) {
      if (!comment.in_reply_to_id) {
        topLevelComments.push(comment);
      }
    }

    logger.debug("Top level comments identified", {
      pullNumber,
      path,
      topLevelCount: topLevelComments.length,
      totalComments: existingComments.length,
    });

    let allChains = '';
    let chainNum = 0;
    for (const topLevelComment of topLevelComments) {
      // get conversation chain
      const chain = await this.composeCommentChain(
        existingComments,
        topLevelComment
      );
      if (chain && chain.includes(tag)) {
        chainNum += 1;
        allChains += `Conversation Chain ${chainNum}:
${chain}
---
`;
      }
    }

    logger.debug("Comment chains composed", {
      pullNumber,
      path,
      chainsFound: chainNum,
      totalLength: allChains.length,
    });

    return allChains;
  }

  /**
   * Get all comments within a specific line range
   */
  async getCommentsWithinRange(
    pullNumber: number,
    path: string,
    startLine: number,
    endLine: number
  ): Promise<any[]> {
    logger.debug("Getting comments within range", {
      pullNumber,
      path,
      startLine,
      endLine,
    });

    const comments = await this.listReviewComments(pullNumber);
    const filtered = comments.filter(
      (comment: any) =>
        comment.path === path &&
        comment.body !== '' &&
        ((comment.start_line !== undefined &&
          comment.start_line >= startLine &&
          comment.line <= endLine) ||
          (startLine === endLine && comment.line === endLine))
    );

    logger.debug("Comments filtered by range", {
      pullNumber,
      path,
      totalComments: comments.length,
      matchingComments: filtered.length,
      lineRange: `${startLine}-${endLine}`,
    });

    return filtered;
  }

  /**
   * Compose a comment chain from top-level comment and its replies
   */
  async composeCommentChain(reviewComments: any[], topLevelComment: any): Promise<string> {
    logger.debug("Composing comment chain", {
      topLevelCommentId: topLevelComment.id,
      totalComments: reviewComments.length,
    });

    const conversationChain = reviewComments
      .filter((cmt: any) => cmt.in_reply_to_id === topLevelComment.id)
      .map((cmt: any) => `${cmt.user.login}: ${cmt.body}`);

    conversationChain.unshift(
      `${topLevelComment.user.login}: ${topLevelComment.body}`
    );

    logger.debug("Comment chain composed", {
      topLevelCommentId: topLevelComment.id,
      chainLength: conversationChain.length,
      totalCharacters: conversationChain.join('\n---\n').length,
    });

    return conversationChain.join('\n---\n');
  }

  /**
   * List all review comments for a PR with caching and pagination
   */
  async listReviewComments(pullNumber: number): Promise<any[]> {
    if (this.reviewCommentsCache[pullNumber]) {
      logger.debug("Using cached review comments", {
        pullNumber,
        cachedCount: this.reviewCommentsCache[pullNumber].length,
      });
      return this.reviewCommentsCache[pullNumber];
    }

    logger.debug("Fetching review comments from GitHub", {
      pullNumber,
      owner: this.issueDetails.owner,
      repo: this.issueDetails.repo,
    });

    const allComments: any[] = [];
    let page = 1;
    const startTime = Date.now();

    try {
      for (;;) {
        logger.debug("Fetching review comments page", {
          pullNumber,
          page,
          perPage: 100,
        });

        const { data: comments } = await this.octokit.pulls.listReviewComments({
          owner: this.issueDetails.owner,
          repo: this.issueDetails.repo,
          pull_number: pullNumber,
          page,
          per_page: 100,
        });
        allComments.push(...comments);
        page++;

        logger.debug("Review comments page fetched", {
          pullNumber,
          pageNumber: page - 1,
          commentsOnPage: comments.length,
          totalSoFar: allComments.length,
        });

        if (!comments || comments.length < 100) {
          break;
        }
      }

      this.reviewCommentsCache[pullNumber] = allComments;

      logger.info("Review comments fetched and cached", {
        pullNumber,
        totalComments: allComments.length,
        pagesRead: page - 1,
        durationMs: Date.now() - startTime,
      });

      return allComments;
    } catch (e: any) {
      logger.warn("Failed to list review comments", {
        pullNumber,
        error: e.message,
        stack: e.stack,
        commentsCollectedBeforeError: allComments.length,
      });
      return allComments;
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
    logger.debug("Attempting to submit review", {
      pullNumber,
      commitSha,
      bufferedCommentCount: this.reviewCommentsBuffer.length,
      statusMessageLength: statusMessage.length,
    });

    if (this.reviewCommentsBuffer.length === 0) {
      logger.info("No review comments to submit", {
        pullNumber,
      });
      return;
    }

    const startTime = Date.now();

    try {
      // Build review comments array
      const comments = this.reviewCommentsBuffer.map((comment) => ({
        path: comment.path,
        body: comment.message,
        line: comment.endLine,
        start_line: comment.startLine !== comment.endLine ? comment.startLine : undefined,
        start_side: comment.startLine !== comment.endLine ? "RIGHT" as const : undefined,
      }));

      logger.debug("Review payload prepared", {
        pullNumber,
        commentCount: comments.length,
        uniquePaths: new Set(comments.map(c => c.path)).size,
        multiLineComments: comments.filter(c => c.start_line !== undefined).length,
      });

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
        commentCount: this.reviewCommentsBuffer.length,
        durationMs: Date.now() - startTime,
      });
      
      // Clear buffer after successful submission
      this.reviewCommentsBuffer.length = 0;
    } catch (e: any) {
      logger.error("Failed to submit review", {
        pullNumber,
        error: e.message,
        durationMs: Date.now() - startTime,
      });
      throw e;
    }
  }

  /**
   * Get the number of buffered comments
   */
  getBufferedCommentCount(): number {
    return this.reviewCommentsBuffer.length;
  }

  /**
   * Clear all buffered comments
   */
  clearBuffer(): void {
    this.reviewCommentsBuffer.length = 0;
  }
}
