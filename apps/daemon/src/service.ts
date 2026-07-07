import fs from 'fs-extra';
import path from 'node:path';
import os from 'node:os';
import { execa } from 'execa';

const LOGS_DIR = path.join(os.homedir(), '.thinkthroo', 'logs');
const OUT_LOG = path.join(LOGS_DIR, 'daemon.out.log');
const ERR_LOG = path.join(LOGS_DIR, 'daemon.err.log');

const MACOS_LABEL = 'com.thinkthroo.daemon';
const MACOS_PLIST = path.join(os.homedir(), 'Library', 'LaunchAgents', `${MACOS_LABEL}.plist`);
const LINUX_UNIT_DIR = path.join(os.homedir(), '.config', 'systemd', 'user');
const LINUX_UNIT = path.join(LINUX_UNIT_DIR, 'thinkthroo-daemon.service');

interface EntrypointPaths {
  node: string;
  script: string;
}

function resolveEntrypoint(): EntrypointPaths {
  // Follows npm-global-install symlinks (and nvm/volta version-manager symlinks) to real,
  // absolute paths — launchd/systemd invoke with a minimal environment and can't rely on
  // PATH-based lookup of `node` or `thinkthroo`.
  return {
    node: fs.realpathSync(process.execPath),
    script: fs.realpathSync(process.argv[1]),
  };
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function installMacOS(): Promise<void> {
  const { node, script } = resolveEntrypoint();
  await fs.ensureDir(LOGS_DIR);

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${MACOS_LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${xmlEscape(node)}</string>
    <string>${xmlEscape(script)}</string>
    <string>start</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>${xmlEscape(process.env.PATH ?? '/usr/local/bin:/usr/bin:/bin')}</string>
    <key>HOME</key>
    <string>${xmlEscape(os.homedir())}</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <dict>
    <key>SuccessfulExit</key>
    <false/>
  </dict>
  <key>ThrottleInterval</key>
  <integer>10</integer>
  <key>StandardOutPath</key>
  <string>${xmlEscape(OUT_LOG)}</string>
  <key>StandardErrorPath</key>
  <string>${xmlEscape(ERR_LOG)}</string>
</dict>
</plist>
`;

  await fs.ensureDir(path.dirname(MACOS_PLIST));
  await fs.writeFile(MACOS_PLIST, plist, 'utf8');

  // Unload first in case a stale copy is already loaded (e.g. re-running after an upgrade).
  await execa('launchctl', ['unload', '-w', MACOS_PLIST]).catch(() => {});
  await execa('launchctl', ['load', '-w', MACOS_PLIST]);
}

async function uninstallMacOS(): Promise<void> {
  await execa('launchctl', ['unload', '-w', MACOS_PLIST]).catch(() => {});
  await fs.remove(MACOS_PLIST);
}

async function statusMacOS(): Promise<string> {
  if (!(await fs.pathExists(MACOS_PLIST))) {
    return 'Not installed. Run `thinkthroo service install` to set it up.';
  }
  const { stdout } = await execa('launchctl', ['list']).catch(() => ({ stdout: '' }));
  const running = stdout.split('\n').some((line) => line.includes(MACOS_LABEL));
  return running
    ? `Installed and loaded (launchd label: ${MACOS_LABEL}). Logs: ${OUT_LOG}`
    : `Installed but not currently loaded. Run \`thinkthroo service install\` to reload it. Logs: ${OUT_LOG}`;
}

async function installLinux(): Promise<void> {
  const { node, script } = resolveEntrypoint();
  await fs.ensureDir(LOGS_DIR);

  const unit = `[Unit]
Description=thinkthroo daemon

[Service]
ExecStart=${node} ${script} start
Restart=on-failure
RestartSec=5
Environment=PATH=${process.env.PATH ?? '/usr/local/bin:/usr/bin:/bin'}
StandardOutput=append:${OUT_LOG}
StandardError=append:${ERR_LOG}

[Install]
WantedBy=default.target
`;

  await fs.ensureDir(LINUX_UNIT_DIR);
  await fs.writeFile(LINUX_UNIT, unit, 'utf8');

  await execa('systemctl', ['--user', 'daemon-reload']);
  await execa('systemctl', ['--user', 'enable', '--now', 'thinkthroo-daemon.service']);

  try {
    await execa('loginctl', ['enable-linger', os.userInfo().username]);
  } catch {
    console.warn(
      `Warning: could not enable lingering for your user, so the service may not survive a full reboot ` +
      `until you're logged in. Run manually: sudo loginctl enable-linger ${os.userInfo().username}`
    );
  }
}

async function uninstallLinux(): Promise<void> {
  await execa('systemctl', ['--user', 'disable', '--now', 'thinkthroo-daemon.service']).catch(() => {});
  await fs.remove(LINUX_UNIT);
  await execa('systemctl', ['--user', 'daemon-reload']).catch(() => {});
}

async function statusLinux(): Promise<string> {
  if (!(await fs.pathExists(LINUX_UNIT))) {
    return 'Not installed. Run `thinkthroo service install` to set it up.';
  }
  const { stdout } = await execa('systemctl', ['--user', 'is-active', 'thinkthroo-daemon.service']).catch(
    (err) => ({ stdout: (err as { stdout?: string }).stdout ?? 'unknown' })
  );
  return `Installed. systemd status: ${stdout.trim()}. Logs: ${OUT_LOG}`;
}

export async function installService(): Promise<void> {
  if (process.platform === 'darwin') return installMacOS();
  if (process.platform === 'linux') return installLinux();
  throw new Error(
    `Auto-start isn't automated on ${process.platform} yet. Run \`thinkthroo start\` manually ` +
    `(e.g. via Windows Task Scheduler) to keep it running.`
  );
}

export async function uninstallService(): Promise<void> {
  if (process.platform === 'darwin') return uninstallMacOS();
  if (process.platform === 'linux') return uninstallLinux();
  throw new Error(`No managed service to uninstall on ${process.platform}.`);
}

export async function serviceStatus(): Promise<string> {
  if (process.platform === 'darwin') return statusMacOS();
  if (process.platform === 'linux') return statusLinux();
  return `Auto-start isn't automated on ${process.platform} yet.`;
}
