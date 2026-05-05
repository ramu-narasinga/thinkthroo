import { sanityClient } from "@/lib/sanity-client";

// ── Sanity Types ───────────────────────────────────────────────────────

export interface SanitySkillTag {
  title: string;
}

export interface SanitySkill {
  title: string;
  description: string;
  /** slug.current from Sanity */
  slug: string;
  /** GitHub repo URL used to build the install command */
  repoUrl: string | null;
  /** Number of sub-skills / rule files in this skill package */
  skillsCount: number;
  /** Markdown body content */
  body: string | null;
  tags: SanitySkillTag[];
  publishedAt: string | null;
}

// ── Skill Item Types (individual skill docs within a module) ──────────

export interface SanitySkillItem {
  title: string;
  /** slug.current */
  slug: string;
  body?: string | null;
  publishedAt: string | null;
}

// ── Queries ────────────────────────────────────────────────────────────

const SKILLS_LIST_QUERY = `
  *[
    _type == "module" &&
    "Skills" in categories[]->title
  ] | order(title asc) {
    title,
    description,
    "slug": slug,
    repoUrl,
    skillsCount,
    tags[]->{title},
    publishedAt
  }
`;

const SKILL_BY_SLUG_QUERY = `
  *[
    _type == "module" &&
    "Skills" in categories[]->title &&
    slug == $slug
  ][0] {
    title,
    description,
    "slug": slug,
    repoUrl,
    skillsCount,
    tags[]->{title},
    body,
    publishedAt
  }
`;

// ── Fetchers ──────────────────────────────────────────────────────────

export async function fetchAllSkills(): Promise<SanitySkill[]> {
  return sanityClient.fetch<SanitySkill[]>(
    SKILLS_LIST_QUERY,
    {},
    { next: { revalidate: 60 } }
  );
}

export async function fetchSkillBySlug(slug: string): Promise<SanitySkill | null> {
  return sanityClient.fetch<SanitySkill | null>(
    SKILL_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 30 } }
  );
}

/**
 * Build the CLI install command for a skill.
 * e.g. npx skills add https://github.com/org/repo --skill my-skill
 */
export function buildInstallCommand(repoUrl: string | null, skillSlug: string): string {
  if (!repoUrl) return `npx skills add --skill ${skillSlug}`;
  return `npx skills add ${repoUrl} --skill ${skillSlug}`;
}

// ── Skill item queries (individual `skill` docs within a module) ──────

const SKILL_ITEMS_BY_MODULE_QUERY = `
  *[
    _type == "skill" &&
    $moduleSlug in module[]->slug
  ] | order(title asc) {
    title,
    "slug": slug.current,
    body,
    publishedAt
  }
`;

const SKILL_ITEM_BY_SLUG_QUERY = `
  *[_type == "skill" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    body,
    publishedAt
  }
`;

export async function fetchSkillItemsByModuleSlug(
  moduleSlug: string
): Promise<SanitySkillItem[]> {
  const result = await sanityClient.fetch<SanitySkillItem[] | null>(
    SKILL_ITEMS_BY_MODULE_QUERY,
    { moduleSlug },
    { next: { revalidate: 60 } }
  );
  return result ?? [];
}

export async function fetchSkillItemBySlug(
  slug: string
): Promise<SanitySkillItem | null> {
  return sanityClient.fetch<SanitySkillItem | null>(
    SKILL_ITEM_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 30 } }
  );
}
