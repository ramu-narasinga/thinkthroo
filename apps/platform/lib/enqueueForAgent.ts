import { and, eq, inArray } from 'drizzle-orm';
import {
  agents,
  agentTasks,
  daemonRuntimes,
  repositories,
  issueBoardStates,
  issueLabels,
  issueBoardStateLabels,
  issueAssignees,
  issueAttachments,
  teamInvitations,
} from '@/database/schemas';
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
    issueBoardStateId,
    taskType = 'implementation',
    executionMode = 'auto_accept_edits',
  }: {
    agentId: string;
    repoId: string;
    repoFullName: string;
    repoInstallationId: string;
    issueNumber: number;
    issueTitle: string;
    issueHtmlUrl: string | null;
    userId: string;
    issueBoardStateId?: string;
    taskType?: 'implementation' | 'planning';
    executionMode?: 'plan' | 'auto_accept_edits' | 'ask_before_edits' | 'auto';
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

  let context: string | null = null;
  if (issueBoardStateId) {
    context = await buildIssueContext(db, issueBoardStateId, userId);
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
      taskType,
      executionMode,
      context,
    })
    .returning();

  return task;
}

/** Assemble priority/labels/assignees/attachments for an issue board row into a JSON blob for the daemon prompt. */
async function buildIssueContext(db: DB, issueBoardStateId: string, userId: string): Promise<string | null> {
  const [board] = await db
    .select({ priority: issueBoardStates.priority })
    .from(issueBoardStates)
    .where(eq(issueBoardStates.id, issueBoardStateId))
    .limit(1);
  if (!board) return null;

  const [labelRows, assigneeRows, attachmentRows] = await Promise.all([
    db
      .select({ name: issueLabels.name })
      .from(issueBoardStateLabels)
      .innerJoin(issueLabels, eq(issueBoardStateLabels.labelId, issueLabels.id))
      .where(eq(issueBoardStateLabels.issueBoardStateId, issueBoardStateId)),
    db.select().from(issueAssignees).where(eq(issueAssignees.issueBoardStateId, issueBoardStateId)),
    db
      .select({ url: issueAttachments.url, fileName: issueAttachments.fileName })
      .from(issueAttachments)
      .where(eq(issueAttachments.issueBoardStateId, issueBoardStateId)),
  ]);

  const agentIds = assigneeRows.filter((a) => a.assigneeType === 'agent' && a.assigneeAgentId).map((a) => a.assigneeAgentId!);
  const memberIds = assigneeRows.filter((a) => a.assigneeType === 'member' && a.assigneeMemberId).map((a) => a.assigneeMemberId!);

  const [agentNameRows, memberNameRows] = await Promise.all([
    agentIds.length ? db.select({ id: agents.id, name: agents.name }).from(agents).where(inArray(agents.id, agentIds)) : [],
    memberIds.length
      ? db.select({ id: teamInvitations.id, fullName: teamInvitations.fullName }).from(teamInvitations).where(inArray(teamInvitations.id, memberIds))
      : [],
  ]);

  const assigneeNames = [
    ...agentNameRows.map((a) => a.name),
    ...memberNameRows.map((m) => m.fullName),
  ];

  return JSON.stringify({
    priority: board.priority,
    labels: labelRows.map((l) => l.name),
    assignees: assigneeNames,
    attachments: attachmentRows.map((a) => ({ url: a.url, fileName: a.fileName })),
  });
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
