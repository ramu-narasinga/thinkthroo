import { NextResponse } from "next/server"
import { sanityClient } from "@/lib/sanity-client"

/**
 * GET /api/dashboard/stats
 *
 * Returns total lesson counts (from Sanity) and first-lesson hrefs for every
 * module across all courses. The dashboard uses this to compute progress
 * percentages against real CMS data.
 */

interface ModuleStat {
  slug: string
  title: string
  lessonCount: number
  /** href of the very first lesson (for Start / Restart navigation) */
  firstLessonHref: string
}

interface CourseStat {
  courseSlug: string
  title: string
  modules: ModuleStat[]
  totalLessons: number
}

const ARCHITECTURE_STATS_QUERY = `
*[_type == "module" && "Codebase Architecture" in categories[]->title]{
  "slug": slug,
  title,
  "lessonCount": count(*[_type == "codebaseArchitecture" && ^._id in chapter[]->module[]._ref]),
  "chapter": *[
    _type == "chapter" && references(^._id) && order == 1
  ][0]{
    "chapterSlug": slug,
    "lesson": *[
      _type == "codebaseArchitecture" && references(^._id) && order == 1
    ][0]{
      "lessonSlug": slug.current
    }
  }
}
`

const PRODUCTION_STATS_QUERY = `
*[_type == "module" && "Production Grade Projects" in categories[]->title]{
  "slug": slug,
  title,
  "lessonCount": count(*[_type == "productionGradeProjects" && ^._id in chapter[]->module[]._ref]),
  "chapter": *[
    _type == "chapter" && references(^._id) && order == 1
  ][0]{
    "chapterSlug": slug,
    "lesson": *[
      _type == "productionGradeProjects" && references(^._id) && order == 1
    ][0]{
      "lessonSlug": slug.current
    }
  }
}
`

function buildHref(coursePrefix: string, moduleSlug: string, chapter: { chapterSlug?: string; lesson?: { lessonSlug?: string } } | null) {
  if (chapter?.chapterSlug && chapter?.lesson?.lessonSlug) {
    return `/${coursePrefix}/${moduleSlug}/${chapter.chapterSlug}/${chapter.lesson.lessonSlug}`
  }
  return `/${coursePrefix}/${moduleSlug}`
}

export async function GET() {
  const [architectureModules, productionModules] = await Promise.all([
    sanityClient.fetch(ARCHITECTURE_STATS_QUERY),
    sanityClient.fetch(PRODUCTION_STATS_QUERY),
  ])

  const courses: CourseStat[] = [
    {
      courseSlug: "architecture",
      title: "Codebase Architecture",
      modules: (architectureModules as any[]).map((m) => ({
        slug: m.slug,
        title: m.title,
        lessonCount: m.lessonCount ?? 0,
        firstLessonHref: buildHref("architecture", m.slug, m.chapter),
      })),
      totalLessons: (architectureModules as any[]).reduce(
        (sum: number, m: any) => sum + (m.lessonCount ?? 0),
        0,
      ),
    },
    {
      courseSlug: "production-grade-projects",
      title: "Production Grade Projects",
      modules: (productionModules as any[]).map((m) => ({
        slug: m.slug,
        title: m.title,
        lessonCount: m.lessonCount ?? 0,
        firstLessonHref: buildHref("production-grade-projects", m.slug, m.chapter),
      })),
      totalLessons: (productionModules as any[]).reduce(
        (sum: number, m: any) => sum + (m.lessonCount ?? 0),
        0,
      ),
    },
  ]

  return NextResponse.json(courses)
}
