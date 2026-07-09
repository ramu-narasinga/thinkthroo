"use client";

import React, { useState } from "react";
import { Tag, Plus } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@thinkthroo/ui/components/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@thinkthroo/ui/components/command";
import { Checkbox } from "@thinkthroo/ui/components/checkbox";
import { IssueLabelItem } from "@/service/issueBoardState/client";

const PRESET_COLORS = ["ef4444", "f97316", "eab308", "22c55e", "06b6d4", "3b82f6", "8b5cf6", "ec4899"];

interface Props {
  labels: IssueLabelItem[];
  selectedLabelIds: string[];
  onToggleLabel: (label: IssueLabelItem) => void;
  onCreateLabel: (name: string, color: string) => Promise<IssueLabelItem>;
  trigger: React.ReactNode;
  align?: "start" | "center" | "end";
}

export function LabelPicker({ labels, selectedLabelIds, onToggleLabel, onCreateLabel, trigger, align = "start" }: Props) {
  const [query, setQuery] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [creating, setCreating] = useState(false);

  const trimmed = query.trim();
  const exists = labels.some((l) => l.name.toLowerCase() === trimmed.toLowerCase());

  async function handleCreate() {
    if (!trimmed || exists || creating) return;
    setCreating(true);
    try {
      const label = await onCreateLabel(trimmed, color);
      onToggleLabel(label);
      setQuery("");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align={align} className="w-64 p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search or create label…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandGroup>
              {labels
                .filter((l) => l.name.toLowerCase().includes(trimmed.toLowerCase()))
                .map((label) => (
                  <CommandItem key={label.id} value={label.name} onSelect={() => onToggleLabel(label)} className="gap-2">
                    <Checkbox checked={selectedLabelIds.includes(label.id)} className="pointer-events-none" />
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: `#${label.color}` }} />
                    <span className="truncate">{label.name}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
            {trimmed && !exists && (
              <CommandEmpty className="p-2 space-y-2 text-left">
                <div className="flex items-center gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-4 w-4 rounded-full shrink-0 ${color === c ? "ring-2 ring-offset-1 ring-foreground" : ""}`}
                      style={{ backgroundColor: `#${c}` }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create label &ldquo;{trimmed}&rdquo;
                </button>
              </CommandEmpty>
            )}
            {!trimmed && labels.length === 0 && (
              <CommandEmpty>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Tag className="h-3 w-3" /> No labels yet — type to create one
                </span>
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
