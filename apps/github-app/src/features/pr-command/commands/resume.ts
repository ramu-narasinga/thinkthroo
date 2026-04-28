import type { Context } from "probot";
import { getSummaryComment, runOrchestrator } from "../commandHelpers";

/**
 * @thinkthroo resume
 * Clears the manual-pause tag, resets the epoch base, then runs an
 * incremental review immediately.
 */
export async function handleResume(
  context: Context<"issue_comment.created">,
  pullNumber: number,
  owner: string,
  repo: string,
  prLogger: any
): Promise<void> {
  try {
    const { commitAnalyzer, commentManager, existingCommentData } =
      await getSummaryComment(context, pullNumber, owner, repo);

    if (existingCommentData.comment && existingCommentData.commentBody) {
      const currentReviewedCount =
        commitAnalyzer.getReviewedCommitIds(existingCommentData.commentBody).length;
      let updatedBody = commentManager.clearPaused(existingCommentData.commentBody);
      updatedBody = updatedBody.replace(/\n?<!-- review_paused_notice_posted -->/g, "");
      updatedBody = commentManager.upsertEpochBase(updatedBody, currentReviewedCount);
      await context.octokit.issues.updateComment({
        owner,
        repo,
        comment_id: existingCommentData.comment.id,
        body: updatedBody,
      });
      prLogger.info("Pause cleared, epoch base reset", { pullNumber, newEpochBase: currentReviewedCount });
    }
  } catch (err: any) {
    prLogger.warn("Failed to clear pause state, proceeding anyway", { pullNumber, error: err.message });
  }

  await runOrchestrator(context, pullNumber, owner, repo, prLogger, {
    generateSummaries: true,
    useSummaryFiltering: true,
    forceReview: true,
  });
}
