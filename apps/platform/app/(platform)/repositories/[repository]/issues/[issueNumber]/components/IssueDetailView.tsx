"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
  Send,
  Code2,
  MessageSquare,
  Circle,
  Tag,
  Paperclip,
  X,
  Terminal,
  FileText,
  Search,
  Copy,
  ArrowUpDown,
  Trash2,
} from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import { createClient } from "@/utils/supabase/client";
import {
  agentTaskClientService,
  AgentTaskItem,
  AgentTaskLogItem,
  AgentTaskEventItem,
  AgentTaskStatus,
} from "@/service/agentTask/client";
import {
  issueCommentClientService,
  IssueCommentItem,
} from "@/service/issueComment/client";
import {
  issueBoardStateClientService,
  IssueBoardItem,
  IssueAssigneeItem,
  AssignableMember,
  IssueLabelItem,
} from "@/service/issueBoardState/client";
import { issueLabelClientService } from "@/service/issueLabel/client";
import { issueClientService, IssueDetail } from "@/service/issues/client";
import { agentClientService, AgentItem } from "@/service/agent/client";
import { squadClientService, SquadWithMembers } from "@/service/squad/client";
import { AssigneePicker } from "../../components/AssigneePicker";
import { LabelPicker } from "../../components/LabelPicker";
import { PriorityPicker } from "../../components/PriorityPicker";
import { ModePicker } from "../../components/ModePicker";
import { IssueDetailSkeleton } from "./IssueDetailSkeleton";
import { StatusPicker } from "../../components/StatusPicker";
import { PRIORITY_CONFIG, EXECUTION_MODE_CONFIG, COLUMN_CONFIG } from "../../components/kanbanConfig";

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
  waiting_for_user: {
    label: "Needs input",
    icon: <MessageSquare className="h-3 w-3" />,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

type IssueStatus = "open" | "in_progress" | "completed" | "failed" | "waiting_for_user";

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
  waiting_for_user: {
    label: "Needs input",
    icon: <MessageSquare className="h-3 w-3" />,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
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

function formatRelative(d: Date | string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  const diffSec = Math.round((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return formatDate(d);
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

const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Bash: Terminal,
  Read: FileText,
  Edit: Code2,
  Write: Code2,
  Grep: Search,
  Glob: Search,
};

function toolIcon(toolName: string | null): React.ComponentType<{ className?: string }> {
  if (!toolName) return Circle;
  return TOOL_ICONS[toolName] ?? Circle;
}

type RowStyle = { badge: string; dot: string };

const TYPE_STYLES: Record<string, RowStyle> = {
  agent_text: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  assistant: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  tool_result: { badge: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-400" },
  user: { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  system: { badge: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground/40" },
  result: { badge: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-400" },
  error: { badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-400" },
  info: { badge: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground/40" },
  output: { badge: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground/40" },
  default: { badge: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground/40" },
};

const TOOL_STYLES: Record<string, RowStyle> = {
  Bash: { badge: "bg-slate-100 text-slate-700 border-slate-300", dot: "bg-slate-400" },
  Read: { badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400" },
  Edit: { badge: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-400" },
  Write: { badge: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-400" },
  Grep: { badge: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-400" },
  Glob: { badge: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-400" },
};

function tryParseJson(text: string): any | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function summarizeParsed(parsed: any): string {
  if (typeof parsed?.summary === "string") return parsed.summary;
  if (typeof parsed?.hook_name === "string") {
    return `${parsed.hook_name}${parsed.hook_event ? ` — ${parsed.hook_event}` : ""}`;
  }
  const content = parsed?.message?.content;
  if (Array.isArray(content)) {
    const textBlock = content.find((b: any) => b?.type === "text");
    if (textBlock?.text) return String(textBlock.text).slice(0, 160);
    const toolBlock = content.find((b: any) => b?.type === "tool_use");
    if (toolBlock) return `${toolBlock.name ?? "tool"} call`;
  }
  if (typeof parsed?.subtype === "string") return parsed.subtype.replace(/_/g, " ");
  if (typeof parsed?.type === "string") return String(parsed.type);
  return JSON.stringify(parsed).slice(0, 160);
}

interface LogRow {
  id: string;
  badgeLabel: string;
  style: RowStyle;
  Icon: React.ComponentType<{ className?: string }>;
  time: string;
  summary: string;
  full: string;
}

function formatTime(d: Date | string): string {
  return new Date(d).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function TranscriptModal({
  taskId,
  task,
  onClose,
}: {
  taskId: string;
  task: AgentTaskItem;
  onClose: () => void;
}) {
  const [events, setEvents] = useState<AgentTaskEventItem[] | null>(null);
  const [logs, setLogs] = useState<AgentTaskLogItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortOldestFirst, setSortOldestFirst] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const eventData = await agentTaskClientService.getEvents(taskId);
        if (cancelled) return;
        if (eventData.length > 0) {
          setEvents(eventData);
        } else {
          const logData = await agentTaskClientService.getLogs(taskId);
          if (!cancelled) setLogs(logData);
        }
      } catch {
        if (!cancelled) setLogs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [taskId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = (supabase.channel(`task-events:${taskId}`) as any)
      .on(
        "broadcast",
        { event: "event" },
        (payload: { payload: AgentTaskEventItem }) => {
          setEvents((prev) => (prev ? [...prev, payload.payload] : [payload.payload]));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [taskId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const durationLabel = (() => {
    if (!task.startedAt) return null;
    const end = task.completedAt ? new Date(task.completedAt) : new Date();
    const ms = end.getTime() - new Date(task.startedAt).getTime();
    const mins = Math.floor(ms / 60000);
    const secs = Math.round((ms % 60000) / 1000);
    return `${mins}m ${secs}s`;
  })();

  const toolCallCount = events?.filter((e) => e.eventType === "tool_call").length ?? 0;
  const statusConfig = STATUS_CONFIGS[task.status] ?? STATUS_CONFIGS.queued;

  const rows: LogRow[] = React.useMemo(() => {
    const sortDirection = (a: Date | string, b: Date | string) => {
      const diff = new Date(a).getTime() - new Date(b).getTime();
      return sortOldestFirst ? diff : -diff;
    };

    if (events) {
      return [...events]
        .sort((a, b) => sortDirection(a.createdAt, b.createdAt))
        .map((event) => {
          const isTool = event.eventType === "tool_call";
          const style = isTool
            ? TOOL_STYLES[event.toolName ?? ""] ?? TYPE_STYLES.default
            : TYPE_STYLES[event.eventType] ?? TYPE_STYLES.default;
          const Icon = isTool ? toolIcon(event.toolName) : event.eventType === "error" ? XCircle : MessageSquare;
          const badgeLabel = isTool
            ? event.toolName ?? "Tool"
            : event.eventType === "agent_text"
            ? "Agent"
            : event.eventType === "tool_result"
            ? "Result"
            : "Error";
          return {
            id: event.id,
            badgeLabel,
            style,
            Icon,
            time: formatTime(event.createdAt),
            summary: event.preview ?? "",
            full: event.toolInput ?? event.raw ?? event.preview ?? "",
          };
        });
    }

    return (logs ?? [])
      .slice()
      .sort((a, b) => sortDirection(a.createdAt, b.createdAt))
      .map((log) => {
        const parsed = tryParseJson(log.message);
        const style = TYPE_STYLES[parsed?.type ?? log.type] ?? TYPE_STYLES.default;
        const badgeLabel = parsed
          ? parsed.subtype
            ? `${parsed.type}:${parsed.subtype}`
            : String(parsed.type ?? log.type)
          : log.type;
        return {
          id: log.id,
          badgeLabel,
          style,
          Icon: log.type === "error" ? XCircle : Terminal,
          time: formatTime(log.createdAt),
          summary: parsed ? summarizeParsed(parsed) : log.message,
          full: parsed ? JSON.stringify(parsed, null, 2) : log.message,
        };
      });
  }, [events, logs, sortOldestFirst]);

  const allExpanded = rows.length > 0 && rows.every((r) => expandedIds.has(r.id));

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpandAll = () => {
    setExpandedIds(allExpanded ? new Set() : new Set(rows.map((r) => r.id)));
  };

  const handleCopyAll = () => {
    const text = rows.map((r) => `${r.time}  [${r.badgeLabel}]  ${r.full || r.summary}`).join("\n");
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="bg-background rounded-xl border shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-3 pb-2 border-b space-y-2.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusConfig.className}`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </span>
              <span className="inline-flex items-center rounded-full border bg-muted text-muted-foreground border-border px-2 py-0.5 text-[11px] capitalize">
                {task.taskType}
              </span>
              {durationLabel && (
                <span className="inline-flex items-center rounded-full border bg-muted text-muted-foreground border-border px-2 py-0.5 text-[11px] tabular-nums">
                  {durationLabel}
                </span>
              )}
              {events && (
                <span className="inline-flex items-center rounded-full border bg-muted text-muted-foreground border-border px-2 py-0.5 text-[11px] tabular-nums">
                  {toolCallCount} tool calls
                </span>
              )}
              <span className="inline-flex items-center rounded-full border bg-muted text-muted-foreground border-border px-2 py-0.5 text-[11px] tabular-nums">
                {rows.length} events
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleExpandAll}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {allExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {allExpanded ? "Collapse all" : "Expand visible"}
              </button>
              <button
                type="button"
                onClick={() => setSortOldestFirst((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortOldestFirst ? "Oldest first" : "Newest first"}
              </button>
              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-3 w-3" />
                {copied ? "Copied" : "Copy all"}
              </button>
              <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {rows.length > 0 && (
            <div className="flex items-center gap-px h-2 rounded-full overflow-hidden bg-muted/50">
              {rows.map((row) => (
                <div
                  key={row.id}
                  title={`${row.badgeLabel} · ${row.time}`}
                  className={`h-full flex-1 min-w-[2px] ${row.style.dot}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 px-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading transcript…
            </div>
          ) : rows.length > 0 ? (
            <div className="space-y-0.5">
              {rows.map((row, i) => {
                const isExpanded = expandedIds.has(row.id);
                return (
                  <button
                    type="button"
                    key={row.id}
                    onClick={() => toggleExpand(row.id)}
                    className="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-muted/40 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 mt-1 shrink-0 text-muted-foreground/60" />
                    ) : (
                      <ChevronRight className="h-3 w-3 mt-1 shrink-0 text-muted-foreground/60" />
                    )}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${row.style.badge}`}
                    >
                      <row.Icon className="h-2.5 w-2.5" />
                      {row.badgeLabel}
                    </span>
                    <p
                      className={`min-w-0 flex-1 text-xs text-muted-foreground font-mono ${
                        isExpanded ? "whitespace-pre-wrap break-words" : "truncate"
                      }`}
                    >
                      {isExpanded ? row.full || row.summary : row.summary}
                    </p>
                    <span className="shrink-0 flex items-center gap-2 text-[10px] text-muted-foreground/60 tabular-nums">
                      <span>#{i + 1}</span>
                      <span>{row.time}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 px-2">No transcript recorded for this run.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function ExecutionLogRow({ task }: { task: AgentTaskItem }) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const config = STATUS_CONFIGS[task.status] ?? STATUS_CONFIGS.queued;
  const label = task.userMessage?.trim() || (task.attemptCount > 0 ? `Attempt ${task.attemptCount + 1}` : "Initial run");

  return (
    <>
      <button
        type="button"
        onClick={() => setTranscriptOpen(true)}
        className="w-full flex items-center gap-2 px-1.5 py-1.5 rounded hover:bg-muted/40 transition-colors text-left"
        title="View full transcript"
      >
        <span className="shrink-0">{config.icon}</span>
        <span className="flex-1 min-w-0 text-xs truncate">{label}</span>
        <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
          {formatRelative(task.completedAt ?? task.createdAt)}
        </span>
      </button>
      {transcriptOpen && (
        <TranscriptModal taskId={task.id} task={task} onClose={() => setTranscriptOpen(false)} />
      )}
    </>
  );
}

export function IssueDetailView({ repositoryFullName, issueNumber }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState<AgentTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<IssueCommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(true);
  const [collapsedCommentIds, setCollapsedCommentIds] = useState<Set<string>>(new Set());
  const [showPastRuns, setShowPastRuns] = useState(false);
  const [boardItem, setBoardItem] = useState<IssueBoardItem | null>(null);
  const [repoAgents, setRepoAgents] = useState<AgentItem[]>([]);
  const [repoMembers, setRepoMembers] = useState<AssignableMember[]>([]);
  const [repoSquads, setRepoSquads] = useState<SquadWithMembers[]>([]);
  const [repoLabels, setRepoLabels] = useState<IssueLabelItem[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [fetchedIssue, setFetchedIssue] = useState<IssueDetail | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!lightboxUrl) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxUrl(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxUrl]);

  const encodedRepo = encodeURIComponent(repositoryFullName);
  const backHref = `/repositories/${encodedRepo}/issues`;

  useEffect(() => {
    agentTaskClientService.getByIssue(repositoryFullName, issueNumber).then((data) => {
      setTasks(data);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, [repositoryFullName, issueNumber]);

  useEffect(() => {
    if (isLoading || tasks.some((t) => t.issueBody)) return;
    issueClientService.getByNumber(repositoryFullName, issueNumber)
      .then(setFetchedIssue)
      .catch(() => {});
  }, [isLoading, tasks, repositoryFullName, issueNumber]);

  const refetchBoardItem = React.useCallback(async () => {
    try {
      const items = await issueBoardStateClientService.getByRepository(repositoryFullName);
      const item = items.find((b) => b.issueNumber === issueNumber);
      setBoardItem(item ?? null);
    } catch { /* silent */ }
  }, [repositoryFullName, issueNumber]);

  useEffect(() => {
    refetchBoardItem();
    agentClientService.getByRepository(repositoryFullName).then(setRepoAgents).catch(() => {});
    squadClientService.getByRepository(repositoryFullName).then(setRepoSquads).catch(() => {});
    issueBoardStateClientService.getAssignableMembers(repositoryFullName).then(setRepoMembers).catch(() => {});
    issueLabelClientService.getByRepository(repositoryFullName).then(setRepoLabels).catch(() => {});
  }, [repositoryFullName, issueNumber, refetchBoardItem]);

  const agentAssignees = boardItem?.assignees.filter((a) => a.assigneeType === "agent") ?? [];
  const memberAssignees = boardItem?.assignees.filter((a) => a.assigneeType === "member") ?? [];
  const selectedAgentIds = agentAssignees.map((a) => a.assigneeAgentId!).filter(Boolean);
  const selectedMemberIds = memberAssignees.map((a) => a.assigneeMemberId!).filter(Boolean);
  const assignedSquad = repoSquads.find((s) => s.id === boardItem?.assigneeSquadId) ?? null;

  async function handleToggleAgentAssignee(agent: AgentItem) {
    const existing = agentAssignees.find((a) => a.assigneeAgentId === agent.id);
    const prev = boardItem;
    if (existing) {
      setBoardItem(prev ? { ...prev, assignees: prev.assignees.filter((a) => a.id !== existing.id) } : null);
      try {
        await issueBoardStateClientService.removeAssignee({ repositoryFullName, issueNumber, assigneeId: existing.id });
        refetchBoardItem();
      } catch {
        setBoardItem(prev);
      }
    } else {
      const optimisticAssignee: IssueAssigneeItem = {
        id: `optimistic-${agent.id}`,
        assigneeType: "agent",
        assigneeAgentId: agent.id,
        assigneeMemberId: null,
      };
      setBoardItem(prev ? { ...prev, assignees: [...(prev.assignees ?? []), optimisticAssignee] } : null);
      try {
        await issueBoardStateClientService.addAssignee({ repositoryFullName, issueNumber, assigneeType: "agent", assigneeAgentId: agent.id });
        refetchBoardItem();
      } catch {
        setBoardItem(prev);
      }
    }
  }

  async function handleToggleMemberAssignee(member: AssignableMember) {
    const existing = memberAssignees.find((a) => a.assigneeMemberId === member.id);
    const prev = boardItem;
    if (existing) {
      setBoardItem(prev ? { ...prev, assignees: prev.assignees.filter((a) => a.id !== existing.id) } : null);
      try {
        await issueBoardStateClientService.removeAssignee({ repositoryFullName, issueNumber, assigneeId: existing.id });
        refetchBoardItem();
      } catch {
        setBoardItem(prev);
      }
    } else {
      const optimisticAssignee: IssueAssigneeItem = {
        id: `optimistic-${member.id}`,
        assigneeType: "member",
        assigneeAgentId: null,
        assigneeMemberId: member.id,
      };
      setBoardItem(prev ? { ...prev, assignees: [...(prev.assignees ?? []), optimisticAssignee] } : null);
      try {
        await issueBoardStateClientService.addAssignee({ repositoryFullName, issueNumber, assigneeType: "member", assigneeMemberId: member.id });
        refetchBoardItem();
      } catch {
        setBoardItem(prev);
      }
    }
  }

  async function handleSquadChange(squadId: string | null) {
    const prev = boardItem;
    setBoardItem(prev ? { ...prev, assigneeSquadId: squadId } : null);
    try {
      await issueBoardStateClientService.updateSquadAssignee({ repositoryFullName, issueNumber, assigneeSquadId: squadId });
      refetchBoardItem();
    } catch {
      setBoardItem(prev);
    }
  }

  async function handlePriorityChange(priority: IssueBoardItem["priority"]) {
    const prev = boardItem;
    setBoardItem(prev ? { ...prev, priority } : null);
    try {
      await issueBoardStateClientService.updatePriority({ repositoryFullName, issueNumber, priority });
      refetchBoardItem();
    } catch {
      setBoardItem(prev);
    }
  }

  async function handleExecutionModeChange(executionMode: IssueBoardItem["executionMode"]) {
    const prev = boardItem;
    setBoardItem(prev ? { ...prev, executionMode } : null);
    try {
      await issueBoardStateClientService.updateExecutionMode({ repositoryFullName, issueNumber, executionMode });
      refetchBoardItem();
    } catch {
      setBoardItem(prev);
    }
  }

  async function handleKanbanStatusChange(kanbanStatus: IssueBoardItem["kanbanStatus"]) {
    const prev = boardItem;
    setBoardItem(prev ? { ...prev, kanbanStatus } : null);
    try {
      await issueBoardStateClientService.updateKanbanStatus({ repositoryFullName, issueNumber, kanbanStatus });
      refetchBoardItem();
    } catch {
      setBoardItem(prev);
    }
  }

  async function handleToggleLabel(label: IssueLabelItem) {
    const has = boardItem?.labels.some((l) => l.id === label.id);
    const prev = boardItem;
    if (has) {
      setBoardItem(prev ? { ...prev, labels: prev.labels.filter((l) => l.id !== label.id) } : null);
      try {
        await issueBoardStateClientService.removeLabelFromIssue({ repositoryFullName, issueNumber, labelId: label.id });
        refetchBoardItem();
      } catch {
        setBoardItem(prev);
      }
    } else {
      setBoardItem(prev ? { ...prev, labels: [...(prev.labels ?? []), label] } : null);
      try {
        await issueBoardStateClientService.addLabelToIssue({ repositoryFullName, issueNumber, labelId: label.id });
        refetchBoardItem();
      } catch {
        setBoardItem(prev);
      }
    }
  }

  async function handleCreateLabel(name: string, color: string): Promise<IssueLabelItem> {
    const label = await issueLabelClientService.create({ repositoryFullName, name, color });
    issueLabelClientService.getByRepository(repositoryFullName).then(setRepoLabels).catch(() => {});
    return label;
  }

  async function handleDeleteIssue() {
    setDeleting(true);
    try {
      await issueBoardStateClientService.deleteIssue({ repositoryFullName, issueNumber });
      router.push(backHref);
    } catch {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  }

  async function handleAddAttachmentFile(file: File) {
    setUploadingAttachment(true);
    try {
      const timestamp = Date.now();
      const extension = file.type.split("/")[1] || "png";
      const filename = `issue-${timestamp}.${extension}`;
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "content-type": file.type || "application/octet-stream", "x-vercel-filename": filename },
        body: file,
      });
      if (!res.ok) return;
      const { url } = (await res.json()) as { url: string };
      await issueBoardStateClientService.addAttachment({ repositoryFullName, issueNumber, url, fileName: file.name, contentType: file.type });
      refetchBoardItem();
    } finally {
      setUploadingAttachment(false);
    }
  }

  async function handleRemoveAttachment(attachmentId: string) {
    await issueBoardStateClientService.removeAttachment({ repositoryFullName, issueNumber, attachmentId });
    refetchBoardItem();
  }

  useEffect(() => {
    issueCommentClientService.getByIssue(repositoryFullName, issueNumber).then((data) => {
      setComments(data);
    }).catch(() => {}).finally(() => setLoadingComments(false));
  }, [repositoryFullName, issueNumber]);

  useEffect(() => {
    const supabase = createClient();
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

  const handleSubmitComment = async (overrideBody?: string) => {
    const body = (overrideBody ?? newComment).trim();
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

      const isAwaitingReply =
        (latestTask?.status === "completed" && !latestTask.userMessage && lastResult?.phase === "planning") ||
        (latestTask?.status === "waiting_for_user" && lastResult?.phase === "question");

      if (isAwaitingReply) {
        await fetch("/api/agents/tasks/enqueue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: latestTask.agentId,
            issueNumber,
            repositoryFullName,
            userMessage: body,
            sessionId: latestTask.sessionId,
            workDir: latestTask.workDir,
            taskType: latestTask.taskType,
            executionMode: latestTask.executionMode,
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
  const issueHtmlUrl = firstTask?.issueHtmlUrl ?? boardItem?.issueHtmlUrl ?? fetchedIssue?.htmlUrl ?? null;
  const issueTitle = firstTask?.issueTitle ?? boardItem?.issueTitle ?? fetchedIssue?.title ?? `Issue #${issueNumber}`;
  const issueBody = firstTask?.issueBody ?? fetchedIssue?.body ?? null;

  // Derive overall issue status from the latest task
  const issueStatus = React.useMemo<IssueStatus>(() => {
    const latest = tasks[0];
    if (!latest) return "open";
    if (["queued", "dispatched", "waiting_local_directory", "running"].includes(latest.status))
      return "in_progress";
    if (latest.status === "waiting_for_user") return "waiting_for_user";
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

  // A permission-pause (ask_before_edits mode) reuses the same waiting_for_user/'question'
  // pipeline as a real clarifying question — distinguished by the comment's sentinel prefix.
  const pendingApproval = React.useMemo(() => {
    const latest = tasks[0];
    if (!latest || latest.status !== "waiting_for_user") return false;
    let result: { phase?: string } | null = null;
    try { result = latest.result ? JSON.parse(latest.result) : null; } catch { /* ignore */ }
    if (result?.phase !== "question") return false;
    const lastComment = comments[comments.length - 1];
    return !!lastComment && lastComment.authorType === "agent" && lastComment.body.startsWith("Wants to run:");
  }, [tasks, comments]);

  async function handleApproval(decision: "approve" | "deny") {
    const body = decision === "approve" ? "Approved — go ahead." : "Denied — please don't do that, try a different approach.";
    await handleSubmitComment(body);
  }

  if (isLoading && loadingComments) {
    return <IssueDetailSkeleton />;
  }

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
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            className="text-muted-foreground hover:text-destructive mt-1 shrink-0 transition-colors"
            title="Delete issue"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          #{issueNumber} · {repositoryFullName}
        </p>
        {issueBody && (
          <p className="text-sm whitespace-pre-wrap break-words text-foreground/90 pt-2">
            {issueBody}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-3">
          {boardItem?.attachments.map((a) => (
            <button
              type="button"
              key={a.id}
              onClick={() => setLightboxUrl(a.url)}
              className="relative h-12 w-12 rounded-md overflow-hidden border shrink-0 group cursor-zoom-in"
              title={a.fileName}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.url} alt={a.fileName} className="h-full w-full object-cover" />
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => { e.stopPropagation(); handleRemoveAttachment(a.id); }}
                className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-2.5 w-2.5" />
              </span>
            </button>
          ))}
          <label className="inline-flex items-center justify-center h-12 w-12 rounded-md border border-dashed hover:bg-muted transition-colors cursor-pointer shrink-0">
            {uploadingAttachment ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : (
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAddAttachmentFile(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      <div className="flex gap-8 items-start">

          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Activity / comment thread */}
            <section className="space-y-3">
              <button
                type="button"
                onClick={() => setActivityExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {activityExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
                {comments.length} {comments.length === 1 ? "activity" : "activities"}
              </button>

              {activityExpanded && (
                <>
                  {issueStatus === "waiting_for_user" && !pendingApproval && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-2 text-sm text-amber-800">
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      Agent needs your input to continue — reply below to keep going.
                    </div>
                  )}

                  {pendingApproval && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 space-y-2 text-sm text-amber-800">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        Agent is paused, waiting for approval before editing — see its request above.
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleApproval("approve")} disabled={submitting}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleApproval("deny")} disabled={submitting}>
                          Deny
                        </Button>
                      </div>
                    </div>
                  )}

                  {loadingComments ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading…
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {comments.map((comment) => {
                        const isAgent = comment.authorType === "agent";
                        const isCollapsed = collapsedCommentIds.has(comment.id);
                        return (
                          <div key={comment.id} className="rounded-lg border overflow-hidden">
                            <button
                              type="button"
                              onClick={() =>
                                setCollapsedCommentIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(comment.id)) next.delete(comment.id);
                                  else next.add(comment.id);
                                  return next;
                                })
                              }
                              className="w-full flex items-center gap-2 px-4 py-2.5 bg-muted/10 hover:bg-muted/20 transition-colors text-left"
                            >
                              {isCollapsed ? (
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              )}
                              {isAgent ? (
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary shrink-0">
                                  <Bot className="h-3.5 w-3.5" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted shrink-0">
                                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                                </span>
                              )}
                              <span className="text-sm font-medium">
                                {isAgent ? "Think Throo Coding Agent" : "You"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comment.createdAt)}
                              </span>
                            </button>
                            {!isCollapsed && (
                              <div className="px-4 py-3 border-t">
                                {isAgent ? (
                                  <AgentMessageBody body={comment.body} />
                                ) : (
                                  <p className="text-sm whitespace-pre-wrap break-words">{comment.body}</p>
                                )}
                              </div>
                            )}
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
                </>
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
                      onClick={() => handleSubmitComment()}
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

              {/* Column (kanban status) */}
              {boardItem && (
                <div className="px-4 py-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Column
                  </p>
                  <StatusPicker
                    value={boardItem.kanbanStatus}
                    onChange={handleKanbanStatusChange}
                    trigger={
                      <button type="button" className="inline-flex items-center gap-1.5 text-xs hover:text-foreground transition-colors">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${COLUMN_CONFIG[boardItem.kanbanStatus].dotColor}`} />
                        {COLUMN_CONFIG[boardItem.kanbanStatus].label}
                      </button>
                    }
                  />
                </div>
              )}

              {/* Priority */}
              <div className="px-4 py-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Priority
                </p>
                {boardItem && (
                  <PriorityPicker
                    value={boardItem.priority}
                    onChange={handlePriorityChange}
                    trigger={
                      <button type="button" className="inline-flex items-center gap-1.5 text-xs hover:text-foreground transition-colors">
                        {(() => {
                          const cfg = PRIORITY_CONFIG[boardItem.priority];
                          const Icon = cfg.icon;
                          return (
                            <>
                              <Icon className={`h-3.5 w-3.5 shrink-0 ${cfg.className}`} />
                              {cfg.label}
                            </>
                          );
                        })()}
                      </button>
                    }
                  />
                )}
              </div>

              {/* Execution mode */}
              <div className="px-4 py-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Mode
                </p>
                {boardItem && (
                  <ModePicker
                    value={boardItem.executionMode}
                    onChange={handleExecutionModeChange}
                    trigger={
                      <button type="button" className="inline-flex items-center gap-1.5 text-xs hover:text-foreground transition-colors">
                        {(() => {
                          const cfg = EXECUTION_MODE_CONFIG[boardItem.executionMode];
                          const Icon = cfg.icon;
                          return (
                            <>
                              <Icon className={`h-3.5 w-3.5 shrink-0 ${cfg.className}`} />
                              {cfg.label}
                            </>
                          );
                        })()}
                      </button>
                    }
                  />
                )}
              </div>

              {/* Assignees */}
              <div className="px-4 py-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Assignees
                </p>
                <AssigneePicker
                  agents={repoAgents}
                  members={repoMembers}
                  selectedAgentIds={selectedAgentIds}
                  selectedMemberIds={selectedMemberIds}
                  onToggleAgent={handleToggleAgentAssignee}
                  onToggleMember={handleToggleMemberAssignee}
                  trigger={
                    <button type="button" className="flex flex-wrap items-center gap-1.5 text-xs hover:text-foreground transition-colors">
                      {agentAssignees.length === 0 && memberAssignees.length === 0 ? (
                        <span className="text-muted-foreground">Unassigned</span>
                      ) : (
                        <>
                          {agentAssignees.map((a) => {
                            const agent = repoAgents.find((ag) => ag.id === a.assigneeAgentId);
                            return (
                              <span key={a.id} className="inline-flex items-center gap-1">
                                <Bot className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                {agent?.name ?? "Agent"}
                              </span>
                            );
                          })}
                          {memberAssignees.map((a) => {
                            const member = repoMembers.find((m) => m.id === a.assigneeMemberId);
                            return (
                              <span key={a.id} className="inline-flex items-center gap-1">
                                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                {member?.fullName ?? "Member"}
                              </span>
                            );
                          })}
                        </>
                      )}
                    </button>
                  }
                />
              </div>

              {/* Squad */}
              {repoSquads.length > 0 && (
                <div className="px-4 py-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Squad
                  </p>
                  <select
                    value={boardItem?.assigneeSquadId ?? ""}
                    onChange={(e) => handleSquadChange(e.target.value || null)}
                    className="w-full text-xs bg-transparent border rounded px-2 py-1"
                  >
                    <option value="">Unassigned</option>
                    {repoSquads.map((squad) => (
                      <option key={squad.id} value={squad.id}>{squad.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Labels */}
              <div className="px-4 py-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Labels
                </p>
                <LabelPicker
                  labels={repoLabels}
                  selectedLabelIds={boardItem?.labels.map((l) => l.id) ?? []}
                  onToggleLabel={handleToggleLabel}
                  onCreateLabel={handleCreateLabel}
                  trigger={
                    <button type="button" className="flex flex-wrap items-center gap-1 text-xs hover:text-foreground transition-colors">
                      {boardItem && boardItem.labels.length > 0 ? (
                        boardItem.labels.map((label) => (
                          <span
                            key={label.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{
                              backgroundColor: `#${label.color}22`,
                              color: `#${label.color}`,
                              border: `1px solid #${label.color}55`,
                            }}
                          >
                            {label.name}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Tag className="h-3 w-3" /> Add label
                        </span>
                      )}
                    </button>
                  }
                />
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

              {/* Execution log */}
              <div className="px-4 py-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Execution log
                </p>
                {isLoading ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading…
                  </div>
                ) : tasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground leading-snug">No runs yet.</p>
                ) : (
                  <div className="space-y-0.5">
                    <ExecutionLogRow task={tasks[0]} />
                    {tasks.length > 1 && (
                      <>
                        {showPastRuns &&
                          tasks.slice(1).map((t) => <ExecutionLogRow key={t.id} task={t} />)}
                        <button
                          type="button"
                          onClick={() => setShowPastRuns((v) => !v)}
                          className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-1.5 py-1"
                        >
                          {showPastRuns ? "Hide" : "Show"} past runs ({tasks.length - 1})
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Token usage */}
              {hasUsage && (
                <div className="px-4 py-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    Token usage
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Input", value: totalInputTokens },
                      { label: "Output", value: totalOutputTokens },
                      { label: "Cache read", value: totalCacheRead },
                      { label: "Cache write", value: totalCacheWrite },
                    ].map(({ label, value }) => (
                      <div key={label} className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-xs font-medium tabular-nums">{formatNumber(value)}</p>
                      </div>
                    ))}
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Runs</p>
                      <p className="text-xs font-medium tabular-nums">{tasks.length}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </aside>

        </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 cursor-zoom-out"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-md cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
