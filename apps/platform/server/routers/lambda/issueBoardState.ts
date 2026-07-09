import { z } from 'zod';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import {
  issueBoardStates,
  agentTasks,
  squads,
  issueLabels,
  issueBoardStateLabels,
  issueAssignees,
  issueAttachments,
  teamInvitations,
} from '@/database/schemas';
import { enqueueForAgent } from '@/lib/enqueueForAgent';
import { generateGithubAppJwt } from '@/lib/generate-github-app-jwt';
import { resolveRepo } from './_shared/resolveRepo';

type KanbanStatus = typeof KANBAN_STATUSES[number];

async function generateInstallationToken(installationId: string): Promise<string> {
  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${generateGithubAppJwt()}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create installation token: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.token;
}

function inferKanbanStatus(taskStatus: string | null, taskType?: string | null): KanbanStatus {
  if (!taskStatus) return 'backlog';
  if (taskType === 'planning') {
    // A planning run never auto-advances the column — the human decides when to move to 'todo'.
    return 'planning';
  }
  if (taskStatus === 'queued') return 'todo';
  if (['dispatched', 'running', 'waiting_local_directory'].includes(taskStatus)) return 'in_progress';
  if (taskStatus === 'waiting_for_user') return 'waiting_for_user';
  if (taskStatus === 'completed') return 'in_review';
  if (taskStatus === 'failed') return 'blocked';
  return 'backlog';
}

const boardProcedure = authedProcedure.use(serverDatabase);

const KANBAN_STATUSES = ['backlog', 'planning', 'todo', 'in_progress', 'in_review', 'done', 'blocked', 'waiting_for_user'] as const;
const PRIORITIES = ['no_priority', 'urgent', 'high', 'medium', 'low'] as const;
const EXECUTION_MODES = ['plan', 'auto_accept_edits', 'ask_before_edits', 'auto'] as const;
type ExecutionMode = typeof EXECUTION_MODES[number];

const ACTIVE_TASK_STATUSES = ['queued', 'dispatched', 'running', 'waiting_local_directory'] as const;

const assigneeInput = z.object({
  assigneeType: z.enum(['agent', 'member']),
  assigneeAgentId: z.string().uuid().optional(),
  assigneeMemberId: z.string().uuid().optional(),
});

const attachmentInput = z.object({
  url: z.string().url(),
  fileName: z.string().min(1),
  contentType: z.string().optional(),
});

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

/** Fetch and stitch labels/assignees/attachments onto a list of board rows. */
async function attachRelations(
  db: typeof import('@/database').serverDB,
  boardRows: (typeof issueBoardStates.$inferSelect)[]
) {
  const ids = boardRows.map((r) => r.id);
  if (ids.length === 0) {
    return boardRows.map((row) => ({ ...row, labels: [], assignees: [], attachments: [] }));
  }

  const [labelLinks, assigneeRows, attachmentRows] = await Promise.all([
    db
      .select({
        issueBoardStateId: issueBoardStateLabels.issueBoardStateId,
        id: issueLabels.id,
        repositoryId: issueLabels.repositoryId,
        name: issueLabels.name,
        color: issueLabels.color,
      })
      .from(issueBoardStateLabels)
      .innerJoin(issueLabels, eq(issueBoardStateLabels.labelId, issueLabels.id))
      .where(inArray(issueBoardStateLabels.issueBoardStateId, ids)),
    db.select().from(issueAssignees).where(inArray(issueAssignees.issueBoardStateId, ids)),
    db.select().from(issueAttachments).where(inArray(issueAttachments.issueBoardStateId, ids)),
  ]);

  return boardRows.map((row) => ({
    ...row,
    labels: labelLinks
      .filter((l) => l.issueBoardStateId === row.id)
      .map(({ id, repositoryId, name, color }) => ({ id, repositoryId, name, color })),
    assignees: assigneeRows
      .filter((a) => a.issueBoardStateId === row.id)
      .map(({ id, assigneeType, assigneeAgentId, assigneeMemberId }) => ({
        id,
        assigneeType: assigneeType as 'agent' | 'member',
        assigneeAgentId,
        assigneeMemberId,
      })),
    attachments: attachmentRows
      .filter((a) => a.issueBoardStateId === row.id)
      .map(({ id, url, fileName, contentType }) => ({ id, url, fileName, contentType })),
  }));
}

export const issueBoardStateRouter = router({
  getByRepository: boardProcedure
    .input(z.object({ repositoryFullName: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) return [];

      const boardRows = await ctx.serverDB
        .select()
        .from(issueBoardStates)
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.userId, ctx.userId)
          )
        );

      return attachRelations(ctx.serverDB, boardRows);
    }),

  getAssignableMembers: boardProcedure
    .input(z.object({ repositoryFullName: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo || !repo.organizationId) return [];

      return ctx.serverDB
        .select({
          id: teamInvitations.id,
          fullName: teamInvitations.fullName,
          email: teamInvitations.email,
        })
        .from(teamInvitations)
        .where(eq(teamInvitations.organizationId, repo.organizationId));
    }),

  addToBoard: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
        issueTitle: z.string().min(1),
        issueHtmlUrl: z.string().optional(),
        priority: z.enum(PRIORITIES).optional(),
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
          priority: input.priority ?? 'no_priority',
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

      const [full] = await attachRelations(ctx.serverDB, [row]);
      return full;
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

      const enqueuedTasks: unknown[] = [];

      if (input.kanbanStatus === 'todo' || input.kanbanStatus === 'planning') {
        const executionMode = (current.executionMode as ExecutionMode) ?? 'auto_accept_edits';
        const taskType = executionMode === 'plan' ? 'planning' : 'implementation';

        const assignees = await ctx.serverDB
          .select()
          .from(issueAssignees)
          .where(eq(issueAssignees.issueBoardStateId, current.id));

        const agentAssignees = assignees.filter((a) => a.assigneeType === 'agent' && a.assigneeAgentId);

        for (const a of agentAssignees) {
          const task = await enqueueForAgent(ctx.serverDB, {
            agentId: a.assigneeAgentId!,
            repoId: repo.id,
            repoFullName: repo.fullName,
            repoInstallationId: repo.installationId,
            issueNumber: input.issueNumber,
            issueTitle: current.issueTitle,
            issueHtmlUrl: current.issueHtmlUrl,
            userId: ctx.userId,
            issueBoardStateId: current.id,
            taskType,
            executionMode,
          });
          if (task) enqueuedTasks.push(task);
        }

        if (current.assigneeSquadId) {
          // Resolve squad leader then enqueue for them
          const [squad] = await ctx.serverDB
            .select({ leaderAgentId: squads.leaderAgentId })
            .from(squads)
            .where(and(eq(squads.id, current.assigneeSquadId), eq(squads.userId, ctx.userId)))
            .limit(1);
          if (squad?.leaderAgentId) {
            const task = await enqueueForAgent(ctx.serverDB, {
              agentId: squad.leaderAgentId,
              repoId: repo.id,
              repoFullName: repo.fullName,
              repoInstallationId: repo.installationId,
              issueNumber: input.issueNumber,
              issueTitle: current.issueTitle,
              issueHtmlUrl: current.issueHtmlUrl,
              userId: ctx.userId,
              issueBoardStateId: current.id,
              taskType,
              executionMode,
            });
            if (task) enqueuedTasks.push(task);
          }
        }
      }

      if (input.kanbanStatus === 'backlog') {
        // Cancel any active tasks when the card is moved back to backlog
        await cancelActiveTasksForIssue(ctx.serverDB, {
          repositoryId: repo.id,
          issueNumber: input.issueNumber,
          userId: ctx.userId,
        });
      }

      const [full] = await attachRelations(ctx.serverDB, [updated]);
      return { boardState: full, enqueuedTasks };
    }),

  updatePriority: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
        priority: z.enum(PRIORITIES),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const [updated] = await ctx.serverDB
        .update(issueBoardStates)
        .set({ priority: input.priority, updatedAt: new Date() })
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.issueNumber, input.issueNumber),
            eq(issueBoardStates.userId, ctx.userId)
          )
        )
        .returning();

      if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: 'Board item not found' });

      const [full] = await attachRelations(ctx.serverDB, [updated]);
      return full;
    }),

  updateExecutionMode: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
        executionMode: z.enum(EXECUTION_MODES),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const [updated] = await ctx.serverDB
        .update(issueBoardStates)
        .set({ executionMode: input.executionMode, updatedAt: new Date() })
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.issueNumber, input.issueNumber),
            eq(issueBoardStates.userId, ctx.userId)
          )
        )
        .returning();

      if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: 'Board item not found' });

      const [full] = await attachRelations(ctx.serverDB, [updated]);
      return full;
    }),

  addAssignee: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
      }).merge(assigneeInput)
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const [board] = await ctx.serverDB
        .select({ id: issueBoardStates.id })
        .from(issueBoardStates)
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.issueNumber, input.issueNumber),
            eq(issueBoardStates.userId, ctx.userId)
          )
        )
        .limit(1);
      if (!board) throw new TRPCError({ code: 'NOT_FOUND', message: 'Board item not found' });

      await ctx.serverDB
        .insert(issueAssignees)
        .values({
          issueBoardStateId: board.id,
          userId: ctx.userId,
          assigneeType: input.assigneeType,
          assigneeAgentId: input.assigneeAgentId ?? null,
          assigneeMemberId: input.assigneeMemberId ?? null,
        })
        .onConflictDoNothing();

      const [row] = await ctx.serverDB
        .select()
        .from(issueBoardStates)
        .where(eq(issueBoardStates.id, board.id))
        .limit(1);
      const [full] = await attachRelations(ctx.serverDB, [row]);
      return full;
    }),

  removeAssignee: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
        assigneeId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const [board] = await ctx.serverDB
        .select({ id: issueBoardStates.id })
        .from(issueBoardStates)
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.issueNumber, input.issueNumber),
            eq(issueBoardStates.userId, ctx.userId)
          )
        )
        .limit(1);
      if (!board) throw new TRPCError({ code: 'NOT_FOUND', message: 'Board item not found' });

      await ctx.serverDB
        .delete(issueAssignees)
        .where(and(eq(issueAssignees.id, input.assigneeId), eq(issueAssignees.issueBoardStateId, board.id)));

      const [row] = await ctx.serverDB
        .select()
        .from(issueBoardStates)
        .where(eq(issueBoardStates.id, board.id))
        .limit(1);
      const [full] = await attachRelations(ctx.serverDB, [row]);
      return full;
    }),

  updateSquadAssignee: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
        assigneeSquadId: z.string().uuid().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const [updated] = await ctx.serverDB
        .update(issueBoardStates)
        .set({ assigneeSquadId: input.assigneeSquadId, updatedAt: new Date() })
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.issueNumber, input.issueNumber),
            eq(issueBoardStates.userId, ctx.userId)
          )
        )
        .returning();

      if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: 'Board item not found' });

      const [full] = await attachRelations(ctx.serverDB, [updated]);
      return full;
    }),

  addLabelToIssue: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
        labelId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const [board] = await ctx.serverDB
        .select({ id: issueBoardStates.id })
        .from(issueBoardStates)
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.issueNumber, input.issueNumber),
            eq(issueBoardStates.userId, ctx.userId)
          )
        )
        .limit(1);
      if (!board) throw new TRPCError({ code: 'NOT_FOUND', message: 'Board item not found' });

      await ctx.serverDB
        .insert(issueBoardStateLabels)
        .values({ issueBoardStateId: board.id, labelId: input.labelId, userId: ctx.userId })
        .onConflictDoNothing();

      const [row] = await ctx.serverDB
        .select()
        .from(issueBoardStates)
        .where(eq(issueBoardStates.id, board.id))
        .limit(1);
      const [full] = await attachRelations(ctx.serverDB, [row]);
      return full;
    }),

  removeLabelFromIssue: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
        labelId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const [board] = await ctx.serverDB
        .select({ id: issueBoardStates.id })
        .from(issueBoardStates)
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.issueNumber, input.issueNumber),
            eq(issueBoardStates.userId, ctx.userId)
          )
        )
        .limit(1);
      if (!board) throw new TRPCError({ code: 'NOT_FOUND', message: 'Board item not found' });

      await ctx.serverDB
        .delete(issueBoardStateLabels)
        .where(
          and(
            eq(issueBoardStateLabels.issueBoardStateId, board.id),
            eq(issueBoardStateLabels.labelId, input.labelId)
          )
        );

      const [row] = await ctx.serverDB
        .select()
        .from(issueBoardStates)
        .where(eq(issueBoardStates.id, board.id))
        .limit(1);
      const [full] = await attachRelations(ctx.serverDB, [row]);
      return full;
    }),

  addAttachment: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
      }).merge(attachmentInput)
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const [board] = await ctx.serverDB
        .select({ id: issueBoardStates.id })
        .from(issueBoardStates)
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.issueNumber, input.issueNumber),
            eq(issueBoardStates.userId, ctx.userId)
          )
        )
        .limit(1);
      if (!board) throw new TRPCError({ code: 'NOT_FOUND', message: 'Board item not found' });

      await ctx.serverDB.insert(issueAttachments).values({
        issueBoardStateId: board.id,
        userId: ctx.userId,
        url: input.url,
        fileName: input.fileName,
        contentType: input.contentType ?? null,
      });

      const [row] = await ctx.serverDB
        .select()
        .from(issueBoardStates)
        .where(eq(issueBoardStates.id, board.id))
        .limit(1);
      const [full] = await attachRelations(ctx.serverDB, [row]);
      return full;
    }),

  removeAttachment: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
        attachmentId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const [board] = await ctx.serverDB
        .select({ id: issueBoardStates.id })
        .from(issueBoardStates)
        .where(
          and(
            eq(issueBoardStates.repositoryId, repo.id),
            eq(issueBoardStates.issueNumber, input.issueNumber),
            eq(issueBoardStates.userId, ctx.userId)
          )
        )
        .limit(1);
      if (!board) throw new TRPCError({ code: 'NOT_FOUND', message: 'Board item not found' });

      await ctx.serverDB
        .delete(issueAttachments)
        .where(and(eq(issueAttachments.id, input.attachmentId), eq(issueAttachments.issueBoardStateId, board.id)));

      const [row] = await ctx.serverDB
        .select()
        .from(issueBoardStates)
        .where(eq(issueBoardStates.id, board.id))
        .limit(1);
      const [full] = await attachRelations(ctx.serverDB, [row]);
      return full;
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
        .select({ issueNumber: agentTasks.issueNumber, status: agentTasks.status, taskType: agentTasks.taskType, createdAt: agentTasks.createdAt })
        .from(agentTasks)
        .where(and(eq(agentTasks.repositoryId, repo.id), eq(agentTasks.userId, ctx.userId)))
        .orderBy(desc(agentTasks.createdAt));

      const latestTaskByIssue = new Map<number, { status: string; taskType: string }>();
      for (const row of taskRows) {
        if (row.issueNumber != null && !latestTaskByIssue.has(row.issueNumber)) {
          latestTaskByIssue.set(row.issueNumber, { status: row.status, taskType: row.taskType });
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
            kanbanStatus: inferKanbanStatus(
              latestTaskByIssue.get(issue.number)?.status ?? null,
              latestTaskByIssue.get(issue.number)?.taskType ?? null
            ),
          }))
        )
        .onConflictDoUpdate({
          target: [issueBoardStates.repositoryId, issueBoardStates.issueNumber],
          set: { issueTitle: issueBoardStates.issueTitle, issueHtmlUrl: issueBoardStates.issueHtmlUrl, updatedAt: new Date() },
        });

      return { synced: allIssues.length };
    }),

  /** Close a GitHub issue and remove it from the board. */
  deleteIssue: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      // Cancel any active tasks first
      await cancelActiveTasksForIssue(ctx.serverDB, {
        repositoryId: repo.id,
        issueNumber: input.issueNumber,
        userId: ctx.userId,
      });

      // Close the issue on GitHub (GitHub does not support deleting issues via API)
      const token = await generateInstallationToken(repo.installationId);
      const [owner, repoName] = repo.fullName.split('/');

      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/issues/${input.issueNumber}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ state: 'closed' }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to close GitHub issue: ${JSON.stringify(error)}`,
        });
      }

      // Remove from board (cascade deletes labels, assignees, attachments via DB constraints)
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

  /** Create a new GitHub issue and add it to the board. Priority/labels/assignees/attachments are app-internal only (not pushed to GitHub). */
  createIssue: boardProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        title: z.string().min(1),
        body: z.string().optional(),
        priority: z.enum(PRIORITIES).optional(),
        kanbanStatus: z.enum(KANBAN_STATUSES).optional(),
        executionMode: z.enum(EXECUTION_MODES).optional(),
        labelIds: z.array(z.string().uuid()).optional(),
        assignees: z.array(assigneeInput).optional(),
        attachments: z.array(attachmentInput).optional(),
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
          kanbanStatus: input.kanbanStatus ?? 'backlog',
          priority: input.priority ?? 'no_priority',
          executionMode: input.executionMode ?? 'auto_accept_edits',
        })
        .returning();

      if (input.labelIds?.length) {
        await ctx.serverDB
          .insert(issueBoardStateLabels)
          .values(input.labelIds.map((labelId) => ({ issueBoardStateId: row.id, labelId, userId: ctx.userId })))
          .onConflictDoNothing();
      }

      if (input.assignees?.length) {
        await ctx.serverDB
          .insert(issueAssignees)
          .values(
            input.assignees.map((a) => ({
              issueBoardStateId: row.id,
              userId: ctx.userId,
              assigneeType: a.assigneeType,
              assigneeAgentId: a.assigneeAgentId ?? null,
              assigneeMemberId: a.assigneeMemberId ?? null,
            }))
          )
          .onConflictDoNothing();
      }

      if (input.attachments?.length) {
        await ctx.serverDB.insert(issueAttachments).values(
          input.attachments.map((a) => ({
            issueBoardStateId: row.id,
            userId: ctx.userId,
            url: a.url,
            fileName: a.fileName,
            contentType: a.contentType ?? null,
          }))
        );
      }

      const [full] = await attachRelations(ctx.serverDB, [row]);
      return full;
    }),
});

export type IssueBoardStateRouter = typeof issueBoardStateRouter;
