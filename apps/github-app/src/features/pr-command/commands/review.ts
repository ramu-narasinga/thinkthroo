import type { Context } from "probot";
import { resetEpochBase, runOrchestrator } from "../commandHelpers";

/**
 * @thinkthroo review
 * Resets the epoch base counter then runs an incremental review immediately.
 * Useful when automatic reviews are disabled or the cycle threshold was reached.
 */
export async function handleReview(
  context: Context<"issue_comment.created">,
  pullNumber: number,
  owner: string,
  repo: string,
  prLogger: any
): Promise<void> {
  await resetEpochBase(context, pullNumber, owner, repo, prLogger);
  await runOrchestrator(context, pullNumber, owner, repo, prLogger, {
    generateSummaries: true,
    useSummaryFiltering: true,
    forceReview: true,
  });
}
