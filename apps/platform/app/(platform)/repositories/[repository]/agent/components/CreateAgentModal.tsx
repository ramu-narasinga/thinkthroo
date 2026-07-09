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
import { FileText, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@thinkthroo/ui/components/select";
import { AGENT_MODELS } from "@/lib/agent-models";
import { AgentItem, CreateAgentInput, DaemonRuntimeItem, UpdateAgentInput } from "@/service/agent/client";
import { documentClientService } from "@/service/document/client";
import { agentDocumentSkillClientService } from "@/service/agentDocumentSkill/client";

interface DocOption {
  id: string;
  name: string;
  description?: string;
}

interface CreateAgentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateAgentInput | UpdateAgentInput) => Promise<AgentItem>;
  repositoryFullName: string;
  runtimes: DaemonRuntimeItem[];
  editAgent?: AgentItem | null;
}

export function CreateAgentModal({
  open,
  onClose,
  onSubmit,
  repositoryFullName,
  runtimes,
  editAgent,
}: CreateAgentModalProps) {
  const isEdit = !!editAgent;

  const [name, setName] = useState(editAgent?.name ?? "");
  const [description, setDescription] = useState(editAgent?.description ?? "");
  const [instructions, setInstructions] = useState(editAgent?.instructions ?? "");
  const [model, setModel] = useState(editAgent?.model ?? "claude-sonnet-4-6");
  const [runtimeId, setRuntimeId] = useState(editAgent?.runtimeId ?? "");
  const [visibility, setVisibility] = useState<"personal" | "workspace">(
    (editAgent?.visibility as "personal" | "workspace") ?? "personal"
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const [availableDocs, setAvailableDocs] = useState<DocOption[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [skillSearch, setSkillSearch] = useState("");

  useEffect(() => {
    if (open) {
      setName(editAgent?.name ?? "");
      setDescription(editAgent?.description ?? "");
      setInstructions(editAgent?.instructions ?? "");
      setModel(editAgent?.model ?? "claude-sonnet-4-6");
      setRuntimeId(editAgent?.runtimeId ?? "");
      setVisibility((editAgent?.visibility as "personal" | "workspace") ?? "personal");
      setError("");
      setSkillSearch("");

      // Fetch file documents for this repository
      documentClientService.getRepositoryIdByName(repositoryFullName)
        .then((repo) => documentClientService.getAllByRepositoryMinimal(repo.id))
        .then((docs) => setAvailableDocs(
          docs.filter((d: { type: string; id: string; name: string; metadata?: { description?: string } | null }) => d.type === 'file')
            .map((d: { id: string; name: string; metadata?: { description?: string } | null }) => ({
              id: d.id,
              name: d.name,
              description: d.metadata?.description,
            }))
        ))
        .catch(() => {});

      if (editAgent) {
        agentDocumentSkillClientService.getAgentDocumentSkills(editAgent.id)
          .then((ids) => setSelectedDocIds(new Set(ids)))
          .catch(() => {});
      } else {
        setSelectedDocIds(new Set());
      }
    }
  }, [open, editAgent, repositoryFullName]);

  const handleClose = () => {
    if (pending) return;
    setName("");
    setDescription("");
    setInstructions("");
    setModel("claude-sonnet-4-6");
    setRuntimeId("");
    setVisibility("personal");
    setSelectedDocIds(new Set());
    setSkillSearch("");
    setError("");
    onClose();
  };

  const toggleDoc = (id: string) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredDocs = availableDocs.filter((doc) => {
    const query = skillSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      doc.name.toLowerCase().includes(query) ||
      (doc.description ?? "").toLowerCase().includes(query)
    );
  });

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (description.length > 255) {
      setError("Description must be 255 characters or fewer.");
      return;
    }
    setError("");
    setPending(true);
    try {
      let agent: AgentItem;
      if (isEdit && editAgent) {
        agent = await onSubmit({
          id: editAgent.id,
          name: name.trim(),
          description,
          instructions,
          model,
          visibility,
          runtimeId: runtimeId || null,
        } as UpdateAgentInput);
      } else {
        agent = await onSubmit({
          repositoryFullName,
          name: name.trim(),
          description,
          instructions,
          model,
          visibility,
          runtimeId: runtimeId || undefined,
        } as CreateAgentInput);
      }
      await agentDocumentSkillClientService.setAgentDocumentSkills(agent.id, [...selectedDocIds]);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Agent" : "New Agent"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="agent-name">Name <span className="text-destructive">*</span></Label>
            <Input
              id="agent-name"
              placeholder="My coding agent"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="agent-description">
              Description{" "}
              <span className="text-muted-foreground text-xs font-normal">(shown in listings, not sent to AI)</span>
            </Label>
            <textarea
              id="agent-description"
              rows={2}
              maxLength={255}
              placeholder="A short summary of what this agent does…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            <span className="text-xs text-muted-foreground text-right">{description.length}/255</span>
          </div>

          {/* Instructions */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="agent-instructions">Instructions</Label>
            <textarea
              id="agent-instructions"
              rows={4}
              placeholder="Write what this agent should do, what to focus on, what to avoid…"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {/* Skills */}
          {availableDocs.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Skills</Label>
              <div className="rounded-md border border-input overflow-hidden">
                <div className="flex items-center gap-2 border-b border-input px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="divide-y max-h-52 overflow-y-auto">
                  {filteredDocs.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                      No skills found.
                    </p>
                  ) : (
                    filteredDocs.map((doc) => (
                      <label
                        key={doc.id}
                        className="flex items-start gap-2.5 px-3 py-2 cursor-pointer hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDocIds.has(doc.id)}
                          onChange={() => toggleDoc(doc.id)}
                          className="h-4 w-4 mt-0.5 rounded border-input accent-primary shrink-0"
                        />
                        <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Model */}
          <div className="flex flex-col gap-1.5">
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {AGENT_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Runtime */}
          <div className="flex flex-col gap-1.5">
            <Label>Runtime</Label>
            <Select
              value={runtimeId || "__none__"}
              onValueChange={(v) => setRuntimeId(v === "__none__" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a runtime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No runtime</SelectItem>
                {runtimes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}{" "}
                    <span className="text-muted-foreground">
                      ({r.status === "online" ? "Online" : "Offline"})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {runtimes.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No runtimes registered yet. Install and run the daemon to connect one.
              </p>
            )}
          </div>

          {/* Visibility */}
          <div className="flex flex-col gap-1.5">
            <Label>Visibility</Label>
            <div className="flex gap-2">
              {(["personal", "workspace"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                    visibility === v
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-input hover:bg-muted"
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save" : "Create Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
