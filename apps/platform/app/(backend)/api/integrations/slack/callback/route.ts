import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { serverDB } from "@/database";
import { SlackIntegrationModel } from "@/database/models/slackIntegration";
import { organizations } from "@/database/schemas";
import { and, eq } from "drizzle-orm";
import { parseAndVerifySlackOAuthState } from "@/lib/server/slack-oauth-state";
import { SlackNotifier } from "@/lib/slack";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/integrations?error=${error ?? "missing_code"}`, req.url)
    );
  }

  // Authenticate the user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.redirect(
      new URL("/integrations?error=unauthorized", req.url)
    );
  }

  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  if (!clientSecret) {
    return NextResponse.redirect(
      new URL("/integrations?error=slack_not_configured", req.url)
    );
  }

  // Verify signed state payload first (tamper + TTL protection), then CSRF token.
  const parsedState = parseAndVerifySlackOAuthState(state, clientSecret);
  const storedCsrf = req.cookies.get("slack_oauth_csrf")?.value;
  const orgId = parsedState.valid ? parsedState.orgId : null;
  const incomingCsrf = parsedState.valid ? parsedState.csrfToken : null;

  const csrfValid =
    storedCsrf &&
    incomingCsrf &&
    storedCsrf.length === incomingCsrf.length &&
    timingSafeEqual(Buffer.from(storedCsrf), Buffer.from(incomingCsrf));

  if (!csrfValid || !orgId) {
    await SlackNotifier.securityAlert(':rotating_light: Slack OAuth invalid state validation.', {
      hasState: String(Boolean(state)),
      hasStoredCsrf: String(Boolean(storedCsrf)),
      userId: user.id,
    });
    return NextResponse.redirect(
      new URL("/integrations?error=invalid_state", req.url)
    );
  }

  // Ensure the current user owns the target organization from OAuth state
  const [ownedOrg] = await serverDB
    .select({ id: organizations.id })
    .from(organizations)
    .where(
      and(
        eq(organizations.id, orgId),
        eq(organizations.userId, user.id),
      ),
    )
    .limit(1);

  if (!ownedOrg) {
    return NextResponse.redirect(
      new URL("/integrations?error=unauthorized_organization", req.url)
    );
  }

  const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!;

  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    console.error("[Slack OAuth] Error:", data.error);
    return NextResponse.redirect(
      new URL(`/integrations?error=${data.error}`, req.url)
    );
  }

  // Persist the Slack integration
  const slackModel = new SlackIntegrationModel(serverDB, user.id);

  const channelId = data.incoming_webhook?.channel_id ?? "";

  await slackModel.upsert({
    organizationId: orgId,
    teamId: data.team?.id ?? "",
    teamName: data.team?.name ?? "",
    accessToken: data.access_token,
    channelId,
    channelName: data.incoming_webhook?.channel ?? "",
    webhookUrl: data.incoming_webhook?.url ?? "",
    botUserId: data.bot_user_id ?? "",
  });

  // Send a welcome message to verify the integration works
  const webhookUrl = data.incoming_webhook?.url;
  if (webhookUrl) {
    try {
      const dashboardUrl = new URL("/integrations", req.url).toString();
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Think Throo is now connected! You'll receive PR review summaries and architecture violation reports in this channel.",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: ":white_check_mark: *Think Throo connected successfully!*\n\nYou'll receive notifications in this channel for:\n\u2022 PR review summaries\n\u2022 Architecture violation reports\n\nManage notification settings in your <" + dashboardUrl + "|Think Throo dashboard>.",
              },
            },
          ],
        }),
      });
    } catch (e) {
      console.error("[Slack] Failed to send welcome message:", e);
    }
  }

  // Clear the CSRF cookie
  const redirectResponse = NextResponse.redirect(
    new URL("/integrations?connected=true", req.url)
  );
  redirectResponse.cookies.set("slack_oauth_csrf", "", { maxAge: 0, path: "/" });
  return redirectResponse;
}
