import { z } from 'zod';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { ReviewModel } from '@/database/models/review';

const analyticsProcedure = authedProcedure
  .use(serverDatabase)
  .use(async (opts) => {
    const { ctx } = opts;
    return opts.next({
      ctx: {
        reviewModel: new ReviewModel(ctx.serverDB, ctx.userId),
      },
    });
  });

export const analyticsRouter = router({
  getWeekly: analyticsProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        repositoryFullName: z.string().optional(),
        weeks: z.number().int().min(1).max(52).default(8),
      })
    )
    .query(async ({ ctx, input }) => {
      const endDate = new Date().toISOString();
      const startDate = new Date(
        Date.now() - input.weeks * 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      const rows = await ctx.reviewModel.getWeeklyAnalytics(
        input.organizationId,
        startDate,
        endDate,
        input.repositoryFullName,
      );

      return rows.map((r) => ({
        week: r.week,
        weekStart: r.weekStart,
        prsReviewed: Number(r.prsReviewed),
        totalViolations: Number(r.totalViolations),
        avgComplianceScore: Number(r.avgComplianceScore),
        cleanPrs: Number(r.cleanPrs),
        cleanPrRate:
          Number(r.prsReviewed) > 0
            ? Math.round((Number(r.cleanPrs) / Number(r.prsReviewed)) * 100)
            : 100,
      }));
    }),

  getHotspots: analyticsProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        repositoryFullName: z.string().optional(),
        weeks: z.number().int().min(1).max(52).default(8),
        limit: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const endDate = new Date().toISOString();
      const startDate = new Date(
        Date.now() - input.weeks * 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      const [files, rulesRaw] = await Promise.all([
        ctx.reviewModel.getHotspotFiles(
          input.organizationId,
          startDate,
          endDate,
          input.repositoryFullName,
          input.limit,
        ),
        ctx.reviewModel.getTopViolatedRules(
          input.organizationId,
          startDate,
          endDate,
          input.repositoryFullName,
          input.limit,
        ),
      ]);

      const rules = (rulesRaw as any[]).map((r: any) => ({
        ruleName: r.rule_name as string,
        violationCount: Number(r.violation_count),
        prCount: Number(r.pr_count),
      }));

      return {
        files: files.map((f) => ({
          filename: f.filename,
          totalViolations: Number(f.totalViolations),
          avgScore: Number(f.avgScore),
          prCount: Number(f.prCount),
        })),
        rules,
      };
    }),
});
