import { NextRequest, NextResponse } from 'next/server';
import { runSweep } from './logic';

// Manual/internal trigger, authenticated via the shared internal secret.
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret');
  if (!process.env.PLATFORM_API_SECRET || secret !== process.env.PLATFORM_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runSweep();
  return NextResponse.json(result);
}

// Vercel Cron trigger (see apps/platform/vercel.json). Vercel Cron issues GET requests and
// authenticates itself with `Authorization: Bearer $CRON_SECRET`.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runSweep();
  return NextResponse.json(result);
}
