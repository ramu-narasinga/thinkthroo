import { z } from 'zod';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { InviteService } from '@/server/service/invite';

const inviteProcedure = authedProcedure
  .use(serverDatabase)
  .use(async (opts) => {
    const { ctx } = opts;
    return opts.next({
      ctx: {
        ...ctx,
        inviteService: new InviteService(ctx.serverDB, ctx.userId),
      },
    });
  });

export const inviteRouter = router({
  getAll: inviteProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.inviteService.getAll(input.organizationId);
    }),

  sendInvite: inviteProcedure
    .input(
      z.object({
        fullName: z.string().min(1),
        email: z.string().email(),
        organizationId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.inviteService.sendInvite({
        fullName: input.fullName,
        email: input.email,
        organizationId: input.organizationId,
      });
    }),
});
