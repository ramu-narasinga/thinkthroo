"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, Trash2, Terminal } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@thinkthroo/ui/components/card";
import { Button } from "@thinkthroo/ui/components/button";
import { Badge } from "@thinkthroo/ui/components/badge";
import { useAgentStore } from "@/store/agent";
import { agentSelectors } from "@/store/agent/selectors";
import { DaemonRuntimeItem } from "@/service/agent/client";

function formatLastSeen(date: Date | string | null): string {
  if (!date) return "Never";
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function RuntimesCard() {
  const runtimes = useAgentStore(agentSelectors.runtimes);
  const fetchRuntimes = useAgentStore((s) => s.fetchRuntimes);
  const deleteRuntime = useAgentStore((s) => s.deleteRuntime);

  // Ensure runtimes are loaded even if the Agent tab hasn't been visited yet
  useEffect(() => { fetchRuntimes(); }, [fetchRuntimes]);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (runtime: DaemonRuntimeItem) => {
    setDeletingId(runtime.id);
    try {
      await deleteRuntime(runtime.id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Daemon Runtimes</CardTitle>
        <CardDescription className="mt-1 text-sm">
          Local machines running the <code className="text-xs bg-muted px-1 py-0.5 rounded">thinkthroo</code> process. Agents use runtimes to execute tasks on your machine.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {runtimes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <WifiOff className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No runtimes registered. Install the daemon and run setup to register this machine.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-md px-3 py-2 mt-1 font-mono">
              <Terminal className="h-3.5 w-3.5 shrink-0" />
              npm install -g thinkthroo && thinkthroo setup
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {runtimes.map((runtime) => (
              <div key={runtime.id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {runtime.status === "online" ? (
                      <Wifi className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm font-medium truncate">{runtime.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        runtime.status === "online"
                          ? "border-green-300 bg-green-50 text-green-700"
                          : "border-muted-foreground/20 text-muted-foreground"
                      }`}
                    >
                      {runtime.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                    Last seen: {formatLastSeen(runtime.lastSeenAt)}
                    <span className="mx-1.5 text-muted-foreground/40">·</span>
                    <span className="font-mono text-xs">{runtime.id.slice(0, 8)}…</span>
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  disabled={deletingId === runtime.id}
                  onClick={() => handleDelete(runtime)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
