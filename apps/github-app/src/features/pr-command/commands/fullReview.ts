import type { Context } from "probot";
import { resetEpochBase, runOrchestrator } from "../commandHelpers";

/**
 * @thinkthroo full review
 * Resets the epoch base counter then reviews all files from the PR base SHA,
 * ignoring any previously reviewed commit checkpoints.
 */
export async function handleFullReview(
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
    fullReview: true,
  });
}
