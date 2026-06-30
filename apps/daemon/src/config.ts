import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.thinkthroo');
const CONFIG_FILE = path.join(CONFIG_DIR, 'daemon.json');

export interface DaemonConfig {
  runtimeId: string;
  apiKey: string;
  platformUrl: string;
}

export async function loadConfig(): Promise<DaemonConfig> {
  if (!(await fs.pathExists(CONFIG_FILE))) {
    throw new Error(
      `No daemon config found at ${CONFIG_FILE}.\n` +
      `Run: thinkthroo-daemon configure --runtime-id <id> --api-key <key> --platform-url <url>`
    );
  }
  const raw = await fs.readJson(CONFIG_FILE);
  if (!raw.runtimeId || !raw.apiKey || !raw.platformUrl) {
    throw new Error(`Daemon config at ${CONFIG_FILE} is missing required fields.`);
  }
  return raw as DaemonConfig;
}

export async function saveConfig(config: DaemonConfig): Promise<void> {
  await fs.ensureDir(CONFIG_DIR);
  await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
}

export function configPath(): string {
  return CONFIG_FILE;
}
