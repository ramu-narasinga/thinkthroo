"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Bot, Wifi, WifiOff, Clock, CheckCircle2, XCircle, Loader2, Ban, ExternalLink } from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import { Badge } from "@thinkthroo/ui/components/badge";
import { useAgentStore } from "@/store/agent";
import { agentSelectors } from "@/store/agent/selectors";
import { AgentItem, CreateAgentInput, UpdateAgentInput } from "@/service/agent/client";
import { useAgentTaskStore } from "@/store/agentTask";
import { agentTaskSelectors } from "@/store/agentTask/selectors";
import { AgentTaskItem, AgentTaskStatus } from "@/service/agentTask/client";
import { AgentCard } from "./AgentCard";
import { CreateAgentModal } from "./CreateAgentModal";

function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function TaskStatusBadge({ status }: { status: AgentTaskStatus }) {
  const configs: Record<AgentTaskStatus, { label: string; icon: React.ReactNode; className: string }> = {
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

  const { label, icon, className } = configs[status] ?? configs.queued;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {icon}
      {label}
    </span>
  );
}

function TaskRow({ task, agentName, onCancel }: { task: AgentTaskItem; agentName: string; onCancel: (id: string) => void }) {
  const result = task.result ? (() => { try { return JSON.parse(task.result); } catch { return null; } })() : null;
  const cancellable = ["queued", "dispatched", "running"].includes(task.status);

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">
            {task.issueTitle ?? `Issue #${task.issueNumber}`}
          </span>
          {task.issueNumber && (
            <span className="text-xs text-muted-foreground">#{task.issueNumber}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-muted-foreground">{agentName}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-xs text-muted-foreground">{formatRelativeDate(task.createdAt)}</span>
          {task.failureReason && (
            <>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-xs text-red-600">{task.failureReason}</span>
            </>
          )}
          {result?.prUrl && (
            <a
              href={result.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              View PR <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <TaskStatusBadge status={task.status} />
        {cancellable && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => onCancel(task.id)}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export function AgentTab() {
  const params = useParams();
  const repositoryFullName = decodeURIComponent(params.repository as string);

  const agents = useAgentStore(agentSelectors.agents);
  const runtimes = useAgentStore(agentSelectors.runtimes);
  const isLoading = useAgentStore(agentSelectors.isLoading);
  const isFirstFetchFinished = useAgentStore(agentSelectors.isFirstFetchFinished);
  const fetchAgents = useAgentStore((s) => s.fetchAgents);
  const fetchRuntimes = useAgentStore((s) => s.fetchRuntimes);
  const createAgent = useAgentStore((s) => s.createAgent);
  const updateAgent = useAgentStore((s) => s.updateAgent);
  const archiveAgent = useAgentStore((s) => s.archiveAgent);

  const tasks = useAgentTaskStore(agentTaskSelectors.tasks);
  const tasksLoading = useAgentTaskStore(agentTaskSelectors.isLoading);
  const fetchTasks = useAgentTaskStore((s) => s.fetchTasks);
  const cancelTask = useAgentTaskStore((s) => s.cancelTask);

  const [modalOpen, setModalOpen] = useState(false);
  const [editAgent, setEditAgent] = useState<AgentItem | null>(null);

  React.useEffect(() => {
    fetchAgents(repositoryFullName);
    fetchRuntimes();
    fetchTasks(repositoryFullName);
  }, [repositoryFullName, fetchAgents, fetchRuntimes, fetchTasks]);

  const visibleAgents = agents.filter((a) => a.status !== "archived");
  const anyOnline = runtimes.some((r) => r.status === "online");

  const agentNameById = React.useMemo(
    () => Object.fromEntries(agents.map((a) => [a.id, a.name])),
    [agents]
  );

  const handleOpenCreate = () => { setEditAgent(null); setModalOpen(true); };
  const handleOpenEdit = (agent: AgentItem) => { setEditAgent(agent); setModalOpen(true); };
  const handleModalClose = () => { setModalOpen(false); setEditAgent(null); };

  const handleSubmit = async (input: CreateAgentInput | UpdateAgentInput) => {
    if ("id" in input) {
      await updateAgent(input as UpdateAgentInput);
    } else {
      await createAgent(input as CreateAgentInput);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Agents</h2>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-1" />
          New Agent
        </Button>
      </div>

      {/* Runtime status banner */}
      <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
        anyOnline
          ? "border-green-300 bg-green-50 text-green-800"
          : "border-muted bg-muted/40 text-muted-foreground"
      }`}>
        {anyOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>
              {runtimes.filter((r) => r.status === "online").length} runtime
              {runtimes.filter((r) => r.status === "online").length !== 1 ? "s" : ""} connected
            </span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>No runtime connected — install and start the daemon to run agents locally</span>
          </>
        )}
      </div>

      {/* Agent list */}
      {isLoading && (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading agents…</p>
      )}

      {!isLoading && isFirstFetchFinished && visibleAgents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <Bot className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No agents yet. Create one to start assigning issues automatically.
          </p>
          <Button size="sm" variant="outline" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-1" />
            New Agent
          </Button>
        </div>
      )}

      {!isLoading && visibleAgents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              runtime={runtimes.find((r) => r.id === agent.runtimeId)}
              onEdit={handleOpenEdit}
              onArchive={archiveAgent}
            />
          ))}
        </div>
      )}

      {/* Recent Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Recent Tasks
          </h3>
          {tasks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          )}
        </div>

        {tasksLoading && (
          <p className="text-sm text-muted-foreground py-4 text-center">Loading tasks…</p>
        )}

        {!tasksLoading && tasks.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No tasks yet. Assign an issue to an agent to get started.
          </p>
        )}

        {!tasksLoading && tasks.length > 0 && (
          <div className="rounded-lg border divide-y">
            {tasks.slice(0, 20).map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                agentName={agentNameById[task.agentId] ?? "Unknown agent"}
                onCancel={cancelTask}
              />
            ))}
          </div>
        )}
      </div>

      <CreateAgentModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        repositoryFullName={repositoryFullName}
        runtimes={runtimes}
        editAgent={editAgent}
      />
    </div>
  );
}
