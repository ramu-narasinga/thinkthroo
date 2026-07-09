"use client";

import React, { useState } from "react";
import { ChevronRight, Paperclip, Tag, X } from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@thinkthroo/ui/components/dialog";
import { AgentItem } from "@/service/agent/client";
import {
  AssignableMember,
  IssueLabelItem,
  IssueBoardItem,
  KanbanStatus,
  Priority,
  ExecutionMode,
} from "@/service/issueBoardState/client";
import { issueLabelClientService } from "@/service/issueLabel/client";
import { COLUMN_CONFIG, PRIORITY_CONFIG, EXECUTION_MODE_CONFIG } from "./kanbanConfig";
import { StatusPicker } from "./StatusPicker";
import { PriorityPicker } from "./PriorityPicker";
import { ModePicker } from "./ModePicker";
import { AssigneePicker } from "./AssigneePicker";
import { LabelPicker } from "./LabelPicker";
import { useIssueAttachmentUpload } from "../hooks/useIssueAttachmentUpload";

interface Props {
  open: boolean;
  onClose: () => void;
  repositoryFullName: string;
  defaultKanbanStatus: KanbanStatus;
  agents: AgentItem[];
  members: AssignableMember[];
  labels: IssueLabelItem[];
  onLabelsChanged: () => void;
  onCreate: (input: {
    title: string;
    body?: string;
    priority: Priority;
    kanbanStatus: KanbanStatus;
    executionMode: ExecutionMode;
    labelIds: string[];
    assignees: Array<{ assigneeType: "agent" | "member"; assigneeAgentId?: string; assigneeMemberId?: string }>;
    attachments: Array<{ url: string; fileName: string; contentType?: string }>;
  }) => Promise<IssueBoardItem>;
  onCreated: (item: IssueBoardItem) => void;
}

export function NewIssueModal({
  open,
  onClose,
  repositoryFullName,
  defaultKanbanStatus,
  agents,
  members,
  labels,
  onLabelsChanged,
  onCreate,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<KanbanStatus>(defaultKanbanStatus);
  const [priority, setPriority] = useState<Priority>("no_priority");
  const [executionMode, setExecutionMode] = useState<ExecutionMode>("auto_accept_edits");
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<IssueLabelItem[]>([]);
  const [creating, setCreating] = useState(false);

  const { attachments, addFiles, removeAttachment, reset: resetAttachments, isUploading, resolved } =
    useIssueAttachmentUpload();

  React.useEffect(() => {
    if (open) setStatus(defaultKanbanStatus);
  }, [open, defaultKanbanStatus]);

  function resetForm() {
    setTitle("");
    setBody("");
    setPriority("no_priority");
    setExecutionMode("auto_accept_edits");
    setSelectedAgentIds([]);
    setSelectedMemberIds([]);
    setSelectedLabels([]);
    resetAttachments();
  }

  function handleClose() {
    onClose();
    resetForm();
  }

  function toggleAgent(agent: AgentItem) {
    setSelectedAgentIds((prev) => (prev.includes(agent.id) ? prev.filter((id) => id !== agent.id) : [...prev, agent.id]));
  }

  function toggleMember(member: AssignableMember) {
    setSelectedMemberIds((prev) => (prev.includes(member.id) ? prev.filter((id) => id !== member.id) : [...prev, member.id]));
  }

  function toggleLabel(label: IssueLabelItem) {
    setSelectedLabels((prev) =>
      prev.some((l) => l.id === label.id) ? prev.filter((l) => l.id !== label.id) : [...prev, label]
    );
  }

  async function handleCreateLabel(name: string, color: string): Promise<IssueLabelItem> {
    const label = await issueLabelClientService.create({ repositoryFullName, name, color });
    onLabelsChanged();
    return label;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || creating || isUploading) return;
    setCreating(true);
    try {
      const item = await onCreate({
        title: title.trim(),
        body: body.trim() || undefined,
        priority,
        kanbanStatus: status,
        executionMode,
        labelIds: selectedLabels.map((l) => l.id),
        assignees: [
          ...selectedAgentIds.map((id) => ({ assigneeType: "agent" as const, assigneeAgentId: id })),
          ...selectedMemberIds.map((id) => ({ assigneeType: "member" as const, assigneeMemberId: id })),
        ],
        attachments: resolved,
      });
      onCreated(item);
      handleClose();
    } finally {
      setCreating(false);
    }
  }

  const statusConfig = COLUMN_CONFIG[status];
  const priorityConfig = PRIORITY_CONFIG[priority];
  const PriorityIcon = priorityConfig.icon;
  const modeConfig = EXECUTION_MODE_CONFIG[executionMode];
  const ModeIcon = modeConfig.icon;
  const assigneeCount = selectedAgentIds.length + selectedMemberIds.length;

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((f): f is File => f != null);
    if (files.length > 0) {
      e.preventDefault();
      addFiles(files);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
            <span className="truncate max-w-[180px]">{repositoryFullName}</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="text-foreground font-medium">Create manually</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Issue title"
            className="w-full border-0 outline-none text-lg font-medium bg-transparent placeholder:text-muted-foreground/50"
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onPaste={handlePaste}
            placeholder="Add description…"
            rows={4}
            className="w-full border-0 outline-none resize-none text-sm bg-transparent placeholder:text-muted-foreground/50"
          />

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((a) => (
                <div key={a.id} className="relative h-16 w-16 rounded-md overflow-hidden border shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.previewUrl} alt={a.file.name} className="h-full w-full object-cover" />
                  {a.uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="h-3 w-3 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAttachment(a.id)}
                    className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedLabels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedLabels.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
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

          <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t">
            <StatusPicker
              value={status}
              onChange={setStatus}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border hover:bg-muted transition-colors"
                >
                  <span className={`h-2 w-2 rounded-full ${statusConfig.dotColor}`} />
                  {statusConfig.label}
                </button>
              }
            />

            <PriorityPicker
              value={priority}
              onChange={setPriority}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border hover:bg-muted transition-colors"
                >
                  <PriorityIcon className={`h-3 w-3 ${priorityConfig.className}`} />
                  {priorityConfig.label}
                </button>
              }
            />

            <ModePicker
              value={executionMode}
              onChange={setExecutionMode}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border hover:bg-muted transition-colors"
                >
                  <ModeIcon className={`h-3 w-3 ${modeConfig.className}`} />
                  {modeConfig.label}
                </button>
              }
            />

            <AssigneePicker
              agents={agents}
              members={members}
              selectedAgentIds={selectedAgentIds}
              selectedMemberIds={selectedMemberIds}
              onToggleAgent={toggleAgent}
              onToggleMember={toggleMember}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border hover:bg-muted transition-colors"
                >
                  {assigneeCount === 0 ? "Unassigned" : `${assigneeCount} assignee${assigneeCount > 1 ? "s" : ""}`}
                </button>
              }
            />

            <LabelPicker
              labels={labels}
              selectedLabelIds={selectedLabels.map((l) => l.id)}
              onToggleLabel={toggleLabel}
              onCreateLabel={handleCreateLabel}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border hover:bg-muted transition-colors"
                >
                  <Tag className="h-3 w-3" />
                  {selectedLabels.length === 0 ? "Add label" : `${selectedLabels.length} label${selectedLabels.length > 1 ? "s" : ""}`}
                </button>
              }
            />

            <label className="inline-flex items-center justify-center h-7 w-7 rounded-full border hover:bg-muted transition-colors cursor-pointer">
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || isUploading || !title.trim()}>
              {creating ? "Creating…" : isUploading ? "Uploading…" : "Create Issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
