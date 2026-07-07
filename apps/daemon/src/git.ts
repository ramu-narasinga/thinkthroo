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
  const authedUrl = `https://x-access-token:${githubToken}@github.com/${repoFullName}.git`;

  if (existingWorkDir && (await fs.pathExists(existingWorkDir))) {
    // Reuse existing work dir — update remote URL with fresh token before fetch
    await execa('git', ['remote', 'set-url', 'origin', authedUrl], { cwd: existingWorkDir });
    await execa('git', ['config', '--local', 'credential.helper', ''], { cwd: existingWorkDir });
    await execa('git', ['fetch', 'origin'], { cwd: existingWorkDir });
    return existingWorkDir;
  }

  const workDir = path.join(os.tmpdir(), 'thinkthroo', repoFullName.replace('/', '-'), Date.now().toString());
  await fs.ensureDir(workDir);

  await execa('git', ['clone', '--depth=1', authedUrl, workDir]);
  // Prevent the OS keychain credential helper from overriding the embedded token
  await execa('git', ['config', '--local', 'credential.helper', ''], { cwd: workDir });
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
  issueNumber: number,
  githubToken: string,
  repoFullName: string,
  commitMessage?: string
): Promise<boolean> {
  // Stage and commit any file changes left uncommitted (e.g. if Claude Code skipped committing)
  const { stdout: status } = await execa('git', ['status', '--porcelain'], { cwd: workDir });
  if (status.trim()) {
    await execa('git', ['add', '-A'], { cwd: workDir });
    await execa('git', [
      'commit',
      '-m', commitMessage ?? `fix: resolve issue #${issueNumber}`,
      '--author', 'thinkthroo <daemon@thinkthroo.com>',
    ], { cwd: workDir });
  }

  // Check for unpushed commits — covers both the commit above and any Claude Code made itself
  const { stdout: aheadCount } = await execa(
    'git', ['rev-list', '--count', 'HEAD', '--not', '--remotes'],
    { cwd: workDir }
  );
  if (parseInt(aheadCount.trim()) === 0) {
    return false; // Nothing to push
  }

  const authedUrl = `https://x-access-token:${githubToken}@github.com/${repoFullName}.git`;
  await execa('git', ['remote', 'set-url', 'origin', authedUrl], { cwd: workDir });

  await execa('git', ['push', 'origin', branch], { cwd: workDir });

  const cleanUrl = `https://github.com/${repoFullName}.git`;
  await execa('git', ['remote', 'set-url', 'origin', cleanUrl], { cwd: workDir });

  return true;
}
