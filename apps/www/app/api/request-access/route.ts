import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { SlackNotifier } from "@/lib/slack";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { github_login, email, note } = body as {
      github_login: string;
      email: string;
      note?: string;
    };

    if (!github_login || !email) {
      return NextResponse.json(
        { error: "github_login and email are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("invited_users").insert({
      github_login: github_login.trim(),
      email: email.trim(),
      note: note?.trim() ?? null,
      is_active: false,
    });

    if (error) {
      // Unique constraint violation — already requested
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A request with this GitHub username or email already exists." },
          { status: 409 }
        );
      }

      console.error("[request-access] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save your request. Please try again." },
        { status: 500 }
      );
    }

    // Fire Slack notification (non-blocking, errors are swallowed internally)
    await SlackNotifier.accessRequested(github_login.trim(), email.trim(), note?.trim());

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[request-access] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
