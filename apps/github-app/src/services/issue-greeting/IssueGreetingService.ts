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
    // Get the username of the issue creator
    const username = this.context.payload.issue.user.login;

    logger.debug("Posting issue greeting comment", {
      owner: issueDetails.owner,
      repo: issueDetails.repo,
      issueNumber: issueDetails.issue_number,
    });

    try {
      // Replace @{user} with the actual username
      const personalizedBody = issueGreetingBodyText.replace("@{user}", `@${username}`);
      const result = await this.context.octokit.issues.createComment({
        ...issueDetails,
        body: personalizedBody,
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
