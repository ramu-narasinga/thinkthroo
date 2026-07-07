import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { serverDB } from '@/database';
import { agents, agentTasks, daemonRuntimes, repositories } from '@/database/schemas';
import { createClient } from '@/utils/supabase/server';
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

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { agentId?: string; issueNumber?: number; repositoryFullName?: string; userMessage?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { agentId, issueNumber, repositoryFullName, userMessage } = body;
  if (!agentId || !issueNumber || !repositoryFullName) {
    return NextResponse.json(
      { error: 'agentId, issueNumber, and repositoryFullName are required' },
      { status: 400 }
    );
  }

  // Resolve repository
  const [repo] = await serverDB
    .select({
      id: repositories.id,
      installationId: repositories.installationId,
      htmlUrl: repositories.htmlUrl,
      fullName: repositories.fullName,
    })
    .from(repositories)
    .where(
      and(
        eq(repositories.fullName, repositoryFullName),
        eq(repositories.userId, user.id)
      )
    )
    .limit(1);

  if (!repo) {
    return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
  }

  // Validate agent
  const [agent] = await serverDB
    .select()
    .from(agents)
    .where(
      and(
        eq(agents.id, agentId),
        eq(agents.userId, user.id),
        eq(agents.repositoryId, repo.id)
      )
    )
    .limit(1);

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }
  if (agent.status !== 'active') {
    return NextResponse.json({ error: 'Agent is not active' }, { status: 400 });
  }
  if (!agent.runtimeId) {
    return NextResponse.json({ error: 'Agent has no runtime assigned' }, { status: 400 });
  }

  // Check runtime is online
  const [runtime] = await serverDB
    .select({ status: daemonRuntimes.status })
    .from(daemonRuntimes)
    .where(
      and(
        eq(daemonRuntimes.id, agent.runtimeId),
        eq(daemonRuntimes.userId, user.id)
      )
    )
    .limit(1);

  if (!runtime) {
    return NextResponse.json({ error: 'Runtime not found' }, { status: 404 });
  }
  if (runtime.status !== 'online') {
    return NextResponse.json({ error: 'Runtime is offline' }, { status: 400 });
  }

  // Fetch issue details from GitHub
  const token = await generateInstallationToken(repo.installationId);
  const [owner, repoName] = repositoryFullName.split('/');

  const issueResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/issues/${issueNumber}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );

  let issueTitle: string | null = null;
  let issueBody: string | null = null;
  let issueHtmlUrl: string | null = null;

  if (issueResponse.ok) {
    const issueData = await issueResponse.json() as {
      title: string;
      body: string | null;
      html_url: string;
    };
    issueTitle = issueData.title;
    issueBody = issueData.body;
    issueHtmlUrl = issueData.html_url;
  }

  // Enqueue task
  const [task] = await serverDB
    .insert(agentTasks)
    .values({
      agentId,
      runtimeId: agent.runtimeId,
      repositoryId: repo.id,
      userId: user.id,
      issueNumber,
      issueTitle,
      issueBody,
      issueHtmlUrl,
      userMessage: userMessage ?? null,
      status: 'queued',
    })
    .returning();

  return NextResponse.json({ taskId: task.id, status: 'queued' }, { status: 201 });
}
