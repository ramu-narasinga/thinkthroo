import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { serverDB } from '@/database';
import { installations, repositories, prArchitectureFileResults, documents, prReviews } from '@/database/schemas';
import { notifyPrReview } from '@/service/slack/channel';
import { pino } from '@/lib/logger';

interface DocReference {
  name: string;
  excerpt: string;
}

interface FileResult {
  filename: string;
  violationCount: number;
  score: number;
  violations: { startLine: number; endLine: number; comment: string }[];
  docReferences: DocReference[];
  creditsDeducted?: number;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret');
  const expected = process.env.PLATFORM_API_SECRET;
  if (
    !secret ||
    !expected ||
    secret.length !== expected.length ||
    !timingSafeEqual(Buffer.from(secret), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    prReviewId?: string;
    repositoryFullName?: string;
    installationId?: string;
    fileResults?: FileResult[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { prReviewId, repositoryFullName, installationId, fileResults } = body;

  if (!prReviewId || !repositoryFullName || !installationId || !Array.isArray(fileResults) || fileResults.length === 0) {
    return NextResponse.json(
      { error: 'prReviewId, repositoryFullName, installationId, and fileResults[] are required' },
      { status: 400 },
    );
  }

  try {
    const [installation] = await serverDB
      .select({ userId: installations.userId })
      .from(installations)
      .where(eq(installations.installationId, installationId))
      .limit(1);

    if (!installation) {
      return NextResponse.json({ error: 'Installation not found' }, { status: 404 });
    }

    const [repository] = await serverDB
      .select({ id: repositories.id })
      .from(repositories)
      .where(
        and(
          eq(repositories.fullName, repositoryFullName),
          eq(repositories.installationId, installationId),
        ),
      )
      .limit(1);

    const rows = await Promise.all(
      fileResults.map(async (file) => {
        const resolvedRefs = await Promise.all(
          file.docReferences.map(async (ref) => {
            let documentId: string | null = null;
            try {
              if (repository) {
                const [doc] = await serverDB
                  .select({ id: documents.id })
                  .from(documents)
                  .where(
                    and(
                      eq(documents.userId, installation.userId),
                      eq(documents.repositoryId, repository.id),
                      eq(documents.name, ref.name),
                    ),
                  )
                  .limit(1);
                documentId = doc?.id ?? null;
              }
            } catch (refErr: any) {
              pino.warn('[ArchitectureSave] Failed to resolve doc reference', {
                installationId,
                repositoryFullName,
                prReviewId,
                filename: file.filename,
                refName: ref.name,
                error: refErr.message,
              });
            }
            return { name: ref.name, excerpt: ref.excerpt, documentId };
          }),
        );

        return {
          prReviewId,
          filename: file.filename,
          violationCount: file.violationCount,
          score: file.score,
          violations: JSON.stringify(file.violations),
          docReferences: JSON.stringify(resolvedRefs),
          creditsDeducted: String(file.creditsDeducted ?? 0),
        };
      }),
    );

    await serverDB.insert(prArchitectureFileResults).values(rows);

    // Send combined Slack notification (PR summary + architecture results)
    try {
      const [review] = await serverDB
        .select({
          organizationId: prReviews.organizationId,
          repositoryFullName: prReviews.repositoryFullName,
          prNumber: prReviews.prNumber,
          prTitle: prReviews.prTitle,
          prAuthor: prReviews.prAuthor,
          summaryPoints: prReviews.summaryPoints,
        })
        .from(prReviews)
        .where(eq(prReviews.id, prReviewId))
        .limit(1);

      if (review) {
        const parsedSummary = (() => {
          try {
            return JSON.parse(review.summaryPoints as string) as string[];
          } catch {
            return [];
          }
        })();

        const slackStatus = await notifyPrReview(serverDB, review.organizationId, {
          repositoryFullName: review.repositoryFullName,
          prNumber: review.prNumber,
          prTitle: review.prTitle,
          prAuthor: review.prAuthor ?? '',
          summaryPoints: parsedSummary,
          fileResults: fileResults.map((f) => ({
            filename: f.filename,
            violationCount: f.violationCount,
            score: f.score,
          })),
        });

        // Update slack status on the PR review
        try {
          await serverDB
            .update(prReviews)
            .set({ slackStatus })
            .where(eq(prReviews.id, prReviewId));
        } catch (updateErr: any) {
          pino.error('[ArchitectureSave] Failed to update slack status on review', {
            prReviewId,
            organizationId: review.organizationId,
            error: updateErr.message,
          });
        }
      }
    } catch (err) {
      pino.error('[ArchitectureSave] Slack notification error', {
        prReviewId,
        repositoryFullName,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    pino.error('[ArchitectureSave] Database operation failed', {
      installationId,
      repositoryFullName,
      prReviewId,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Failed to save architecture results' }, { status: 500 });
  }
}
