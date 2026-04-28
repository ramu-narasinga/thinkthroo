import type { Context } from "probot";
import { getSummaryComment } from "../commandHelpers";

/**
 * @thinkthroo pause
 * Stamps the manual-pause tag on the summary comment so subsequent push
 * events are silently skipped by the orchestrator.
 */
export async function handlePause(
  context: Context<"issue_comment.created">,
  pullNumber: number,
  owner: string,
  repo: string,
  prLogger: any
): Promise<void> {
  try {
    const { commentManager, existingCommentData } =
      await getSummaryComment(context, pullNumber, owner, repo);

    if (existingCommentData.comment && existingCommentData.commentBody) {
      if (commentManager.isPaused(existingCommentData.commentBody)) {
        await context.octokit.issues.createComment({
          owner,
          repo,
          issue_number: pullNumber,
          body: "Reviews are already paused on this PR. Comment `@thinkthroo resume` to resume.",
        });
        return;
      }
      const updatedBody = commentManager.setPaused(existingCommentData.commentBody);
      await context.octokit.issues.updateComment({
        owner,
        repo,
        comment_id: existingCommentData.comment.id,
        body: updatedBody,
      });
    }

    await context.octokit.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body: "Reviews have been **paused** on this PR. Comment `@thinkthroo resume` to resume.",
    });
    prLogger.info("PR reviews paused", { pullNumber });
  } catch (err: any) {
    prLogger.error("Failed to pause reviews", { pullNumber, error: err.message });
  }
}
