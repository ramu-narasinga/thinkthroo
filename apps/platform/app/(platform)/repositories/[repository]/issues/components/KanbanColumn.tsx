"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { KanbanStatus, IssueBoardItem } from "@/service/issueBoardState/client";
import { AgentTaskItem } from "@/service/agentTask/client";
import { AgentItem } from "@/service/agent/client";
import { IssueCard } from "./IssueCard";

interface ColumnConfig {
  label: string;
  dotColor: string;
  bg: string;
}

const COLUMN_CONFIG: Record<KanbanStatus, ColumnConfig> = {
  backlog:     { label: "Backlog",     dotColor: "bg-muted-foreground",  bg: "bg-muted/30" },
  todo:        { label: "Todo",        dotColor: "bg-yellow-400",        bg: "bg-yellow-50/50 dark:bg-yellow-950/20" },
  in_progress: { label: "In Progress", dotColor: "bg-blue-500",          bg: "bg-blue-50/50 dark:bg-blue-950/20" },
  in_review:   { label: "In Review",   dotColor: "bg-purple-500",        bg: "bg-purple-50/50 dark:bg-purple-950/20" },
  done:        { label: "Done",        dotColor: "bg-green-500",         bg: "bg-green-50/50 dark:bg-green-950/20" },
  blocked:     { label: "Blocked",     dotColor: "bg-red-500",           bg: "bg-red-50/50 dark:bg-red-950/20" },
};

interface Props {
  status: KanbanStatus;
  items: IssueBoardItem[];
  repositoryFullName: string;
  tasksByIssue: Record<number, AgentTaskItem | undefined>;
  agents: AgentItem[];
  onAssigneeClick: (item: IssueBoardItem) => void;
}

export function KanbanColumn({ status, items, repositoryFullName, tasksByIssue, agents, onAssigneeClick }: Props) {
  const config = COLUMN_CONFIG[status];

  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col min-w-[240px] w-[240px] shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`h-2 w-2 rounded-full ${config.dotColor} shrink-0`} />
        <span className="text-sm font-medium">{config.label}</span>
        <span className="ml-auto text-xs text-muted-foreground font-medium tabular-nums">
          {items.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 space-y-2 min-h-[120px] transition-colors ${config.bg} ${
          isOver ? "ring-2 ring-inset ring-foreground/20" : ""
        }`}
      >
        {items.map((item) => (
          <IssueCard
            key={item.id}
            item={item}
            repositoryFullName={repositoryFullName}
            latestTask={tasksByIssue[item.issueNumber]}
            agents={agents}
            onAssigneeClick={onAssigneeClick}
          />
        ))}

        {items.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6 px-2">
            No issues
          </p>
        )}
      </div>
    </div>
  );
}
