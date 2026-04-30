import type { Context } from "probot";
import type { PRWorkflowOptions } from "@/features/pr-workflow/PRWorkflowOrchestrator";
import { PRWorkflowOrchestrator } from "@/features/pr-workflow/PRWorkflowOrchestrator";
import { CommitAnalyzer } from "@/services/commits/CommitAnalyzer";
import { CommentManager } from "@/services/comments/CommentManager";
import { SUMMARIZE_TAG } from "@/services/constants";

/**
 * Fetches the existing PR summary comment and returns the parsed data
 * together with helper instances.
 */
export async function getSummaryComment(
  context: Context<"issue_comment.created">,
  pullNumber: number,
  owner: string,
  repo: string
) {
  const octokit = context.octokit;
  const issueDetails = { owner, repo, issue_number: pullNumber } as any;
  const commitAnalyzer = new CommitAnalyzer(octokit, issueDetails);
  const commentManager = new CommentManager(octokit, issueDetails);
  const existingCommentData = await commentManager.getExistingCommentData(
    pullNumber,
    SUMMARIZE_TAG,
    commitAnalyzer.getReviewedCommitIdsBlock.bind(commitAnalyzer)
  );
  return { commitAnalyzer, commentManager, existingCommentData };
}

/**
 * Builds a thin context adapter that lets PRWorkflowOrchestrator run from
 * an issue_comment.created event by injecting the full PR payload.
 */
export async function buildOrchestratorContext(
  context: Context<"issue_comment.created">,
  pullNumber: number,
  owner: string,
  repo: string
): Promise<any> {
  try {
    const { data: prData } = await context.octokit.pulls.get({ owner, repo, pull_number: pullNumber });
    return {
      ...context,
      payload: {
        ...context.payload,
        action: "synchronize",
        pull_request: prData,
        repository: context.payload.repository,
        installation: (context.payload as any).installation,
      },
      issue: () => ({ owner, repo, issue_number: pullNumber }),
    };
  } catch (err: any) {
    throw new Error(`Failed to fetch pull request details: ${err.message}`);
  }
}

/**
 * Resets the epoch base on the summary comment to the current reviewed-commit
 * count so the auto-pause counter restarts from zero.
 */
export async function resetEpochBase(
  context: Context<"issue_comment.created">,
  pullNumber: number,
  owner: string,
  repo: string,
  prLogger: any
): Promise<void> {
  try {
    const { commitAnalyzer, commentManager, existingCommentData } =
      await getSummaryComment(context, pullNumber, owner, repo);
    if (!existingCommentData.comment || !existingCommentData.commentBody) return;

    const currentReviewedCount =
      commitAnalyzer.getReviewedCommitIds(existingCommentData.commentBody).length;
    let updatedBody = existingCommentData.commentBody
      .replace(/\n?<!-- review_paused_notice_posted -->/g, "");
    updatedBody = commentManager.upsertEpochBase(updatedBody, currentReviewedCount);

    await context.octokit.issues.updateComment({
      owner,
      repo,
      comment_id: existingCommentData.comment.id,
      body: updatedBody,
    });
    prLogger.info("Epoch base reset", { pullNumber, newEpochBase: currentReviewedCount });
  } catch (err: any) {
    prLogger.warn("Failed to reset epoch base, proceeding anyway", { pullNumber, error: err.message });
  }
}

/**
 * Builds the orchestrator context and runs the PR workflow with the given options.
 */
export async function runOrchestrator(
  context: Context<"issue_comment.created">,
  pullNumber: number,
  owner: string,
  repo: string,
  prLogger: any,
  options: PRWorkflowOptions
): Promise<void> {
  try {
    const adaptedContext = await buildOrchestratorContext(context, pullNumber, owner, repo);
    const orchestrator = new PRWorkflowOrchestrator(adaptedContext);
    await orchestrator.execute({
      ...options,
      reviewOptions: {
        maxFiles: 50,
        maxConcurrency: 5,
        debug: false,
        ...options.reviewOptions,
      },
    });
    prLogger.info("PR workflow completed via command", { pullNumber });
  } catch (err: any) {
    prLogger.error("PR workflow failed via command", {
      pullNumber,
      error: err.message,
      stack: err.stack,
    });

    try {
      await context.octokit.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body: "ThinkThroo could not run this command due to an internal error. Please retry in a moment.",
      });
    } catch (commentErr: any) {
      prLogger.warn("Failed to post command failure comment", {
        pullNumber,
        error: commentErr.message,
      });
    }
  }
}
