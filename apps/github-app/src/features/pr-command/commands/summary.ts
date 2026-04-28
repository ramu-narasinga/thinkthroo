import type { Context } from "probot";
import { runOrchestrator } from "../commandHelpers";

/**
 * @thinkthroo summary
 * Regenerates the PR summary without running a code review.
 */
export async function handleSummary(
  context: Context<"issue_comment.created">,
  pullNumber: number,
  owner: string,
  repo: string,
  prLogger: any
): Promise<void> {
  await runOrchestrator(context, pullNumber, owner, repo, prLogger, {
    generateSummaries: true,
    useSummaryFiltering: false,
    forceReview: true,
    summaryOnly: true,
  });
}
