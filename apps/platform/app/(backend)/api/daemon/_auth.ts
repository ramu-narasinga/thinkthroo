import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { serverDB } from '@/database';
import { daemonRuntimes } from '@/database/schemas';

type DaemonRuntime = typeof daemonRuntimes.$inferSelect;

async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getDaemonRuntime(req: NextRequest): Promise<DaemonRuntime> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawKey = authHeader.slice(7).trim();
  if (!rawKey) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hash = await sha256Hex(rawKey);

  const [runtime] = await serverDB
    .select()
    .from(daemonRuntimes)
    .where(eq(daemonRuntimes.apiKey, hash))
    .limit(1);

  if (!runtime) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return runtime;
}
