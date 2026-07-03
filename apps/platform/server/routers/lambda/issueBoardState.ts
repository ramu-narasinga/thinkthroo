import { z } from 'zod';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { issueBoardStates, repositories, agentTasks, squads } from '@/database/schemas';
import { enqueueForAgent } from '@/lib/enqueueForAgent';

type KanbanStatus = typeof KANBAN_STATUSES[number];

function inferKanbanStatus(taskStatus: string | null): KanbanStatus {
  if (!taskStatus) return 'backlog';
  if (taskStatus === 'queued') return 'todo';
  if (['dispatched', 'running', 'waiting_local_directory'].includes(taskStatus)) return 'in_progress';
  if (taskStatus === 'completed') return 'in_review';
  if (taskStatus === 'failed') return 'blocked';
  return 'backlog';
}

const boardProcedure = authedProcedure.use(serverDatabase);

const KANBAN_STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'blocked'] as const;

const ACTIVE_TASK_STATUSES = ['queued', 'dispatched', 'running', 'waiting_local_directory'] as const;

async function resolveRepo(
  db: typeof import('@/database').serverDB,
  repositoryFullName: string,
  userId: string
) {
  const [repo] = await db
    .select({
      id: repositories.id,
      fullName: repositories.fullName,
      installationId: repositories.installationId,
    })
    .from(repositories)
    .where(and(eq(repositories.fullName, repositoryFullName), eq(repositories.userId, userId)))
    .limit(1);
  return repo ?? null;
}

/**
 * Cancel all active tasks for an issue when it is moved back to "backlog".
 */
async function cancelActiveTasksForIssue(
  db: typeof import('@/database').serverDB,
  { repositoryId, issueNumber, userId }: { repositoryId: string; issueNumber: number; userId: string }
) {
  await db
    .update(agentTasks)
    .set({ status: 'cancelled', failureReason: 'cancelled_by_user' })
    .where(
      and(
        eq(agentTasks.repositoryId, repositoryId),
        eq(agentTasks.issueNumber, issueNumber),
        eq(agentTasks.userId, userId),
        inArray(agentTasks.status, [...ACTIVE_TASK_STATUSES])
      )
    );
}

export const issueBoardStateRouter = router({
  getByRepository: boardProcedure
    .input(z.object({ repositoryFullName: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) return [];

      return ctx.serverDB
        .select()
        .from(issueBoardStates)
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.userId, ctx.userId)
          )
        );
    }),

  addToBoard: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
        issueTitle: z.string().min(1),
        issueHtmlUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const [row] = await ctx.serverDB
        .insert(issueBoardStates)
        .values({
          repositoryId: repo.id,
          userId: ctx.userId,
          issueNumber: input.issueNumber,
          issueTitle: input.issueTitle,
          issueHtmlUrl: input.issueHtmlUrl ?? null,
          kanbanStatus: 'backlog',
        })
        .onConflictDoUpdate({
          target: [issueBoardStates.repositoryId, issueBoardStates.issueNumber],
          set: {
            issueTitle: input.issueTitle,
            issueHtmlUrl: input.issueHtmlUrl ?? null,
            updatedAt: new Date(),
          },
        })
        .returning();

      return row;
    }),

  updateKanbanStatus: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
        kanbanStatus: z.enum(KANBAN_STATUSES),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      // Fetch current board state before updating (need assignee info for auto-enqueue)
      const [current] = await ctx.serverDB
        .select()
        .from(issueBoardStates)
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.issueNumber, input.issueNumber),
            eq(issueBoardStates.userId, ctx.userId)
          )
        )
        .limit(1);

      if (!current) throw new TRPCError({ code: 'NOT_FOUND', message: 'Board item not found' });

      const [updated] = await ctx.serverDB
        .update(issueBoardStates)
        .set({ kanbanStatus: input.kanbanStatus, updatedAt: new Date() })
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.issueNumber, input.issueNumber),
            eq(issueBoardStates.userId, ctx.userId)
          )
        )
        .returning();

      let enqueuedTask = null;

      if (input.kanbanStatus === 'todo') {
        if (current.assigneeType === 'agent' && current.assigneeAgentId) {
          enqueuedTask = await enqueueForAgent(ctx.serverDB, {
            agentId: current.assigneeAgentId,
            repoId: repo.id,
            repoFullName: repo.fullName,
            repoInstallationId: repo.installationId,
            issueNumber: input.issueNumber,
            issueTitle: current.issueTitle,
            issueHtmlUrl: current.issueHtmlUrl,
            userId: ctx.userId,
          });
        } else if (current.assigneeType === 'squad' && current.assigneeSquadId) {
          // Resolve squad leader then enqueue for them
          const [squad] = await ctx.serverDB
            .select({ leaderAgentId: squads.leaderAgentId })
            .from(squads)
            .where(and(eq(squads.id, current.assigneeSquadId), eq(squads.userId, ctx.userId)))
            .limit(1);
          if (squad?.leaderAgentId) {
            enqueuedTask = await enqueueForAgent(ctx.serverDB, {
              agentId: squad.leaderAgentId,
              repoId: repo.id,
              repoFullName: repo.fullName,
              repoInstallationId: repo.installationId,
              issueNumber: input.issueNumber,
              issueTitle: current.issueTitle,
              issueHtmlUrl: current.issueHtmlUrl,
              userId: ctx.userId,
            });
          }
        }
        // member assignee or unassigned → no auto-trigger, just update the column
      }

      if (input.kanbanStatus === 'backlog') {
        // Cancel any active tasks when the card is moved back to backlog
        await cancelActiveTasksForIssue(ctx.serverDB, {
          repositoryId: repo.id,
          issueNumber: input.issueNumber,
          userId: ctx.userId,
        });
      }

      return { boardState: updated, enqueuedTask };
    }),

  updateAssignee: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
        assigneeType: z.enum(['agent', 'member', 'squad']).nullable(),
        assigneeAgentId: z.string().uuid().nullable().optional(),
        assigneeMemberId: z.string().uuid().nullable().optional(),
        assigneeSquadId: z.string().uuid().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const [updated] = await ctx.serverDB
        .update(issueBoardStates)
        .set({
          assigneeType: input.assigneeType,
          assigneeAgentId: input.assigneeAgentId ?? null,
          assigneeMemberId: input.assigneeMemberId ?? null,
          assigneeSquadId: input.assigneeSquadId ?? null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.issueNumber, input.issueNumber),
            eq(issueBoardStates.userId, ctx.userId)
          )
        )
        .returning();

      if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: 'Board item not found' });

      return updated;
    }),

  removeFromBoard: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      await ctx.serverDB
        .delete(issueBoardStates)
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.issueNumber, input.issueNumber),
            eq(issueBoardStates.userId, ctx.userId)
          )
        );

      return { success: true };
    }),

  /**
   * Fetch all open GitHub issues and upsert them into the board.
   * For new issues, kanban status is inferred from the latest agent_task.
   * For issues already on the board, kanban status is preserved.
   */
  syncFromGitHub: boardProcedure
    .input(z.object({ repositoryFullName: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const token = await generateInstallationToken(repo.installationId);
      const [owner, repoName] = repo.fullName.split('/');

      // Fetch all open issues (up to 10 pages × 100)
      const allIssues: Array<{ number: number; title: string; html_url: string }> = [];
      for (let page = 1; page <= 10; page++) {
        const url = `https://api.github.com/repos/${owner}/${repoName}/issues?state=open&per_page=100&page=${page}`;
        const res = await fetch(url, {
          headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' },
        });
        if (!res.ok) break;
        const data = await res.json() as Array<{
          number: number; title: string; html_url: string; pull_request?: unknown;
        }>;
        const issues = data.filter((i) => !i.pull_request);
        allIssues.push(...issues);
        if (data.length < 100) break;
      }

      if (allIssues.length === 0) return { synced: 0 };

      // Get latest task per issue number for this repository
      const taskRows = await ctx.serverDB
        .select({ issueNumber: agentTasks.issueNumber, status: agentTasks.status, createdAt: agentTasks.createdAt })
        .from(agentTasks)
        .where(and(eq(agentTasks.repositoryId, repo.id), eq(agentTasks.userId, ctx.userId)))
        .orderBy(desc(agentTasks.createdAt));

      const latestTaskByIssue = new Map<number, string>();
      for (const row of taskRows) {
        if (row.issueNumber != null && !latestTaskByIssue.has(row.issueNumber)) {
          latestTaskByIssue.set(row.issueNumber, row.status);
        }
      }

      // Upsert — preserve kanban status for issues already on the board
      await ctx.serverDB
        .insert(issueBoardStates)
        .values(
          allIssues.map((issue) => ({
            repositoryId: repo.id,
            userId: ctx.userId,
            issueNumber: issue.number,
            issueTitle: issue.title,
            issueHtmlUrl: issue.html_url,
            kanbanStatus: inferKanbanStatus(latestTaskByIssue.get(issue.number) ?? null),
          }))
        )
        .onConflictDoUpdate({
          target: [issueBoardStates.repositoryId, issueBoardStates.issueNumber],
          set: { issueTitle: issueBoardStates.issueTitle, issueHtmlUrl: issueBoardStates.issueHtmlUrl, updatedAt: new Date() },
        });

      return { synced: allIssues.length };
    }),

  /** Create a new GitHub issue and add it to the board in Backlog. */
  createIssue: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        title: z.string().min(1),
        body: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const token = await generateInstallationToken(repo.installationId);
      const [owner, repoName] = repo.fullName.split('/');

      const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues`, {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: input.title, body: input.body ?? '' }),
      });

      if (!res.ok) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create GitHub issue' });
      }

      const created = await res.json() as { number: number; title: string; html_url: string };

      const [row] = await ctx.serverDB
        .insert(issueBoardStates)
        .values({
          repositoryId: repo.id,
          userId: ctx.userId,
          issueNumber: created.number,
          issueTitle: created.title,
          issueHtmlUrl: created.html_url,
          kanbanStatus: 'backlog',
        })
        .returning();

      return row;
    }),
});

export type IssueBoardStateRouter = typeof issueBoardStateRouter;
