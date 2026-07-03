import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { agentDocumentSkills } from '@/database/schemas';

const proc = authedProcedure.use(serverDatabase);

export const agentDocumentSkillRouter = router({
  getAgentDocumentSkills: proc
    .input(z.object({ agentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.serverDB
        .select({ documentId: agentDocumentSkills.documentId })
        .from(agentDocumentSkills)
        .where(eq(agentDocumentSkills.agentId, input.agentId));
      return rows.map(r => r.documentId);
    }),

  setAgentDocumentSkills: proc
    .input(z.object({ agentId: z.string().uuid(), documentIds: z.array(z.string().uuid()) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.serverDB
        .delete(agentDocumentSkills)
        .where(eq(agentDocumentSkills.agentId, input.agentId));
      if (input.documentIds.length > 0) {
        await ctx.serverDB
          .insert(agentDocumentSkills)
          .values(input.documentIds.map(documentId => ({ agentId: input.agentId, documentId, userId: ctx.userId })));
      }
    }),
});
