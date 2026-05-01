import { NextRequest, NextResponse } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { serverDB } from '@/database';
import {
  repositories,
  organizations,
  repositorySettings,
  rateLimitPlanDefaults,
  rateLimitOverrides,
} from '@/database/schemas';
import { createRateLimiter } from '@/lib/upstash';
import { isValidInternalSecret } from '@/lib/server/internal-auth';
import { trackPlatformSecuritySignal } from '@/lib/server/security-alerts';

/** Hard-coded safety fallback if the plan is missing from rate_limit_plan_defaults */
const FALLBACK_REVIEWS_PER_HOUR = 3;
const FALLBACK_FILES_PER_REVIEW = 50;

export async function POST(req: NextRequest) {
  if (!isValidInternalSecret(req.headers)) {
    await trackPlatformSecuritySignal({
      signal: 'internal_auth_failed_rate_limits_check',
      threshold: 3,
      windowSeconds: 60,
      text: ':rotating_light: Repeated failed internal auth on /api/rate-limits/check.',
      fields: {
        route: '/api/rate-limits/check',
      },
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { installationId?: string; repoFullName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { installationId, repoFullName } = body;
  if (!installationId || !repoFullName) {
    return NextResponse.json(
      { error: 'installationId and repoFullName are required' },
      { status: 400 },
    );
  }

  // Resolve repo + org from the installation
  const [repo] = await serverDB
    .select({ id: repositories.id, organizationId: repositories.organizationId })
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

  // Resolve org plan name
  const [org] = await serverDB
    .select({ currentPlanName: organizations.currentPlanName })
    .from(organizations)
    .where(eq(organizations.id, repo.organizationId))
    .limit(1);

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  // Determine whether to use org-level or repo-level overrides,
  // matching the same use_organization_settings flag used by review-settings
  const [repoSettings] = await serverDB
    .select({ useOrganizationSettings: repositorySettings.useOrganizationSettings })
    .from(repositorySettings)
    .where(eq(repositorySettings.repositoryId, repo.id))
    .limit(1);

  const useOrgSettings = !repoSettings || repoSettings.useOrganizationSettings;

  // --- Resolve reviews_per_hour ---
  // Check 1: repo-level override (only when useOrganizationSettings = false)
  let reviewsPerHour: number | null = null;
  let filesPerReview: number | null = null;

  if (!useOrgSettings) {
    const [repoOverride] = await serverDB
      .select({
        reviewsPerHour: rateLimitOverrides.reviewsPerHour,
        filesPerReview: rateLimitOverrides.filesPerReview,
      })
      .from(rateLimitOverrides)
      .where(
        and(
          eq(rateLimitOverrides.organizationId, repo.organizationId),
          eq(rateLimitOverrides.repositoryId, repo.id),
        ),
      )
      .limit(1);

    reviewsPerHour = repoOverride?.reviewsPerHour ?? null;
    filesPerReview = repoOverride?.filesPerReview ?? null;
  }

  // Check 2: org-level override (for any field still null)
  if (reviewsPerHour === null || filesPerReview === null) {
    const [orgOverride] = await serverDB
      .select({
        reviewsPerHour: rateLimitOverrides.reviewsPerHour,
        filesPerReview: rateLimitOverrides.filesPerReview,
      })
      .from(rateLimitOverrides)
      .where(
        and(
          eq(rateLimitOverrides.organizationId, repo.organizationId),
          isNull(rateLimitOverrides.repositoryId),
        ),
      )
      .limit(1);

    if (reviewsPerHour === null) reviewsPerHour = orgOverride?.reviewsPerHour ?? null;
    if (filesPerReview === null) filesPerReview = orgOverride?.filesPerReview ?? null;
  }

  // Check 3: plan defaults (for any field still null)
  if (reviewsPerHour === null || filesPerReview === null) {
    const [planDefaults] = await serverDB
      .select({
        reviewsPerHour: rateLimitPlanDefaults.reviewsPerHour,
        filesPerReview: rateLimitPlanDefaults.filesPerReview,
      })
      .from(rateLimitPlanDefaults)
      .where(eq(rateLimitPlanDefaults.planName, org.currentPlanName))
      .limit(1);

    if (reviewsPerHour === null) reviewsPerHour = planDefaults?.reviewsPerHour ?? FALLBACK_REVIEWS_PER_HOUR;
    if (filesPerReview === null) filesPerReview = planDefaults?.filesPerReview ?? FALLBACK_FILES_PER_REVIEW;
  }

  // At this point both values are guaranteed non-null
  const resolvedReviewsPerHour = reviewsPerHour!;
  const resolvedFilesPerReview = filesPerReview!;

  // Run Upstash sliding window check
  const rateLimiter = createRateLimiter(resolvedReviewsPerHour);
  // Key is scoped to org + repo so repo-level limits are independent
  const key = `org:${repo.organizationId}:repo:${repo.id}`;
  const { success, remaining, reset } = await rateLimiter.limit(key);

  if (!success) {
    const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json({
      allowed: false,
      reviewsPerHour: resolvedReviewsPerHour,
      filesPerReview: resolvedFilesPerReview,
      retryAfterSeconds,
    });
  }

  return NextResponse.json({
    allowed: true,
    reviewsPerHour: resolvedReviewsPerHour,
    filesPerReview: resolvedFilesPerReview,
    remaining,
  });
}
