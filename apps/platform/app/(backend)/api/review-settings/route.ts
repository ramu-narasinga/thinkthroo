import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { serverDB } from '@/database';
import {
  repositories,
  organizations,
  repositorySettings,
  organizationSettings,
} from '@/database/schemas';

export interface EffectiveReviewSettings {
  enableReviews: boolean;
  enablePrSummary: boolean;
  enableInlineReviewComments: boolean;
  enableArchitectureReview: boolean;
  reviewLanguage: string | null;
  toneInstructions: string | null;
  pathFilters: string[];
  autoPauseAfterReviewedCommits: number;
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret');
  if (!process.env.PLATFORM_API_SECRET || secret !== process.env.PLATFORM_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const installationId = req.nextUrl.searchParams.get('installationId');
  const repoFullName = req.nextUrl.searchParams.get('repoFullName');

  if (!installationId || !repoFullName) {
    return NextResponse.json(
      { error: 'installationId and repoFullName are required' },
      { status: 400 },
    );
  }

  // Resolve the repository and its linked organization
  const [repo] = await serverDB
    .select({
      id: repositories.id,
      organizationId: repositories.organizationId,
    })
    .from(repositories)
    .where(
      and(
        eq(repositories.installationId, installationId),
        eq(repositories.fullName, repoFullName),
      ),
    )
    .limit(1);

  if (!repo) {
    return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
  }

  // Resolve the organization's plan
  const [org] = await serverDB
    .select({ currentPlanName: organizations.currentPlanName })
    .from(organizations)
    .where(eq(organizations.id, repo.organizationId))
    .limit(1);

  const isPro = org?.currentPlanName === 'pro';

  // Load repo settings
  const [repoSettings] = await serverDB
    .select()
    .from(repositorySettings)
    .where(eq(repositorySettings.repositoryId, repo.id))
    .limit(1);

  // Determine effective settings: use org settings when flag is set or no repo settings exist
  let effective: EffectiveReviewSettings;

  const useOrgSettings = !repoSettings || repoSettings.useOrganizationSettings;

  if (useOrgSettings) {
    const [orgSettings] = await serverDB
      .select()
      .from(organizationSettings)
      .where(eq(organizationSettings.organizationId, repo.organizationId))
      .limit(1);

    // If no org settings either — safe defaults (free plan)
    effective = {
      enableReviews: orgSettings?.enableReviews ?? true,
      enablePrSummary: orgSettings?.enablePrSummary ?? true,
      enableInlineReviewComments: orgSettings?.enableInlineReviewComments ?? false,
      enableArchitectureReview: orgSettings?.enableArchitectureReview ?? false,
      reviewLanguage: orgSettings?.reviewLanguage ?? null,
      toneInstructions: orgSettings?.toneInstructions ?? null,
      pathFilters: orgSettings?.pathFilters ?? [],
      autoPauseAfterReviewedCommits: orgSettings?.autoPauseAfterReviewedCommits ?? 5,
    };
  } else {
    effective = {
      enableReviews: repoSettings.enableReviews,
      enablePrSummary: repoSettings.enablePrSummary,
      enableInlineReviewComments: repoSettings.enableInlineReviewComments,
      enableArchitectureReview: repoSettings.enableArchitectureReview,
      reviewLanguage: repoSettings.reviewLanguage ?? null,
      toneInstructions: repoSettings.toneInstructions ?? null,
      pathFilters: repoSettings.pathFilters ?? [],
      autoPauseAfterReviewedCommits: repoSettings.autoPauseAfterReviewedCommits ?? 5,
    };
  }

  // Enforce plan gating — Pro-only features are always false for free orgs
  if (!isPro) {
    effective.enableInlineReviewComments = false;
    effective.enableArchitectureReview = false;
  }

  return NextResponse.json(effective);
}
