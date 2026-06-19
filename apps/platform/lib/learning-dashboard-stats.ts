import { sanityClient } from "@/lib/sanity-client";

export interface ModuleStat {
  slug: string;
  title: string;
  lessonCount: number;
  firstLessonHref: string;
}

export interface CourseStat {
  courseSlug: string;
  title: string;
  modules: ModuleStat[];
  totalLessons: number;
  moduleCount: number;
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
`;

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
`;

type SanityModuleRow = {
  slug: string;
  title: string;
  lessonCount?: number;
  chapter?: {
    chapterSlug?: string;
    lesson?: { lessonSlug?: string };
  } | null;
};

function buildHref(
  coursePrefix: string,
  moduleSlug: string,
  chapter: SanityModuleRow["chapter"],
) {
  if (chapter?.chapterSlug && chapter?.lesson?.lessonSlug) {
    return `/${coursePrefix}/${moduleSlug}/${chapter.chapterSlug}/${chapter.lesson.lessonSlug}`;
  }
  return `/${coursePrefix}/${moduleSlug}`;
}

function mapModules(
  rows: SanityModuleRow[],
  coursePrefix: string,
): ModuleStat[] {
  return rows.map((m) => ({
    slug: m.slug,
    title: m.title,
    lessonCount: m.lessonCount ?? 0,
    firstLessonHref: buildHref(coursePrefix, m.slug, m.chapter),
  }));
}

export async function getLearningDashboardStats(): Promise<CourseStat[]> {
  const [architectureModules, productionModules] = await Promise.all([
    sanityClient.fetch<SanityModuleRow[]>(ARCHITECTURE_STATS_QUERY),
    sanityClient.fetch<SanityModuleRow[]>(PRODUCTION_STATS_QUERY),
  ]);

  const architecture = mapModules(architectureModules, "architecture");
  const production = mapModules(
    productionModules,
    "production-grade-projects",
  );

  return [
    {
      courseSlug: "architecture",
      title: "Codebase Architecture",
      modules: architecture,
      totalLessons: architecture.reduce((sum, m) => sum + m.lessonCount, 0),
      moduleCount: architecture.length,
    },
    {
      courseSlug: "production-grade-projects",
      title: "Production Grade Projects",
      modules: production,
      totalLessons: production.reduce((sum, m) => sum + m.lessonCount, 0),
      moduleCount: production.length,
    },
  ];
}
