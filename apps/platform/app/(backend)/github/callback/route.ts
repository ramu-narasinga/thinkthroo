import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const installationId = searchParams.get("installation_id");

  if (!installationId) {
    return NextResponse.json({ error: "Missing installation_id" }, { status: 400 });
  }

  // You can now:
  // 1. Use this installationId to request a GitHub installation access token
  // 2. Store it in your DB linked to the Supabase user session

  // For now, just redirect to dashboard with the ID
  return redirect(`/repositories?installation_id=${installationId}`);
}