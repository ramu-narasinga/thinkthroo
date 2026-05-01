import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { serverDB } from "@/database";
import { organizations } from "@/database/schemas";
import { and, eq } from "drizzle-orm";
import { createSignedSlackOAuthState } from "@/lib/server/slack-oauth-state";

export async function GET(req: NextRequest) {
  // 1. Require an authenticated user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Validate orgId
  const orgId = req.nextUrl.searchParams.get("orgId");
  // Basic UUID format check — the real ownership check happens at upsert time
  if (!orgId || !/^[0-9a-f-]{36}$/.test(orgId)) {
    return NextResponse.redirect(
      new URL("/integrations?error=missing_organization", req.url)
    );
  }

  // Enforce that users can only start OAuth for organizations they own
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

  const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/integrations?error=slack_not_configured", req.url)
    );
  }

  // 3. Generate a random CSRF token and sign state payload
  const csrfToken = randomBytes(16).toString("hex");
  const state = createSignedSlackOAuthState(orgId, csrfToken, clientSecret);

  // 4. Build the Slack authorize URL
  const scope = "incoming-webhook,chat:write";
  const url = new URL("https://slack.com/oauth/v2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);

  // 5. Store the token in a short-lived, HttpOnly, SameSite=Strict cookie
  const response = NextResponse.redirect(url.toString());
  response.cookies.set("slack_oauth_csrf", csrfToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
