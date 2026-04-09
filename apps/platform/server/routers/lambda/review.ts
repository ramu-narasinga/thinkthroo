import { z } from 'zod';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { ReviewModel } from '@/database/models/review';

const reviewProcedure = authedProcedure
  .use(serverDatabase)
  .use(async (opts) => {
    const { ctx } = opts;
    return opts.next({
      ctx: {
        reviewModel: new ReviewModel(ctx.serverDB, ctx.userId),
      },
    });
  });

export const reviewRouter = router({
  getByRepository: reviewProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.reviewModel.getByRepository(
        input.repositoryFullName,
        input.page,
        input.pageSize,
      );
      return rows.map((r) => ({
        ...r,
        summaryPoints: JSON.parse(r.summaryPoints) as string[],
        creditsDeducted: Number(r.creditsDeducted),
      }));
    }),

  getArchitectureResults: reviewProcedure
    .input(z.object({ prReviewId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.reviewModel.getArchitectureResults(input.prReviewId);
      return rows.map((r) => ({
        ...r,
        violations: JSON.parse(r.violations) as { startLine: number; endLine: number; comment: string }[],
        docReferences: JSON.parse(r.docReferences) as { name: string; excerpt: string; documentId: string | null }[],
      }));
    }),
});
