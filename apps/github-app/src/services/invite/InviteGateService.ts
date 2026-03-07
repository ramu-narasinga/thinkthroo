import { SupabaseService } from "@/services/database/SupabaseService";
import { logger } from "@/utils/logger";

/**
 * Service to check whether a GitHub user/org is on the invite list.
 * When INVITE_ONLY_MODE env var is "true", all AI features (PR review,
 * PR summary, etc.) are gated behind this check.
 */
export class InviteGateService {
  /**
   * Returns true if invite-only mode is disabled OR the user is on the invite list.
   * Returns false if the user is NOT invited.
   */
  static async isAllowed(githubLogin: string): Promise<boolean> {
    const inviteOnly = process.env.INVITE_ONLY_MODE === "true";

    if (!inviteOnly) {
      logger.debug("Invite-only mode is disabled, allowing all users");
      return true;
    }

    try {
      const supabase = SupabaseService.getInstance().getClient();

      const { data, error } = await supabase
        .from("invited_users")
        .select("id, is_active")
        .eq("github_login", githubLogin)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        logger.error("Failed to check invite status", {
          githubLogin,
          error: error.message,
        });
        // Fail closed: deny access if we can't verify
        return false;
      }

      const isInvited = !!data;

      logger.info("Invite gate check", {
        githubLogin,
        isInvited,
      });

      return isInvited;
    } catch (err: any) {
      logger.error("Invite gate service error", {
        githubLogin,
        error: err.message,
      });
      // Fail closed
      return false;
    }
  }

  /**
   * Build a PR comment body explaining that the user is not invited.
   */
  static buildNotInvitedComment(githubLogin: string): string {
    return [
      `<!-- This is an auto-generated comment by OSS ThinkThroo -->`,
      `### 🔒 Invite-Only Access`,
      ``,
      `Hi @${githubLogin}, the **Think Throo AI code review** features are currently **invite-only**.`,
      ``,
      `Your account (\`${githubLogin}\`) is not on the invite list, so AI-powered reviews ` +
        `(PR summaries, architecture checks, etc.) have been skipped for this pull request.`,
      ``,
      `**Want access?** [Request access here](https://thinkthroo.com/request-access).`,
      ``,
      `---`,
      `*This check is temporary while we control usage during the early access phase.*`,
    ].join("\n");
  }
}
