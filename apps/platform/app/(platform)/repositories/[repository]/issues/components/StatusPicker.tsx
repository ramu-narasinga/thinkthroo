"use client";

import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@thinkthroo/ui/components/popover";
import { Command, CommandList, CommandGroup, CommandItem } from "@thinkthroo/ui/components/command";
import type { KanbanStatus } from "@/service/issueBoardState/client";
import { COLUMN_ORDER, COLUMN_CONFIG } from "./kanbanConfig";

interface Props {
  value: KanbanStatus;
  onChange: (status: KanbanStatus) => void;
  trigger: React.ReactNode;
  align?: "start" | "center" | "end";
}

export function StatusPicker({ value, onChange, trigger, align = "start" }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align={align} className="w-48 p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {COLUMN_ORDER.map((status) => {
                const config = COLUMN_CONFIG[status];
                return (
                  <CommandItem key={status} value={config.label} onSelect={() => onChange(status)} className="gap-2">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${config.dotColor}`} />
                    <span className={value === status ? "font-medium" : ""}>{config.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
