import { Minus, AlertTriangle, SignalHigh, SignalMedium, SignalLow, Compass, Sparkles, MessageSquare, Zap, type LucideIcon } from "lucide-react";
import type { KanbanStatus, Priority, ExecutionMode } from "@/service/issueBoardState/client";

export interface ColumnConfig {
  label: string;
  dotColor: string;
  bg: string;
}

export const COLUMN_ORDER: KanbanStatus[] = ["backlog", "todo", "in_progress", "in_review", "done", "blocked"];

// Statuses folded into "in_progress" for display — the board still tracks the
// real kanbanStatus, but these no longer get their own column.
export const FOLDED_INTO_IN_PROGRESS: KanbanStatus[] = ["planning", "waiting_for_user"];

export const COLUMN_CONFIG: Record<KanbanStatus, ColumnConfig> = {
  backlog:          { label: "Backlog",         dotColor: "bg-muted-foreground",  bg: "bg-muted/30" },
  planning:         { label: "Planning",         dotColor: "bg-indigo-400",        bg: "bg-indigo-50/50 dark:bg-indigo-950/20" },
  todo:             { label: "Todo",             dotColor: "bg-yellow-400",        bg: "bg-yellow-50/50 dark:bg-yellow-950/20" },
  in_progress:      { label: "In Progress",      dotColor: "bg-blue-500",          bg: "bg-blue-50/50 dark:bg-blue-950/20" },
  in_review:        { label: "In Review",        dotColor: "bg-purple-500",        bg: "bg-purple-50/50 dark:bg-purple-950/20" },
  done:             { label: "Done",             dotColor: "bg-green-500",         bg: "bg-green-50/50 dark:bg-green-950/20" },
  blocked:          { label: "Blocked",          dotColor: "bg-red-500",           bg: "bg-red-50/50 dark:bg-red-950/20" },
  waiting_for_user: { label: "Needs Input",      dotColor: "bg-amber-500",         bg: "bg-amber-50/50 dark:bg-amber-950/20" },
};

export interface PriorityConfig {
  label: string;
  className: string;
  icon: LucideIcon;
}

export const PRIORITY_ORDER: Priority[] = ["no_priority", "urgent", "high", "medium", "low"];

export const PRIORITY_CONFIG: Record<Priority, PriorityConfig> = {
  no_priority: { label: "No priority", className: "text-muted-foreground", icon: Minus },
  urgent:      { label: "Urgent",      className: "text-red-600",          icon: AlertTriangle },
  high:        { label: "High",        className: "text-orange-500",       icon: SignalHigh },
  medium:      { label: "Medium",      className: "text-yellow-500",       icon: SignalMedium },
  low:         { label: "Low",         className: "text-muted-foreground", icon: SignalLow },
};

export interface ExecutionModeConfig {
  label: string;
  description: string;
  className: string;
  icon: LucideIcon;
}

export const EXECUTION_MODE_ORDER: ExecutionMode[] = ["plan", "ask_before_edits", "auto_accept_edits", "auto"];

export const EXECUTION_MODE_CONFIG: Record<ExecutionMode, ExecutionModeConfig> = {
  plan:              { label: "Plan",               description: "Investigate and propose a plan, no edits",     className: "text-indigo-600",  icon: Compass },
  ask_before_edits:  { label: "Ask before edits",    description: "Pause for approval before each edit",          className: "text-amber-600",   icon: MessageSquare },
  auto_accept_edits: { label: "Auto-accept edits",   description: "Edits proceed automatically",                  className: "text-blue-600",    icon: Sparkles },
  auto:              { label: "Auto",                description: "Full auto, all permission checks skipped",    className: "text-muted-foreground", icon: Zap },
};
