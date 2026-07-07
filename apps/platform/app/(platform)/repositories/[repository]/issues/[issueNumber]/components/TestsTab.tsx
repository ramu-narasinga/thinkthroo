"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FlaskConical,
  Loader2,
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import { createClient } from "@/utils/supabase/client";
import { agentTaskClientService, AgentTaskItem, ArtifactItem } from "@/service/agentTask/client";

const ACTIVE_STATUSES = new Set(["queued", "dispatched", "waiting_local_directory", "running"]);

interface Props {
  repositoryFullName: string;
  issueNumber: number;
  implementationTask: AgentTaskItem | null;
  testTasks: AgentTaskItem[];
}

export function TestsTab({ repositoryFullName, issueNumber, implementationTask, testTasks }: Props) {
  const [localTestTasks, setLocalTestTasks] = useState<AgentTaskItem[]>(testTasks);
  const [creating, setCreating] = useState(false);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactItem[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Keep localTestTasks in sync with parent (new tasks from Realtime)
  useEffect(() => {
    setLocalTestTasks(testTasks);
  }, [testTasks]);

  const latestTestTask = localTestTasks[0] ?? null;
  const isActive = latestTestTask ? ACTIVE_STATUSES.has(latestTestTask.status) : false;
  const isCompleted = latestTestTask?.status === "completed";
  const isFailed = latestTestTask?.status === "failed";

  // Subscribe to live broadcast log for the running task
  useEffect(() => {
    if (!latestTestTask || !isActive) return;
    setLiveLogs([]);

    const supabase = createClient();
    const channel = (supabase.channel(`task-progress:${latestTestTask.id}`) as any)
      .on(
        "broadcast",
        { event: "progress" },
        (payload: { payload: { message: string; type: string } }) => {
          setLiveLogs((prev) => [...prev.slice(-199), payload.payload.message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [latestTestTask?.id, isActive]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveLogs.length]);

  // Subscribe to live artifact inserts for the latest test task
  useEffect(() => {
    if (!latestTestTask) return;

    // Fetch existing artifacts on mount / task change
    agentTaskClientService.getArtifacts(latestTestTask.id)
      .then(setArtifacts)
      .catch(() => {});

    const supabase = createClient();
    const channel = (supabase.channel(`artifacts:${latestTestTask.id}`) as any)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_task_artifacts",
          filter: `task_id=eq.${latestTestTask.id}`,
        },
        (payload: { new: ArtifactItem }) => {
          setArtifacts((prev) => {
            if (prev.some((a) => a.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [latestTestTask?.id]);

  async function handleRunTests() {
    if (!implementationTask || creating) return;
    setCreating(true);
    setLiveLogs([]);
    setArtifacts([]);
    try {
      const newTask = await agentTaskClientService.createTestTask(repositoryFullName, issueNumber);
      setLocalTestTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      console.error("[TestsTab] createTestTask error:", err);
    } finally {
      setCreating(false);
    }
  }

  // Parse result JSON for pass/fail summary
  let testResult: { passed?: number; failed?: number; total?: number } | null = null;
  if (isCompleted && latestTestTask?.result) {
    try { testResult = JSON.parse(latestTestTask.result); } catch { /* ignore */ }
  }

  const screenshotArtifacts = artifacts.filter((a) => a.type === "screenshot");

  if (!implementationTask) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        No completed implementation found. Run the agent first.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Tests</span>
          {isActive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
              <Loader2 className="h-3 w-3 animate-spin" />
              {latestTestTask?.status === "queued" ? "Queued" : "Generating…"}
            </span>
          )}
          {isCompleted && testResult && (
            <div className="flex items-center gap-2">
              {(testResult.passed ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle2 className="h-3 w-3" />
                  {testResult.passed} passed
                </span>
              )}
              {(testResult.failed ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-200">
                  <XCircle className="h-3 w-3" />
                  {testResult.failed} failed
                </span>
              )}
            </div>
          )}
          {isFailed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-200">
              <XCircle className="h-3 w-3" />
              Failed
            </span>
          )}
        </div>

        <Button
          size="sm"
          variant={latestTestTask ? "outline" : "default"}
          onClick={handleRunTests}
          disabled={creating || isActive}
          className="gap-1.5"
        >
          {creating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : latestTestTask ? (
            <RefreshCw className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {creating ? "Creating…" : latestTestTask ? "Re-generate & Run" : "Generate Tests"}
        </Button>
      </div>

      {/* ── Empty state ── */}
      {!latestTestTask && (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No tests run yet. Click &quot;Generate Tests&quot; to let the agent write and run tests for this issue.
        </div>
      )}

      {/* ── Live logs (while running) ── */}
      {isActive && (
        <div className="rounded-lg border bg-muted/10 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/20 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Live output
          </div>
          <div className="px-4 py-3 font-mono text-xs space-y-0.5 max-h-72 overflow-y-auto">
            {liveLogs.length === 0 ? (
              <p className="text-muted-foreground">Waiting for output…</p>
            ) : (
              liveLogs.map((line, i) => (
                <div key={i} className="leading-relaxed text-foreground whitespace-pre-wrap break-all">
                  {line}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}

      {/* ── Completed: result summary ── */}
      {isCompleted && (
        <div className="rounded-lg border bg-muted/10 px-4 py-3 text-sm space-y-1">
          {testResult ? (
            <>
              <p className="font-medium">
                {(testResult.failed ?? 0) === 0
                  ? "All tests passed"
                  : `${testResult.failed} of ${testResult.total} tests failed`}
              </p>
              <p className="text-xs text-muted-foreground">
                Tests were committed to the implementation branch and included in the PR.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Tests completed. Check the PR for the generated test files.</p>
          )}
        </div>
      )}

      {/* ── Failed state ── */}
      {isFailed && (
        <div className="rounded-lg border border-red-200 bg-red-50/50 px-4 py-3 text-sm">
          <p className="font-medium text-red-700">Test generation failed</p>
          {latestTestTask?.failureReason && (
            <p className="text-xs text-red-600 mt-1">{latestTestTask.failureReason}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Click &quot;Re-generate &amp; Run&quot; to try again.</p>
        </div>
      )}

      {/* ── Screenshot thumbnails ── */}
      {screenshotArtifacts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Screenshots ({screenshotArtifacts.length})
          </p>
          <div className="flex flex-wrap gap-3">
            {screenshotArtifacts.map((artifact) => (
              <button
                key={artifact.id}
                type="button"
                onClick={() => setLightboxUrl(artifact.url)}
                className="group relative w-32 h-20 rounded-lg border overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all"
                title={artifact.filename}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artifact.url}
                  alt={artifact.filename}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                  <ImageIcon className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">
                  {artifact.filename}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8"
          onClick={() => setLightboxUrl(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Screenshot"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
