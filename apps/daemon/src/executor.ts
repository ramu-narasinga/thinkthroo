import { execa, ExecaError } from 'execa';
import { DaemonConfig } from './config.js';
import { ClaimedTask, reportProgress, pinSession, reportComment, fetchIssueComments } from './reporter.js';
import { prepareWorkDir, branchName, createBranch, commitAndPush } from './git.js';
import { createPullRequest } from './github.js';

export interface ExecutionResult {
  success: boolean;
  prUrl?: string;
  branchName?: string;
  summary?: string;
  failureReason?: string;
}

function buildPrompt(task: ClaimedTask['task'], comments: Array<{ authorType: string; body: string }>): string {
  const lines: string[] = [];
  lines.push(`You are a coding agent assigned to issue #${task.issueNumber}: ${task.issueTitle ?? '(no title)'}`);
  lines.push('');
  if (task.issueBody) {
    lines.push('## Issue description');
    lines.push('');
    lines.push(task.issueBody);
  }

  if (comments.length > 0) {
    lines.push('');
    lines.push('## Conversation so far');
    lines.push('');
    for (const c of comments) {
      const author = c.authorType === 'agent' ? 'Agent' : 'User';
      lines.push(`**${author}:** ${c.body}`);
      lines.push('');
    }
  }

  if (task.userMessage) {
    lines.push(`**User:** ${task.userMessage}`);
    lines.push('');
  }

  lines.push('Implement the fix for this issue. Make the necessary code changes, ensure tests pass if applicable, and keep the changes focused on the issue.');
  return lines.join('\n');
}

// Parses a session ID from Claude Code output lines.
function extractSessionId(line: string): string | null {
  const match = line.match(/[Ss]ession\s+(?:ID|id):\s*([a-f0-9-]{36})/);
  return match ? match[1] : null;
}

async function runClaude(
  args: string[],
  workDir: string,
  task: ClaimedTask['task'],
  config: DaemonConfig
): Promise<{ outputLines: string[]; success: boolean; errorMessage?: string }> {
  const outputLines: string[] = [];
  let sessionPinned = false;

  try {
    const proc = execa('claude', args, {
      cwd: workDir,
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env },
    });

    proc.stdout?.on('data', async (chunk: Buffer) => {
      const text = chunk.toString();
      for (const line of text.split('\n')) {
        if (!line.trim()) continue;
        outputLines.push(line);

        if (!sessionPinned) {
          const sid = extractSessionId(line);
          if (sid) {
            await pinSession(task.id, sid, workDir, config).catch(() => {});
            sessionPinned = true;
          }
        }

        await reportProgress(task.id, line, 'output', config);
      }
    });

    proc.stderr?.on('data', async (chunk: Buffer) => {
      await reportProgress(task.id, chunk.toString().trim(), 'error', config);
    });

    await proc;
    return { outputLines, success: true };
  } catch (err) {
    const msg = (err as ExecaError).message;
    await reportProgress(task.id, `Claude Code exited with error: ${msg}`, 'error', config);
    return { outputLines, success: false, errorMessage: msg };
  }
}

export async function executeTask(
  claimed: ClaimedTask,
  config: DaemonConfig
): Promise<ExecutionResult> {
  const { task, agent, repository, githubToken } = claimed;

  if (!repository || !githubToken) {
    return { success: false, failureReason: 'agent_error' };
  }

  const model = agent?.model ?? 'claude-sonnet-4-6';
  const instructions = agent?.instructions ?? '';

  let workDir: string;
  try {
    workDir = await prepareWorkDir(
      repository.fullName,
      repository.htmlUrl,
      githubToken,
      task.workDir
    );
  } catch (err) {
    await reportProgress(task.id, `Failed to prepare work directory: ${(err as Error).message}`, 'error', config);
    return { success: false, failureReason: 'agent_error' };
  }

  const branch = branchName(task.issueNumber ?? 0, task.issueTitle);
  await createBranch(workDir, branch);

  // Fetch conversation thread from platform for context
  const comments = await fetchIssueComments(task.id, config).catch(() => []);

  const prompt = buildPrompt(task, comments);
  const implArgs = ['--print', '--model', model, '--dangerously-skip-permissions'];
  if (instructions) implArgs.push('--system-prompt', instructions);
  if (task.sessionId) implArgs.push('--resume', task.sessionId);
  implArgs.push(prompt);

  const { outputLines, success: claudeSuccess } = await runClaude(implArgs, workDir, task, config);

  if (!claudeSuccess) {
    return { success: false, failureReason: 'agent_error' };
  }

  // Commit and push
  let pushed: boolean;
  try {
    pushed = await commitAndPush(workDir, branch, task.issueNumber ?? 0);
  } catch (err) {
    await reportProgress(task.id, `Git push failed: ${(err as Error).message}`, 'error', config);
    return { success: false, failureReason: 'agent_error' };
  }

  if (!pushed) {
    await reportProgress(task.id, 'No changes to commit — agent made no file modifications.', 'info', config);
    return { success: false, failureReason: 'agent_error' };
  }

  // Create PR
  const summary = outputLines.slice(-5).join('\n');
  let prUrl: string | undefined;
  try {
    const pr = await createPullRequest(
      repository.fullName,
      githubToken,
      branch,
      task.issueNumber ?? 0,
      task.issueTitle,
      summary
    );
    prUrl = pr.html_url;
  } catch (err) {
    await reportProgress(task.id, `PR creation failed: ${(err as Error).message}`, 'error', config);
    return { success: false, failureReason: 'agent_error' };
  }

  // Post completion comment on the platform
  const completionBody = [
    `Implementation complete. All changes pushed to branch \`${branch}\`.`,
    '',
    prUrl ? `Pull request: ${prUrl}` : '',
    '',
    '**Changes summary:**',
    summary,
  ].filter(Boolean).join('\n');
  await reportComment(task.id, completionBody, config).catch(() => {});

  return { success: true, prUrl, branchName: branch, summary };
}
