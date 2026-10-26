import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { SlackNotifier } from "@/lib/slack";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      submission_id,
      page_slug,
      name,
      work_email,
      project_type,
      budget_range,
      description,
      company, // honeypot - real users never see or fill this
      gclid,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
    } = body as Record<string, string | undefined>;

    if (!submission_id || !page_slug || !name || !work_email || !project_type || !budget_range || !description) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!EMAIL_RE.test(work_email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Honeypot tripped: pretend success so the bot doesn't learn it was caught,
    // but never store the lead, notify Slack, or let the client fire a conversion.
    if (company) {
      return NextResponse.json({ success: true, spam: true }, { status: 201 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("consulting_leads").insert({
      submission_id,
      page_slug,
      name: name.trim(),
      work_email: work_email.trim(),
      project_type,
      budget_range,
      description: description.trim(),
      gclid: gclid || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      utm_term: utm_term || null,
      utm_content: utm_content || null,
    });

    if (error) {
      if (error.code === "23505") {
        // Duplicate submission_id (e.g. retried request) - already stored, treat as success.
        return NextResponse.json({ success: true }, { status: 201 });
      }

      console.error("[consulting-lead] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save your request. Please try again." },
        { status: 500 }
      );
    }

    await SlackNotifier.consultingLeadReceived({
      name: name.trim(),
      workEmail: work_email.trim(),
      pageSlug: page_slug,
      projectType: project_type,
      budgetRange: budget_range,
      description: description.trim(),
      gclid,
      utmSource: utm_source,
      utmCampaign: utm_campaign,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[consulting-lead] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
