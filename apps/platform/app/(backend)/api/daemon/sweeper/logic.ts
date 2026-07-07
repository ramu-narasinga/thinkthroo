import { sql } from 'drizzle-orm';
import { serverDB } from '@/database';
import { agentTasks } from '@/database/schemas';

export interface SweepResult {
  markedOffline: number;
  tasksFailed: number;
  tasksRequeued: number;
  cliAuthRequestsCleaned: number;
}

export async function runSweep(): Promise<SweepResult> {
  // Step 1: Mark runtimes offline if no heartbeat in the last 150 seconds
  const offlineResult = await serverDB.execute(sql`
    UPDATE daemon_runtimes
    SET status = 'offline'
    WHERE status = 'online'
      AND last_seen_at < now() - interval '150 seconds'
    RETURNING id
  `);
  const markedOffline = Array.from(offlineResult).length;

  // Step 2 (independent of step 1): clean up expired/consumed one-time CLI auth codes.
  const cliAuthCleanupResult = await serverDB.execute(sql`
    DELETE FROM daemon_cli_auth_requests
    WHERE created_at < now() - interval '1 hour'
    RETURNING code
  `);
  const cliAuthRequestsCleaned = Array.from(cliAuthCleanupResult).length;

  if (markedOffline === 0) {
    return { markedOffline: 0, tasksFailed: 0, tasksRequeued: 0, cliAuthRequestsCleaned };
  }

  // Step 3: Fail orphaned tasks for all offline runtimes (not just newly-offline ones,
  // to catch any tasks left over from a previous sweep that didn't complete the fail step)
  const orphanResult = await serverDB.execute(sql`
    UPDATE agent_tasks
    SET status = 'failed',
        completed_at = now(),
        failure_reason = 'runtime_offline',
        wait_reason = NULL
    WHERE status IN ('dispatched', 'running', 'waiting_local_directory')
      AND runtime_id IN (
        SELECT id FROM daemon_runtimes WHERE status = 'offline'
      )
    RETURNING id, agent_id, runtime_id, repository_id, user_id,
              issue_number, issue_title, issue_body, issue_html_url,
              session_id, work_dir, attempt_count, priority
  `);
  const tasksFailed = Array.from(orphanResult).length;

  // Step 4: Re-queue retryable tasks (attemptCount < 2)
  type OrphanRow = {
    id: string;
    agent_id: string;
    runtime_id: string;
    repository_id: string;
    user_id: string;
    issue_number: number | null;
    issue_title: string | null;
    issue_body: string | null;
    issue_html_url: string | null;
    session_id: string | null;
    work_dir: string | null;
    attempt_count: number;
    priority: number;
  };

  const retryable = (Array.from(orphanResult) as OrphanRow[]).filter(
    (row) => row.attempt_count < 2
  );

  let tasksRequeued = 0;
  if (retryable.length > 0) {
    const newTasks = retryable.map((row) => ({
      agentId: row.agent_id,
      runtimeId: row.runtime_id,
      repositoryId: row.repository_id,
      userId: row.user_id,
      issueNumber: row.issue_number,
      issueTitle: row.issue_title,
      issueBody: row.issue_body,
      issueHtmlUrl: row.issue_html_url,
      status: 'queued' as const,
      sessionId: row.session_id,
      workDir: row.work_dir,
      attemptCount: row.attempt_count + 1,
      priority: row.priority,
    }));

    const inserted = await serverDB
      .insert(agentTasks)
      .values(newTasks)
      .returning({ id: agentTasks.id });
    tasksRequeued = inserted.length;
  }

  return { markedOffline, tasksFailed, tasksRequeued, cliAuthRequestsCleaned };
}
