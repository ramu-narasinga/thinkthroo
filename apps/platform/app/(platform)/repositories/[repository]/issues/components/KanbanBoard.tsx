"use client";

import React, { useMemo } from "react";
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useIssueBoardStateStore } from "@/store/issueBoardState/store";
import { boardSelectors } from "@/store/issueBoardState/selectors";
import { useAgentTaskStore } from "@/store/agentTask/store";
import { agentTaskSelectors } from "@/store/agentTask/selectors";
import { KanbanStatus, IssueBoardItem, AssignableMember } from "@/service/issueBoardState/client";
import { AgentItem } from "@/service/agent/client";
import { AgentTaskItem } from "@/service/agentTask/client";
import { COLUMN_ORDER, FOLDED_INTO_IN_PROGRESS } from "./kanbanConfig";
import { KanbanColumn } from "./KanbanColumn";
import KanbanBoardSkeleton from "./KanbanBoardSkeleton";

type AssigneeFilter = "all" | "agents" | "members";

interface Props {
  repositoryFullName: string;
  agents: AgentItem[];
  members: AssignableMember[];
  filter: AssigneeFilter;
  setFilter: (f: AssigneeFilter) => void;
  onAddIssue: (status: KanbanStatus) => void;
}

export function KanbanBoard({ repositoryFullName, agents, members, filter, onAddIssue }: Props) {
  const boardItems = useIssueBoardStateStore(boardSelectors.boardItems);
  const isLoading = useIssueBoardStateStore(boardSelectors.isLoading);
  const moveCard = useIssueBoardStateStore((s) => s.moveCard);

  const tasks = useAgentTaskStore(agentTaskSelectors.tasks);

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
    if (filter === "agents") return boardItems.filter((b) => b.assignees.some((a) => a.assigneeType === "agent"));
    if (filter === "members") return boardItems.filter((b) => b.assignees.some((a) => a.assigneeType === "member"));
    return boardItems;
  }, [boardItems, filter]);

  const itemsByColumn = useMemo(() => {
    const map: Record<KanbanStatus, IssueBoardItem[]> = {
      backlog: [], planning: [], todo: [], in_progress: [], in_review: [], done: [], blocked: [], waiting_for_user: [],
    };
    for (const item of filteredItems) {
      const status = FOLDED_INTO_IN_PROGRESS.includes(item.kanbanStatus) ? "in_progress" : item.kanbanStatus;
      map[status]?.push(item);
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

  if (isLoading) {
    return <KanbanBoardSkeleton />;
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
                members={members}
                onAddIssue={onAddIssue}
              />
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
