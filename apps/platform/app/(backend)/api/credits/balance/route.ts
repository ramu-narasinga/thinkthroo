import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { serverDB } from '@/database';
import { installations, organizations } from '@/database/schemas';

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret');
  const expected = process.env.PLATFORM_API_SECRET;
  if (!secret || !expected || !timingSafeEqual(Buffer.from(secret), Buffer.from(expected))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const installationId = req.nextUrl.searchParams.get('installationId');
  if (!installationId) {
    return NextResponse.json({ error: 'installationId is required' }, { status: 400 });
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
    .select({ creditBalance: organizations.creditBalance })
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

  return NextResponse.json({ creditBalance: Number(org.creditBalance) });
}
