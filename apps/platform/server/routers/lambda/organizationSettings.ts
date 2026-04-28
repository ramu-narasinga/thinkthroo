import { z } from 'zod';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { OrganizationSettingsModel } from '@/database/models/organizationSettings';

const settingsInput = z.object({
  enableReviews: z.boolean().optional(),
  enablePrSummary: z.boolean().optional(),
  enableInlineReviewComments: z.boolean().optional(),
  enableArchitectureReview: z.boolean().optional(),
  reviewLanguage: z.string().nullable().optional(),
  toneInstructions: z.string().nullable().optional(),
  pathFilters: z.array(z.string()).optional(),
  autoPauseAfterReviewedCommits: z.number().int().min(0).optional(),
});

const organizationSettingsProcedure = authedProcedure
  .use(serverDatabase)
  .use(async (opts) => {
    const { ctx } = opts;
    return opts.next({
      ctx: {
        organizationSettingsModel: new OrganizationSettingsModel(ctx.serverDB, ctx.userId),
      },
    });
  });

export const organizationSettingsRouter = router({
  get: organizationSettingsProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.organizationSettingsModel.getByOrganization(input.organizationId);
    }),

  upsert: organizationSettingsProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        settings: settingsInput,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.organizationSettingsModel.upsert(input.organizationId, input.settings);
      return { success: true };
    }),
});
