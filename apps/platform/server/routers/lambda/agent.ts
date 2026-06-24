import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { agents, repositories, daemonRuntimes } from '@/database/schemas';

const agentProcedure = authedProcedure.use(serverDatabase);

export const agentRouter = router({
  create: agentProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        name: z.string().min(1),
        description: z.string().max(255).optional().default(''),
        instructions: z.string().optional().default(''),
        model: z.string().optional().default('claude-sonnet-4-6'),
        visibility: z.enum(['personal', 'workspace']).optional().default('personal'),
        runtimeId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { repositoryFullName, runtimeId, ...rest } = input;

      const [repo] = await ctx.serverDB
        .select({ id: repositories.id })
        .from(repositories)
        .where(
          and(
            eq(repositories.fullName, repositoryFullName),
            eq(repositories.userId, ctx.userId)
          )
        )
        .limit(1);

      if (!repo) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Repository not found: ${repositoryFullName}` });
      }

      const [agent] = await ctx.serverDB
        .insert(agents)
        .values({
          repositoryId: repo.id,
          userId: ctx.userId,
          runtimeId: runtimeId ?? null,
          ...rest,
        })
        .returning();

      return agent;
    }),

  getByRepository: agentProcedure
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
        .from(agents)
        .where(
          and(
            eq(agents.repositoryId, repo.id),
            eq(agents.userId, ctx.userId)
          )
        );
    }),

  getById: agentProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [agent] = await ctx.serverDB
        .select()
        .from(agents)
        .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.userId)))
        .limit(1);

      if (!agent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent not found' });
      }

      return agent;
    }),

  update: agentProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        description: z.string().max(255).optional(),
        instructions: z.string().optional(),
        model: z.string().optional(),
        visibility: z.enum(['personal', 'workspace']).optional(),
        status: z.enum(['active', 'paused', 'archived']).optional(),
        runtimeId: z.string().uuid().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const [existing] = await ctx.serverDB
        .select({ id: agents.id })
        .from(agents)
        .where(and(eq(agents.id, id), eq(agents.userId, ctx.userId)))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent not found' });
      }

      const [updated] = await ctx.serverDB
        .update(agents)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(agents.id, id), eq(agents.userId, ctx.userId)))
        .returning();

      return updated;
    }),

  archive: agentProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.serverDB
        .select({ id: agents.id })
        .from(agents)
        .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.userId)))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent not found' });
      }

      const [updated] = await ctx.serverDB
        .update(agents)
        .set({ status: 'archived', updatedAt: new Date() })
        .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.userId)))
        .returning();

      return updated;
    }),

  getMyRuntimes: agentProcedure
    .query(async ({ ctx }) => {
      return ctx.serverDB
        .select()
        .from(daemonRuntimes)
        .where(eq(daemonRuntimes.userId, ctx.userId));
    }),
});

export type AgentRouter = typeof agentRouter;
