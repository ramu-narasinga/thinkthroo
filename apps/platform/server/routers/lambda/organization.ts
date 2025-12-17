import { z } from 'zod';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { OrganizationModel } from '@/database/models/organization';
import { OrganizationService } from '@/server/service/organization';

const organizationProcedure = authedProcedure
  .use(serverDatabase)
  .use(async (opts) => {
    const { ctx } = opts;

    return opts.next({
      ctx: {
        organizationModel: new OrganizationModel(ctx.serverDB, ctx.userId),
        organizationService: new OrganizationService(ctx.serverDB, ctx.userId),
      },
    });
  });

export const organizationRouter = router({
  /**
   * Get all organizations for the current user
   */
  getAll: organizationProcedure.query(async ({ ctx }) => {
    return ctx.organizationService.getAll();
  }),

  /**
   * Get organization by ID
   */
  getById: organizationProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.organizationService.getById(input.id);
    }),

  /**
   * Get organization by GitHub org ID
   */
  getByGithubOrgId: organizationProcedure
    .input(
      z.object({
        githubOrgId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.organizationService.getByGithubOrgId(input.githubOrgId);
    }),

  /**
   * Sync organizations from GitHub
   * Requires access token from the session
   */
  syncFromGitHub: organizationProcedure
    .input(
      z.object({
        accessToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.organizationService.syncFromGitHub(input.accessToken);
    }),

  /**
   * Delete organization by ID
   */
  delete: organizationProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.organizationService.delete(input.id);
    }),
});
