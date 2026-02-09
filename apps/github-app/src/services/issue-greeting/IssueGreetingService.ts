import type { Context } from "probot";
import { issueGreetingBodyText } from "@/services/constants";
import { logger } from "@/utils/logger";

/**
 * IssueGreetingService - Posts a greeting comment on newly opened issues
 */
export class IssueGreetingService {
  constructor(private readonly context: Context<"issues.opened">) {}

  /**
   * Post greeting comment on the issue
   */
  async greet(): Promise<void> {
    const issueDetails = this.context.issue();

    logger.debug("Posting issue greeting comment", {
      owner: issueDetails.owner,
      repo: issueDetails.repo,
      issueNumber: issueDetails.issue_number,
    });

    try {
      const result = await this.context.octokit.issues.createComment({
        ...issueDetails,
        body: issueGreetingBodyText,
      });

      logger.info("Issue greeting posted successfully", {
        issueNumber: issueDetails.issue_number,
        commentId: result.data.id,
      });
    } catch (error: any) {
      logger.error("Failed to post issue greeting", {
        issueNumber: issueDetails.issue_number,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
