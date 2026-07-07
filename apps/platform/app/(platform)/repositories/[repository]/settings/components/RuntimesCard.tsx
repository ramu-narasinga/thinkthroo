"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, Trash2, Plus, Copy, Check, Terminal } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@thinkthroo/ui/components/card";
import { Button } from "@thinkthroo/ui/components/button";
import { Input } from "@thinkthroo/ui/components/input";
import { Label } from "@thinkthroo/ui/components/label";
import { Badge } from "@thinkthroo/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@thinkthroo/ui/components/dialog";
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

interface RegisteredKey {
  runtimeId: string;
  apiKey: string;
  name: string;
  platformUrl: string;
}

export function RuntimesCard() {
  const runtimes = useAgentStore(agentSelectors.runtimes);
  const fetchRuntimes = useAgentStore((s) => s.fetchRuntimes);
  const deleteRuntime = useAgentStore((s) => s.deleteRuntime);

  // Ensure runtimes are loaded even if the Agent tab hasn't been visited yet
  useEffect(() => { fetchRuntimes(); }, [fetchRuntimes]);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<RegisteredKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const platformUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://app.thinkthroo.com";

  const handleRegister = async () => {
    if (!name.trim()) return;
    setIsRegistering(true);
    setRegisterError(null);
    try {
      const res = await fetch("/api/daemon/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setRegisterError(data.error ?? "Registration failed");
        return;
      }
      const data = await res.json() as { runtimeId: string; apiKey: string };
      setRegistered({ ...data, name: name.trim(), platformUrl });
      await fetchRuntimes();
    } catch {
      setRegisterError("Network error");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCloseRegister = () => {
    setRegisterOpen(false);
    setName("");
    setRegistered(null);
    setRegisterError(null);
  };

  const handleDelete = async (runtime: DaemonRuntimeItem) => {
    setDeletingId(runtime.id);
    try {
      await deleteRuntime(runtime.id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const configureCommand = registered
    ? `thinkthroo configure \\\n  --runtime-id ${registered.runtimeId} \\\n  --api-key ${registered.apiKey} \\\n  --platform-url ${registered.platformUrl}`
    : "";

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-base">Daemon Runtimes</CardTitle>
            <CardDescription className="mt-1 text-sm">
              Local machines running the <code className="text-xs bg-muted px-1 py-0.5 rounded">thinkthroo</code> process. Agents use runtimes to execute tasks on your machine.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => setRegisterOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Register Runtime
          </Button>
        </CardHeader>

        <CardContent>
          {runtimes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <WifiOff className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No runtimes registered. Install the daemon and register it to run agents locally.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-md px-3 py-2 mt-1 font-mono">
                <Terminal className="h-3.5 w-3.5 shrink-0" />
                npm install -g thinkthroo
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

      {/* Register dialog */}
      <Dialog open={registerOpen} onOpenChange={(open) => { if (!open) handleCloseRegister(); }}>
        <DialogContent>
          {!registered ? (
            <>
              <DialogHeader>
                <DialogTitle>Register a Runtime</DialogTitle>
                <DialogDescription>
                  Give this machine a name, then use the generated API key to configure the daemon.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="runtime-name">Runtime name</Label>
                  <Input
                    id="runtime-name"
                    placeholder="e.g. MacBook Air M3"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleRegister(); }}
                  />
                </div>
                {registerError && (
                  <p className="text-sm text-destructive">{registerError}</p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseRegister}>Cancel</Button>
                <Button onClick={handleRegister} disabled={isRegistering || !name.trim()}>
                  {isRegistering ? "Registering…" : "Register"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Runtime registered</DialogTitle>
                <DialogDescription>
                  Copy the command below and run it on <strong>{registered.name}</strong> to configure the daemon. The API key is shown only once.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <div className="relative rounded-md bg-muted p-3 pr-10 font-mono text-xs whitespace-pre">
                  {configureCommand}
                  <button
                    className="absolute top-2 right-2 p-1 rounded hover:bg-muted-foreground/10 text-muted-foreground"
                    onClick={() => handleCopy(configureCommand.replace(/\\\n\s+/g, ' '))}
                    title="Copy command"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Then run <code className="bg-muted px-1 py-0.5 rounded">thinkthroo start</code> to begin processing tasks.
                </p>
              </div>

              <DialogFooter>
                <Button onClick={handleCloseRegister}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
