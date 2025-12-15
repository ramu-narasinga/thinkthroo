import { z } from 'zod';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { InstallationService } from '@/service/installation';

const installationProcedure = authedProcedure
  .use(serverDatabase)
  .use(async (opts) => {
    const { ctx } = opts;

    const installationService = new InstallationService(
      ctx.serverDB,
      ctx.userId
    );

    return opts.next({
      ctx: {
        ...ctx,
        installationService,
      },
    });
  });

export const installationRouter = router({
  /**
   * Process GitHub App installation callback
   * Called after user installs the GitHub App
   */
  processCallback: installationProcedure
    .input(
      z.object({
        installationId: z.string().min(1, 'Installation ID is required'),
        organizationId: z.string().uuid('Invalid organization ID'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.installationService.processCallback({
        installationId: input.installationId,
        organizationId: input.organizationId,
      });
    }),

  /**
   * Get installation details by installation ID
   */
  getInstallation: installationProcedure
    .input(
      z.object({
        installationId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.installationService.getInstallation(input.installationId);
    }),

  /**
   * Get all installations for current user
   */
  getAllInstallations: installationProcedure.query(async ({ ctx }) => {
    return ctx.installationService.getAllInstallations();
  }),

  /**
   * Get repositories for a specific installation
   */
  getRepositories: installationProcedure
    .input(
      z.object({
        installationId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.installationService.getRepositories(input.installationId);
    }),

  /**
   * Get all repositories for current user
   */
  getAllRepositories: installationProcedure.query(async ({ ctx }) => {
    return ctx.installationService.getAllRepositories();
  }),

  /**
   * Fetch live repositories from GitHub API
   * Returns current state from GitHub, not just database
   */
  fetchLiveRepositories: installationProcedure.query(async ({ ctx }) => {
    return ctx.installationService.fetchLiveRepositories();
  }),

  /**
   * Delete installation (cascades to repositories)
   */
  deleteInstallation: installationProcedure
    .input(
      z.object({
        installationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.installationService.deleteInstallation(input.installationId);
    }),
});

export type InstallationRouter = typeof installationRouter;
