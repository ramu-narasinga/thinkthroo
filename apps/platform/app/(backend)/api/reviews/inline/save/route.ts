import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { serverDB } from '@/database';
import { prReviews, prInlineReviewComments } from '@/database/schemas';

interface InlineComment {
  filename: string;
  startLine: number;
  endLine: number;
  comment: string;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret');
  if (!process.env.PLATFORM_API_SECRET || secret !== process.env.PLATFORM_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    prReviewId?: string;
    inlineComments?: InlineComment[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { prReviewId, inlineComments } = body;

  if (!prReviewId || !Array.isArray(inlineComments) || inlineComments.length === 0) {
    return NextResponse.json(
      { error: 'prReviewId and inlineComments[] are required' },
      { status: 400 },
    );
  }

  // Verify the parent review exists
  const [review] = await serverDB
    .select({ id: prReviews.id })
    .from(prReviews)
    .where(eq(prReviews.id, prReviewId))
    .limit(1);

  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  await serverDB.insert(prInlineReviewComments).values(
    inlineComments.map((c) => ({
      prReviewId,
      filename: c.filename,
      startLine: c.startLine,
      endLine: c.endLine,
      comment: c.comment,
    })),
  );

  return NextResponse.json({ success: true, count: inlineComments.length });
}
