import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { serverDB } from '@/database';
import { installations, repositories, prArchitectureFileResults, documents } from '@/database/schemas';

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
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret');
  if (!process.env.PLATFORM_API_SECRET || secret !== process.env.PLATFORM_API_SECRET) {
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
      };
    }),
  );

  await serverDB.insert(prArchitectureFileResults).values(rows);

  return NextResponse.json({ success: true });
}
