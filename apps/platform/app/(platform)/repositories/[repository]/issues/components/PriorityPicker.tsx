"use client";

import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@thinkthroo/ui/components/popover";
import { Command, CommandList, CommandGroup, CommandItem } from "@thinkthroo/ui/components/command";
import type { Priority } from "@/service/issueBoardState/client";
import { PRIORITY_ORDER, PRIORITY_CONFIG } from "./kanbanConfig";

interface Props {
  value: Priority;
  onChange: (priority: Priority) => void;
  trigger: React.ReactNode;
  align?: "start" | "center" | "end";
}

export function PriorityPicker({ value, onChange, trigger, align = "start" }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align={align} className="w-48 p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {PRIORITY_ORDER.map((priority) => {
                const config = PRIORITY_CONFIG[priority];
                const Icon = config.icon;
                return (
                  <CommandItem key={priority} value={config.label} onSelect={() => onChange(priority)} className="gap-2">
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${config.className}`} />
                    <span className={value === priority ? "font-medium" : ""}>{config.label}</span>
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
