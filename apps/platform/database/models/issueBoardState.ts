import { and, eq } from 'drizzle-orm';
import { serverDB } from '@/database';
import { issueBoardStates } from '@/database/schemas';

type DB = typeof serverDB;

/** Sync the kanban column for an issue after a daemon task lifecycle event. */
export async function updateBoardKanbanStatus(
  db: DB,
  {
    repositoryId,
    issueNumber,
    kanbanStatus,
  }: {
    repositoryId: string;
    issueNumber: number | null;
    kanbanStatus: string;
  }
): Promise<void> {
  if (!issueNumber) return;

  await db
    .update(issueBoardStates)
    .set({ kanbanStatus, updatedAt: new Date() })
    .where(
      and(
        eq(issueBoardStates.repositoryId, repositoryId),
        eq(issueBoardStates.issueNumber, issueNumber)
      )
    );
}
