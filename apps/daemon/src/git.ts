import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export async function prepareWorkDir(
  repoFullName: string,
  repoHtmlUrl: string,
  githubToken: string,
  existingWorkDir: string | null
): Promise<string> {
  if (existingWorkDir && (await fs.pathExists(existingWorkDir))) {
    // Reuse existing work dir from a prior session (crash recovery)
    await execa('git', ['fetch', 'origin'], { cwd: existingWorkDir });
    return existingWorkDir;
  }

  const workDir = path.join(os.tmpdir(), 'thinkthroo-daemon', repoFullName.replace('/', '-'), Date.now().toString());
  await fs.ensureDir(workDir);

  // Embed the token in the remote URL so git can push without interactive auth
  const [, repoPath] = repoHtmlUrl.replace('https://', '').split('/').reduce(
    (acc, part, i) => { if (i > 0) acc[1] += (acc[1] ? '/' : '') + part; return acc; },
    ['', ''] as [string, string]
  );
  const cloneUrl = `https://x-access-token:${githubToken}@github.com/${repoFullName}.git`;

  await execa('git', ['clone', '--depth=1', cloneUrl, workDir]);
  return workDir;
}

export function branchName(issueNumber: number, issueTitle: string | null): string {
  const slug = (issueTitle ?? `issue-${issueNumber}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `fix/issue-${issueNumber}-${slug}`;
}

export async function createBranch(workDir: string, branch: string): Promise<void> {
  // Check if branch already exists (crash recovery path)
  const { stdout } = await execa('git', ['branch', '--list', branch], { cwd: workDir });
  if (stdout.trim()) {
    await execa('git', ['checkout', branch], { cwd: workDir });
  } else {
    await execa('git', ['checkout', '-b', branch], { cwd: workDir });
  }
}

export async function commitAndPush(
  workDir: string,
  branch: string,
  issueNumber: number
): Promise<boolean> {
  const { stdout: status } = await execa('git', ['status', '--porcelain'], { cwd: workDir });
  if (!status.trim()) {
    return false; // Nothing to commit
  }

  await execa('git', ['add', '-A'], { cwd: workDir });
  await execa('git', [
    'commit',
    '-m', `fix: resolve issue #${issueNumber}`,
    '--author', 'thinkthroo-daemon <daemon@thinkthroo.com>',
  ], { cwd: workDir });
  await execa('git', ['push', 'origin', branch], { cwd: workDir });
  return true;
}
