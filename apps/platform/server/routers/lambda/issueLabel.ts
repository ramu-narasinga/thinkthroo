import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { issueLabels } from '@/database/schemas';
import { resolveRepo } from './_shared/resolveRepo';

const labelProcedure = authedProcedure.use(serverDatabase);

export const issueLabelRouter = router({
  getByRepository: labelProcedure
    .input(z.object({ repositoryFullName: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) return [];

      return ctx.serverDB
        .select()
        .from(issueLabels)
        .where(and(eq(issueLabels.repositoryId, repo.id), eq(issueLabels.userId, ctx.userId)));
    }),

  create: labelProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        name: z.string().min(1).max(50),
        color: z.string().regex(/^[0-9a-fA-F]{6}$/),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const [row] = await ctx.serverDB
        .insert(issueLabels)
        .values({
          repositoryId: repo.id,
          userId: ctx.userId,
          name: input.name,
          color: input.color,
        })
        .onConflictDoNothing({ target: [issueLabels.repositoryId, issueLabels.name] })
        .returning();

      if (row) return row;

      // Label with this name already exists — return the existing row.
      const [existing] = await ctx.serverDB
        .select()
        .from(issueLabels)
        .where(and(eq(issueLabels.repositoryId, repo.id), eq(issueLabels.name, input.name)))
        .limit(1);
      return existing;
    }),

  delete: labelProcedure
    .input(z.object({ repositoryFullName: z.string().min(1), labelId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const repo = await resolveRepo(ctx.serverDB, input.repositoryFullName, ctx.userId);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      await ctx.serverDB
        .delete(issueLabels)
        .where(
          and(
            eq(issueLabels.id, input.labelId),
            eq(issueLabels.repositoryId, repo.id),
            eq(issueLabels.userId, ctx.userId)
          )
        );

      return { success: true };
    }),
});

export type IssueLabelRouter = typeof issueLabelRouter;
