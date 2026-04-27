import type { Context } from "probot";

const HELP_COMMENT = `**ThinkThroo \u2014 Available commands**

| Command | Description |
|---|---|
| \`@thinkthroo pause\` | Pause automatic reviews on this PR |
| \`@thinkthroo resume\` | Resume paused reviews and run an incremental review |
| \`@thinkthroo review\` | Trigger an incremental review immediately |
| \`@thinkthroo full review\` | Trigger a full review of all files from scratch |
| \`@thinkthroo summary\` | Regenerate the PR summary |
| \`@thinkthroo help\` | Show this help message |`;

/**
 * @thinkthroo help
 * Posts the available-commands reference table as a PR comment.
 */
export async function handleHelp(
  context: Context<"issue_comment.created">,
  pullNumber: number,
  owner: string,
  repo: string,
  prLogger: any
): Promise<void> {
  try {
    await context.octokit.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body: HELP_COMMENT,
    });
    prLogger.info("Help comment posted", { pullNumber });
  } catch (err: any) {
    prLogger.error("Failed to post help comment", { pullNumber, error: err.message });
  }
}
