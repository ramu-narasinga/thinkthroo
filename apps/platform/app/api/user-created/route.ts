import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/emails/send-welcome";

export async function POST(req: NextRequest) {
  try {
    const { record } = await req.json();
    console.log("[USER_CREATED]", req.json())
    const email = record?.email;
    const fullName = record?.user_metadata?.full_name || "there";

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    await sendWelcomeEmail({
      user: {
        name: fullName,
        email,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}