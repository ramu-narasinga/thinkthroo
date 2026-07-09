"use client";

import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@thinkthroo/ui/components/popover";
import { Command, CommandList, CommandGroup, CommandItem } from "@thinkthroo/ui/components/command";
import type { ExecutionMode } from "@/service/issueBoardState/client";
import { EXECUTION_MODE_ORDER, EXECUTION_MODE_CONFIG } from "./kanbanConfig";

interface Props {
  value: ExecutionMode;
  onChange: (mode: ExecutionMode) => void;
  trigger: React.ReactNode;
  align?: "start" | "center" | "end";
}

export function ModePicker({ value, onChange, trigger, align = "start" }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align={align} className="w-64 p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {EXECUTION_MODE_ORDER.map((mode) => {
                const config = EXECUTION_MODE_CONFIG[mode];
                const Icon = config.icon;
                return (
                  <CommandItem key={mode} value={config.label} onSelect={() => onChange(mode)} className="gap-2 items-start py-2">
                    <Icon className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${config.className}`} />
                    <div className="flex flex-col">
                      <span className={value === mode ? "font-medium" : ""}>{config.label}</span>
                      <span className="text-xs text-muted-foreground">{config.description}</span>
                    </div>
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
