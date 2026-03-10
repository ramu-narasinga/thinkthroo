import { sanityClient } from "@/lib/sanity-client";
import { type SanityDocument } from "next-sanity";

// ── Types ─────────────────────────────────────────────────────────────

export interface SanityLesson extends SanityDocument {
  title: string;
  description?: string;
  slug: string;
  body: string | null;
  order: number;
}

export interface SanityChapterLesson {
  title: string;
  slug: string;
  order: number;
}

export interface SanityChapter {
  title: string;
  order: number;
  lessons: SanityChapterLesson[];
}

// ── Fetch a single lesson by its slug ─────────────────────────────────

const LESSON_BY_SLUG_QUERY = `
  *[
    _type == "codebaseArchitecture" &&
    slug.current == $slug
  ][0] {
    _id,
    _type,
    title,
    description,
    "slug": slug.current,
    body,
    order
  }
`;

export async function fetchLessonBySlug(slug: string): Promise<SanityLesson> {
  return sanityClient.fetch<SanityLesson>(
    LESSON_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 30 } }
  );
}

// ── Fetch all chapters (+ lessons) for a given module slug ────────────

const CHAPTERS_BY_MODULE_QUERY = `
  *[
    _type == "chapter" &&
    $slug in module[]->slug
  ] | order(order asc) {
    title,
    order,
    "lessons": *[
      _type == "codebaseArchitecture" &&
      ^._id in chapter[]._ref
    ] | order(order asc) {
      title,
      "slug": slug.current,
      order
    }
  }
`;

export async function fetchChaptersByModuleSlug(
  moduleSlug: string
): Promise<SanityChapter[]> {
  return sanityClient.fetch<SanityChapter[]>(
    CHAPTERS_BY_MODULE_QUERY,
    { slug: moduleSlug },
    { next: { revalidate: 30 } }
  );
}

// ── Production Grade Projects ─────────────────────────────────────────

const PGP_LESSON_BY_SLUG_QUERY = `
  *[
    _type == "productionGradeProjects" &&
    slug.current == $slug
  ][0] {
    _id,
    _type,
    title,
    description,
    "slug": slug.current,
    body,
    order
  }
`;

export async function fetchPGPLessonBySlug(slug: string): Promise<SanityLesson> {
  return sanityClient.fetch<SanityLesson>(
    PGP_LESSON_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 30 } }
  );
}

const PGP_CHAPTERS_BY_MODULE_QUERY = `
  *[
    _type == "chapter" &&
    $slug in module[]->slug
  ] | order(order asc) {
    title,
    order,
    "lessons": *[
      _type == "productionGradeProjects" &&
      ^._id in chapter[]._ref
    ] | order(order asc) {
      title,
      "slug": slug.current,
      order
    }
  }
`;

export async function fetchPGPChaptersByModuleSlug(
  moduleSlug: string
): Promise<SanityChapter[]> {
  return sanityClient.fetch<SanityChapter[]>(
    PGP_CHAPTERS_BY_MODULE_QUERY,
    { slug: moduleSlug },
    { next: { revalidate: 30 } }
  );
}
