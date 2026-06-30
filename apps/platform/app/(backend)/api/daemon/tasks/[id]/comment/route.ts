import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { serverDB } from '@/database';
import { agentTasks, issueComments } from '@/database/schemas';
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

  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { body: commentBody } = body;
  if (!commentBody || typeof commentBody !== 'string') {
    return NextResponse.json({ error: 'body is required' }, { status: 400 });
  }

  const { id } = await params;

  // Verify task belongs to this runtime and get context needed for the comment
  const [task] = await serverDB
    .select({
      id: agentTasks.id,
      userId: agentTasks.userId,
      repositoryId: agentTasks.repositoryId,
      issueNumber: agentTasks.issueNumber,
    })
    .from(agentTasks)
    .where(and(eq(agentTasks.id, id), eq(agentTasks.runtimeId, runtime.id)))
    .limit(1);

  if (!task || !task.issueNumber) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const [comment] = await serverDB
    .insert(issueComments)
    .values({
      repositoryId: task.repositoryId,
      issueNumber: task.issueNumber,
      userId: task.userId,
      authorType: 'agent',
      agentTaskId: task.id,
      body: commentBody,
    })
    .returning();

  // Broadcast so the UI updates in real time
  const supabase = createServiceRoleClient();
  await supabase.channel(`issue-comments:${task.repositoryId}:${task.issueNumber}`).send({
    type: 'broadcast',
    event: 'new-comment',
    payload: { comment },
  });

  return NextResponse.json({ ok: true, commentId: comment.id });
}
