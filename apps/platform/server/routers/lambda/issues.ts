import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { repositories } from '@/database/schemas';
import { generateGithubAppJwt } from '@/lib/generate-github-app-jwt';

const issueProcedure = authedProcedure.use(serverDatabase);

async function generateInstallationToken(installationId: string): Promise<string> {
  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${generateGithubAppJwt()}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create installation token: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.token;
}

export const issueRouter = router({
  getByRepository: issueProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        page: z.number().int().positive().default(1),
        perPage: z.number().int().positive().max(100).default(25),
        state: z.enum(['open', 'closed', 'all']).default('open'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { repositoryFullName, page, perPage, state } = input;

      const [repo] = await ctx.serverDB
        .select({ installationId: repositories.installationId })
        .from(repositories)
        .where(
          and(
            eq(repositories.fullName, repositoryFullName),
            eq(repositories.userId, ctx.userId)
          )
        )
        .limit(1);

      if (!repo) {
        throw new Error(`Repository not found: ${repositoryFullName}`);
      }

      const token = await generateInstallationToken(repo.installationId);

      const [owner, repoName] = repositoryFullName.split('/');
      const url = new URL(`https://api.github.com/repos/${owner}/${repoName}/issues`);
      url.searchParams.set('state', state);
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(perPage));

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to fetch issues: ${JSON.stringify(error)}`);
      }

      const issues = await response.json() as Array<{
        id: number;
        number: number;
        title: string;
        state: string;
        html_url: string;
        user: { login: string; avatar_url: string } | null;
        labels: Array<{ name: string; color: string }>;
        created_at: string;
        updated_at: string;
        pull_request?: unknown;
      }>;

      // GitHub Issues API includes PRs — filter them out
      const onlyIssues = issues.filter((i) => !i.pull_request);

      return {
        issues: onlyIssues.map((i) => ({
          id: i.id,
          number: i.number,
          title: i.title,
          state: i.state,
          htmlUrl: i.html_url,
          author: i.user?.login ?? '',
          authorAvatarUrl: i.user?.avatar_url ?? '',
          labels: i.labels.map((l) => ({ name: l.name, color: l.color })),
          createdAt: i.created_at,
          updatedAt: i.updated_at,
        })),
        hasMore: onlyIssues.length === perPage,
      };
    }),

  getByNumber: issueProcedure
    .input(
      z.object({
        repositoryFullName: z.string().min(1),
        issueNumber: z.number().int().positive(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { repositoryFullName, issueNumber } = input;

      const [repo] = await ctx.serverDB
        .select({ installationId: repositories.installationId })
        .from(repositories)
        .where(
          and(
            eq(repositories.fullName, repositoryFullName),
            eq(repositories.userId, ctx.userId)
          )
        )
        .limit(1);

      if (!repo) {
        throw new Error(`Repository not found: ${repositoryFullName}`);
      }

      const token = await generateInstallationToken(repo.installationId);
      const [owner, repoName] = repositoryFullName.split('/');

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/issues/${issueNumber}`,
        { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' } }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to fetch issue: ${JSON.stringify(error)}`);
      }

      const issue = await response.json() as {
        title: string;
        body: string | null;
        html_url: string;
      };

      return {
        title: issue.title,
        body: issue.body,
        htmlUrl: issue.html_url,
      };
    }),
});

export type IssueRouter = typeof issueRouter;
