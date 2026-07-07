import { and, eq } from 'drizzle-orm';
import { agents, agentTasks, daemonRuntimes, repositories } from '@/database/schemas';
import { generateGithubAppJwt } from './generate-github-app-jwt';

type DB = typeof import('@/database').serverDB;

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

export async function enqueueForAgent(
  db: DB,
  {
    agentId,
    repoId,
    repoFullName,
    repoInstallationId,
    issueNumber,
    issueTitle,
    issueHtmlUrl,
    userId,
  }: {
    agentId: string;
    repoId: string;
    repoFullName: string;
    repoInstallationId: string;
    issueNumber: number;
    issueTitle: string;
    issueHtmlUrl: string | null;
    userId: string;
  }
) {
  const [agent] = await db
    .select({ id: agents.id, runtimeId: agents.runtimeId, status: agents.status })
    .from(agents)
    .where(
      and(
        eq(agents.id, agentId),
        eq(agents.userId, userId),
        eq(agents.repositoryId, repoId)
      )
    )
    .limit(1);

  if (!agent || agent.status !== 'active' || !agent.runtimeId) return null;

  const [runtime] = await db
    .select({ status: daemonRuntimes.status })
    .from(daemonRuntimes)
    .where(and(eq(daemonRuntimes.id, agent.runtimeId), eq(daemonRuntimes.userId, userId)))
    .limit(1);

  if (!runtime || runtime.status !== 'online') return null;

  const [owner, repo] = repoFullName.split('/');
  let issueBody: string | null = null;
  try {
    const token = await generateInstallationToken(repoInstallationId);
    const issueRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
      { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' } }
    );
    if (issueRes.ok) {
      const data = await issueRes.json() as { body: string | null };
      issueBody = data.body;
    }
  } catch {
    // Non-critical — proceed without body
  }

  const [task] = await db
    .insert(agentTasks)
    .values({
      agentId: agent.id,
      runtimeId: agent.runtimeId,
      repositoryId: repoId,
      userId,
      issueNumber,
      issueTitle,
      issueBody,
      issueHtmlUrl,
      status: 'queued',
      taskType: 'implementation',
    })
    .returning();

  return task;
}

export async function enqueueForAgentByName(
  db: DB,
  {
    agentName,
    repositoryId,
    repoFullName,
    repoInstallationId,
    issueNumber,
    issueTitle,
    issueHtmlUrl,
    userId,
  }: {
    agentName: string;
    repositoryId: string;
    repoFullName: string;
    repoInstallationId: string;
    issueNumber: number;
    issueTitle: string;
    issueHtmlUrl: string | null;
    userId: string;
  }
) {
  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(
      and(
        eq(agents.name, agentName),
        eq(agents.repositoryId, repositoryId),
        eq(agents.userId, userId),
        eq(agents.status, 'active')
      )
    )
    .limit(1);

  if (!agent) return null;

  return enqueueForAgent(db, {
    agentId: agent.id,
    repoId: repositoryId,
    repoFullName,
    repoInstallationId,
    issueNumber,
    issueTitle,
    issueHtmlUrl,
    userId,
  });
}
