import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/database';
import { daemonRuntimes } from '@/database/schemas';
import { createClient } from '@/utils/supabase/server';

async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateApiKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `ttd_${hex}`;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name } = body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const rawKey = generateApiKey();
  const hashedKey = await sha256Hex(rawKey);

  const [runtime] = await serverDB
    .insert(daemonRuntimes)
    .values({
      userId: user.id,
      name: name.trim(),
      apiKey: hashedKey,
      status: 'offline',
    })
    .returning();

  return NextResponse.json({ runtimeId: runtime.id, apiKey: rawKey }, { status: 201 });
}
