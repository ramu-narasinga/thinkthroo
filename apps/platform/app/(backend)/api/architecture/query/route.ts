import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { serverDB } from '@/database';
import { installations, repositories } from '@/database/schemas';
import { pineconeService } from '@/service/pinecone';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret');
  if (!process.env.PLATFORM_API_SECRET || secret !== process.env.PLATFORM_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { installationId?: string; repositoryFullName?: string; codeSnippet?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { installationId, repositoryFullName, codeSnippet } = body;

  if (!installationId || !repositoryFullName || !codeSnippet) {
    return NextResponse.json(
      { error: 'installationId, repositoryFullName, and codeSnippet are required' },
      { status: 400 },
    );
  }

  const MAX_CODE_SNIPPET_CHARS = 10_000;
  if (codeSnippet.length > MAX_CODE_SNIPPET_CHARS) {
    return NextResponse.json(
      { error: `codeSnippet must not exceed ${MAX_CODE_SNIPPET_CHARS} characters` },
      { status: 400 },
    );
  }

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

  if (!repository) {
    return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
  }

  const results = await pineconeService.queryDocuments(
    installation.userId,
    repository.id,
    codeSnippet,
  );

  return NextResponse.json({ results });
}
