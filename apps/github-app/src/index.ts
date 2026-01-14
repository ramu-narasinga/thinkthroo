import "./lib/sentry";

import { Probot } from "probot";
import { issueGreeting } from "./features/issue-greeting";
import { generatePullRequestSummary } from "./features/generate-pr-summary";
import { generatePullRequestReview } from "./features/generate-pr-review";
import { logger } from "@/lib/logger";

export default (app: Probot) => {
  logger.info("GitHub App initialized", { appName: "think-throo" });

  app.on("issues.opened", async (context) => {
    const issueDetails = context.issue();
    logger.info("Issue opened event received", {
      owner: issueDetails.owner,
      repo: issueDetails.repo,
      issueNumber: issueDetails.issue_number,
    });

    try {
      await issueGreeting(context.octokit, issueDetails);
      logger.info("Issue greeting completed", { issueNumber: issueDetails.issue_number });
    } catch (error: any) {
      logger.error("Failed to post issue greeting", {
        issueNumber: issueDetails.issue_number,
        error: error.message,
      });
      throw error;
    }
  });

  app.on("pull_request.opened", async (context) => {
    const pullRequest = context.payload.pull_request;
    logger.info("Pull request opened event received", {
      owner: context.repo().owner,
      repo: context.repo().repo,
      prNumber: pullRequest.number,
      prTitle: pullRequest.title,
      author: pullRequest.user?.login,
      baseBranch: pullRequest.base.ref,
      headBranch: pullRequest.head.ref,
    });

    try {
      await generatePullRequestSummary(context);
      logger.info("PR summary generation completed", { prNumber: pullRequest.number });
    } catch (error: any) {
      logger.error("Failed to generate PR summary", {
        prNumber: pullRequest.number,
        error: error.message,
      });
    }

    try {
      await generatePullRequestReview(context);
      logger.info("PR review generation completed", { prNumber: pullRequest.number });
    } catch (error: any) {
      logger.error("Failed to generate PR review", {
        prNumber: pullRequest.number,
        error: error.message,
      });
    }
  });
};
