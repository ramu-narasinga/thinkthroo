import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { serverDB } from '@/database';
import { agentTasks } from '@/database/schemas';
import { getDaemonRuntime } from '../../../_auth';
import { updateBoardKanbanStatus } from '@/database/models/issueBoardState';

interface TaskResult {
  prUrl?: string;
  summary?: string;
  branchName?: string;
}

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

  let body: { result?: TaskResult };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { result } = body;
  if (!result || typeof result !== 'object') {
    return NextResponse.json({ error: 'result is required' }, { status: 400 });
  }

  const { id } = await params;

  const [updated] = await serverDB
    .update(agentTasks)
    .set({
      status: 'completed',
      completedAt: new Date(),
      result: JSON.stringify(result),
    })
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

  if (updated.taskType === 'implementation') {
    try {
      await updateBoardKanbanStatus(serverDB, {
        repositoryId: updated.repositoryId,
        issueNumber: updated.issueNumber,
        kanbanStatus: 'in_review',
      });
    } catch {
      // Board sync is best-effort — do not fail the task completion
    }
  }

  return NextResponse.json(updated);
}
