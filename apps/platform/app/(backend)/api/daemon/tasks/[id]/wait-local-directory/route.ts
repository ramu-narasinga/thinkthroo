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

  let body: { waitReason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { waitReason } = body;
  if (!waitReason || typeof waitReason !== 'string') {
    return NextResponse.json({ error: 'waitReason is required' }, { status: 400 });
  }

  const { id } = await params;

  const [updated] = await serverDB
    .update(agentTasks)
    .set({ status: 'waiting_local_directory', waitReason })
    .where(
      and(
        eq(agentTasks.id, id),
        eq(agentTasks.runtimeId, runtime.id),
        eq(agentTasks.status, 'dispatched')
      )
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Task not found or invalid status transition' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
