import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
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

  let body: { sessionId?: string; workDir?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { sessionId, workDir } = body;
  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }
  if (!workDir || typeof workDir !== 'string') {
    return NextResponse.json({ error: 'workDir is required' }, { status: 400 });
  }

  const { id } = await params;

  const [updated] = await serverDB
    .update(agentTasks)
    .set({ sessionId, workDir })
    .where(
      and(
        eq(agentTasks.id, id),
        eq(agentTasks.runtimeId, runtime.id),
        eq(agentTasks.status, 'running')
      )
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Task not found or not in running state' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
