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

    // Supabase egress quota is used up until it resets (Mon 2026-11-02), so for now leads
    // skip the DB and Slack is the only record. Set CONSULTING_LEADS_SAVE_TO_DB=true to
    // resume writing to consulting_leads (Slack keeps posting either way).
    const saveToDb = process.env.CONSULTING_LEADS_SAVE_TO_DB === "true";

    if (saveToDb) {
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
    }

    const notified = await SlackNotifier.consultingLeadReceived({
      name: name.trim(),
      workEmail: work_email.trim(),
      pageSlug: page_slug,
      projectType: project_type,
      budgetRange: budget_range,
      description: description.trim(),
      gclid,
      utmSource: utm_source,
      utmMedium: utm_medium,
      utmCampaign: utm_campaign,
      utmTerm: utm_term,
      utmContent: utm_content,
      submissionId: submission_id,
    });

    // With DB writes off, Slack holds the only copy of the lead - fail loudly rather than
    // telling the visitor it worked when nobody was notified.
    if (!saveToDb && !notified) {
      console.error("[consulting-lead] Lead was neither saved nor sent to Slack:", { submission_id });
      return NextResponse.json(
        { error: "Failed to send your request. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[consulting-lead] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
