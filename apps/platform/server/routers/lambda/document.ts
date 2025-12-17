import { z } from 'zod';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { DocumentService } from '@/server/service/document';
import { eq, and, or } from 'drizzle-orm';
import { repositories } from '@/database/schemas';

const documentProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      documentService: new DocumentService(ctx.serverDB, ctx.userId),
    },
  });
});

export const documentRouter = router({
  /**
   * Get repository ID by name (accepts either short name or full name)
   */
  getRepositoryIdByName: documentProcedure
    .input(
      z.object({
        repositoryName: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { repositoryName } = input;
      
      // Query for repository matching either name or fullName
      const repo = await ctx.serverDB.query.repositories.findFirst({
        where: and(
          eq(repositories.userId, ctx.userId),
          or(
            eq(repositories.name, repositoryName),
            eq(repositories.fullName, repositoryName)
          )
        ),
        columns: {
          id: true,
          name: true,
          fullName: true,
        },
      });

      if (!repo) {
        throw new Error(`Repository '${repositoryName}' not found or you don't have access`);
      }

      return repo;
    }),

  /**
   * Get all documents for a repository
   */
  getAllByRepository: documentProcedure
    .input(
      z.object({
        repositoryId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.documentService.getAllByRepository(input.repositoryId);
    }),

  /**
   * Get all documents for a repository with minimal fields (excludes content/editorData)
   * Used for file tree to reduce payload size
   */
  getAllByRepositoryMinimal: documentProcedure
    .input(
      z.object({
        repositoryId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.documentService.getAllByRepositoryMinimal(input.repositoryId);
    }),

  /**
   * Get document by ID
   */
  getById: documentProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.documentService.getById(input.id);
    }),

  /**
   * Create a new document (file or folder)
   */
  create: documentProcedure
    .input(
      z.object({
        repositoryId: z.string().uuid(),
        parentId: z.string().uuid().nullable().optional(),
        name: z.string().min(1),
        type: z.enum(['file', 'folder']),
        content: z.string().optional(),
        editorData: z.record(z.any()).optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.documentService.create(input);
    }),

  /**
   * Update a document
   */
  update: documentProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        content: z.string().optional(),
        editorData: z.record(z.any()).optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return ctx.documentService.update(id, updateData);
    }),

  /**
   * Delete a document
   */
  delete: documentProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.documentService.delete(input.id);
      return { success: true };
    }),
});
