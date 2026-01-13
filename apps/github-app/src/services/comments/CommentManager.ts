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
import { logger } from "@/lib/logger";

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
      return issueCommentsCache[issueNumber];
    }

    const allComments: any[] = [];
    let page = 1;
    try {
      for (;;) {
        const { data: comments } = await this.octokit.issues.listComments({
          owner: this.issueDetails.owner,
          repo: this.issueDetails.repo,
          issue_number: issueNumber,
          page,
          per_page: 100,
        });
        allComments.push(...comments);
        page++;
        if (!comments || comments.length < 100) {
          break;
        }
      }

      issueCommentsCache[issueNumber] = allComments;
      return allComments;
    } catch (e: any) {
      logger.warn("Failed to list comments", {
        issueNumber,
        error: e.message,
      });
      return allComments;
    }
  }

  private async findCommentWithTag(
    tag: string,
    comments: any[]
  ): Promise<any | null> {
    try {
      for (const cmt of comments) {
        if (cmt.body && cmt.body.includes(tag)) {
          return cmt;
        }
      }
      return null;
    } catch (e: unknown) {
      logger.warn("Failed to find comment with tag", { tag, error: String(e) });
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
      return content.slice(start + startTag.length, end);
    }
    return "";
  }

  private getRawSummary(summary: string): string {
    return this.getContentWithinTags(
      summary,
      RAW_SUMMARY_START_TAG,
      RAW_SUMMARY_END_TAG
    );
  }

  private getShortSummary(summary: string): string {
    return this.getContentWithinTags(
      summary,
      SHORT_SUMMARY_START_TAG,
      SHORT_SUMMARY_END_TAG
    );
  }

  async getExistingCommentData(
    pullNumber: number,
    tag: string,
    getReviewedCommitIdsBlock: (commentBody: string) => string
  ): Promise<ExistingCommentData> {
    const comments = await this.listComments(pullNumber);

    const existingComment = await this.findCommentWithTag(tag, comments);

    if (!existingComment) {
      return {
        comment: null,
        commitIdsBlock: "",
        commentBody: "",
        rawSummary: "",
        shortSummary: "",
      };
    }

    const commentBody = existingComment.body;

    return {
      comment: existingComment,
      commitIdsBlock: getReviewedCommitIdsBlock(commentBody),
      commentBody,
      rawSummary: this.getRawSummary(commentBody),
      shortSummary: this.getShortSummary(commentBody),
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
    return `<details>
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
  }

  addInProgressStatus(commentBody: string, statusMsg: string): string {
    const start = commentBody.indexOf(IN_PROGRESS_START_TAG);
    const end = commentBody.indexOf(IN_PROGRESS_END_TAG);
    // add to the beginning of the comment body if the marker doesn't exist
    // otherwise do nothing
    if (start === -1 || end === -1) {
      return `${IN_PROGRESS_START_TAG}

Currently reviewing new changes in this PR...

${statusMsg}

${IN_PROGRESS_END_TAG}

---

${commentBody}`;
    }
    return commentBody;
  }

  private async create(body: string, target: number): Promise<void> {
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
    } catch (e: any) {
      logger.warn("Failed to create comment", {
        target,
        error: e.message,
      });
    }
  }

  private async replace(body: string, tag: string, target: number): Promise<void> {
    try {
      const comments = await this.listComments(target);
      const cmt = await this.findCommentWithTag(tag, comments);
      if (cmt) {
        await this.octokit.issues.updateComment({
          owner: this.issueDetails.owner,
          repo: this.issueDetails.repo,
          comment_id: cmt.id,
          body,
        });
      } else {
        await this.create(body, target);
      }
    } catch (e: any) {
      logger.warn("Failed to replace comment", {
        target,
        tag,
        error: e.message,
      });
    }
  }

  /**
   * @param mode Can be "create", "replace". Default is "replace".
   */
  async comment(message: string, tag: string, mode: string = "replace"): Promise<void> {
    const finalTag = tag || COMMENT_TAG;

    const body = `${COMMENT_GREETING}

${message}

${finalTag}`;

    if (mode === "create") {
      await this.create(body, this.issueDetails.issue_number);
    } else if (mode === "replace") {
      await this.replace(body, finalTag, this.issueDetails.issue_number);
    } else {
      logger.warn("Unknown comment mode, using replace", { mode });
      await this.replace(body, finalTag, this.issueDetails.issue_number);
    }
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
}
