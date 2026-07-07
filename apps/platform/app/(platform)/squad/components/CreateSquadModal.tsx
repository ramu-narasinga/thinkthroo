"use client";

import { useState, useEffect } from "react";
import { Button } from "@thinkthroo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@thinkthroo/ui/components/dialog";
import { Input } from "@thinkthroo/ui/components/input";
import { Label } from "@thinkthroo/ui/components/label";
import { Textarea } from "@thinkthroo/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@thinkthroo/ui/components/select";
import { lambdaClient } from "@/lib/trpc/client/lambda";
import { agentClientService, AgentItem } from "@/service/agent/client";
import { squadClientService } from "@/service/squad/client";

interface Repository {
  id: string;
  fullName: string;
}

interface CreateSquadModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateSquadModal({ open, onClose, onCreated }: CreateSquadModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [leaderAgentId, setLeaderAgentId] = useState("");
  const [memberAgentIds, setMemberAgentIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setSelectedRepo("");
    setAgents([]);
    setLeaderAgentId("");
    setMemberAgentIds(new Set());
    setError("");

    lambdaClient.installation.getAllRepositories.query()
      .then((repos) => setRepositories(repos as Repository[]))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!selectedRepo) {
      setAgents([]);
      setLeaderAgentId("");
      setMemberAgentIds(new Set());
      return;
    }
    agentClientService.getByRepository(selectedRepo).then((list) => {
      setAgents(list.filter((a) => a.status === "active"));
      setLeaderAgentId("");
      setMemberAgentIds(new Set());
    }).catch(() => {});
  }, [selectedRepo]);

  const toggleMember = (agentId: string) => {
    setMemberAgentIds((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId);
      else next.add(agentId);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Name is required."); return; }
    if (!selectedRepo) { setError("Please select a repository."); return; }
    if (!leaderAgentId) { setError("Please select a leader agent."); return; }

    setPending(true);
    setError("");
    try {
      await squadClientService.create({
        repositoryFullName: selectedRepo,
        name: name.trim(),
        description: description.trim(),
        leaderAgentId,
        memberAgentIds: [...memberAgentIds].filter((id) => id !== leaderAgentId),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create squad.");
    } finally {
      setPending(false);
    }
  };

  const nonLeaderAgents = agents.filter((a) => a.id !== leaderAgentId);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create Squad</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Create a collaborative squad with a leader agent and optional additional members.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="squad-name">Name</Label>
            <Input
              id="squad-name"
              placeholder="e.g. Frontend Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="squad-description">Description</Label>
            <Textarea
              id="squad-description"
              placeholder="Describe what this squad is responsible for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={255}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{description.length} / 255</p>
          </div>

          {/* Repository */}
          <div className="space-y-1.5">
            <Label>Repository</Label>
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger>
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((r) => (
                  <SelectItem key={r.id} value={r.fullName}>
                    {r.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Leader Agent */}
          <div className="space-y-1.5">
            <Label>Leader Agent</Label>
            <p className="text-xs text-muted-foreground">
              The leader receives all tasks assigned to this squad and coordinates the team.
            </p>
            <Select value={leaderAgentId} onValueChange={setLeaderAgentId} disabled={!selectedRepo || agents.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={agents.length === 0 ? (selectedRepo ? "No agents in this repository" : "Select a repository first") : "Select a leader agent"} />
              </SelectTrigger>
              <SelectContent>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Members */}
          {nonLeaderAgents.length > 0 && (
            <div className="space-y-1.5">
              <Label>Additional Members <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <p className="text-xs text-muted-foreground">
                Members the leader can delegate sub-tasks to. Can be added later.
              </p>
              <div className="border rounded-md divide-y max-h-36 overflow-y-auto">
                {nonLeaderAgents.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/30">
                    <input
                      type="checkbox"
                      checked={memberAgentIds.has(a.id)}
                      onChange={() => toggleMember(a.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{a.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? "Creating…" : "Create Squad"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
