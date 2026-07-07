import { NextRequest, NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';
import { serverDB } from '@/database';
import { agentTasks } from '@/database/schemas';
import { getDaemonRuntime } from '../../../_auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let runtime: Awaited<ReturnType<typeof getDaemonRuntime>>;
  try {
    runtime = await getDaemonRuntime(req);
  } catch (errResponse) {
    return errResponse as NextResponse;
  }

  let body: {
    inputTokens?: number;
    outputTokens?: number;
    cacheReadTokens?: number;
    cacheWriteTokens?: number;
    model?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { inputTokens = 0, outputTokens = 0, cacheReadTokens = 0, cacheWriteTokens = 0 } = body;

  const { id } = await params;

  // Verify task belongs to this runtime
  const [task] = await serverDB
    .select({ id: agentTasks.id })
    .from(agentTasks)
    .where(and(eq(agentTasks.id, id), eq(agentTasks.runtimeId, runtime.id)))
    .limit(1);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  // Accumulate token counts — additive so multiple streaming calls sum correctly
  await serverDB
    .update(agentTasks)
    .set({
      inputTokens: sql`input_tokens + ${inputTokens}`,
      outputTokens: sql`output_tokens + ${outputTokens}`,
      cacheReadTokens: sql`cache_read_tokens + ${cacheReadTokens}`,
      cacheWriteTokens: sql`cache_write_tokens + ${cacheWriteTokens}`,
    })
    .where(eq(agentTasks.id, id));

  return NextResponse.json({ ok: true });
}
