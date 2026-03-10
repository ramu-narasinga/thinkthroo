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

// ── Queries ────────────────────────────────────────────────────────────

const SKILLS_LIST_QUERY = `
  *[_type == "skill"] | order(publishedAt desc) {
    title,
    description,
    "slug": slug.current,
    repoUrl,
    skillsCount,
    tags[]->{title},
    publishedAt
  }
`;

const SKILL_BY_SLUG_QUERY = `
  *[_type == "skill" && slug.current == $slug][0] {
    title,
    description,
    "slug": slug.current,
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
