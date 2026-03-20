import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/integrations/slack?error=${error ?? "missing_code"}`, req.url)
    );
  }

  const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!;
  const clientSecret = process.env.SLACK_CLIENT_SECRET!;
  const redirectUri = `${new URL(req.url).origin}/api/integrations/slack/callback`;

  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    console.error("[Slack OAuth] Error:", data.error);
    return NextResponse.redirect(
      new URL(`/integrations/slack?error=${data.error}`, req.url)
    );
  }

  // TODO: save data.access_token and data.incoming_webhook to your database

  return NextResponse.redirect(
    new URL("/integrations/slack?connected=true", req.url)
  );
}
