"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Bot, Wifi, WifiOff } from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import { useAgentStore } from "@/store/agent";
import { agentSelectors } from "@/store/agent/selectors";
import { AgentItem, CreateAgentInput, UpdateAgentInput } from "@/service/agent/client";
import { AgentCard } from "./AgentCard";
import { CreateAgentModal } from "./CreateAgentModal";

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

  const [modalOpen, setModalOpen] = useState(false);
  const [editAgent, setEditAgent] = useState<AgentItem | null>(null);

  React.useEffect(() => {
    fetchAgents(repositoryFullName);
    fetchRuntimes();
  }, [repositoryFullName, fetchAgents, fetchRuntimes]);

  const visibleAgents = agents.filter((a) => a.status !== "archived");
  const anyOnline = runtimes.some((r) => r.status === "online");

  const handleOpenCreate = () => { setEditAgent(null); setModalOpen(true); };
  const handleOpenEdit = (agent: AgentItem) => { setEditAgent(agent); setModalOpen(true); };
  const handleModalClose = () => { setModalOpen(false); setEditAgent(null); };

  const handleSubmit = async (input: CreateAgentInput | UpdateAgentInput) => {
    if ("id" in input) {
      return updateAgent(input as UpdateAgentInput);
    } else {
      return createAgent(input as CreateAgentInput);
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
