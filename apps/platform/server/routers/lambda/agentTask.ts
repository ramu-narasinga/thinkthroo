import { z } from 'zod';
import { eq, and, desc, asc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { agentTasks, agentTaskLogs, repositories, agentTaskArtifacts, agentTaskReviewComments } from '@/database/schemas';
import { generateGithubAppJwt } from '@/lib/generate-github-app-jwt';

async function generateInstallationToken(installationId: string): Promise<string> {
  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${generateGithubAppJwt()}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );
  if (!res.ok) throw new Error('Failed to generate installation token');
  const data = await res.json();
  return data.token;
}

const agentTaskProcedure = authedProcedure.use(serverDatabase);

const CANCELLABLE_STATUSES = ['queued', 'dispatched', 'running'] as const;

export const agentTaskRouter = router({
  getByRepository: agentTaskProcedure
    .input(z.object({ repositoryFullName: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [repo] = await ctx.serverDB
        .select({ id: repositories.id })
        .from(repositories)
        .where(
          and(
            eq(repositories.fullName, input.repositoryFullName),
            eq(repositories.userId, ctx.userId)
          )
        )
        .limit(1);

      if (!repo) return [];

      return ctx.serverDB
        .select()
        .from(agentTasks)
        .where(
          and(
            eq(agentTasks.repositoryId, repo.id),
            eq(agentTasks.userId, ctx.userId)
          )
        )
        .orderBy(desc(agentTasks.createdAt));
    }),

  getByIssue: agentTaskProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [repo] = await ctx.serverDB
        .select({ id: repositories.id })
        .from(repositories)
        .where(
          and(
            eq(repositories.fullName, input.repositoryFullName),
            eq(repositories.userId, ctx.userId)
          )
        )
        .limit(1);

      if (!repo) return [];

      return ctx.serverDB
        .select()
        .from(agentTasks)
        .where(
          and(
            eq(agentTasks.repositoryId, repo.id),
            eq(agentTasks.issueNumber, input.issueNumber),
            eq(agentTasks.userId, ctx.userId)
          )
        )
        .orderBy(desc(agentTasks.createdAt));
    }),

  getLogs: agentTaskProcedure
    .input(z.object({ taskId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [task] = await ctx.serverDB
        .select({ id: agentTasks.id })
        .from(agentTasks)
        .where(and(eq(agentTasks.id, input.taskId), eq(agentTasks.userId, ctx.userId)))
        .limit(1);

      if (!task) throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });

      return ctx.serverDB
        .select()
        .from(agentTaskLogs)
        .where(eq(agentTaskLogs.taskId, input.taskId))
        .orderBy(asc(agentTaskLogs.createdAt));
    }),

  cancel: agentTaskProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [task] = await ctx.serverDB
        .select({ id: agentTasks.id, status: agentTasks.status })
        .from(agentTasks)
        .where(and(eq(agentTasks.id, input.id), eq(agentTasks.userId, ctx.userId)))
        .limit(1);

      if (!task) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
      }

      if (!CANCELLABLE_STATUSES.includes(task.status as typeof CANCELLABLE_STATUSES[number])) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot cancel a task with status '${task.status}'`,
        });
      }

      const [updated] = await ctx.serverDB
        .update(agentTasks)
        .set({ status: 'cancelled', failureReason: 'cancelled_by_user' })
        .where(and(eq(agentTasks.id, input.id), eq(agentTasks.userId, ctx.userId)))
        .returning();

      return updated;
    }),

  getDiff: agentTaskProcedure
    .input(z.object({ taskId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [task] = await ctx.serverDB
        .select({
          id: agentTasks.id,
          result: agentTasks.result,
          repositoryId: agentTasks.repositoryId,
        })
        .from(agentTasks)
        .where(and(eq(agentTasks.id, input.taskId), eq(agentTasks.userId, ctx.userId)))
        .limit(1);

      if (!task) throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
      if (!task.result) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Task has no result yet' });

      const result = JSON.parse(task.result) as { prUrl?: string; summary?: string; branchName?: string };
      if (!result.branchName) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Task result has no branch name' });

      const [repo] = await ctx.serverDB
        .select({
          fullName: repositories.fullName,
          defaultBranch: repositories.defaultBranch,
          installationId: repositories.installationId,
        })
        .from(repositories)
        .where(eq(repositories.id, task.repositoryId))
        .limit(1);

      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const token = await generateInstallationToken(repo.installationId);
      const base = repo.defaultBranch ?? 'main';
      const compareUrl = `https://api.github.com/repos/${repo.fullName}/compare/${base}...${result.branchName}`;

      const compareRes = await fetch(compareUrl, {
        headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' },
      });

      if (!compareRes.ok) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch diff from GitHub' });
      }

      const compareData = await compareRes.json() as {
        files?: Array<{
          filename: string;
          status: string;
          additions: number;
          deletions: number;
          changes: number;
          patch?: string;
        }>;
      };

      return {
        branchName: result.branchName,
        prUrl: result.prUrl ?? null,
        baseBranch: base,
        files: (compareData.files ?? []).map((f) => ({
          filename: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
          changes: f.changes,
          patch: f.patch ?? null,
        })),
      };
    }),

  createTestTask: agentTaskProcedure
    .input(z.object({
      repositoryFullName: z.string().min(1),
      issueNumber: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [repo] = await ctx.serverDB
        .select({ id: repositories.id })
        .from(repositories)
        .where(and(eq(repositories.fullName, input.repositoryFullName), eq(repositories.userId, ctx.userId)))
        .limit(1);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      // Find the most recent completed implementation task for this issue
      const [implTask] = await ctx.serverDB
        .select({
          agentId: agentTasks.agentId,
          runtimeId: agentTasks.runtimeId,
          issueTitle: agentTasks.issueTitle,
          issueHtmlUrl: agentTasks.issueHtmlUrl,
          workDir: agentTasks.workDir,
        })
        .from(agentTasks)
        .where(
          and(
            eq(agentTasks.repositoryId, repo.id),
            eq(agentTasks.issueNumber, input.issueNumber),
            eq(agentTasks.userId, ctx.userId),
            eq(agentTasks.status, 'completed'),
            eq(agentTasks.taskType, 'implementation')
          )
        )
        .orderBy(desc(agentTasks.createdAt))
        .limit(1);

      if (!implTask) throw new TRPCError({ code: 'NOT_FOUND', message: 'No completed implementation task found for this issue' });

      const [newTask] = await ctx.serverDB
        .insert(agentTasks)
        .values({
          agentId: implTask.agentId,
          runtimeId: implTask.runtimeId,
          repositoryId: repo.id,
          userId: ctx.userId,
          issueNumber: input.issueNumber,
          issueTitle: implTask.issueTitle,
          issueHtmlUrl: implTask.issueHtmlUrl,
          workDir: implTask.workDir,
          status: 'queued',
          taskType: 'test',
        })
        .returning();

      return newTask;
    }),

  getArtifacts: agentTaskProcedure
    .input(z.object({ taskId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.serverDB
        .select()
        .from(agentTaskArtifacts)
        .where(
          and(
            eq(agentTaskArtifacts.taskId, input.taskId),
            eq(agentTaskArtifacts.userId, ctx.userId)
          )
        )
        .orderBy(asc(agentTaskArtifacts.createdAt));
    }),

  createReviewTask: agentTaskProcedure
    .input(z.object({
      repositoryFullName: z.string().min(1),
      issueNumber: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [repo] = await ctx.serverDB
        .select({ id: repositories.id })
        .from(repositories)
        .where(and(eq(repositories.fullName, input.repositoryFullName), eq(repositories.userId, ctx.userId)))
        .limit(1);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      const [implTask] = await ctx.serverDB
        .select({
          agentId: agentTasks.agentId,
          runtimeId: agentTasks.runtimeId,
          issueTitle: agentTasks.issueTitle,
          issueHtmlUrl: agentTasks.issueHtmlUrl,
          workDir: agentTasks.workDir,
        })
        .from(agentTasks)
        .where(
          and(
            eq(agentTasks.repositoryId, repo.id),
            eq(agentTasks.issueNumber, input.issueNumber),
            eq(agentTasks.userId, ctx.userId),
            eq(agentTasks.status, 'completed'),
            eq(agentTasks.taskType, 'implementation')
          )
        )
        .orderBy(desc(agentTasks.createdAt))
        .limit(1);

      if (!implTask) throw new TRPCError({ code: 'NOT_FOUND', message: 'No completed implementation task found for this issue' });

      const [newTask] = await ctx.serverDB
        .insert(agentTasks)
        .values({
          agentId: implTask.agentId,
          runtimeId: implTask.runtimeId,
          repositoryId: repo.id,
          userId: ctx.userId,
          issueNumber: input.issueNumber,
          issueTitle: implTask.issueTitle,
          issueHtmlUrl: implTask.issueHtmlUrl,
          workDir: implTask.workDir,
          status: 'queued',
          taskType: 'review',
        })
        .returning();

      return newTask;
    }),

  getReviewComments: agentTaskProcedure
    .input(z.object({ taskId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [task] = await ctx.serverDB
        .select({ id: agentTasks.id })
        .from(agentTasks)
        .where(and(eq(agentTasks.id, input.taskId), eq(agentTasks.userId, ctx.userId)))
        .limit(1);
      if (!task) throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });

      return ctx.serverDB
        .select()
        .from(agentTaskReviewComments)
        .where(
          and(
            eq(agentTaskReviewComments.taskId, input.taskId),
            eq(agentTaskReviewComments.userId, ctx.userId)
          )
        )
        .orderBy(asc(agentTaskReviewComments.filename), asc(agentTaskReviewComments.startLine), asc(agentTaskReviewComments.createdAt));
    }),

  addUserReviewComment: agentTaskProcedure
    .input(z.object({
      taskId: z.string().uuid(),
      filename: z.string().min(1),
      startLine: z.number().int().positive(),
      body: z.string().min(1),
      replyToCommentId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify the review task belongs to this user and get context
      const [reviewTask] = await ctx.serverDB
        .select({
          id: agentTasks.id,
          repositoryId: agentTasks.repositoryId,
          issueNumber: agentTasks.issueNumber,
        })
        .from(agentTasks)
        .where(and(eq(agentTasks.id, input.taskId), eq(agentTasks.userId, ctx.userId)))
        .limit(1);
      if (!reviewTask) throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });

      // Find the latest completed implementation task to get branch name
      const [implTask] = await ctx.serverDB
        .select({ result: agentTasks.result })
        .from(agentTasks)
        .where(
          and(
            eq(agentTasks.repositoryId, reviewTask.repositoryId),
            eq(agentTasks.issueNumber, reviewTask.issueNumber!),
            eq(agentTasks.userId, ctx.userId),
            eq(agentTasks.taskType, 'implementation'),
            eq(agentTasks.status, 'completed')
          )
        )
        .orderBy(desc(agentTasks.completedAt))
        .limit(1);

      const [repo] = await ctx.serverDB
        .select({ fullName: repositories.fullName, installationId: repositories.installationId, defaultBranch: repositories.defaultBranch })
        .from(repositories)
        .where(eq(repositories.id, reviewTask.repositoryId))
        .limit(1);
      if (!repo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Repository not found' });

      let githubCommentId: number | null = null;

      // Try to post to GitHub
      try {
        const token = await generateInstallationToken(repo.installationId);
        const [owner, repoName] = repo.fullName.split('/');

        let branchName: string | null = null;
        if (implTask?.result) {
          try { branchName = (JSON.parse(implTask.result) as { branchName?: string }).branchName ?? null; } catch { /* */ }
        }

        if (branchName) {
          // Find the PR
          const prRes = await fetch(
            `https://api.github.com/repos/${owner}/${repoName}/pulls?head=${owner}:${branchName}&state=all&sort=updated&per_page=1`,
            { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
          );

          if (prRes.ok) {
            const prs = await prRes.json() as Array<{ number: number; head: { sha: string } }>;
            if (prs.length > 0) {
              const { number: prNumber, head: { sha: commitId } } = prs[0];

              if (input.replyToCommentId) {
                // Reply to an existing agent comment
                const [parentRow] = await ctx.serverDB
                  .select({ githubCommentId: agentTaskReviewComments.githubCommentId })
                  .from(agentTaskReviewComments)
                  .where(and(
                    eq(agentTaskReviewComments.id, input.replyToCommentId),
                    eq(agentTaskReviewComments.userId, ctx.userId)
                  ))
                  .limit(1);

                if (parentRow?.githubCommentId) {
                  const replyRes = await fetch(
                    `https://api.github.com/repos/${owner}/${repoName}/pulls/comments/${parentRow.githubCommentId}/replies`,
                    {
                      method: 'POST',
                      headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/vnd.github+json',
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ body: input.body }),
                    }
                  );
                  if (replyRes.ok) {
                    const replyData = await replyRes.json() as { id: number };
                    githubCommentId = replyData.id;
                  }
                }
              } else {
                // New top-level comment on a line
                const reviewRes = await fetch(
                  `https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}/reviews`,
                  {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      Accept: 'application/vnd.github+json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      commit_id: commitId,
                      event: 'COMMENT',
                      comments: [{ path: input.filename, line: input.startLine, body: input.body }],
                    }),
                  }
                );
                if (reviewRes.ok) {
                  const reviewData = await reviewRes.json() as { comments?: Array<{ id: number }> };
                  githubCommentId = reviewData.comments?.[0]?.id ?? null;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('[addUserReviewComment] GitHub API error:', err);
        // Non-fatal — still save to DB
      }

      const [saved] = await ctx.serverDB
        .insert(agentTaskReviewComments)
        .values({
          taskId: input.taskId,
          repositoryId: reviewTask.repositoryId,
          userId: ctx.userId,
          issueNumber: reviewTask.issueNumber,
          filename: input.filename,
          startLine: input.startLine,
          body: input.body,
          severity: 'suggestion',
          authorType: 'user',
          parentCommentId: input.replyToCommentId ?? null,
          githubCommentId,
        })
        .returning();

      return saved;
    }),
});

export type AgentTaskRouter = typeof agentTaskRouter;
