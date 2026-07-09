import fs from 'fs-extra';
import path from 'path';
import os from 'os';

function claudeConfigPath(): string {
  const dir = process.env.CLAUDE_CONFIG_DIR;
  return dir ? path.join(dir, '.claude.json') : path.join(os.homedir(), '.claude.json');
}

// Marks workDir as a trusted project so Claude Code honors that repo's
// .claude/settings.json (permissions.allow, additionalDirectories, etc.)
// instead of silently dropping it — tmp clone dirs are unique per run and
// are otherwise never a known/trusted project.
export async function trustWorkDir(workDir: string): Promise<void> {
  // Claude Code checks trust against the OS-resolved cwd (getcwd() returns the
  // canonical path, e.g. /private/var/... on macOS where /var is a symlink),
  // not the possibly-symlinked path we constructed workDir from — resolve here
  // so the stored key actually matches what gets looked up.
  const resolvedWorkDir = await fs.realpath(workDir).catch(() => workDir);

  const file = claudeConfigPath();
  let data: Record<string, any> = {};
  try {
    data = await fs.readJson(file);
  } catch {
    // missing/corrupt config file — start fresh rather than fail the run
  }
  data.projects ??= {};
  data.projects[resolvedWorkDir] ??= {};
  data.projects[resolvedWorkDir].hasTrustDialogAccepted = true;
  await fs.writeJson(file, data, { spaces: 2 });
}
