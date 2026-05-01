import type { Context } from "probot";
import { logger } from "@/utils/logger";
import { BOT_NAME, parseCommand } from "./parseCommand";
import { handlePause } from "./commands/pause";
import { handleResume } from "./commands/resume";
import { handleReview } from "./commands/review";
import { handleFullReview } from "./commands/fullReview";
import { handleSummary } from "./commands/summary";
import { handleHelp } from "./commands/help";
import { CommandThrottleService } from "@/services/commands/CommandThrottleService";

const ALLOWED_AUTHOR_ASSOCIATIONS = new Set([
  "OWNER",
  "MEMBER",
  "COLLABORATOR",
]);

const THROTTLED_COMMANDS = new Set(["review", "full-review", "summary"]);

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

    const authorAssociation = payload.comment.author_association;
    if (!ALLOWED_AUTHOR_ASSOCIATIONS.has(authorAssociation)) {
      logger.warn("Skipping PR command from unauthorized commenter", {
        command,
        author: payload.comment.user?.login,
        authorAssociation,
        prNumber: payload.issue.number,
        repo: `${payload.repository.owner.login}/${payload.repository.name}`,
      });

      try {
        await this.context.octokit.issues.createComment({
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          issue_number: payload.issue.number,
          body: `Only repository collaborators can run ${BOT_NAME} commands.`,
        });
      } catch (err: any) {
        logger.warn("Failed to post unauthorized command warning", {
          command,
          author: payload.comment.user?.login,
          error: err.message,
        });
      }
      return;
    }

    const pullNumber = payload.issue.number;
    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;
    const repoFullName = `${owner}/${repo}`;
    const installationId = String((payload as any).installation?.id ?? "");
    const commenter = payload.comment.user?.login ?? 'unknown';

    if (installationId && THROTTLED_COMMANDS.has(command)) {
      try {
        const throttleService = new CommandThrottleService();
        const throttle = await throttleService.check(
          installationId,
          repoFullName,
          commenter,
          command,
        );

        if (!throttle.allowed) {
          const retryText = throttle.retryAfterSeconds
            ? `Please try again in about **${Math.ceil(throttle.retryAfterSeconds / 60)} minute(s)**.`
            : 'Please try again shortly.';

          await this.context.octokit.issues.createComment({
            owner,
            repo,
            issue_number: pullNumber,
            body: `Command ignored: ${BOT_NAME} ${command} is on cooldown for this repository and user. ${retryText}`,
          });

          logger.warn('PR command throttled', {
            command,
            prNumber: pullNumber,
            repo: repoFullName,
            commenter,
            retryAfterSeconds: throttle.retryAfterSeconds,
          });
          return;
        }
      } catch (err: any) {
        logger.warn('Command throttle check failed, proceeding', {
          command,
          prNumber: pullNumber,
          repo: repoFullName,
          commenter,
          error: err.message,
        });
      }
    }

    const prLogger = logger.child({
      prNumber: pullNumber,
      repo: repoFullName,
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
