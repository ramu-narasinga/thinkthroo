import type { Context } from "probot";
import type { IssueDetails } from "@/types/issue";
import {
  RAW_SUMMARY_END_TAG,
  RAW_SUMMARY_START_TAG,
  SHORT_SUMMARY_END_TAG,
  SHORT_SUMMARY_START_TAG,
  IN_PROGRESS_START_TAG,
  IN_PROGRESS_END_TAG,
  COMMENT_TAG,
  COMMENT_GREETING,
} from "@/services/constants";
import { logger } from "@/utils/logger";

export interface ExistingCommentData {
  comment: any | null;
  commitIdsBlock: string;
  commentBody: string;
  rawSummary: string;
  shortSummary: string;
}

const issueCommentsCache: Record<number, any[]> = {};

/**
 * Manages PR comments - finding, parsing, and extracting summary data
 */
export class CommentManager {
  constructor(
    private readonly octokit: Context["octokit"],
    private readonly issueDetails: IssueDetails
  ) {}

  private async listComments(issueNumber: number): Promise<any[]> {
    if (issueCommentsCache[issueNumber]) {
      logger.debug("Using cached comments", { 
        issueNumber,
        cachedCount: issueCommentsCache[issueNumber].length 
      });
      return issueCommentsCache[issueNumber];
    }

    logger.info("Fetching comments from GitHub API", { 
      issueNumber,
      owner: this.issueDetails.owner,
      repo: this.issueDetails.repo 
    });

    const allComments: any[] = [];
    let page = 1;
    try {
      for (;;) {
        logger.debug("Fetching comments page", { 
          issueNumber, 
          page, 
          perPage: 100 
        });
        
        const { data: comments } = await this.octokit.issues.listComments({
          owner: this.issueDetails.owner,
          repo: this.issueDetails.repo,
          issue_number: issueNumber,
          page,
          per_page: 100,
        });
        
        allComments.push(...comments);
        logger.debug("Comments page fetched", { 
          issueNumber, 
          page, 
          commentsInPage: comments.length,
          totalSoFar: allComments.length 
        });
        
        page++;
        if (!comments || comments.length < 100) {
          break;
        }
      }

      issueCommentsCache[issueNumber] = allComments;
      logger.info("All comments fetched and cached", { 
        issueNumber, 
        totalComments: allComments.length,
        totalPages: page - 1 
      });
      return allComments;
    } catch (e: any) {
      logger.error("Failed to list comments", {
        issueNumber,
        page,
        partialCount: allComments.length,
        error: e.message,
        stack: e.stack
      });
      return allComments;
    }
  }

  private async findCommentWithTag(
    tag: string,
    comments: any[]
  ): Promise<any | null> {
    logger.debug("Searching for comment with tag", { 
      tag, 
      totalComments: comments.length 
    });
    
    try {
      for (const cmt of comments) {
        if (cmt.body && cmt.body.includes(tag)) {
          logger.info("Comment with tag found", { 
            tag, 
            commentId: cmt.id,
            commentAuthor: cmt.user?.login,
            commentCreatedAt: cmt.created_at,
            commentUpdatedAt: cmt.updated_at,
            bodyLength: cmt.body.length 
          });
          return cmt;
        }
      }
      
      logger.debug("No comment found with tag", { 
        tag, 
        searchedComments: comments.length 
      });
      return null;
    } catch (e: unknown) {
      logger.error("Error while searching for comment with tag", { 
        tag, 
        error: String(e),
        totalComments: comments.length 
      });
      return null;
    }
  }

  private getContentWithinTags(
    content: string,
    startTag: string,
    endTag: string
  ): string {
    const start = content.indexOf(startTag);
    const end = content.indexOf(endTag);
    
    if (start >= 0 && end >= 0) {
      const extracted = content.slice(start + startTag.length, end);
      logger.debug("Content extracted within tags", { 
        startTag: startTag.substring(0, 50),
        endTag: endTag.substring(0, 50),
        startIndex: start,
        endIndex: end,
        extractedLength: extracted.length 
      });
      return extracted;
    }
    
    logger.debug("Tags not found in content", { 
      startTag: startTag.substring(0, 50),
      endTag: endTag.substring(0, 50),
      startFound: start >= 0,
      endFound: end >= 0,
      contentLength: content.length 
    });
    return "";
  }

  private getRawSummary(summary: string): string {
    logger.debug("Extracting raw summary", { 
      summaryLength: summary.length 
    });
    
    const result = this.getContentWithinTags(
      summary,
      RAW_SUMMARY_START_TAG,
      RAW_SUMMARY_END_TAG
    );
    
    if (result) {
      logger.debug("Raw summary extracted", { 
        rawSummaryLength: result.length 
      });
    } else {
      logger.warn("Raw summary not found in comment", { 
        summaryLength: summary.length 
      });
    }
    
    return result;
  }

  private getShortSummary(summary: string): string {
    logger.debug("Extracting short summary", { 
      summaryLength: summary.length 
    });
    
    const result = this.getContentWithinTags(
      summary,
      SHORT_SUMMARY_START_TAG,
      SHORT_SUMMARY_END_TAG
    );
    
    if (result) {
      logger.debug("Short summary extracted", { 
        shortSummaryLength: result.length 
      });
    } else {
      logger.warn("Short summary not found in comment", { 
        summaryLength: summary.length 
      });
    }
    
    return result;
  }

  async getExistingCommentData(
    pullNumber: number,
    tag: string,
    getReviewedCommitIdsBlock: (commentBody: string) => string
  ): Promise<ExistingCommentData> {
    logger.info("Fetching existing comment data", { 
      pullNumber, 
      tag,
      owner: this.issueDetails.owner,
      repo: this.issueDetails.repo 
    });

    const comments = await this.listComments(pullNumber);
    logger.debug("Comments retrieved", { 
      pullNumber, 
      totalComments: comments.length 
    });

    const existingComment = await this.findCommentWithTag(tag, comments);

    if (!existingComment) {
      logger.info("No existing comment found with tag", { 
        pullNumber, 
        tag 
      });
      return {
        comment: null,
        commitIdsBlock: "",
        commentBody: "",
        rawSummary: "",
        shortSummary: "",
      };
    }

    logger.info("Existing comment found", { 
      pullNumber, 
      tag,
      commentId: existingComment.id,
      commentLength: existingComment.body?.length || 0 
    });

    const commentBody = existingComment.body;
    const commitIdsBlock = getReviewedCommitIdsBlock(commentBody);
    const rawSummary = this.getRawSummary(commentBody);
    const shortSummary = this.getShortSummary(commentBody);

    logger.debug("Extracted comment data", { 
      pullNumber,
      hasCommitIdsBlock: commitIdsBlock.length > 0,
      hasRawSummary: rawSummary.length > 0,
      hasShortSummary: shortSummary.length > 0,
      commitIdsBlockLength: commitIdsBlock.length,
      rawSummaryLength: rawSummary.length,
      shortSummaryLength: shortSummary.length
    });

    return {
      comment: existingComment,
      commitIdsBlock,
      commentBody,
      rawSummary,
      shortSummary,
    };
  }

  async addPrSummaryComment(): Promise<void> {
    const prSummaryBodyText =
      "Thank you for opening this pull request!\n\nHere is a summary of your PR (placeholder):\n\n- Please add a description and context for reviewers.";

    await this.octokit.issues.createComment({
      owner: this.issueDetails.owner,
      repo: this.issueDetails.repo,
      issue_number: this.issueDetails.issue_number,
      body: prSummaryBodyText,
    });
  }

  generateStatusMessage(
    reviewStartCommit: string,
    headSha: string,
    filesAndChanges: Array<[string, string, string, Array<[number, number, string]>]>,
    filterIgnoredFiles: any[]
  ): string {
    logger.debug("Generating status message", {
      reviewStartCommit,
      headSha,
      filesAndChangesCount: filesAndChanges.length,
      filterIgnoredFilesCount: filterIgnoredFiles.length,
    });

    // Calculate total patches across all files
    const totalPatches = filesAndChanges.reduce((sum, [, , , patches]) => sum + patches.length, 0);

    logger.debug("Status message file details", {
      selectedFiles: filesAndChanges.map(([filename, , , patches]) => ({
        filename,
        patchCount: patches.length,
      })),
      ignoredFiles: filterIgnoredFiles.map(file => file.filename),
      totalPatches,
    });

    const statusMessage = `<details>
<summary>Commits</summary>
Files that changed from the base of the PR and between ${reviewStartCommit} and ${headSha} commits.
</details>
${
  filesAndChanges.length > 0
    ? `
<details>
<summary>Files selected (${filesAndChanges.length})</summary>

* ${filesAndChanges
        .map(([filename, , , patches]) => `${filename} (${patches.length})`)
        .join('\n* ')}
</details>
`
    : ''
}
${
  filterIgnoredFiles.length > 0
    ? `
<details>
<summary>Files ignored due to filter (${filterIgnoredFiles.length})</summary>

* ${filterIgnoredFiles.map(file => file.filename).join('\n* ')}

</details>
`
    : ''
}
`;

    logger.info("Status message generated", {
      reviewStartCommit,
      headSha,
      messageLength: statusMessage.length,
      selectedFilesCount: filesAndChanges.length,
      ignoredFilesCount: filterIgnoredFiles.length,
      totalPatches,
      hasSelectedFiles: filesAndChanges.length > 0,
      hasIgnoredFiles: filterIgnoredFiles.length > 0,
    });

    return statusMessage;
  }

  addInProgressStatus(commentBody: string, statusMsg: string): string {
    logger.debug("Adding in-progress status", {
      hasExistingComment: commentBody.length > 0,
      commentBodyLength: commentBody.length,
      statusMsgLength: statusMsg.length,
    });

    const start = commentBody.indexOf(IN_PROGRESS_START_TAG);
    const end = commentBody.indexOf(IN_PROGRESS_END_TAG);
    
    // add to the beginning of the comment body if the marker doesn't exist
    // otherwise do nothing
    if (start === -1 || end === -1) {
      const result = `${IN_PROGRESS_START_TAG}

Currently reviewing new changes in this PR...

${statusMsg}

${IN_PROGRESS_END_TAG}

---

${commentBody}`;
      
      logger.info("In-progress status added to comment", {
        hadExistingMarker: false,
        originalLength: commentBody.length,
        newLength: result.length,
      });
      
      return result;
    }
    
    logger.debug("In-progress marker already exists in comment", {
      startIndex: start,
      endIndex: end,
      commentBodyLength: commentBody.length,
    });
    
    return commentBody;
  }

  private async create(body: string, target: number): Promise<void> {
    logger.debug("Creating new comment", {
      target,
      bodyLength: body.length,
      owner: this.issueDetails.owner,
      repo: this.issueDetails.repo,
    });

    try {
      // get comment ID from the response
      const response = await this.octokit.issues.createComment({
        owner: this.issueDetails.owner,
        repo: this.issueDetails.repo,
        issue_number: target,
        body,
      });
      
      // add comment to issueCommentsCache
      if (issueCommentsCache[target]) {
        issueCommentsCache[target].push(response.data);
      } else {
        issueCommentsCache[target] = [response.data];
      }
      
      logger.info("Comment created successfully", {
        target,
        commentId: response.data.id,
        commentUrl: response.data.html_url,
        bodyLength: body.length,
      });
    } catch (e: any) {
      logger.error("Failed to create comment", {
        target,
        bodyLength: body.length,
        error: e.message,
        stack: e.stack,
      });
    }
  }

  private async replace(body: string, tag: string, target: number): Promise<void> {
    logger.debug("Replacing comment with tag", {
      target,
      tag,
      bodyLength: body.length,
      owner: this.issueDetails.owner,
      repo: this.issueDetails.repo,
    });

    try {
      const comments = await this.listComments(target);
      const cmt = await this.findCommentWithTag(tag, comments);
      
      if (cmt) {
        logger.debug("Updating existing comment", {
          target,
          tag,
          commentId: cmt.id,
          oldBodyLength: cmt.body?.length || 0,
          newBodyLength: body.length,
        });

        await this.octokit.issues.updateComment({
          owner: this.issueDetails.owner,
          repo: this.issueDetails.repo,
          comment_id: cmt.id,
          body,
        });
        
        logger.info("Comment updated successfully", {
          target,
          tag,
          commentId: cmt.id,
          bodyLength: body.length,
        });
      } else {
        logger.debug("No existing comment found, creating new one", {
          target,
          tag,
        });
        await this.create(body, target);
      }
    } catch (e: any) {
      logger.error("Failed to replace comment", {
        target,
        tag,
        bodyLength: body.length,
        error: e.message,
        stack: e.stack,
      });
    }
  }

  /**
   * @param mode Can be "create", "replace". Default is "replace".
   */
  async comment(message: string, tag: string, mode: string = "replace"): Promise<void> {
    const finalTag = tag || COMMENT_TAG;

    logger.debug("Preparing to post comment", {
      mode,
      tag: finalTag,
      messageLength: message.length,
      issueNumber: this.issueDetails.issue_number,
    });

    const body = `${COMMENT_GREETING}

${message}

${finalTag}`;

    logger.debug("Comment body prepared", {
      mode,
      tag: finalTag,
      bodyLength: body.length,
      hasGreeting: body.includes(COMMENT_GREETING),
      hasTag: body.includes(finalTag),
    });

    if (mode === "create") {
      logger.info("Creating new comment", {
        tag: finalTag,
        issueNumber: this.issueDetails.issue_number,
      });
      await this.create(body, this.issueDetails.issue_number);
    } else if (mode === "replace") {
      logger.info("Replacing existing comment", {
        tag: finalTag,
        issueNumber: this.issueDetails.issue_number,
      });
      await this.replace(body, finalTag, this.issueDetails.issue_number);
    } else {
      logger.warn("Unknown comment mode, using replace", { 
        mode,
        tag: finalTag,
        issueNumber: this.issueDetails.issue_number,
      });
      await this.replace(body, finalTag, this.issueDetails.issue_number);
    }

    logger.info("Comment operation completed", {
      mode,
      tag: finalTag,
      issueNumber: this.issueDetails.issue_number,
    });
  }

  /**
   * Update the PR description with release notes
   */
  async updateDescription(pullNumber: number, message: string): Promise<void> {
    try {
      const { data: pull } = await this.octokit.pulls.get({
        owner: this.issueDetails.owner,
        repo: this.issueDetails.repo,
        pull_number: pullNumber,
      });

      let body = pull.body || "";
      const tag = "<!-- This is an auto-generated comment: release notes by OSS Think Throo -->";

      // Check if release notes already exist
      const tagIndex = body.indexOf(tag);
      if (tagIndex === -1) {
        // Append release notes
        body = `${body}\n\n---\n\n${message}\n${tag}`;
      } else {
        // Replace existing release notes
        const endTag = "<!-- end of auto-generated comment: release notes by OSS Think Throo -->";
        const endIndex = body.indexOf(endTag);
        if (endIndex !== -1) {
          body = body.substring(0, tagIndex) + `${message}\n${tag}` + body.substring(endIndex + endTag.length);
        } else {
          body = body.substring(0, tagIndex) + `${message}\n${tag}`;
        }
      }

      await this.octokit.pulls.update({
        owner: this.issueDetails.owner,
        repo: this.issueDetails.repo,
        pull_number: pullNumber,
        body,
      });
    } catch (e: any) {
      logger.warn("Failed to update PR description", {
        pullNumber,
        error: e.message,
      });
      throw e;
    }
  }

  /**
   * Builds the base summary comment with all required tags and promotional content
   */
  buildBaseSummaryComment(
    finalResponse: string,
    rawSummary: string,
    shortSummary: string
  ): string {
    logger.debug("Building base summary comment", {
      finalResponseLength: finalResponse.length,
      rawSummaryLength: rawSummary.length,
      shortSummaryLength: shortSummary.length,
    });

    return `${finalResponse}
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
  }

  /**
   * Builds status message including information about skipped and failed files
   */
  buildStatusMessageWithErrors(
    baseStatusMsg: string,
    skippedFiles: string[],
    failedSummaries: string[]
  ): string {
    let finalStatusMsg = baseStatusMsg;
    
    if (skippedFiles.length > 0) {
      logger.debug("Adding skipped files to status message", {
        skippedFilesCount: skippedFiles.length,
      });
      finalStatusMsg += `\n<details>
<summary>Files not processed due to max files limit (${skippedFiles.length})</summary>

* ${skippedFiles.join('\n* ')}

</details>
`;
    }

    if (failedSummaries.length > 0) {
      logger.debug("Adding failed summaries to status message", {
        failedSummariesCount: failedSummaries.length,
      });
      finalStatusMsg += `\n<details>
<summary>Files not summarized due to errors (${failedSummaries.length})</summary>

* ${failedSummaries.join('\n* ')}

</details>
`;
    }

    logger.debug("Status message with errors built", {
      hasSkippedFiles: skippedFiles.length > 0,
      hasFailedSummaries: failedSummaries.length > 0,
      finalLength: finalStatusMsg.length,
    });

    return finalStatusMsg;
  }

  /**
   * Combines status message and summary comment into final comment
   */
  buildFinalSummaryComment(
    finalResponse: string,
    rawSummary: string,
    shortSummary: string,
    baseStatusMsg: string,
    skippedFiles: string[],
    failedSummaries: string[]
  ): string {
    logger.debug("Building final summary comment", {
      hasSkippedFiles: skippedFiles.length > 0,
      hasFailedSummaries: failedSummaries.length > 0,
    });

    const baseSummary = this.buildBaseSummaryComment(
      finalResponse,
      rawSummary,
      shortSummary
    );
    
    const statusMsg = this.buildStatusMessageWithErrors(
      baseStatusMsg,
      skippedFiles,
      failedSummaries
    );
    
    const finalComment = `${statusMsg}\n\n${baseSummary}`;
    
    logger.info("Final summary comment built", {
      totalLength: finalComment.length,
      statusMsgLength: statusMsg.length,
      baseSummaryLength: baseSummary.length,
    });
    
    return finalComment;
  }
}
