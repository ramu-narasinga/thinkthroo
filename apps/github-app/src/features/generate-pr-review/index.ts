import type { Context } from "probot";
import { PullRequestReviewGenerator } from "./PullRequestReviewGenerator";

/**
 * Entry point for PR review generation feature
 */
export async function generatePullRequestReview(
  context: Context<"pull_request.opened" | "pull_request.synchronize" | "pull_request.reopened">
): Promise<void> {
  const generator = new PullRequestReviewGenerator(context, {
    disableReview: false,
    reviewCommentLGTM: false,
    maxConcurrency: 5,
    maxFiles: 50,
    maxRequestTokens: 10000,
    debug: false,
  });

  await generator.generate();
}
