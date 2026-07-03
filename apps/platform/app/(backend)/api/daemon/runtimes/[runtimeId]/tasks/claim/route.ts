import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { serverDB } from '@/database';
import { agents, repositories, agentDocumentSkills, documents } from '@/database/schemas';
import { getDaemonRuntime } from '../../../../_auth';
import { generateGithubAppJwt } from '@/lib/generate-github-app-jwt';

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ runtimeId: string }> }
) {
  let runtime: Awaited<ReturnType<typeof getDaemonRuntime>>;
  try {
    runtime = await getDaemonRuntime(req);
  } catch (errResponse) {
    return errResponse as NextResponse;
  }

  const { runtimeId } = await params;
  if (runtimeId !== runtime.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Atomically claim the next queued task for this runtime.
  // FOR UPDATE SKIP LOCKED prevents race conditions when multiple daemon
  // processes poll concurrently. The serialization subquery ensures no two
  // tasks for the same (agent_id, issue_number) pair are active simultaneously.
  const claimResult = await serverDB.execute(sql`
    UPDATE agent_tasks
    SET status = 'dispatched', dispatched_at = now()
    WHERE id = (
      SELECT atq.id FROM agent_tasks atq
      WHERE atq.runtime_id = ${runtimeId}::uuid
        AND atq.status = 'queued'
        AND NOT EXISTS (
          SELECT 1 FROM agent_tasks active
          WHERE active.agent_id = atq.agent_id
            AND active.status IN ('dispatched', 'running', 'waiting_local_directory')
            AND (
              (atq.issue_number IS NOT NULL AND active.issue_number = atq.issue_number)
              OR (atq.issue_number IS NULL AND active.issue_number IS NULL)
            )
        )
      ORDER BY atq.priority DESC, atq.created_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *
  `);

  const rows = Array.from(claimResult) as Array<Record<string, unknown>>;
  if (!rows.length) {
    return new NextResponse(null, { status: 204 });
  }

  const raw = rows[0];
  const task = {
    id:           raw['id']             as string,
    agentId:      raw['agent_id']       as string,
    runtimeId:    raw['runtime_id']     as string,
    repositoryId: raw['repository_id']  as string,
    issueNumber:  raw['issue_number']   as number | null,
    issueTitle:   raw['issue_title']    as string | null,
    issueBody:    raw['issue_body']     as string | null,
    issueHtmlUrl: raw['issue_html_url'] as string | null,
    sessionId:    raw['session_id']     as string | null,
    workDir:      raw['work_dir']       as string | null,
    attemptCount: raw['attempt_count']  as number,
    userMessage:  raw['user_message']   as string | null,
    taskType:     (raw['task_type']     as string | null) ?? 'implementation',
  };

  // Fetch agent instructions + model
  const [agent] = await serverDB
    .select({ instructions: agents.instructions, model: agents.model })
    .from(agents)
    .where(eq(agents.id, task.agentId))
    .limit(1);

  // Fetch document skills for this agent
  const assocRows = await serverDB
    .select({ documentId: agentDocumentSkills.documentId })
    .from(agentDocumentSkills)
    .where(eq(agentDocumentSkills.agentId, task.agentId));

  let mappedSkills: Array<{ name: string; slug: string; content: string }> = [];

  if (assocRows.length > 0) {
    const allDocs = await serverDB
      .select({ id: documents.id, name: documents.name, parentId: documents.parentId, type: documents.type, content: documents.content })
      .from(documents)
      .where(eq(documents.repositoryId, task.repositoryId));

    const docMap = new Map(allDocs.map(d => [d.id, d]));

    function getPath(id: string): string {
      const d = docMap.get(id);
      if (!d) return '';
      return d.parentId ? `${getPath(d.parentId)}/${d.name}` : d.name;
    }

    const selectedIds = new Set(assocRows.map(r => r.documentId));
    mappedSkills = allDocs
      .filter(d => d.type === 'file' && selectedIds.has(d.id))
      .map(d => ({ name: d.name, slug: getPath(d.id), content: d.content ?? '' }));
  }

  // Fetch repository URL + installationId for GitHub token
  const [repo] = await serverDB
    .select({ htmlUrl: repositories.htmlUrl, installationId: repositories.installationId, fullName: repositories.fullName })
    .from(repositories)
    .where(eq(repositories.id, task.repositoryId))
    .limit(1);

  let githubToken: string | null = null;
  if (repo?.installationId) {
    try {
      githubToken = await generateInstallationToken(repo.installationId);
    } catch (err) {
      console.error('[daemon/claim] Failed to generate GitHub token:', err);
    }
  }

  return NextResponse.json({
    task,
    agent: agent ? { ...agent, skills: mappedSkills } : null,
    repository: repo ?? null,
    githubToken,
  });
}
