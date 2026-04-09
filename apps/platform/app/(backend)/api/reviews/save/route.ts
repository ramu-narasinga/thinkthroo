import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { serverDB } from '@/database';
import { installations, organizations, prReviews } from '@/database/schemas';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret');
  if (!process.env.PLATFORM_API_SECRET || secret !== process.env.PLATFORM_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    installationId?: string;
    repositoryFullName?: string;
    prNumber?: number;
    prTitle?: string;
    summaryPoints?: string[];
    creditsDeducted?: number;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { installationId, repositoryFullName, prNumber, prTitle, summaryPoints, creditsDeducted } = body;

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
      summaryPoints: JSON.stringify(summaryPoints),
      creditsDeducted: String(creditsDeducted ?? 0),
    })
    .returning({ id: prReviews.id });

  return NextResponse.json({ success: true, reviewId: review.id });
}
