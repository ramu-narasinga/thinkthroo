"use client";

import React from "react";
import { Bot, User } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@thinkthroo/ui/components/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@thinkthroo/ui/components/command";
import { Checkbox } from "@thinkthroo/ui/components/checkbox";
import { AgentItem } from "@/service/agent/client";
import { AssignableMember } from "@/service/issueBoardState/client";

interface Props {
  agents: AgentItem[];
  members: AssignableMember[];
  selectedAgentIds: string[];
  selectedMemberIds: string[];
  onToggleAgent: (agent: AgentItem) => void;
  onToggleMember: (member: AssignableMember) => void;
  trigger: React.ReactNode;
  align?: "start" | "center" | "end";
}

export function AssigneePicker({
  agents,
  members,
  selectedAgentIds,
  selectedMemberIds,
  onToggleAgent,
  onToggleMember,
  trigger,
  align = "start",
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align={align} className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Assign agents or members…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Agents">
              {agents.length === 0 && (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">No active agents</p>
              )}
              {agents.map((agent) => (
                <CommandItem key={agent.id} value={agent.name} onSelect={() => onToggleAgent(agent)} className="gap-2">
                  <Checkbox checked={selectedAgentIds.includes(agent.id)} className="pointer-events-none" />
                  <Bot className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate flex-1">{agent.name}</span>
                  {agent.status === "paused" && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 shrink-0">
                      paused
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {members.length > 0 && (
              <CommandGroup heading="Members">
                {members.map((member) => (
                  <CommandItem key={member.id} value={member.fullName} onSelect={() => onToggleMember(member)} className="gap-2">
                    <Checkbox checked={selectedMemberIds.includes(member.id)} className="pointer-events-none" />
                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{member.fullName}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
