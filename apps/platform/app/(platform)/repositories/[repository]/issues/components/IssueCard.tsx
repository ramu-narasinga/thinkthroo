"use client";

import React from "react";
import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  ExternalLink,
  Bot,
  User,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Ban,
  GitPullRequest,
} from "lucide-react";
import { IssueBoardItem } from "@/service/issueBoardState/client";
import { AgentTaskItem } from "@/service/agentTask/client";
import { AgentItem } from "@/service/agent/client";

interface Props {
  item: IssueBoardItem;
  repositoryFullName: string;
  latestTask: AgentTaskItem | undefined;
  agents: AgentItem[];
  onAssigneeClick: (item: IssueBoardItem) => void;
}

const TASK_STATUS_CONFIG = {
  queued:                  { icon: <Clock className="h-3 w-3" />,                                                           label: "Queued",     className: "text-muted-foreground" },
  dispatched:              { icon: <Loader2 className="h-3 w-3 animate-spin" />,                                            label: "Picking up", className: "text-muted-foreground" },
  waiting_local_directory: { icon: <Loader2 className="h-3 w-3 animate-spin" />,                                            label: "Waiting",    className: "text-muted-foreground" },
  running:                 { icon: <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse inline-block" />,        label: "Running",    className: "text-blue-600" },
  completed:               { icon: <CheckCircle2 className="h-3 w-3" />,                                                    label: "Done",       className: "text-green-600" },
  failed:                  { icon: <XCircle className="h-3 w-3" />,                                                         label: "Failed",     className: "text-red-500" },
  cancelled:               { icon: <Ban className="h-3 w-3" />,                                                             label: "Cancelled",  className: "text-muted-foreground" },
} as const;

export function IssueCard({ item, repositoryFullName, latestTask, agents, onAssigneeClick }: Props) {
  const encodedRepo = encodeURIComponent(repositoryFullName);
  const href = `/repositories/${encodedRepo}/issues/${item.issueNumber}`;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { issueNumber: item.issueNumber, currentStatus: item.kanbanStatus },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 }
    : undefined;

  const taskConfig = latestTask ? TASK_STATUS_CONFIG[latestTask.status] : null;
  const taskResult = latestTask?.result ? JSON.parse(latestTask.result) as { prUrl?: string } : null;

  const assignedAgent = item.assigneeType === "agent" && item.assigneeAgentId
    ? agents.find((a) => a.id === item.assigneeAgentId)
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-background border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing select-none hover:border-foreground/20 transition-colors"
    >
      {/* Title + external link */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-medium leading-snug hover:underline line-clamp-2"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {item.issueTitle}
        </Link>
        {item.issueHtmlUrl && (
          <a
            href={item.issueHtmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Issue number + task status */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">#{item.issueNumber}</span>

        <div className="flex items-center gap-2">
          {/* PR link if completed */}
          {taskResult?.prUrl && (
            <a
              href={taskResult.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground"
            >
              <GitPullRequest className="h-3 w-3" />
            </a>
          )}

          {/* Task status badge */}
          {taskConfig && (
            <span className={`inline-flex items-center gap-1 text-xs ${taskConfig.className}`}>
              {taskConfig.icon}
              {taskConfig.label}
            </span>
          )}

          {/* Assignee chip */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAssigneeClick(item); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title={assignedAgent ? `Assigned to ${assignedAgent.name}` : "Unassigned"}
          >
            {item.assigneeType === "agent" ? (
              <Bot className="h-3.5 w-3.5" />
            ) : item.assigneeType === "member" ? (
              <User className="h-3.5 w-3.5" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-dashed border-muted-foreground/40 flex items-center justify-center">
                <User className="h-2.5 w-2.5 text-muted-foreground/40" />
              </div>
            )}
            {assignedAgent && (
              <span className="max-w-[60px] truncate">{assignedAgent.name}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
