import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { serverDB } from '@/database';
import { installations, organizations, prReviews } from '@/database/schemas';
import { notifyPrReview } from '@/service/slack/channel';
import { pino } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret');
  const expected = process.env.PLATFORM_API_SECRET;
  if (!secret || !expected || secret.length !== expected.length || !timingSafeEqual(Buffer.from(secret), Buffer.from(expected))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    installationId?: string;
    repositoryFullName?: string;
    prNumber?: number;
    prTitle?: string;
    prAuthor?: string;
    summaryPoints?: string[];
    creditsDeducted?: number;
    hasArchitectureResults?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { installationId, repositoryFullName, prNumber, prTitle, prAuthor, summaryPoints, creditsDeducted, hasArchitectureResults } = body;

  if (
    !installationId ||
    !repositoryFullName ||
    prNumber == null ||
    !prTitle ||
    !Array.isArray(summaryPoints)
  ) {
    return NextResponse.json(
      { error: 'installationId, repositoryFullName, prNumber, prTitle, and summaryPoints[] are required' },
      { status: 400 },
    );
  }

  try {
    const [installation] = await serverDB
      .select({ githubOrgId: installations.githubOrgId, userId: installations.userId })
      .from(installations)
      .where(eq(installations.installationId, installationId))
      .limit(1);

    if (!installation) {
      return NextResponse.json({ error: 'Installation not found' }, { status: 404 });
    }

    const [org] = await serverDB
      .select({ id: organizations.id })
      .from(organizations)
      .where(
        and(
          eq(organizations.githubOrgId, installation.githubOrgId),
          eq(organizations.userId, installation.userId),
        ),
      )
      .limit(1);

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const [review] = await serverDB
      .insert(prReviews)
      .values({
        organizationId: org.id,
        repositoryFullName,
        prNumber,
        prTitle,
        prAuthor: prAuthor ?? '',
        summaryPoints: JSON.stringify(summaryPoints),
        creditsDeducted: String(creditsDeducted ?? 0),
      })
      .returning({ id: prReviews.id });

    // Only send Slack notification for PR-only reviews (no architecture results coming)
    if (!hasArchitectureResults) {
      try {
        const slackStatus = await notifyPrReview(serverDB, org.id, {
          repositoryFullName,
          prNumber,
          prTitle,
          prAuthor: prAuthor ?? '',
          summaryPoints,
        });

        try {
          await serverDB
            .update(prReviews)
            .set({ slackStatus })
            .where(eq(prReviews.id, review.id));
        } catch (updateErr: any) {
          pino.error('[ReviewSave] Failed to update slack status on review', {
            reviewId: review.id,
            orgId: org.id,
            error: updateErr.message,
          });
        }
      } catch (err) {
        pino.error('[ReviewSave] Slack notification error', {
          orgId: org.id,
          repositoryFullName,
          prNumber,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({ success: true, reviewId: review.id });
  } catch (err) {
    pino.error('[ReviewSave] Database operation failed', {
      installationId,
      repositoryFullName,
      prNumber,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }
}
