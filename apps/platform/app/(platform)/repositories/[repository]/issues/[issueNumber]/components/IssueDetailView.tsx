"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Ban,
  ExternalLink,
  GitPullRequest,
  Zap,
  Bot,
  User,
  Users2,
  Send,
  Code2,
  MessageSquare,
  FlaskConical,
  Circle,
} from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import { Badge } from "@thinkthroo/ui/components/badge";
import { createClient } from "@/utils/supabase/client";
import {
  agentTaskClientService,
  AgentTaskItem,
  AgentTaskLogItem,
  AgentTaskStatus,
} from "@/service/agentTask/client";
import {
  issueCommentClientService,
  IssueCommentItem,
} from "@/service/issueComment/client";
import { issueBoardStateClientService } from "@/service/issueBoardState/client";
import { agentClientService } from "@/service/agent/client";
import { squadClientService } from "@/service/squad/client";
import { CodeTab } from "./CodeTab";
import { TestsTab } from "./TestsTab";

interface Props {
  repositoryFullName: string;
  issueNumber: number;
}

type BadgeConfig = { label: string; icon: React.ReactNode; className: string };

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

type IssueStatus = "open" | "in_progress" | "completed" | "failed";

const ISSUE_STATUS_CONFIGS: Record<
  IssueStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  open: {
    label: "Open",
    icon: <Circle className="h-3 w-3" />,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  in_progress: {
    label: "In Progress",
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
};

const LOG_TYPE_COLORS: Record<string, string> = {
  info: "text-muted-foreground",
  output: "text-foreground",
  error: "text-red-600",
};

function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

// Renders agent message body with inline markdown: **bold**, `code`, and URLs
function AgentMessageBody({ body }: { body: string }) {
  const segments = body.split(/(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/\S+)/g);
  return (
    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
      {segments.map((seg, i) => {
        if (seg.startsWith("**") && seg.endsWith("**")) {
          return <strong key={i}>{seg.slice(2, -2)}</strong>;
        }
        if (seg.startsWith("`") && seg.endsWith("`")) {
          return (
            <code key={i} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
              {seg.slice(1, -1)}
            </code>
          );
        }
        if (/^https?:\/\//.test(seg)) {
          return (
            <a
              key={i}
              href={seg}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {seg}
            </a>
          );
        }
        return <React.Fragment key={i}>{seg}</React.Fragment>;
      })}
    </p>
  );
}

function TaskRow({
  task,
}: {
  task: AgentTaskItem;
  repositoryFullName: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState<AgentTaskLogItem[] | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const logsEndRef = React.useRef<HTMLDivElement>(null);

  const config = STATUS_CONFIGS[task.status] ?? STATUS_CONFIGS.queued;
  const result: { prUrl?: string; branchName?: string; summary?: string } | null = task.result
    ? (() => { try { return JSON.parse(task.result); } catch { return null; } })()
    : null;

  const handleExpand = async () => {
    const opening = !expanded;
    setExpanded(opening);
    if (opening && logs === null && !loadingLogs) {
      setLoadingLogs(true);
      try {
        const data = await agentTaskClientService.getLogs(task.id);
        setLogs(data);
      } catch {
        setLogs([]);
      } finally {
        setLoadingLogs(false);
      }
    }
  };

  useEffect(() => {
    if (!expanded) return;

    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase.channel(`task-progress:${task.id}`) as any)
      .on(
        "broadcast",
        { event: "progress" },
        (payload: { payload: { message: string; type: string; timestamp: string } }) => {
          const { message, type, timestamp } = payload.payload;
          const newEntry: AgentTaskLogItem = {
            id: `live-${timestamp}`,
            taskId: task.id,
            userId: task.userId,
            type: type as AgentTaskLogItem["type"],
            message,
            createdAt: new Date(timestamp),
          };
          setLogs((prev) => (prev ? [...prev, newEntry] : [newEntry]));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [expanded, task.id, task.userId]);

  useEffect(() => {
    if (expanded && logs && logs.length > 0) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs?.length, expanded]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
        onClick={handleExpand}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}

        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
        >
          {config.icon}
          {config.label}
        </span>

        {task.taskType && task.taskType !== "implementation" && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border shrink-0">
            {task.taskType === "test" ? "Test" : task.taskType === "review" ? "Review" : task.taskType}
          </span>
        )}

        <span className="flex-1 text-sm font-medium truncate">
          {task.issueTitle ?? `Issue #${task.issueNumber}`}
          {task.attemptCount > 0 && (
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              attempt {task.attemptCount + 1}
            </span>
          )}
        </span>

        {result?.prUrl && (
          <a
            href={result.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline inline-flex items-center gap-0.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <GitPullRequest className="h-3 w-3" />
            PR
          </a>
        )}

        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {formatDate(task.createdAt)}
        </span>
      </button>

      {expanded && (
        <div className="border-t bg-muted/10">
          {loadingLogs ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading logs…
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="px-4 py-3 font-mono text-xs space-y-0.5 max-h-72 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`leading-relaxed ${LOG_TYPE_COLORS[log.type] ?? "text-foreground"}`}
                >
                  <span className="text-muted-foreground/50 mr-2 select-none">
                    {new Date(log.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  {log.message}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          ) : (
            <p className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
              {task.status === "running" || task.status === "dispatched" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Waiting for output…
                </>
              ) : (
                "No logs recorded for this run."
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

type DetailTab = "activity" | "code" | "tests";

export function IssueDetailView({ repositoryFullName, issueNumber }: Props) {
  const [tasks, setTasks] = useState<AgentTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<IssueCommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("activity");
  const [assigneeDisplay, setAssigneeDisplay] = useState<{ type: 'agent' | 'squad' | null; name: string | null }>({ type: null, name: null });

  const encodedRepo = encodeURIComponent(repositoryFullName);
  const backHref = `/repositories/${encodedRepo}/issues`;

  useEffect(() => {
    agentTaskClientService.getByIssue(repositoryFullName, issueNumber).then((data) => {
      setTasks(data);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, [repositoryFullName, issueNumber]);

  useEffect(() => {
    async function resolveAssignee() {
      try {
        const items = await issueBoardStateClientService.getByRepository(repositoryFullName);
        const item = items.find((b) => b.issueNumber === issueNumber);
        if (!item || !item.assigneeType) return;

        if (item.assigneeType === 'agent' && item.assigneeAgentId) {
          const agents = await agentClientService.getByRepository(repositoryFullName);
          const agent = agents.find((a) => a.id === item.assigneeAgentId);
          setAssigneeDisplay({ type: 'agent', name: agent?.name ?? null });
        } else if (item.assigneeType === 'squad' && item.assigneeSquadId) {
          const squads = await squadClientService.getByRepository(repositoryFullName);
          const squad = squads.find((s) => s.id === item.assigneeSquadId);
          setAssigneeDisplay({ type: 'squad', name: squad?.name ?? null });
        }
      } catch { /* silent */ }
    }
    resolveAssignee();
  }, [repositoryFullName, issueNumber]);

  useEffect(() => {
    issueCommentClientService.getByIssue(repositoryFullName, issueNumber).then((data) => {
      setComments(data);
    }).catch(() => {}).finally(() => setLoadingComments(false));
  }, [repositoryFullName, issueNumber]);

  useEffect(() => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase.channel(`issue-detail:${repositoryFullName}:${issueNumber}`) as any)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_tasks",
          filter: `issue_number=eq.${issueNumber}`,
        },
        (payload: { new: AgentTaskItem; old: { id: string }; eventType: string }) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t))
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [repositoryFullName, issueNumber]);

  useEffect(() => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase.channel(`issue-comments-db:${repositoryFullName}:${issueNumber}`) as any)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "issue_comments",
          filter: `issue_number=eq.${issueNumber}`,
        },
        (payload: { new: IssueCommentItem }) => {
          setComments((prev) => {
            if (prev.some((c) => c.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [repositoryFullName, issueNumber]);

  const handleSubmitComment = async () => {
    const body = newComment.trim();
    if (!body || submitting) return;

    const optimistic: IssueCommentItem = {
      id: `optimistic-${Date.now()}`,
      repositoryId: "",
      issueNumber,
      userId: "",
      authorType: "user",
      agentTaskId: null,
      body,
      createdAt: new Date(),
    };
    setComments((prev) => [...prev, optimistic]);
    setNewComment("");
    setSubmitting(true);

    try {
      const saved = await issueCommentClientService.create(repositoryFullName, issueNumber, body);
      setComments((prev) => prev.map((c) => (c.id === optimistic.id ? saved : c)));

      const latestTask = tasks[0];
      let lastResult: { phase?: string } | null = null;
      try { lastResult = latestTask?.result ? JSON.parse(latestTask.result) : null; } catch { /* ignore */ }

      const isAfterPlanningRun =
        latestTask?.status === "completed" &&
        !latestTask.userMessage &&
        lastResult?.phase === "planning";

      if (isAfterPlanningRun) {
        await fetch("/api/agents/tasks/enqueue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: latestTask.agentId,
            issueNumber,
            repositoryFullName,
            userMessage: body,
          }),
        });
      }
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setNewComment(body);
    } finally {
      setSubmitting(false);
    }
  };

  const totalInputTokens = tasks.reduce((s, t) => s + (t.inputTokens ?? 0), 0);
  const totalOutputTokens = tasks.reduce((s, t) => s + (t.outputTokens ?? 0), 0);
  const totalCacheRead = tasks.reduce((s, t) => s + (t.cacheReadTokens ?? 0), 0);
  const totalCacheWrite = tasks.reduce((s, t) => s + (t.cacheWriteTokens ?? 0), 0);
  const hasUsage = totalInputTokens > 0 || totalOutputTokens > 0;

  const firstTask = tasks[tasks.length - 1];
  const issueHtmlUrl = firstTask?.issueHtmlUrl;
  const issueTitle = firstTask?.issueTitle ?? `Issue #${issueNumber}`;

  const completedTask = tasks.find(
    (t) => t.status === "completed" && t.result != null && (t.taskType === "implementation" || !t.taskType)
  ) ?? null;

  const showCodeTab = completedTask != null;

  const testTasks = React.useMemo(
    () =>
      tasks
        .filter((t) => t.taskType === "test")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [tasks]
  );

  const reviewTasks = React.useMemo(
    () =>
      tasks
        .filter((t) => t.taskType === "review")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [tasks]
  );

  // Derive overall issue status from the latest task
  const issueStatus = React.useMemo<IssueStatus>(() => {
    const latest = tasks[0];
    if (!latest) return "open";
    if (["queued", "dispatched", "waiting_local_directory", "running"].includes(latest.status))
      return "in_progress";
    if (latest.status === "completed") return "completed";
    if (latest.status === "failed") return "failed";
    return "open";
  }, [tasks]);

  // Collect all unique PR URLs from completed task results
  const prUrls = React.useMemo(() => {
    const seen = new Set<string>();
    const urls: string[] = [];
    for (const task of tasks) {
      if (!task.result) continue;
      try {
        const r = JSON.parse(task.result);
        if (r.prUrl && !seen.has(r.prUrl)) {
          seen.add(r.prUrl);
          urls.push(r.prUrl);
        }
      } catch { /* ignore */ }
    }
    return urls;
  }, [tasks]);

  const statusCfg = ISSUE_STATUS_CONFIGS[issueStatus];

  return (
    <div className="space-y-6 pb-12">

      {/* Issue header */}
      <div className="space-y-1">
        <div className="flex items-start gap-2">
          <h1 className="text-xl font-semibold leading-snug flex-1">{issueTitle}</h1>
          {!isLoading && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 mt-0.5 ${statusCfg.className}`}
            >
              {statusCfg.icon}
              {statusCfg.label}
            </span>
          )}
          {issueHtmlUrl && (
            <a
              href={issueHtmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground mt-1 shrink-0"
              title="Open on GitHub"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          #{issueNumber} · {repositoryFullName}
        </p>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex border-b gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("activity")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "activity"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Activity
        </button>
        {showCodeTab && (
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "code"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            Code
          </button>
        )}
        {showCodeTab && (
          <button
            type="button"
            onClick={() => setActiveTab("tests")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "tests"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Tests
            {testTasks.length > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">({testTasks.length})</span>
            )}
          </button>
        )}
      </div>

      {/* ── Code tab ── */}
      {activeTab === "code" && completedTask && (
        <CodeTab
          task={completedTask}
          repositoryFullName={repositoryFullName}
          issueNumber={issueNumber}
          reviewTasks={reviewTasks}
        />
      )}

      {/* ── Tests tab ── */}
      {activeTab === "tests" && (
        <TestsTab
          repositoryFullName={repositoryFullName}
          issueNumber={issueNumber}
          implementationTask={completedTask}
          testTasks={testTasks}
        />
      )}

      {/* ── Activity tab contents ── */}
      {activeTab === "activity" && (
        <div className="flex gap-8 items-start">

          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Agent Runs (was Execution log) */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Agent Runs</h2>
                {tasks.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {tasks.length} {tasks.length === 1 ? "run" : "runs"}
                  </Badge>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading runs…
                </div>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No agent runs for this issue yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <TaskRow key={task.id} task={task} repositoryFullName={repositoryFullName} />
                  ))}
                </div>
              )}
            </section>

            {/* Token usage */}
            {hasUsage && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" />
                  Token usage
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Input", value: totalInputTokens },
                    { label: "Output", value: totalOutputTokens },
                    { label: "Cache read", value: totalCacheRead },
                    { label: "Cache write", value: totalCacheWrite },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-lg border bg-muted/20 px-4 py-3 space-y-0.5"
                    >
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-lg font-semibold tabular-nums">{formatNumber(value)}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Aggregated across {tasks.length} {tasks.length === 1 ? "run" : "runs"}
                </p>
              </section>
            )}

            {/* Comments */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold">Activity</h2>

              {loadingComments ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const isAgent = comment.authorType === "agent";
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <div className="shrink-0 mt-0.5">
                          {isAgent ? (
                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary">
                              <Bot className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-muted">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {isAgent ? "Think Throo Coding Agent" : "You"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <div className="rounded-lg border bg-muted/10 px-4 py-3">
                            {isAgent ? (
                              <AgentMessageBody body={comment.body} />
                            ) : (
                              <p className="text-sm whitespace-pre-wrap break-words">{comment.body}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {comments.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No activity yet. Run the agent to start the conversation.
                    </p>
                  )}
                </div>
              )}

              {/* Reply input */}
              <div className="flex gap-3 pt-2">
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-muted shrink-0 mt-0.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="flex-1 space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                    placeholder="Leave a reply…"
                    rows={3}
                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        handleSubmitComment();
                      }
                    }}
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || submitting}
                      className="gap-1.5"
                    >
                      {submitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* ── Properties panel ── */}
          <aside className="w-56 shrink-0 self-start sticky top-6">
            <div className="rounded-lg border divide-y text-sm">

              {/* Status */}
              <div className="px-4 py-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Status
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusCfg.className}`}
                >
                  {statusCfg.icon}
                  {statusCfg.label}
                </span>
              </div>

              {/* Assignee */}
              <div className="px-4 py-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Assignee
                </p>
                {assigneeDisplay.type === 'agent' && assigneeDisplay.name ? (
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <Bot className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {assigneeDisplay.name}
                  </span>
                ) : assigneeDisplay.type === 'squad' && assigneeDisplay.name ? (
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <Users2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {assigneeDisplay.name}
                  </span>
                ) : (
                  <p className="text-xs text-muted-foreground">Unassigned</p>
                )}
              </div>

              {/* Pull Requests */}
              <div className="px-4 py-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pull Requests
                </p>
                {isLoading ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading…
                  </div>
                ) : prUrls.length === 0 ? (
                  <p className="text-xs text-muted-foreground leading-snug">
                    No linked pull requests yet.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {prUrls.map((url) => {
                      const prNumber = url.match(/\/pull\/(\d+)/)?.[1];
                      return (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
                        >
                          <GitPullRequest className="h-3.5 w-3.5 shrink-0" />
                          {prNumber ? `PR #${prNumber}` : "View PR"}
                          <ExternalLink className="h-2.5 w-2.5 shrink-0 ml-auto opacity-60" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="px-4 py-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Details
                </p>
                <div className="space-y-2">
                  {firstTask?.createdAt && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-xs tabular-nums">{formatDate(firstTask.createdAt)}</p>
                    </div>
                  )}
                  {tasks[0]?.completedAt && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Last run</p>
                      <p className="text-xs tabular-nums">{formatDate(tasks[0].completedAt)}</p>
                    </div>
                  )}
                  {tasks.length > 0 && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Runs</p>
                      <p className="text-xs font-medium">{tasks.length}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </aside>

        </div>
      )}
    </div>
  );
}
