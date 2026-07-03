"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CircleDot,
  CircleCheck,
  ExternalLink,
  User,
  LayoutGrid,
  List,
  PlusSquare,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@thinkthroo/ui/components/dialog";
import { Input } from "@thinkthroo/ui/components/input";
import { Label } from "@thinkthroo/ui/components/label";
import { useIssueStore } from "@/store/issues";
import { issueSelectors } from "@/store/issues/selectors";
import { IssueState } from "@/store/issues/initialState";
import { useAgentStore } from "@/store/agent";
import { agentSelectors } from "@/store/agent/selectors";
import { squadClientService, SquadWithMembers } from "@/service/squad/client";
import { useIssueBoardStateStore } from "@/store/issueBoardState/store";
import { boardSelectors } from "@/store/issueBoardState/selectors";
import { IssueAgentBadge } from "./IssueAgentBadge";
import { KanbanBoard } from "./KanbanBoard";

function formatRelativeDate(isoDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(isoDate);
  day.setHours(0, 0, 0, 0);
  const days = Math.round((today.getTime() - day.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

type ViewMode = "board" | "list";
type AssigneeFilter = "all" | "agents" | "members";

export function IssuesTab() {
  const params = useParams();
  const repositoryFullName = decodeURIComponent(params.repository as string);

  const [viewMode, setViewMode] = React.useState<ViewMode>("board");
  const [boardFilter, setBoardFilter] = React.useState<AssigneeFilter>("all");
  const [squads, setSquads] = React.useState<SquadWithMembers[]>([]);
  const [addingToBoard, setAddingToBoard] = React.useState<number | null>(null);
  const [syncing, setSyncing] = React.useState(false);
  const [showNewIssue, setShowNewIssue] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newBody, setNewBody] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const issues = useIssueStore(issueSelectors.issues);
  const isLoading = useIssueStore(issueSelectors.isLoading);
  const isFirstFetchFinished = useIssueStore(issueSelectors.isFirstFetchFinished);
  const page = useIssueStore(issueSelectors.page);
  const hasMore = useIssueStore(issueSelectors.hasMore);
  const stateFilter = useIssueStore(issueSelectors.stateFilter);
  const fetchIssues = useIssueStore((s) => s.fetchIssues);
  const setStateFilter = useIssueStore((s) => s.setStateFilter);

  const agents = useAgentStore(agentSelectors.agents);
  const fetchAgents = useAgentStore((s) => s.fetchAgents);

  const boardItems = useIssueBoardStateStore(boardSelectors.boardItems);
  const fetchBoard = useIssueBoardStateStore((s) => s.fetchBoard);
  const addToBoard = useIssueBoardStateStore((s) => s.addToBoard);
  const syncFromGitHub = useIssueBoardStateStore((s) => s.syncFromGitHub);
  const createIssue = useIssueBoardStateStore((s) => s.createIssue);

  const activeAgents = React.useMemo(
    () => agents.filter((a) => a.status === "active"),
    [agents]
  );

  React.useEffect(() => {
    fetchIssues(repositoryFullName, 1, stateFilter);
    fetchAgents(repositoryFullName);
    fetchBoard(repositoryFullName);
    squadClientService.getByRepository(repositoryFullName)
      .then(setSquads)
      .catch(() => {});
  }, [repositoryFullName, stateFilter, fetchIssues, fetchAgents, fetchBoard]);

  const boardIssueNumbers = React.useMemo(
    () => new Set(boardItems.map((b) => b.issueNumber)),
    [boardItems]
  );

  const handleStateToggle = (state: IssueState) => setStateFilter(state);
  const handlePrev = () => fetchIssues(repositoryFullName, Math.max(1, page - 1), stateFilter);
  const handleNext = () => fetchIssues(repositoryFullName, page + 1, stateFilter);

  async function handleAddToBoard(issueNumber: number, issueTitle: string, issueHtmlUrl: string) {
    setAddingToBoard(issueNumber);
    try {
      await addToBoard(repositoryFullName, { number: issueNumber, title: issueTitle, htmlUrl: issueHtmlUrl });
    } finally {
      setAddingToBoard(null);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      await syncFromGitHub(repositoryFullName);
    } finally {
      setSyncing(false);
    }
  }

  async function handleCreateIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await createIssue(repositoryFullName, newTitle.trim(), newBody.trim() || undefined);
      setShowNewIssue(false);
      setNewTitle("");
      setNewBody("");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Fixed toolbar row — never scrolls ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Left: board assignee filters OR list state filters */}
        <div className="flex items-center gap-2">
          {viewMode === "board" && (
            <>
              {(["all", "agents", "members"] as AssigneeFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setBoardFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                    boardFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {f === "all" ? "All" : f === "agents" ? "Agents" : "Members"}
                </button>
              ))}
            </>
          )}
          {viewMode === "list" && (
            <>
              <button
                type="button"
                onClick={() => handleStateToggle("open")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  stateFilter === "open"
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <CircleDot className="h-3.5 w-3.5" />
                Open
              </button>
              <button
                type="button"
                onClick={() => handleStateToggle("closed")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  stateFilter === "closed"
                    ? "bg-purple-100 text-purple-800 border border-purple-300"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <CircleCheck className="h-3.5 w-3.5" />
                Closed
              </button>
            </>
          )}
        </div>

        {/* Right: actions + view toggle */}
        <div className="flex items-center gap-2">
          {/* Sync from GitHub */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync GitHub Issues"}
          </Button>

          {/* New Issue */}
          <Button size="sm" onClick={() => setShowNewIssue(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Issue
          </Button>

          {/* Board / List toggle */}
          <div className="inline-flex rounded-lg border overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`px-3 py-1.5 text-sm inline-flex items-center gap-1.5 transition-colors ${
                viewMode === "board"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm inline-flex items-center gap-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* ── Board view ── */}
      {viewMode === "board" && (
        <KanbanBoard
          repositoryFullName={repositoryFullName}
          agents={activeAgents}
          squads={squads}
          filter={boardFilter}
          setFilter={setBoardFilter}
        />
      )}

      {/* ── List view ── */}
      {viewMode === "list" && (
        <>
          {/* Header row */}
          <div className="flex gap-4 border-b pb-2">
            <span className="flex-1 text-sm font-medium text-muted-foreground">Issue</span>
            <span className="w-24 text-right text-sm font-medium text-muted-foreground shrink-0">Author</span>
            <span className="w-28 text-right text-sm font-medium text-muted-foreground shrink-0">Opened</span>
            <span className="w-28 text-right text-sm font-medium text-muted-foreground shrink-0">Board</span>
            {activeAgents.length > 0 && (
              <span className="w-36 text-right text-sm font-medium text-muted-foreground shrink-0">Agent</span>
            )}
          </div>

          {isLoading && (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading issues…</p>
          )}

          {!isLoading && isFirstFetchFinished && issues.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No {stateFilter} issues found for this repository.
            </p>
          )}

          {!isLoading && issues.length > 0 && (
            <div className="divide-y">
              {issues.map((issue) => {
                const encodedRepo = encodeURIComponent(repositoryFullName);
                const detailHref = `/repositories/${encodedRepo}/issues/${issue.number}`;
                const onBoard = boardIssueNumbers.has(issue.number);
                return (
                  <div key={issue.id} className="flex gap-4 py-4 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {issue.state === "open" ? (
                          <CircleDot className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <CircleCheck className="h-4 w-4 text-purple-600 shrink-0" />
                        )}
                        <Link
                          href={detailHref}
                          className="font-medium text-sm hover:underline inline-flex items-center gap-1"
                        >
                          {issue.title}
                        </Link>
                        <a
                          href={issue.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground shrink-0"
                          title="Open on GitHub"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground ml-5.5">#{issue.number}</p>
                      {issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5 ml-5.5">
                          {issue.labels.map((label) => (
                            <span
                              key={label.name}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `#${label.color}22`,
                                color: `#${label.color}`,
                                border: `1px solid #${label.color}55`,
                              }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="w-24 text-right text-sm text-muted-foreground shrink-0">
                      <span className="inline-flex items-center justify-end gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[60px]">{issue.author}</span>
                      </span>
                    </div>

                    <div className="w-28 text-right text-sm text-muted-foreground shrink-0 whitespace-nowrap">
                      {formatRelativeDate(issue.createdAt)}
                    </div>

                    <div className="w-28 flex justify-end shrink-0">
                      {onBoard ? (
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <LayoutGrid className="h-3 w-3" />
                          On board
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToBoard(issue.number, issue.title, issue.htmlUrl)}
                          disabled={addingToBoard === issue.number}
                          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          <PlusSquare className="h-3 w-3" />
                          Add to board
                        </button>
                      )}
                    </div>

                    {activeAgents.length > 0 && (
                      <div className="w-36 flex justify-end shrink-0">
                        <IssueAgentBadge
                          repositoryFullName={repositoryFullName}
                          issueNumber={issue.number}
                          activeAgents={activeAgents}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && isFirstFetchFinished && (page > 1 || hasMore) && (
            <div className="flex items-center justify-end gap-3 pt-2 pb-6">
              <Button variant="outline" size="sm" onClick={handlePrev} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <Button variant="outline" size="sm" onClick={handleNext} disabled={!hasMore}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* ── New Issue dialog ── */}
      <Dialog open={showNewIssue} onOpenChange={setShowNewIssue}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Issue</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateIssue} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="issue-title">Title</Label>
              <Input
                id="issue-title"
                placeholder="Issue title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="issue-body">Description <span className="text-muted-foreground">(optional)</span></Label>
              <textarea
                id="issue-body"
                rows={5}
                placeholder="Describe the issue…"
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewIssue(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || !newTitle.trim()}>
                {creating ? "Creating…" : "Create Issue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
