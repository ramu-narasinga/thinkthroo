"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { KanbanStatus, IssueBoardItem } from "@/service/issueBoardState/client";
import { AgentTaskItem } from "@/service/agentTask/client";
import { AgentItem } from "@/service/agent/client";
import { AssignableMember } from "@/service/issueBoardState/client";
import { COLUMN_CONFIG } from "./kanbanConfig";
import { IssueCard } from "./IssueCard";

interface Props {
  status: KanbanStatus;
  items: IssueBoardItem[];
  repositoryFullName: string;
  tasksByIssue: Record<number, AgentTaskItem | undefined>;
  agents: AgentItem[];
  members: AssignableMember[];
  onAddIssue: (status: KanbanStatus) => void;
}

export function KanbanColumn({ status, items, repositoryFullName, tasksByIssue, agents, members, onAddIssue }: Props) {
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
        <button
          type="button"
          onClick={() => onAddIssue(status)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title={`New issue in ${config.label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
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
            members={members}
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
