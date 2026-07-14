import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { serverDB } from '@/database';
import { agentTasks, agentTaskLogs } from '@/database/schemas';
import { createServiceRoleClient } from '@/utils/supabase/service-role';
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

  let body: { message?: string; type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { message, type } = body;
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }
  if (!type || !['info', 'output', 'error'].includes(type)) {
    return NextResponse.json({ error: 'type must be info, output, or error' }, { status: 400 });
  }

  const { id } = await params;

  // Verify task belongs to this runtime
  const [task] = await serverDB
    .select({ id: agentTasks.id, userId: agentTasks.userId })
    .from(agentTasks)
    .where(and(eq(agentTasks.id, id), eq(agentTasks.runtimeId, runtime.id)))
    .limit(1);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  // Persist log entry for history
  await serverDB.insert(agentTaskLogs).values({
    taskId: id,
    userId: task.userId,
    type,
    message,
  });

  // Broadcast for live UI subscribers
  const supabase = createServiceRoleClient();
  await supabase.channel(`task-progress:${id}`).httpSend('progress', {
    message, type, taskId: id, timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
