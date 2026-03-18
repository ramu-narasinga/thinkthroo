import { NextRequest, NextResponse } from "next/server"
import { fetchPGPLessonBySlug } from "@/lib/lesson"

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 })
  }

  const lesson = await fetchPGPLessonBySlug(slug)
  if (!lesson) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(lesson)
}
