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
  MessageSquare,
} from "lucide-react";
import { IssueBoardItem, AssignableMember } from "@/service/issueBoardState/client";
import { AgentTaskItem } from "@/service/agentTask/client";
import { AgentItem } from "@/service/agent/client";
import { useIssueBoardStateStore } from "@/store/issueBoardState/store";
import { AssigneePicker } from "./AssigneePicker";
import { PRIORITY_CONFIG } from "./kanbanConfig";

interface Props {
  item: IssueBoardItem;
  repositoryFullName: string;
  latestTask: AgentTaskItem | undefined;
  agents: AgentItem[];
  members: AssignableMember[];
}

const TASK_STATUS_CONFIG = {
  queued:                  { icon: <Clock className="h-3 w-3" />,                                                           label: "Queued",     className: "text-muted-foreground" },
  dispatched:              { icon: <Loader2 className="h-3 w-3 animate-spin" />,                                            label: "Picking up", className: "text-muted-foreground" },
  waiting_local_directory: { icon: <Loader2 className="h-3 w-3 animate-spin" />,                                            label: "Waiting",    className: "text-muted-foreground" },
  running:                 { icon: <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse inline-block" />,        label: "Running",    className: "text-blue-600" },
  completed:               { icon: <CheckCircle2 className="h-3 w-3" />,                                                    label: "Done",       className: "text-green-600" },
  failed:                  { icon: <XCircle className="h-3 w-3" />,                                                         label: "Failed",     className: "text-red-500" },
  cancelled:               { icon: <Ban className="h-3 w-3" />,                                                             label: "Cancelled",  className: "text-muted-foreground" },
  waiting_for_user:        { icon: <MessageSquare className="h-3 w-3" />,                                                   label: "Needs input", className: "text-amber-600" },
} as const;

export function IssueCard({ item, repositoryFullName, latestTask, agents, members }: Props) {
  const addAssignee = useIssueBoardStateStore((s) => s.addAssignee);
  const removeAssignee = useIssueBoardStateStore((s) => s.removeAssignee);

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

  const agentAssignees = item.assignees.filter((a) => a.assigneeType === "agent");
  const memberAssignees = item.assignees.filter((a) => a.assigneeType === "member");
  const selectedAgentIds = agentAssignees.map((a) => a.assigneeAgentId!).filter(Boolean);
  const selectedMemberIds = memberAssignees.map((a) => a.assigneeMemberId!).filter(Boolean);

  function handleToggleAgent(agent: AgentItem) {
    const existing = agentAssignees.find((a) => a.assigneeAgentId === agent.id);
    if (existing) {
      removeAssignee(repositoryFullName, item.issueNumber, existing.id);
    } else {
      addAssignee(repositoryFullName, item.issueNumber, { assigneeType: "agent", assigneeAgentId: agent.id });
    }
  }

  function handleToggleMember(member: AssignableMember) {
    const existing = memberAssignees.find((a) => a.assigneeMemberId === member.id);
    if (existing) {
      removeAssignee(repositoryFullName, item.issueNumber, existing.id);
    } else {
      addAssignee(repositoryFullName, item.issueNumber, { assigneeType: "member", assigneeMemberId: member.id });
    }
  }

  const priorityConfig = item.priority !== "no_priority" ? PRIORITY_CONFIG[item.priority] : null;
  const PriorityIcon = priorityConfig?.icon;

  const totalAssignees = item.assignees.length;

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

      {/* Labels */}
      {item.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {item.labels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium"
              style={{
                backgroundColor: `#${label.color}22`,
                color: `#${label.color}`,
                border: `1px solid #${label.color}55`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Issue number + task status */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
          {PriorityIcon && <PriorityIcon className={`h-3 w-3 ${priorityConfig!.className}`} />}
          #{item.issueNumber}
        </span>

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
          <AssigneePicker
            agents={agents}
            members={members}
            selectedAgentIds={selectedAgentIds}
            selectedMemberIds={selectedMemberIds}
            onToggleAgent={handleToggleAgent}
            onToggleMember={handleToggleMember}
            align="end"
            trigger={
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title={totalAssignees > 0 ? `${totalAssignees} assignee${totalAssignees > 1 ? "s" : ""}` : "Unassigned"}
              >
                {agentAssignees.length > 0 ? (
                  <Bot className="h-3.5 w-3.5" />
                ) : memberAssignees.length > 0 ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-dashed border-muted-foreground/40 flex items-center justify-center">
                    <User className="h-2.5 w-2.5 text-muted-foreground/40" />
                  </div>
                )}
                {totalAssignees > 0 && <span>{totalAssignees}</span>}
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}
