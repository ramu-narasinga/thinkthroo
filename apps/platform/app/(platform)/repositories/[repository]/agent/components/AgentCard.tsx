"use client";

import { Badge } from "@thinkthroo/ui/components/badge";
import { Button } from "@thinkthroo/ui/components/button";
import { AGENT_MODELS } from "@/lib/agent-models";
import { AgentItem, DaemonRuntimeItem } from "@/service/agent/client";
import { Pencil, Archive, Bot, Wifi, WifiOff } from "lucide-react";

interface AgentCardProps {
  agent: AgentItem;
  runtime: DaemonRuntimeItem | undefined;
  onEdit: (agent: AgentItem) => void;
  onArchive: (id: string) => void;
}

export function AgentCard({ agent, runtime, onEdit, onArchive }: AgentCardProps) {
  const modelLabel =
    AGENT_MODELS.find((m) => m.value === agent.model)?.label ?? agent.model;

  const isOnline = runtime?.status === "online";

  return (
    <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-medium text-sm truncate">{agent.name}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(agent)}
            title="Edit agent"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onArchive(agent.id)}
            title="Archive agent"
          >
            <Archive className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {agent.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mt-auto">
        <Badge variant="secondary" className="text-xs font-normal">
          {modelLabel}
        </Badge>

        {agent.runtimeId ? (
          <Badge
            variant={isOnline ? "default" : "outline"}
            className={`text-xs font-normal gap-1 ${isOnline ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-100" : ""}`}
          >
            {isOnline ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {isOnline ? "Online" : "Offline"}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
            No runtime
          </Badge>
        )}

        {agent.status === "paused" && (
          <Badge variant="outline" className="text-xs font-normal">
            Paused
          </Badge>
        )}
      </div>
    </div>
  );
}
