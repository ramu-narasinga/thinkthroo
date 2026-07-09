import chalk from 'chalk';
import { DaemonConfig } from './config.js';
import {
  heartbeat,
  claimTask,
  startTask,
  completeTask,
  failTask,
  deregister,
} from './reporter.js';
import { executeTask } from './executor.js';

const HEARTBEAT_INTERVAL_MS = 15_000;
const POLL_INTERVAL_MS = 3_000;

export async function runDaemon(config: DaemonConfig): Promise<void> {
  console.log(chalk.green('✓') + ' Daemon started');
  console.log(chalk.dim(`  Platform: ${config.platformUrl}`));
  console.log(chalk.dim(`  Runtime:  ${config.runtimeId}`));
  console.log('');

  // Send initial heartbeat, then repeat every 15 seconds
  await sendHeartbeat(config);
  const heartbeatTimer = setInterval(() => sendHeartbeat(config), HEARTBEAT_INTERVAL_MS);

  // Poll for tasks every 3 seconds
  const pollTimer = setInterval(() => poll(config), POLL_INTERVAL_MS);

  // Keep the process alive
  const shutdown = async (): Promise<void> => {
    clearInterval(heartbeatTimer);
    clearInterval(pollTimer);
    await Promise.race([
      deregister(config),
      new Promise((resolve) => setTimeout(resolve, 3_000)),
    ]);
    process.exit(0);
  };

  process.on('SIGINT', () => {
    console.log('\n' + chalk.yellow('Shutting down…'));
    void shutdown();
  });

  process.on('SIGTERM', () => {
    void shutdown();
  });
}

async function sendHeartbeat(config: DaemonConfig): Promise<void> {
  try {
    await heartbeat(config);
  } catch {
    console.error(chalk.red('✗') + ' Heartbeat failed');
  }
}

// Track task IDs being executed to prevent duplicate execution
const runningTasks = new Set<string>();

async function poll(config: DaemonConfig): Promise<void> {
  let claimed;
  try {
    claimed = await claimTask(config);
  } catch (err) {
    console.error(chalk.red('✗') + ` Claim error: ${(err as Error).message}`);
    return;
  }

  if (!claimed) return; // No work available

  const { task } = claimed;

  if (runningTasks.has(task.id)) return; // Already running
  runningTasks.add(task.id);

  const label = task.issueTitle
    ? `#${task.issueNumber} ${task.issueTitle}`
    : `task ${task.id.slice(0, 8)}`;

  console.log(chalk.blue('→') + ` Claimed ${label}`);

  try {
    await startTask(task.id, config);

    const result = await executeTask(claimed, config);

    if (result.success) {
      await completeTask(task.id, {
        prUrl: result.prUrl,
        summary: result.summary,
        branchName: result.branchName,
        phase: result.phase,
        question: result.question,
      }, config);
      console.log(chalk.green('✓') + ` Completed ${label}` + (result.prUrl ? ` — ${result.prUrl}` : ''));
    } else {
      await failTask(task.id, result.failureReason ?? 'agent_error', config);
      console.log(chalk.red('✗') + ` Failed ${label}: ${result.failureReason}`);
    }
  } catch (err) {
    console.error(chalk.red('✗') + ` Unexpected error on ${label}: ${(err as Error).message}`);
    await failTask(task.id, 'agent_error', config).catch(() => {});
  } finally {
    runningTasks.delete(task.id);
  }
}
