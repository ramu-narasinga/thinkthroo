import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { serverDB } from '@/database';
import { daemonRuntimes } from '@/database/schemas';
import { getDaemonRuntime } from '../_auth';

export async function POST(req: NextRequest) {
  let runtime: Awaited<ReturnType<typeof getDaemonRuntime>>;
  try {
    runtime = await getDaemonRuntime(req);
  } catch (errResponse) {
    return errResponse as NextResponse;
  }

  await serverDB
    .update(daemonRuntimes)
    .set({ status: 'online', lastSeenAt: new Date() })
    .where(eq(daemonRuntimes.id, runtime.id));

  return NextResponse.json({ ok: true });
}
