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
  getAll: inviteProcedure.query(async ({ ctx }) => {
    return ctx.inviteService.getAll();
  }),

  sendInvite: inviteProcedure
    .input(
      z.object({
        fullName: z.string().min(1),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.inviteService.sendInvite({
        fullName: input.fullName,
        email: input.email,
      });
    }),
});
