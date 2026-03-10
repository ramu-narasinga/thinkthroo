import { NextRequest, NextResponse } from "next/server"
import { fetchSkillItemBySlug } from "@/lib/skill"

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 })
  }

  const skill = await fetchSkillItemBySlug(slug)
  if (!skill) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(skill)
}
