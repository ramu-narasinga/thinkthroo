import { NextRequest, NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
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

  const { id } = await params;

  const [updated] = await serverDB
    .update(agentTasks)
    .set({ status: 'running', startedAt: new Date() })
    .where(
      and(
        eq(agentTasks.id, id),
        eq(agentTasks.runtimeId, runtime.id),
        inArray(agentTasks.status, ['dispatched', 'waiting_local_directory'])
      )
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Task not found or invalid status transition' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
