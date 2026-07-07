import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { serverDB } from '@/database';

// Called directly by the daemon CLI (server-to-server, no browser/session involved) to
// exchange the one-time code handed to it via the /cli-auth loopback redirect for the real
// runtime credentials. Single-use and time-boxed via the WHERE clause below.
export async function POST(req: NextRequest) {
  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { code } = body;
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'code is required' }, { status: 400 });
  }

  const result = await serverDB.execute(sql`
    UPDATE daemon_cli_auth_requests
    SET consumed_at = now()
    WHERE code = ${code}
      AND consumed_at IS NULL
      AND created_at > now() - interval '5 minutes'
    RETURNING runtime_id, api_key
  `);

  const rows = Array.from(result) as Array<{ runtime_id: string; api_key: string }>;
  if (!rows.length) {
    return NextResponse.json({ error: 'Invalid, expired, or already-used code' }, { status: 410 });
  }

  return NextResponse.json({ runtimeId: rows[0].runtime_id, apiKey: rows[0].api_key });
}
