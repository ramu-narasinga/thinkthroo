// https://github.com/aayushchugh/repo-command/blob/main/src/index.ts
import { ProbotOctokit } from "probot";
import { issueGreetingBodyText } from "@/services/constants";
import { IssueDetails } from "@/types/issue";
import { logger } from "@/lib/logger";

export async function issueGreeting(
  octokit: InstanceType<typeof ProbotOctokit>,
  issueDetails: IssueDetails
) {
  logger.debug("Posting issue greeting comment", {
    owner: issueDetails.owner,
    repo: issueDetails.repo,
    issueNumber: issueDetails.issue_number,
  });

  const result = await octokit.issues.createComment({
    ...issueDetails,
    body: issueGreetingBodyText,
  });

  logger.info("Issue greeting posted successfully", {
    issueNumber: issueDetails.issue_number,
    commentId: result.data.id,
  });

  return result;
}