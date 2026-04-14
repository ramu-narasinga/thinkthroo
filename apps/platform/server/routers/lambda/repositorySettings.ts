import { z } from 'zod';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { RepositorySettingsModel } from '@/database/models/repositorySettings';

const settingsInput = z.object({
  useOrganizationSettings: z.boolean().optional(),
  enableReviews: z.boolean().optional(),
  enablePrSummary: z.boolean().optional(),
  enableInlineReviewComments: z.boolean().optional(),
  enableArchitectureReview: z.boolean().optional(),
  reviewLanguage: z.string().nullable().optional(),
  toneInstructions: z.string().nullable().optional(),
  pathFilters: z.array(z.string()).optional(),
});

const repositorySettingsProcedure = authedProcedure
  .use(serverDatabase)
  .use(async (opts) => {
    const { ctx } = opts;
    return opts.next({
      ctx: {
        repositorySettingsModel: new RepositorySettingsModel(ctx.serverDB, ctx.userId),
      },
    });
  });

export const repositorySettingsRouter = router({
  get: repositorySettingsProcedure
    .input(z.object({ repositoryFullName: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.repositorySettingsModel.getByRepositoryFullName(input.repositoryFullName);
    }),

  upsert: repositorySettingsProcedure
    .input(
      z.object({
        repositoryId: z.string().uuid(),
        organizationId: z.string().uuid(),
        settings: settingsInput,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.repositorySettingsModel.upsert(
        input.repositoryId,
        input.organizationId,
        input.settings,
      );
      return { success: true };
    }),
});
