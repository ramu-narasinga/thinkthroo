"use client";

import React, { useMemo, useState } from "react"; // useState still needed for assigneePopover
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Bot, Users2, X } from "lucide-react";
import { useIssueBoardStateStore } from "@/store/issueBoardState/store";
import { boardSelectors } from "@/store/issueBoardState/selectors";
import { useAgentTaskStore } from "@/store/agentTask/store";
import { agentTaskSelectors } from "@/store/agentTask/selectors";
import { KanbanStatus, IssueBoardItem } from "@/service/issueBoardState/client";
import { AgentItem } from "@/service/agent/client";
import { AgentTaskItem } from "@/service/agentTask/client";
import { SquadWithMembers } from "@/service/squad/client";
import { KanbanColumn } from "./KanbanColumn";

const COLUMN_ORDER: KanbanStatus[] = ["backlog", "todo", "in_progress", "in_review", "done", "blocked"];

type AssigneeFilter = "all" | "agents" | "members";

interface Props {
  repositoryFullName: string;
  agents: AgentItem[];
  squads: SquadWithMembers[];
  filter: AssigneeFilter;
  setFilter: (f: AssigneeFilter) => void;
}

export function KanbanBoard({ repositoryFullName, agents, squads, filter, setFilter }: Props) {
  const boardItems = useIssueBoardStateStore(boardSelectors.boardItems);
  const isLoading = useIssueBoardStateStore(boardSelectors.isLoading);
  const moveCard = useIssueBoardStateStore((s) => s.moveCard);
  const updateAssignee = useIssueBoardStateStore((s) => s.updateAssignee);

  const tasks = useAgentTaskStore(agentTaskSelectors.tasks);

  const [assigneePopover, setAssigneePopover] = useState<IssueBoardItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Index latest task per issue number for quick lookup
  const tasksByIssue = useMemo<Record<number, AgentTaskItem | undefined>>(() => {
    const map: Record<number, AgentTaskItem> = {};
    for (const task of tasks) {
      if (task.issueNumber == null) continue;
      const existing = map[task.issueNumber];
      if (!existing || new Date(task.createdAt) > new Date(existing.createdAt)) {
        map[task.issueNumber] = task;
      }
    }
    return map;
  }, [tasks]);

  const filteredItems = useMemo(() => {
    if (filter === "agents") return boardItems.filter((b) => b.assigneeType === "agent");
    if (filter === "members") return boardItems.filter((b) => b.assigneeType === "member");
    return boardItems;
  }, [boardItems, filter]);

  const itemsByColumn = useMemo(() => {
    const map: Record<KanbanStatus, IssueBoardItem[]> = {
      backlog: [], todo: [], in_progress: [], in_review: [], done: [], blocked: [],
    };
    for (const item of filteredItems) {
      map[item.kanbanStatus]?.push(item);
    }
    return map;
  }, [filteredItems]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const draggedItem = boardItems.find((b) => b.id === active.id);
    const newStatus = over.id as KanbanStatus;

    if (!draggedItem || draggedItem.kanbanStatus === newStatus) return;

    try {
      await moveCard(repositoryFullName, draggedItem.issueNumber, newStatus);
    } catch {
      // moveCard already logs; board will revert via re-fetch if needed
    }
  }

  function handleAssignAgent(item: IssueBoardItem, agent: AgentItem) {
    updateAssignee(repositoryFullName, item.issueNumber, "agent", agent.id, null, null);
    setAssigneePopover(null);
  }

  function handleAssignSquad(item: IssueBoardItem, squad: SquadWithMembers) {
    updateAssignee(repositoryFullName, item.issueNumber, "squad", null, null, squad.id);
    setAssigneePopover(null);
  }

  function handleClearAssignee(item: IssueBoardItem) {
    updateAssignee(repositoryFullName, item.issueNumber, null, null, null, null);
    setAssigneePopover(null);
  }

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">Loading board…</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Board — only this div scrolls horizontally */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
            {COLUMN_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                items={itemsByColumn[status]}
                repositoryFullName={repositoryFullName}
                tasksByIssue={tasksByIssue}
                agents={agents}
                onAssigneeClick={(item) => setAssigneePopover(item)}
              />
            ))}
          </div>
        </div>
      </DndContext>

      {/* Assignee popover (rendered outside columns to avoid z-index issues) */}
      {assigneePopover && (
        <AssigneePopover
          item={assigneePopover}
          agents={agents}
          squads={squads}
          onAssignAgent={handleAssignAgent}
          onAssignSquad={handleAssignSquad}
          onClearAssignee={handleClearAssignee}
          onClose={() => setAssigneePopover(null)}
        />
      )}
    </div>
  );
}

interface AssigneePopoverProps {
  item: IssueBoardItem;
  agents: AgentItem[];
  squads: SquadWithMembers[];
  onAssignAgent: (item: IssueBoardItem, agent: AgentItem) => void;
  onAssignSquad: (item: IssueBoardItem, squad: SquadWithMembers) => void;
  onClearAssignee: (item: IssueBoardItem) => void;
  onClose: () => void;
}

function AssigneePopover({ item, agents, squads, onAssignAgent, onAssignSquad, onClearAssignee, onClose }: AssigneePopoverProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={onClose}
    >
      <div
        className="bg-background border rounded-xl shadow-xl p-4 w-64 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Assign #{item.issueNumber}</p>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground px-1">Agents</p>
          {agents.length === 0 && (
            <p className="text-xs text-muted-foreground px-1">No active agents</p>
          )}
          {agents.map((agent) => (
            <button
              key={agent.id}
              type="button"
              onClick={() => onAssignAgent(item, agent)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm hover:bg-muted transition-colors text-left ${
                item.assigneeAgentId === agent.id ? "bg-muted font-medium" : ""
              }`}
            >
              <Bot className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {agent.name}
            </button>
          ))}
        </div>

        {squads.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground px-1">Squads</p>
            {squads.map((squad) => (
              <button
                key={squad.id}
                type="button"
                onClick={() => onAssignSquad(item, squad)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm hover:bg-muted transition-colors text-left ${
                  item.assigneeSquadId === squad.id ? "bg-muted font-medium" : ""
                }`}
              >
                <Users2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {squad.name}
              </button>
            ))}
          </div>
        )}

        {item.assigneeType && (
          <button
            type="button"
            onClick={() => onClearAssignee(item)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors text-left border-t pt-2 mt-1"
          >
            <X className="h-3.5 w-3.5 shrink-0" />
            Unassign
          </button>
        )}
      </div>
    </div>
  );
}
