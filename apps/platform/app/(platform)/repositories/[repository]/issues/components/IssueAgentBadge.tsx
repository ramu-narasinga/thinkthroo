"use client";

import React, { useState, useEffect } from "react";
import { Bot, Clock, Loader2, CheckCircle2, XCircle, Ban, ExternalLink } from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@thinkthroo/ui/components/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import { agentTaskClientService, AgentTaskItem, AgentTaskStatus } from "@/service/agentTask/client";
import { AgentItem } from "@/service/agent/client";

interface IssueAgentBadgeProps {
  repositoryFullName: string;
  issueNumber: number;
  activeAgents: AgentItem[];
}

type BadgeConfig = {
  label: string;
  icon: React.ReactNode;
  className: string;
};

const STATUS_CONFIGS: Record<AgentTaskStatus, BadgeConfig> = {
  queued: {
    label: "Queued",
    icon: <Clock className="h-3 w-3" />,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  dispatched: {
    label: "Picking up…",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  waiting_local_directory: {
    label: "Waiting…",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  running: {
    label: "Running",
    icon: <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse inline-block" />,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-red-50 text-red-700 border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: <Ban className="h-3 w-3" />,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
};

const ACTIVE_STATUSES: AgentTaskStatus[] = ["queued", "dispatched", "waiting_local_directory", "running"];

export function IssueAgentBadge({ repositoryFullName, issueNumber, activeAgents }: IssueAgentBadgeProps) {
  const [task, setTask] = useState<AgentTaskItem | null>(null);
  const [isEnqueuing, setIsEnqueuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load latest task for this issue on mount
  useEffect(() => {
    agentTaskClientService.getByIssue(repositoryFullName, issueNumber).then((tasks) => {
      // Find most recent active task, or most recent of any status
      const active = tasks.find((t) => ACTIVE_STATUSES.includes(t.status));
      setTask(active ?? tasks[0] ?? null);
    }).catch(() => {});
  }, [repositoryFullName, issueNumber]);

  // Subscribe to Supabase Realtime for live status updates
  useEffect(() => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase.channel(`agent-task-issue:${repositoryFullName}:${issueNumber}`) as any)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_tasks",
          filter: `issue_number=eq.${issueNumber}`,
        },
        (payload: { new: AgentTaskItem; eventType: string }) => {
          if (payload.eventType === "DELETE") return;
          const updated = payload.new as AgentTaskItem;
          setTask((prev) => {
            if (!prev) return updated;
            return new Date(updated.createdAt) >= new Date(prev.createdAt) ? updated : prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [repositoryFullName, issueNumber]);

  const handleEnqueue = async (agentId: string) => {
    setIsEnqueuing(true);
    setError(null);
    try {
      const response = await fetch("/api/agents/tasks/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, issueNumber, repositoryFullName }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Failed to enqueue task");
        return;
      }

      const data = await response.json() as { taskId: string; status: string };
      // Optimistically show queued badge — Realtime will update when DB changes
      setTask({
        id: data.taskId,
        agentId,
        runtimeId: null,
        repositoryId: "",
        userId: "",
        issueNumber,
        issueTitle: null,
        issueBody: null,
        issueHtmlUrl: null,
        status: "queued",
        failureReason: null,
        result: null,
        waitReason: null,
        sessionId: null,
        workDir: null,
        attemptCount: 0,
        userMessage: null,
        forceFreshSession: false,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
      });
    } catch {
      setError("Network error");
    } finally {
      setIsEnqueuing(false);
    }
  };

  // In-progress — show status badge only, no action button
  const IN_PROGRESS: AgentTaskStatus[] = ["queued", "dispatched", "waiting_local_directory", "running"];
  if (task && IN_PROGRESS.includes(task.status)) {
    const config = STATUS_CONFIGS[task.status] ?? STATUS_CONFIGS.queued;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  }

  // Completed or failed — show status badge + Re-run button
  const RERUNNABLE: AgentTaskStatus[] = ["completed", "failed"];
  if (task && RERUNNABLE.includes(task.status)) {
    const config = STATUS_CONFIGS[task.status];
    const result = task.result ? (() => { try { return JSON.parse(task.result); } catch { return null; } })() : null;

    if (activeAgents.length === 0) {
      return (
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
            title={task.failureReason ?? undefined}
          >
            {config.icon}
            {config.label}
          </span>
          {result?.prUrl && (
            <a
              href={result.prUrl as string}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-0.5"
            >
              PR <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
            title={task.failureReason ?? undefined}
          >
            {config.icon}
            {config.label}
          </span>
          {result?.prUrl && (
            <a
              href={result.prUrl as string}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-0.5"
            >
              PR <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs gap-1"
                disabled={isEnqueuing}
              >
                {isEnqueuing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Bot className="h-3 w-3" />
                )}
                Re-run
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs">Select agent</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {activeAgents.map((agent) => (
                <DropdownMenuItem
                  key={agent.id}
                  onClick={() => handleEnqueue(agent.id)}
                  className="text-sm"
                >
                  <Bot className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  {agent.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  // Cancelled / no task — show "Run with Agent" button
  if (activeAgents.length === 0) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs gap-1"
            disabled={isEnqueuing}
          >
            {isEnqueuing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Bot className="h-3 w-3" />
            )}
            Run with Agent
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs">Select agent</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {activeAgents.map((agent) => (
            <DropdownMenuItem
              key={agent.id}
              onClick={() => handleEnqueue(agent.id)}
              className="text-sm"
            >
              <Bot className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              {agent.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
