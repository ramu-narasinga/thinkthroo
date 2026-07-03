import { z } from 'zod';
import { eq, and, count, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { squads, squadMembers, agents, repositories } from '@/database/schemas';

const squadProcedure = authedProcedure.use(serverDatabase);

export const squadRouter = router({
  getAll: squadProcedure
    .query(async ({ ctx }) => {
      const rows = await ctx.serverDB
        .select({
          squad: squads,
          leaderName: agents.name,
          repositoryFullName: repositories.fullName,
        })
        .from(squads)
        .leftJoin(agents, eq(squads.leaderAgentId, agents.id))
        .leftJoin(repositories, eq(squads.repositoryId, repositories.id))
        .where(eq(squads.userId, ctx.userId))
        .orderBy(desc(squads.createdAt));

      const squadIds = rows.map((r) => r.squad.id);
      if (squadIds.length === 0) return rows.map((r) => ({ ...r.squad, leaderName: r.leaderName, repositoryFullName: r.repositoryFullName, memberCount: 0 }));

      const memberCounts = await ctx.serverDB
        .select({ squadId: squadMembers.squadId, cnt: count() })
        .from(squadMembers)
        .where(eq(squadMembers.userId, ctx.userId))
        .groupBy(squadMembers.squadId);

      const countById = new Map(memberCounts.map((m) => [m.squadId, Number(m.cnt)]));

      return rows.map((r) => ({
        ...r.squad,
        leaderName: r.leaderName,
        repositoryFullName: r.repositoryFullName,
        memberCount: countById.get(r.squad.id) ?? 0,
      }));
    }),

  getByRepository: squadProcedure
    .input(z.object({ repositoryFullName: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [repo] = await ctx.serverDB
        .select({ id: repositories.id })
        .from(repositories)
        .where(and(eq(repositories.fullName, input.repositoryFullName), eq(repositories.userId, ctx.userId)))
        .limit(1);

      if (!repo) return [];

      const squadRows = await ctx.serverDB
        .select({
          squad: squads,
          leaderName: agents.name,
        })
        .from(squads)
        .leftJoin(agents, eq(squads.leaderAgentId, agents.id))
        .where(and(eq(squads.repositoryId, repo.id), eq(squads.userId, ctx.userId)))
        .orderBy(desc(squads.createdAt));

      const memberRows = await ctx.serverDB
        .select({
          squadId: squadMembers.squadId,
          memberType: squadMembers.memberType,
          agentId: squadMembers.agentId,
          memberId: squadMembers.memberId,
          role: squadMembers.role,
          agentName: agents.name,
        })
        .from(squadMembers)
        .leftJoin(agents, eq(squadMembers.agentId, agents.id))
        .where(eq(squadMembers.userId, ctx.userId));

      const membersBySquad = new Map<string, typeof memberRows>();
      for (const m of memberRows) {
        if (!membersBySquad.has(m.squadId)) membersBySquad.set(m.squadId, []);
        membersBySquad.get(m.squadId)!.push(m);
      }

      return squadRows.map((r) => ({
        ...r.squad,
        leaderName: r.leaderName,
        members: membersBySquad.get(r.squad.id) ?? [],
      }));
    }),

  create: squadProcedure
    .input(z.object({
      repositoryFullName: z.string().min(1),
      name: z.string().min(1).max(100),
      description: z.string().max(255).default(''),
      leaderAgentId: z.string().uuid(),
      memberAgentIds: z.array(z.string().uuid()).optional().default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const [repo] = await ctx.serverDB
        .select({ id: repositories.id })
        .from(repositories)
        .where(and(eq(repositories.fullName, input.repositoryFullName), eq(repositories.userId, ctx.userId)))
        .limit(1);

      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      // Validate leader agent belongs to this repository
      const [leader] = await ctx.serverDB
        .select({ id: agents.id })
        .from(agents)
        .where(and(eq(agents.id, input.leaderAgentId), eq(agents.repositoryId, repo.id), eq(agents.userId, ctx.userId)))
        .limit(1);

      if (!leader) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Leader agent must belong to this repository' });

      const [squad] = await ctx.serverDB
        .insert(squads)
        .values({
          repositoryId: repo.id,
          userId: ctx.userId,
          name: input.name,
          description: input.description,
          leaderAgentId: input.leaderAgentId,
        })
        .returning();

      // Auto-add leader as member with role 'leader'
      await ctx.serverDB.insert(squadMembers).values({
        squadId: squad.id,
        userId: ctx.userId,
        memberType: 'agent',
        agentId: input.leaderAgentId,
        role: 'leader',
      });

      // Add additional members
      for (const agentId of input.memberAgentIds) {
        if (agentId === input.leaderAgentId) continue; // skip if already leader
        await ctx.serverDB.insert(squadMembers).values({
          squadId: squad.id,
          userId: ctx.userId,
          memberType: 'agent',
          agentId,
        }).onConflictDoNothing();
      }

      return squad;
    }),

  update: squadProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(255).optional(),
      leaderAgentId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [squad] = await ctx.serverDB
        .select({ id: squads.id, repositoryId: squads.repositoryId })
        .from(squads)
        .where(and(eq(squads.id, input.id), eq(squads.userId, ctx.userId)))
        .limit(1);

      if (!squad) throw new TRPCError({ code: 'NOT_FOUND', message: 'Squad not found' });

      if (input.leaderAgentId) {
        const [leader] = await ctx.serverDB
          .select({ id: agents.id })
          .from(agents)
          .where(and(eq(agents.id, input.leaderAgentId), eq(agents.repositoryId, squad.repositoryId), eq(agents.userId, ctx.userId)))
          .limit(1);
        if (!leader) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Leader agent must belong to this repository' });
      }

      const [updated] = await ctx.serverDB
        .update(squads)
        .set({
          ...(input.name !== undefined && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.leaderAgentId !== undefined && { leaderAgentId: input.leaderAgentId }),
          updatedAt: new Date(),
        })
        .where(and(eq(squads.id, input.id), eq(squads.userId, ctx.userId)))
        .returning();

      return updated;
    }),

  delete: squadProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.serverDB
        .delete(squads)
        .where(and(eq(squads.id, input.id), eq(squads.userId, ctx.userId)));
      return { success: true };
    }),

  addMember: squadProcedure
    .input(z.object({
      squadId: z.string().uuid(),
      agentId: z.string().uuid(),
      role: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [squad] = await ctx.serverDB
        .select({ id: squads.id })
        .from(squads)
        .where(and(eq(squads.id, input.squadId), eq(squads.userId, ctx.userId)))
        .limit(1);

      if (!squad) throw new TRPCError({ code: 'NOT_FOUND', message: 'Squad not found' });

      const [member] = await ctx.serverDB
        .insert(squadMembers)
        .values({
          squadId: input.squadId,
          userId: ctx.userId,
          memberType: 'agent',
          agentId: input.agentId,
          role: input.role ?? null,
        })
        .onConflictDoNothing()
        .returning();

      return member;
    }),

  removeMember: squadProcedure
    .input(z.object({
      squadId: z.string().uuid(),
      agentId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.serverDB
        .delete(squadMembers)
        .where(
          and(
            eq(squadMembers.squadId, input.squadId),
            eq(squadMembers.agentId, input.agentId),
            eq(squadMembers.userId, ctx.userId)
          )
        );
      return { success: true };
    }),
});

export type SquadRouter = typeof squadRouter;
