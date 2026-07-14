import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { serverDB } from '@/database';
import { agentTasks, agentTaskEvents } from '@/database/schemas';
import { createServiceRoleClient } from '@/utils/supabase/service-role';
import { getDaemonRuntime } from '../../../_auth';

const EVENT_TYPES = ['agent_text', 'tool_call', 'tool_result', 'error'];

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
    eventType?: string;
    toolName?: string;
    toolUseId?: string;
    toolInput?: string;
    preview?: string;
    raw?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { eventType, toolName, toolUseId, toolInput, preview, raw } = body;
  if (!eventType || !EVENT_TYPES.includes(eventType)) {
    return NextResponse.json({ error: 'eventType must be agent_text, tool_call, tool_result, or error' }, { status: 400 });
  }
  if (!raw || typeof raw !== 'string') {
    return NextResponse.json({ error: 'raw is required' }, { status: 400 });
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

  const [event] = await serverDB
    .insert(agentTaskEvents)
    .values({
      taskId: id,
      userId: task.userId,
      eventType,
      toolName: toolName ?? null,
      toolUseId: toolUseId ?? null,
      toolInput: toolInput ?? null,
      preview: preview ?? null,
      raw,
    })
    .returning();

  // Broadcast for live UI subscribers (transcript modal)
  const supabase = createServiceRoleClient();
  await supabase.channel(`task-events:${id}`).httpSend('event', event);

  return NextResponse.json({ ok: true });
}
