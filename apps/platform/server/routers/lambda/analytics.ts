import { z } from 'zod';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { ReviewModel } from '@/database/models/review';
import { agentTasks, agents, repositories } from '@/database/schemas';
import { sql, eq, and } from 'drizzle-orm';

// Approximate Claude Sonnet 4.6 pricing ($ per million tokens)
const INPUT_COST_PER_M = 3.0;
const OUTPUT_COST_PER_M = 15.0;
const CACHE_READ_COST_PER_M = 0.30;
const CACHE_WRITE_COST_PER_M = 3.75;

function calcCost(inputTokens: number, outputTokens: number, cacheRead: number, cacheWrite: number): number {
  return (
    inputTokens * INPUT_COST_PER_M +
    outputTokens * OUTPUT_COST_PER_M +
    cacheRead * CACHE_READ_COST_PER_M +
    cacheWrite * CACHE_WRITE_COST_PER_M
  ) / 1_000_000;
}

const agentAnalyticsProcedure = authedProcedure.use(serverDatabase);

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

  getAgentSummary: agentAnalyticsProcedure
    .input(z.object({ weeks: z.number().int().min(1).max(52).default(8) }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date(Date.now() - input.weeks * 7 * 24 * 60 * 60 * 1000).toISOString();

      const [row] = await ctx.serverDB
        .select({
          totalTasks: sql<number>`count(*)::int`,
          completedTasks: sql<number>`count(*) filter (where ${agentTasks.status} = 'completed')::int`,
          failedTasks: sql<number>`count(*) filter (where ${agentTasks.status} = 'failed')::int`,
          prsCreated: sql<number>`count(*) filter (where ${agentTasks.result} is not null and (${agentTasks.result})::jsonb->>'prUrl' is not null and (${agentTasks.result})::jsonb->>'prUrl' != '')::int`,
          totalInputTokens: sql<number>`coalesce(sum(${agentTasks.inputTokens}), 0)::int`,
          totalOutputTokens: sql<number>`coalesce(sum(${agentTasks.outputTokens}), 0)::int`,
          totalCacheReadTokens: sql<number>`coalesce(sum(${agentTasks.cacheReadTokens}), 0)::int`,
          totalCacheWriteTokens: sql<number>`coalesce(sum(${agentTasks.cacheWriteTokens}), 0)::int`,
        })
        .from(agentTasks)
        .where(and(
          eq(agentTasks.userId, ctx.userId),
          sql`${agentTasks.createdAt} >= ${startDate}::timestamptz`,
        ));

      if (!row) {
        return { totalTasks: 0, completedTasks: 0, failedTasks: 0, prsCreated: 0, totalInputTokens: 0, totalOutputTokens: 0, totalCacheReadTokens: 0, totalCacheWriteTokens: 0, estimatedCostUsd: 0 };
      }

      return {
        ...row,
        estimatedCostUsd: calcCost(row.totalInputTokens, row.totalOutputTokens, row.totalCacheReadTokens, row.totalCacheWriteTokens),
      };
    }),

  getAgentActivityByWeek: agentAnalyticsProcedure
    .input(z.object({ weeks: z.number().int().min(1).max(52).default(8) }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date(Date.now() - input.weeks * 7 * 24 * 60 * 60 * 1000).toISOString();

      const rows = await ctx.serverDB
        .select({
          week: sql<string>`to_char(date_trunc('week', ${agentTasks.createdAt}), 'MM/DD')`,
          weekStart: sql<string>`date_trunc('week', ${agentTasks.createdAt})::text`,
          implementation: sql<number>`count(*) filter (where ${agentTasks.taskType} = 'implementation' and ${agentTasks.status} = 'completed')::int`,
          test: sql<number>`count(*) filter (where ${agentTasks.taskType} = 'test' and ${agentTasks.status} = 'completed')::int`,
          review: sql<number>`count(*) filter (where ${agentTasks.taskType} = 'review' and ${agentTasks.status} = 'completed')::int`,
          prsCreated: sql<number>`count(*) filter (where ${agentTasks.result} is not null and (${agentTasks.result})::jsonb->>'prUrl' is not null and (${agentTasks.result})::jsonb->>'prUrl' != '')::int`,
        })
        .from(agentTasks)
        .where(and(
          eq(agentTasks.userId, ctx.userId),
          sql`${agentTasks.createdAt} >= ${startDate}::timestamptz`,
        ))
        .groupBy(sql`date_trunc('week', ${agentTasks.createdAt})`)
        .orderBy(sql`date_trunc('week', ${agentTasks.createdAt})`);

      return rows;
    }),

  getAgentLeaderboard: agentAnalyticsProcedure
    .input(z.object({ weeks: z.number().int().min(1).max(52).default(8) }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date(Date.now() - input.weeks * 7 * 24 * 60 * 60 * 1000).toISOString();

      const rows = await ctx.serverDB
        .select({
          agentId: agents.id,
          agentName: agents.name,
          tasksTotal: sql<number>`count(*)::int`,
          tasksCompleted: sql<number>`count(*) filter (where ${agentTasks.status} = 'completed')::int`,
          prsCreated: sql<number>`count(*) filter (where ${agentTasks.result} is not null and (${agentTasks.result})::jsonb->>'prUrl' is not null and (${agentTasks.result})::jsonb->>'prUrl' != '')::int`,
          totalInputTokens: sql<number>`coalesce(sum(${agentTasks.inputTokens}), 0)::int`,
          totalOutputTokens: sql<number>`coalesce(sum(${agentTasks.outputTokens}), 0)::int`,
          totalCacheReadTokens: sql<number>`coalesce(sum(${agentTasks.cacheReadTokens}), 0)::int`,
          totalCacheWriteTokens: sql<number>`coalesce(sum(${agentTasks.cacheWriteTokens}), 0)::int`,
          avgDurationSeconds: sql<number | null>`avg(extract(epoch from (${agentTasks.completedAt} - ${agentTasks.startedAt}))) filter (where ${agentTasks.status} = 'completed' and ${agentTasks.startedAt} is not null and ${agentTasks.completedAt} is not null)`,
        })
        .from(agentTasks)
        .innerJoin(agents, eq(agentTasks.agentId, agents.id))
        .where(and(
          eq(agentTasks.userId, ctx.userId),
          sql`${agentTasks.createdAt} >= ${startDate}::timestamptz`,
        ))
        .groupBy(agents.id, agents.name)
        .orderBy(sql`count(*) filter (where ${agentTasks.status} = 'completed') desc`);

      return rows.map((row) => ({
        agentId: row.agentId,
        agentName: row.agentName,
        tasksCompleted: row.tasksCompleted,
        prsCreated: row.prsCreated,
        successRate: row.tasksTotal > 0 ? Math.round((row.tasksCompleted / row.tasksTotal) * 100) : 0,
        totalTokens: row.totalInputTokens + row.totalOutputTokens + row.totalCacheReadTokens + row.totalCacheWriteTokens,
        estimatedCostUsd: calcCost(row.totalInputTokens, row.totalOutputTokens, row.totalCacheReadTokens, row.totalCacheWriteTokens),
        avgDurationMinutes: row.avgDurationSeconds != null ? Math.round((Number(row.avgDurationSeconds) / 60) * 10) / 10 : 0,
      }));
    }),

  getRepositoryBreakdown: agentAnalyticsProcedure
    .input(z.object({ weeks: z.number().int().min(1).max(52).default(8) }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date(Date.now() - input.weeks * 7 * 24 * 60 * 60 * 1000).toISOString();

      const rows = await ctx.serverDB
        .select({
          repositoryId: repositories.id,
          repositoryName: repositories.name,
          tasks: sql<number>`count(*)::int`,
          prsCreated: sql<number>`count(*) filter (where ${agentTasks.result} is not null and (${agentTasks.result})::jsonb->>'prUrl' is not null and (${agentTasks.result})::jsonb->>'prUrl' != '')::int`,
          totalInputTokens: sql<number>`coalesce(sum(${agentTasks.inputTokens}), 0)::int`,
          totalOutputTokens: sql<number>`coalesce(sum(${agentTasks.outputTokens}), 0)::int`,
          totalCacheReadTokens: sql<number>`coalesce(sum(${agentTasks.cacheReadTokens}), 0)::int`,
          totalCacheWriteTokens: sql<number>`coalesce(sum(${agentTasks.cacheWriteTokens}), 0)::int`,
        })
        .from(agentTasks)
        .innerJoin(repositories, eq(agentTasks.repositoryId, repositories.id))
        .where(and(
          eq(agentTasks.userId, ctx.userId),
          sql`${agentTasks.createdAt} >= ${startDate}::timestamptz`,
        ))
        .groupBy(repositories.id, repositories.name)
        .orderBy(sql`count(*) desc`);

      return rows.map((row) => ({
        repositoryId: row.repositoryId,
        repositoryName: row.repositoryName,
        tasks: row.tasks,
        prsCreated: row.prsCreated,
        totalTokens: row.totalInputTokens + row.totalOutputTokens,
        estimatedCostUsd: calcCost(row.totalInputTokens, row.totalOutputTokens, row.totalCacheReadTokens, row.totalCacheWriteTokens),
      }));
    }),
});
