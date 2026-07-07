import fs from 'node:fs/promises';
import path from 'node:path';
import { execa, ExecaError } from 'execa';
import { DaemonConfig } from './config.js';
import { ClaimedTask, reportProgress, pinSession, reportComment, fetchIssueComments, uploadArtifact, postReviewComments, ReviewCommentInput } from './reporter.js';
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

async function writeSkillFiles(
  workDir: string,
  skills: Array<{ name: string; slug: string; content: string }>
): Promise<void> {
  const skillsDir = path.join(workDir, '.claude', 'skills');
  await fs.mkdir(skillsDir, { recursive: true });
  for (const skill of skills) {
    const skillDir = path.join(skillsDir, skill.slug);
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(path.join(skillDir, 'SKILL.md'), skill.content, 'utf8');
  }
}

// ─── Test task execution ──────────────────────────────────────────────────────

function buildTestPrompt(task: ClaimedTask['task']): string {
  const lines: string[] = [];
  lines.push(`You are a test engineer. Issue #${task.issueNumber}: "${task.issueTitle ?? '(no title)'}" was resolved and the changes are in the current branch.`);
  lines.push('');
  lines.push('Your task:');
  lines.push('1. Run `git diff main` (or `git diff origin/main`) to understand what code changed.');
  lines.push('2. Determine the nature of the fix: UI interaction, API endpoint, data/logic, configuration, etc.');
  lines.push('3. Look for existing test files (test/, __tests__/, *.spec.ts, *.test.ts, playwright.config.ts, jest.config.*, vitest.config.*, pytest.ini, etc.)');
  lines.push('');
  lines.push('CASE A — Existing test patterns found:');
  lines.push('  - Follow the same framework, file naming conventions, and patterns already in use.');
  lines.push('  - Write tests in the same style and location as existing tests.');
  lines.push('');
  lines.push('CASE B — No existing tests found:');
  lines.push('  - Detect the tech stack from package.json / pyproject.toml / go.mod / etc.');
  lines.push('  - Choose the most appropriate test framework for the stack:');
  lines.push('      * TypeScript/Next.js/React → Playwright (E2E) or Vitest (unit)');
  lines.push('      * Node.js API → Vitest or Jest');
  lines.push('      * Python → pytest');
  lines.push('      * Go → Go test stdlib');
  lines.push('  - Install the chosen framework (e.g. `npm install -D @playwright/test`, `pip install pytest`)');
  lines.push('  - Create the minimal config file needed (playwright.config.ts, vitest.config.ts, etc.)');
  lines.push('  - Write tests that cover the changed behavior.');
  lines.push('');
  lines.push('4. Write tests that specifically verify the behavior fixed or added by this issue.');
  lines.push('   - For UI changes: test the interaction flow end-to-end.');
  lines.push('   - For API changes: test the endpoint with valid and invalid inputs.');
  lines.push('   - For logic fixes: test the corrected edge cases.');
  lines.push('5. Run the tests and fix any that fail due to setup issues (environment, imports, etc.).');
  lines.push('6. On the very last line of your output print ONLY this JSON (no prose after it):');
  lines.push('   {"passed": N, "failed": N, "total": N}');
  return lines.join('\n');
}

async function findScreenshots(dir: string): Promise<string[]> {
  const results: string[] = [];
  async function scan(current: string, depth: number): Promise<void> {
    if (depth > 4) return;
    let names: string[];
    try { names = await fs.readdir(current); } catch { return; }
    for (const name of names) {
      const full = path.join(current, name);
      try {
        const stat = await fs.stat(full);
        if (stat.isDirectory()) {
          await scan(full, depth + 1);
        } else if (/\.(png|jpg|jpeg|webp)$/i.test(name)) {
          results.push(full);
        }
      } catch { /* skip inaccessible entries */ }
    }
  }
  // Focus on common test output directories
  for (const sub of ['test-results', 'playwright-report', 'cypress/screenshots', '__screenshots__']) {
    await scan(path.join(dir, sub), 0);
  }
  return results;
}

async function executeTestTask(
  claimed: ClaimedTask,
  config: DaemonConfig
): Promise<ExecutionResult> {
  const { task, agent, repository, githubToken } = claimed;

  if (!repository || !githubToken) {
    return { success: false, failureReason: 'agent_error' };
  }

  if (!task.workDir) {
    await reportProgress(task.id, 'No work directory set for this test task. Cannot proceed.', 'error', config);
    return { success: false, failureReason: 'agent_error' };
  }

  // Verify the work directory exists
  try {
    await fs.access(task.workDir);
  } catch {
    await reportProgress(task.id, `Work directory not found: ${task.workDir}. The implementation checkout may have been cleaned up.`, 'error', config);
    return { success: false, failureReason: 'agent_error' };
  }

  // Write skill files before running Claude
  const testSkills = agent?.skills ?? [];
  if (testSkills.length > 0) {
    await writeSkillFiles(task.workDir, testSkills);
  }

  // Derive the current branch name from the checkout
  let currentBranch: string;
  try {
    const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: task.workDir });
    currentBranch = stdout.trim();
  } catch {
    await reportProgress(task.id, 'Failed to determine current branch.', 'error', config);
    return { success: false, failureReason: 'agent_error' };
  }

  const model = agent?.model ?? 'claude-sonnet-4-6';
  const instructions = agent?.instructions ?? '';

  await reportProgress(task.id, `Starting test generation on branch: ${currentBranch}`, 'info', config);

  const prompt = buildTestPrompt(task);
  const testArgs = ['--print', '--model', model, '--dangerously-skip-permissions'];
  if (instructions) testArgs.push('--system-prompt', instructions);
  testArgs.push(prompt);

  const { outputLines, success: claudeSuccess } = await runClaude(testArgs, task.workDir, task, config);

  if (!claudeSuccess) {
    return { success: false, failureReason: 'agent_error' };
  }

  // Commit and push the generated test files to the same branch (they appear in the existing PR)
  try {
    await commitAndPush(
      task.workDir,
      currentBranch,
      task.issueNumber ?? 0,
      githubToken,
      repository.fullName,
      `test(#${task.issueNumber}): add generated tests for ${task.issueTitle ?? 'issue'}`
    );
    await reportProgress(task.id, 'Generated test files committed and pushed to the branch.', 'info', config);
  } catch (err) {
    // Non-fatal — tests may not have created new files (e.g. only ran existing ones)
    await reportProgress(task.id, `Note: could not push test files: ${(err as Error).message}`, 'info', config);
  }

  // Upload screenshots from test output directories
  const screenshots = await findScreenshots(task.workDir);
  for (const filePath of screenshots) {
    const filename = path.relative(task.workDir, filePath);
    await uploadArtifact(task.id, 'screenshot', filename, filePath, config).catch(() => {});
  }

  // Parse the last JSON summary line from Claude's output
  let summary = '';
  for (let i = outputLines.length - 1; i >= 0; i--) {
    const line = outputLines[i].trim();
    if (line.startsWith('{') && line.includes('"passed"')) {
      try {
        JSON.parse(line); // validate
        summary = line;
        break;
      } catch { /* keep searching */ }
    }
  }

  await reportProgress(task.id, summary ? `Test summary: ${summary}` : 'Tests completed.', 'info', config);
  return { success: true, summary };
}

// ─── Review task execution ────────────────────────────────────────────────────

function buildReviewPrompt(): string {
  const lines: string[] = [];
  lines.push('You are a code reviewer. Run `git diff main` (or `git diff origin/main`) to see the changes in this branch.');
  lines.push('');
  lines.push('Review the changes for:');
  lines.push('- Bugs and potential runtime errors');
  lines.push('- Security vulnerabilities (injection, auth bypasses, sensitive data exposure)');
  lines.push('- Performance issues');
  lines.push('- Missing error handling or edge cases');
  lines.push('- Type safety issues');
  lines.push('- Code clarity and maintainability');
  lines.push('');
  lines.push('First, write a concise overall review summary (2-5 sentences describing what changed and the overall quality). Then list your inline findings below.');
  lines.push('');
  lines.push('At the very end of your response, output the marker REVIEW_COMMENTS: followed by a JSON array on the next line:');
  lines.push('REVIEW_COMMENTS:');
  lines.push('[');
  lines.push('  {');
  lines.push('    "filename": "relative/path/to/file.ts",');
  lines.push('    "startLine": 42,');
  lines.push('    "endLine": 42,');
  lines.push('    "severity": "error|warning|suggestion",');
  lines.push('    "body": "Clear explanation of the issue and how to fix it"');
  lines.push('  }');
  lines.push(']');
  lines.push('');
  lines.push('Use line numbers from the NEW version of each file (the + side of the diff). If no issues found, output REVIEW_COMMENTS: followed by [].');
  return lines.join('\n');
}

async function executeReviewTask(
  claimed: ClaimedTask,
  config: DaemonConfig
): Promise<ExecutionResult> {
  const { task, agent, repository, githubToken } = claimed;

  if (!repository || !githubToken) {
    return { success: false, failureReason: 'agent_error' };
  }

  // Determine a usable work directory — reuse the cached one if it still exists,
  // otherwise do a fresh clone of the implementation branch.
  let workDir = task.workDir ?? '';
  let needsFreshCheckout = !workDir;

  if (!needsFreshCheckout) {
    try {
      await fs.access(workDir);
    } catch {
      needsFreshCheckout = true;
    }
  }

  if (needsFreshCheckout) {
    const branch = branchName(task.issueNumber ?? 0, task.issueTitle);
    await reportProgress(task.id, `No cached work directory — cloning branch: ${branch}`, 'info', config);
    try {
      // Clone the default branch (shallow), then fetch and switch to the implementation branch.
      const freshDir = await prepareWorkDir(repository.fullName, repository.htmlUrl, githubToken, null);
      await execa('git', ['fetch', '--depth=1', 'origin', branch], { cwd: freshDir });
      await execa('git', ['checkout', '-b', branch, 'FETCH_HEAD'], { cwd: freshDir });
      workDir = freshDir;
    } catch (err) {
      await reportProgress(task.id, `Failed to clone repository for review: ${(err as Error).message}`, 'error', config);
      return { success: false, failureReason: 'agent_error' };
    }
  }

  let currentBranch: string;
  try {
    const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: workDir });
    currentBranch = stdout.trim();
  } catch {
    await reportProgress(task.id, 'Failed to determine current branch.', 'error', config);
    return { success: false, failureReason: 'agent_error' };
  }

  const model = agent?.model ?? 'claude-sonnet-4-6';
  const instructions = agent?.instructions ?? '';

  await reportProgress(task.id, `Starting code review on branch: ${currentBranch}`, 'info', config);

  const prompt = buildReviewPrompt();
  const reviewArgs = ['--print', '--model', model, '--dangerously-skip-permissions'];
  if (instructions) reviewArgs.push('--system-prompt', instructions);
  reviewArgs.push(prompt);

  // Use buffered stdout (not streaming) to guarantee full output is available before parsing.
  // runClaude's async data handler can race with `await proc`, leaving outputLines incomplete.
  let fullOutput = '';
  try {
    const result = await execa('claude', reviewArgs, {
      cwd: workDir,
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env },
    });
    fullOutput = result.stdout;
  } catch (err) {
    const exitErr = err as ExecaError;
    fullOutput = (typeof exitErr.stdout === 'string' ? exitErr.stdout : '') ?? '';
    await reportProgress(task.id, `Claude Code exited with error: ${exitErr.message}`, 'error', config);
    if (!fullOutput) return { success: false, failureReason: 'agent_error' };
  }

  // Report each line to the activity log now that we have the complete output.
  for (const line of fullOutput.split('\n')) {
    if (line.trim()) await reportProgress(task.id, line, 'output', config).catch(() => {});
  }

  // Parse: everything before REVIEW_COMMENTS: is the summary; after is the JSON array
  const markerIdx = fullOutput.lastIndexOf('REVIEW_COMMENTS:');
  const summary = markerIdx > 0 ? fullOutput.slice(0, markerIdx).trim() : 'Review complete.';
  const jsonPart = markerIdx >= 0 ? fullOutput.slice(markerIdx + 'REVIEW_COMMENTS:'.length).trim() : '[]';

  let comments: ReviewCommentInput[] = [];
  try {
    const arrayStart = jsonPart.indexOf('[');
    if (arrayStart >= 0) {
      comments = JSON.parse(jsonPart.slice(arrayStart));
    }
  } catch {
    await reportProgress(task.id, 'Could not parse review comments JSON — proceeding with summary only.', 'info', config);
  }

  await reportProgress(task.id, `Review complete. Found ${comments.length} inline comment(s). Posting to GitHub…`, 'info', config);

  await postReviewComments(task.id, summary, comments, config);

  return { success: true, branchName: currentBranch, summary: `${comments.length} review comment(s) posted.` };
}

// ─── Implementation task execution ───────────────────────────────────────────

export async function executeTask(
  claimed: ClaimedTask,
  config: DaemonConfig
): Promise<ExecutionResult> {
  if (claimed.task.taskType === 'test') {
    return executeTestTask(claimed, config);
  }
  if (claimed.task.taskType === 'review') {
    return executeReviewTask(claimed, config);
  }

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

  const skills = agent?.skills ?? [];
  if (skills.length > 0) {
    await writeSkillFiles(workDir, skills);
  }

  const branch = branchName(task.issueNumber ?? 0, task.issueTitle);
  await createBranch(workDir, branch);

  // Fetch conversation thread from platform for context
  const comments = await fetchIssueComments(task.id, config).catch(() => []);

  const prompt = buildPrompt(task, comments);
  const implArgs = ['--model', model, '--dangerously-skip-permissions'];
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
    pushed = await commitAndPush(workDir, branch, task.issueNumber ?? 0, githubToken, repository.fullName);
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
