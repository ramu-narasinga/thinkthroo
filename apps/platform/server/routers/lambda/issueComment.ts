import { z } from 'zod';
import { eq, and, asc } from 'drizzle-orm';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { issueComments, repositories } from '@/database/schemas';

const issueCommentProcedure = authedProcedure.use(serverDatabase);

export const issueCommentRouter = router({
  getByIssue: issueCommentProcedure
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
        .from(issueComments)
        .where(
          and(
            eq(issueComments.repositoryId, repo.id),
            eq(issueComments.issueNumber, input.issueNumber),
            eq(issueComments.userId, ctx.userId)
          )
        )
        .orderBy(asc(issueComments.createdAt));
    }),

  create: issueCommentProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
        body: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      if (!repo) throw new Error('Repository not found');

      const [comment] = await ctx.serverDB
        .insert(issueComments)
        .values({
          repositoryId: repo.id,
          issueNumber: input.issueNumber,
          userId: ctx.userId,
          authorType: 'user',
          body: input.body,
        })
        .returning();

      return comment;
    }),
});

export type IssueCommentRouter = typeof issueCommentRouter;
