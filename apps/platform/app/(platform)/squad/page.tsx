"use client";

import { useEffect, useState, useCallback } from "react";
import { Users2, Plus, Bot, Loader2, Trash2 } from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import { squadClientService, SquadItem } from "@/service/squad/client";
import { CreateSquadModal } from "./components/CreateSquadModal";

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function SquadPage() {
  const [squads, setSquads] = useState<SquadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchSquads = useCallback(async () => {
    try {
      const data = await squadClientService.getAll();
      setSquads(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSquads(); }, [fetchSquads]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await squadClientService.delete(id);
      setSquads((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Squad</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your team and collaborators.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          New Squad
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading squads…
        </div>
      ) : squads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
          <Users2 className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No squads yet. Create your first squad.</p>
          <Button size="sm" variant="outline" onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create Squad
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {squads.map((squad) => (
            <div key={squad.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-sm font-medium truncate">{squad.name}</p>
                {squad.description && (
                  <p className="text-xs text-muted-foreground truncate">{squad.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {squad.repositoryFullName && (
                    <span>{squad.repositoryFullName}</span>
                  )}
                  {squad.leaderName && (
                    <span className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      {squad.leaderName}
                    </span>
                  )}
                  <span>{squad.memberCount} member{squad.memberCount !== 1 ? "s" : ""}</span>
                  <span>Created {formatDate(squad.createdAt)}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(squad.id)}
                disabled={deleting === squad.id}
              >
                {deleting === squad.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      <CreateSquadModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchSquads}
      />
    </div>
  );
}
