import { z } from 'zod';
import { eq, and, desc, asc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { agentTasks, agentTaskLogs, repositories } from '@/database/schemas';

const agentTaskProcedure = authedProcedure.use(serverDatabase);

const CANCELLABLE_STATUSES = ['queued', 'dispatched', 'running'] as const;

export const agentTaskRouter = router({
  getByRepository: agentTaskProcedure
    .input(z.object({ repositoryFullName: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [repo] = await ctx.serverDB
        .select({ id: repositories.id })
        .from(repositories)
        .where(
          and(
            eq(repositories.fullName, input.repositoryFullName),
            eq(repositories.userId, ctx.userId)
          )
        )
        .limit(1);

      if (!repo) return [];

      return ctx.serverDB
        .select()
        .from(agentTasks)
        .where(
          and(
            eq(agentTasks.repositoryId, repo.id),
            eq(agentTasks.userId, ctx.userId)
          )
        )
        .orderBy(desc(agentTasks.createdAt));
    }),

  getByIssue: agentTaskProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [repo] = await ctx.serverDB
        .select({ id: repositories.id })
        .from(repositories)
        .where(
          and(
            eq(repositories.fullName, input.repositoryFullName),
            eq(repositories.userId, ctx.userId)
          )
        )
        .limit(1);

      if (!repo) return [];

      return ctx.serverDB
        .select()
        .from(agentTasks)
        .where(
          and(
            eq(agentTasks.repositoryId, repo.id),
            eq(agentTasks.issueNumber, input.issueNumber),
            eq(agentTasks.userId, ctx.userId)
          )
        )
        .orderBy(desc(agentTasks.createdAt));
    }),

  getLogs: agentTaskProcedure
    .input(z.object({ taskId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [task] = await ctx.serverDB
        .select({ id: agentTasks.id })
        .from(agentTasks)
        .where(and(eq(agentTasks.id, input.taskId), eq(agentTasks.userId, ctx.userId)))
        .limit(1);

      if (!task) throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });

      return ctx.serverDB
        .select()
        .from(agentTaskLogs)
        .where(eq(agentTaskLogs.taskId, input.taskId))
        .orderBy(asc(agentTaskLogs.createdAt));
    }),

  cancel: agentTaskProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [task] = await ctx.serverDB
        .select({ id: agentTasks.id, status: agentTasks.status })
        .from(agentTasks)
        .where(and(eq(agentTasks.id, input.id), eq(agentTasks.userId, ctx.userId)))
        .limit(1);

      if (!task) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
      }

      if (!CANCELLABLE_STATUSES.includes(task.status as typeof CANCELLABLE_STATUSES[number])) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot cancel a task with status '${task.status}'`,
        });
      }

      const [updated] = await ctx.serverDB
        .update(agentTasks)
        .set({ status: 'cancelled', failureReason: 'cancelled_by_user' })
        .where(and(eq(agentTasks.id, input.id), eq(agentTasks.userId, ctx.userId)))
        .returning();

      return updated;
    }),
});

export type AgentTaskRouter = typeof agentTaskRouter;
