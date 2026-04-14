import { z } from 'zod';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { SlackIntegrationModel } from '@/database/models/slackIntegration';

const slackProcedure = authedProcedure
  .use(serverDatabase)
  .use(async (opts) => {
    const { ctx } = opts;
    return opts.next({
      ctx: {
        slackModel: new SlackIntegrationModel(ctx.serverDB, ctx.userId),
      },
    });
  });

export const slackRouter = router({
  getIntegration: slackProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.slackModel.getByOrganization(input.organizationId);
    }),

  updateNotificationSettings: slackProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        notifyPrReviews: z.boolean().optional(),
        notifyArchitectureViolations: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId, ...settings } = input;
      await ctx.slackModel.updateNotificationSettings(organizationId, settings);
      return { success: true };
    }),

  disconnect: slackProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.slackModel.disconnect(input.organizationId);
      return { success: true };
    }),
});
