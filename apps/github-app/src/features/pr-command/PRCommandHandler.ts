import type { Context } from "probot";
import { logger } from "@/utils/logger";
import { BOT_NAME, parseCommand } from "./parseCommand";
import { handlePause } from "./commands/pause";
import { handleResume } from "./commands/resume";
import { handleReview } from "./commands/review";
import { handleFullReview } from "./commands/fullReview";
import { handleSummary } from "./commands/summary";
import { handleHelp } from "./commands/help";

/**
 * Thin dispatcher — parses the @thinkthroo command from the comment body
 * and delegates to the appropriate single-responsibility handler.
 */
export class PRCommandHandler {
  constructor(
    private readonly context: Context<"issue_comment.created">
  ) {}

  async handle(): Promise<void> {
    const { payload } = this.context;

    // Only act on PR comments (not plain issues)
    if (!payload.issue.pull_request) return;

    const command = parseCommand(payload.comment.body ?? "");
    if (!command) return;

    const pullNumber = payload.issue.number;
    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;
    const installationId = String((payload as any).installation?.id ?? "");

    const prLogger = logger.child({
      prNumber: pullNumber,
      repo: `${owner}/${repo}`,
      owner,
      installationId,
      command,
    });

    prLogger.info(`${BOT_NAME} ${command} command received`, { pullNumber });

    switch (command) {
      case "pause":       return handlePause(this.context, pullNumber, owner, repo, prLogger);
      case "resume":      return handleResume(this.context, pullNumber, owner, repo, prLogger);
      case "review":      return handleReview(this.context, pullNumber, owner, repo, prLogger);
      case "full-review": return handleFullReview(this.context, pullNumber, owner, repo, prLogger);
      case "summary":     return handleSummary(this.context, pullNumber, owner, repo, prLogger);
      case "help":        return handleHelp(this.context, pullNumber, owner, repo, prLogger);
    }
  }
}
