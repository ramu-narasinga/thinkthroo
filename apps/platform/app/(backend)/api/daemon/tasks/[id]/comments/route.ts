import { NextRequest, NextResponse } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { serverDB } from '@/database';
import { agentTasks, issueComments } from '@/database/schemas';
import { getDaemonRuntime } from '../../../_auth';

export async function GET(
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

  // Verify task belongs to this runtime
  const [task] = await serverDB
    .select({
      id: agentTasks.id,
      repositoryId: agentTasks.repositoryId,
      issueNumber: agentTasks.issueNumber,
    })
    .from(agentTasks)
    .where(and(eq(agentTasks.id, id), eq(agentTasks.runtimeId, runtime.id)))
    .limit(1);

  if (!task || !task.issueNumber) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const comments = await serverDB
    .select({
      id: issueComments.id,
      authorType: issueComments.authorType,
      body: issueComments.body,
      createdAt: issueComments.createdAt,
    })
    .from(issueComments)
    .where(
      and(
        eq(issueComments.repositoryId, task.repositoryId),
        eq(issueComments.issueNumber, task.issueNumber)
      )
    )
    .orderBy(asc(issueComments.createdAt));

  return NextResponse.json({ comments });
}
