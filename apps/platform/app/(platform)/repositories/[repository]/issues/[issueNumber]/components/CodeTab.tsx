"use client";

import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  GitBranch,
  GitPullRequest,
  FileCode,
  FilePlus,
  FileMinus,
  FileEdit,
  Loader2,
  ChevronRight,
  Bot,
  User,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  Plus,
  X,
  Send,
  ScanLine,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { agentTaskClientService, AgentTaskItem, DiffFile, DiffResult, ReviewComment } from "@/service/agentTask/client";
import { Button } from "@thinkthroo/ui/components/button";

// ─── Diff parsing with new-file line number tracking ─────────────────────────

type PatchLine = {
  type: "add" | "remove" | "hunk" | "context";
  content: string;
  newLine: number | null;
};

function parsePatch(patch: string): PatchLine[] {
  const lines: PatchLine[] = [];
  let newLineCounter = 0;

  for (const rawLine of patch.split("\n")) {
    if (rawLine.startsWith("@@")) {
      const match = rawLine.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) newLineCounter = parseInt(match[1], 10) - 1;
      lines.push({ type: "hunk", content: rawLine, newLine: null });
    } else if (rawLine.startsWith("+")) {
      newLineCounter++;
      lines.push({ type: "add", content: rawLine.slice(1), newLine: newLineCounter });
    } else if (rawLine.startsWith("-")) {
      lines.push({ type: "remove", content: rawLine.slice(1), newLine: null });
    } else {
      newLineCounter++;
      lines.push({ type: "context", content: rawLine.startsWith(" ") ? rawLine.slice(1) : rawLine, newLine: newLineCounter });
    }
  }

  return lines;
}

// ─── Severity badge ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "error") {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
        <AlertCircle className="h-2.5 w-2.5" /> Error
      </span>
    );
  }
  if (severity === "warning") {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700">
        <AlertTriangle className="h-2.5 w-2.5" /> Warning
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
      <Lightbulb className="h-2.5 w-2.5" /> Suggestion
    </span>
  );
}

// ─── Review status badge ──────────────────────────────────────────────────────

function ReviewStatusBadge({ status }: { status: string }) {
  if (status === "queued") {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">Queued</span>;
  }
  if (["running", "dispatched", "waiting_local_directory"].includes(status)) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
        <Loader2 className="h-2.5 w-2.5 animate-spin" /> Reviewing…
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
        Reviewed ✓
      </span>
    );
  }
  if (status === "failed") {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Review failed</span>;
  }
  return null;
}

// ─── File status icon ─────────────────────────────────────────────────────────

function FileStatusIcon({ status }: { status: string }) {
  if (status === "added") return <FilePlus className="h-3.5 w-3.5 text-green-600 shrink-0" />;
  if (status === "removed") return <FileMinus className="h-3.5 w-3.5 text-red-500 shrink-0" />;
  return <FileEdit className="h-3.5 w-3.5 text-yellow-500 shrink-0" />;
}

// ─── Comment thread ───────────────────────────────────────────────────────────

interface CommentThreadProps {
  comment: ReviewComment;
  replies: ReviewComment[];
  replyingTo: string | null;
  onReplyClick: (commentId: string) => void;
  onReplyCancel: () => void;
  onReplySubmit: (commentId: string, body: string) => Promise<void>;
  submitting: boolean;
}

function CommentThread({ comment, replies, replyingTo, onReplyClick, onReplyCancel, onReplySubmit, submitting }: CommentThreadProps) {
  const [replyText, setReplyText] = useState("");

  const handleSubmit = async () => {
    if (!replyText.trim()) return;
    await onReplySubmit(comment.id, replyText.trim());
    setReplyText("");
  };

  return (
    <div className="border-l-2 border-blue-400 bg-blue-50/40 dark:bg-blue-950/20 px-4 py-2.5 text-xs">
      <div className="flex items-center gap-1.5 mb-1">
        <Bot className="h-3 w-3 text-blue-500 shrink-0" />
        <span className="font-semibold text-blue-700 dark:text-blue-400">Think Throo Review</span>
        <SeverityBadge severity={comment.severity} />
      </div>
      <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-2">{comment.body}</p>

      {replies.map((reply) => (
        <div key={reply.id} className="mt-2 pl-3 border-l border-border/60">
          <div className="flex items-center gap-1.5 mb-0.5">
            <User className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="font-medium text-foreground">You</span>
          </div>
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{reply.body}</p>
        </div>
      ))}

      {replyingTo === comment.id ? (
        <div className="mt-2 space-y-1.5">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply…"
            className="w-full rounded border bg-background px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 min-h-[52px] text-xs"
            autoFocus
          />
          <div className="flex gap-1.5">
            <Button size="sm" variant="default" className="h-6 px-2 text-xs gap-1" onClick={handleSubmit} disabled={submitting || !replyText.trim()}>
              {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              Reply
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={onReplyCancel}>Cancel</Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onReplyClick(comment.id)}
          className="text-[10px] text-muted-foreground hover:text-foreground mt-1 hover:underline underline-offset-2"
        >
          Reply
        </button>
      )}
    </div>
  );
}

// ─── Add comment form ─────────────────────────────────────────────────────────

function AddCommentForm({ onSubmit, onCancel, submitting }: { onSubmit: (body: string) => Promise<void>; onCancel: () => void; submitting: boolean }) {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="border-l-2 border-muted-foreground/30 bg-muted/20 px-4 py-2.5 text-xs">
      <div className="flex items-center gap-1.5 mb-1.5">
        <User className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="font-medium">Add a comment</span>
        <button type="button" onClick={onCancel} className="ml-auto text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment on this line…"
        className="w-full rounded border bg-background px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 min-h-[52px] text-xs"
        autoFocus
      />
      <div className="flex gap-1.5 mt-1.5">
        <Button size="sm" variant="default" className="h-6 px-2 text-xs gap-1" onClick={handleSubmit} disabled={submitting || !text.trim()}>
          {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          Comment
        </Button>
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── Diff viewer with inline comments ────────────────────────────────────────

interface DiffViewerProps {
  file: DiffFile;
  reviewComments: ReviewComment[];
  reviewTaskId: string | null;
  onAddComment: (line: number, body: string) => Promise<void>;
  onReplyToComment: (commentId: string, body: string) => Promise<void>;
}

function DiffViewer({ file, reviewComments, reviewTaskId, onAddComment, onReplyToComment }: DiffViewerProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [addingCommentLine, setAddingCommentLine] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!file.patch) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        No textual diff — binary or moved file.
      </div>
    );
  }

  const lines = parsePatch(file.patch);

  const topLevelComments = reviewComments.filter(
    (c) => c.filename === file.filename && c.parentCommentId == null && c.severity !== "summary"
  );
  const commentsByLine = new Map<number, ReviewComment[]>();
  for (const c of topLevelComments) {
    const arr = commentsByLine.get(c.startLine) ?? [];
    arr.push(c);
    commentsByLine.set(c.startLine, arr);
  }
  const repliesByParent = new Map<string, ReviewComment[]>();
  for (const c of reviewComments.filter((c) => c.parentCommentId != null)) {
    const arr = repliesByParent.get(c.parentCommentId!) ?? [];
    arr.push(c);
    repliesByParent.set(c.parentCommentId!, arr);
  }

  const handleAddComment = async (line: number, body: string) => {
    setSubmitting(true);
    try {
      await onAddComment(line, body);
    } finally {
      setSubmitting(false);
      setAddingCommentLine(null);
    }
  };

  const handleReply = async (commentId: string, body: string) => {
    setSubmitting(true);
    try {
      await onReplyToComment(commentId, body);
    } finally {
      setSubmitting(false);
      setReplyingTo(null);
    }
  };

  return (
    <div className="font-mono text-xs">
      {lines.map((line, i) => {
        const lineComments = line.newLine != null ? (commentsByLine.get(line.newLine) ?? []) : [];
        const isCommentable = line.type !== "remove" && line.type !== "hunk" && line.newLine != null;

        return (
          <React.Fragment key={i}>
            <div
              className={`flex items-start px-2 py-px leading-5 whitespace-pre group relative ${
                line.type === "add"
                  ? "bg-green-50 dark:bg-green-950/30"
                  : line.type === "remove"
                  ? "bg-red-50 dark:bg-red-950/30"
                  : line.type === "hunk"
                  ? "bg-muted/70"
                  : ""
              }`}
            >
              {/* Type gutter */}
              <span
                className={`select-none w-4 shrink-0 mr-1 ${
                  line.type === "add" ? "text-green-600"
                  : line.type === "remove" ? "text-red-500"
                  : line.type === "hunk" ? "text-blue-500"
                  : "text-muted-foreground/30"
                }`}
              >
                {line.type === "add" ? "+" : line.type === "remove" ? "-" : line.type === "hunk" ? "…" : " "}
              </span>

              {/* Line number */}
              <span className="select-none w-8 shrink-0 mr-2 text-right text-muted-foreground/40 text-[10px]">
                {line.newLine ?? ""}
              </span>

              {/* Content */}
              <span
                className={`flex-1 ${
                  line.type === "add" ? "text-green-900 dark:text-green-300"
                  : line.type === "remove" ? "text-red-900 dark:text-red-300"
                  : line.type === "hunk" ? "text-blue-600 dark:text-blue-400"
                  : "text-foreground"
                }`}
              >
                {line.content}
              </span>

              {/* Add comment button (shows on hover when review task exists) */}
              {isCommentable && reviewTaskId && addingCommentLine !== line.newLine && (
                <button
                  type="button"
                  title="Add comment on this line"
                  onClick={() => setAddingCommentLine(line.newLine!)}
                  className="invisible group-hover:visible ml-2 shrink-0 text-muted-foreground/50 hover:text-blue-500 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Existing inline comment threads for this line */}
            {lineComments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                replies={repliesByParent.get(comment.id) ?? []}
                replyingTo={replyingTo}
                onReplyClick={setReplyingTo}
                onReplyCancel={() => setReplyingTo(null)}
                onReplySubmit={handleReply}
                submitting={submitting}
              />
            ))}

            {/* New comment form */}
            {addingCommentLine === line.newLine && line.newLine != null && (
              <AddCommentForm
                onSubmit={(body) => handleAddComment(line.newLine!, body)}
                onCancel={() => setAddingCommentLine(null)}
                submitting={submitting}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── File sidebar ─────────────────────────────────────────────────────────────

function FileSidebar({ files, selected, onSelect }: { files: DiffFile[]; selected: DiffFile | null; onSelect: (f: DiffFile) => void }) {
  return (
    <div className="w-56 shrink-0 border-r bg-muted/10 overflow-y-auto flex flex-col">
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b bg-muted/20 shrink-0">
        Changed files
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.map((file) => {
          const basename = file.filename.split("/").pop() ?? file.filename;
          const dir = file.filename.includes("/") ? file.filename.slice(0, file.filename.lastIndexOf("/")) : null;
          const isSelected = selected?.filename === file.filename;
          return (
            <button
              key={file.filename}
              type="button"
              onClick={() => onSelect(file)}
              title={file.filename}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                isSelected ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <FileStatusIcon status={file.status} />
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{basename}</div>
                {dir && <div className="truncate text-muted-foreground/60 text-[10px]">{dir}</div>}
              </div>
              <div className="shrink-0 font-mono text-[10px] flex gap-0.5">
                {file.additions > 0 && <span className="text-green-600">+{file.additions}</span>}
                {file.deletions > 0 && <span className="text-red-500">-{file.deletions}</span>}
              </div>
              {isSelected && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main CodeTab ─────────────────────────────────────────────────────────────

interface Props {
  task: AgentTaskItem;
  repositoryFullName: string;
  issueNumber: number;
  reviewTasks: AgentTaskItem[];
}

export function CodeTab({ task, repositoryFullName, issueNumber, reviewTasks }: Props) {
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<DiffFile | null>(null);

  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [requestingReview, setRequestingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // The most recent review task (newest first)
  const latestReviewTask = reviewTasks[0] ?? null;

  // ── Load diff ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDiff(null);
    setSelectedFile(null);

    agentTaskClientService
      .getDiff(task.id)
      .then((data) => {
        if (cancelled) return;
        setDiff(data);
        if (data.files.length > 0) setSelectedFile(data.files[0]);
      })
      .catch((err: { message?: string }) => {
        if (cancelled) return;
        setError(err?.message ?? "Failed to load diff");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [task.id]);

  // ── Load review comments when a completed review task exists ──
  useEffect(() => {
    if (!latestReviewTask || latestReviewTask.status !== "completed") return;
    let cancelled = false;
    setReviewLoading(true);
    agentTaskClientService
      .getReviewComments(latestReviewTask.id)
      .then((comments) => { if (!cancelled) setReviewComments(comments); })
      .catch((err) => console.error('[CodeTab] getReviewComments failed:', err))
      .finally(() => { if (!cancelled) setReviewLoading(false); });
    return () => { cancelled = true; };
  }, [latestReviewTask?.id, latestReviewTask?.status]);

  // ── Supabase Realtime: new review comments as they're inserted ──
  useEffect(() => {
    if (!latestReviewTask) return;
    const supabase = createClient();
    const channel = (supabase.channel(`review-comments:${latestReviewTask.id}`) as any)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_task_review_comments",
          filter: `task_id=eq.${latestReviewTask.id}`,
        },
        (payload: { new: ReviewComment }) => {
          setReviewComments((prev) => {
            if (prev.find((c) => c.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [latestReviewTask?.id]);

  const handleRequestReview = async () => {
    setRequestingReview(true);
    setReviewError(null);
    try {
      await agentTaskClientService.createReviewTask(repositoryFullName, issueNumber);
    } catch (err) {
      setReviewError((err as { message?: string }).message ?? 'Failed to request review');
    } finally {
      setRequestingReview(false);
    }
  };

  const handleAddComment = async (line: number, body: string) => {
    if (!latestReviewTask) return;
    const comment = await agentTaskClientService.addUserReviewComment(
      latestReviewTask.id,
      selectedFile!.filename,
      line,
      body
    );
    setReviewComments((prev) => [...prev, comment]);
  };

  const handleReplyToComment = async (commentId: string, body: string) => {
    if (!latestReviewTask) return;
    const parentComment = reviewComments.find((c) => c.id === commentId);
    if (!parentComment) return;
    const reply = await agentTaskClientService.addUserReviewComment(
      latestReviewTask.id,
      parentComment.filename,
      parentComment.startLine,
      body,
      commentId
    );
    setReviewComments((prev) => [...prev, reply]);
  };

  // ── Review summary ──
  const summaryComment = reviewComments.find((c) => c.filename === "__summary__");

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 justify-center text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading diff…
      </div>
    );
  }

  if (error) {
    const friendly = error.includes("no branch name") || error.includes("branch name")
      ? "No branch found. The agent may not have pushed any code yet."
      : error.includes("no result")
      ? "This task has not completed yet."
      : error;
    return <div className="py-16 text-center text-sm text-muted-foreground">{friendly}</div>;
  }

  if (!diff) return null;

  const isReviewActive = latestReviewTask != null;
  const isReviewDone = latestReviewTask?.status === "completed";

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 text-sm border-b pb-3 flex-wrap">
        <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
        <code className="text-xs bg-muted px-2 py-0.5 rounded border">{diff.branchName}</code>
        <span className="text-muted-foreground">→</span>
        <code className="text-xs bg-muted px-2 py-0.5 rounded border">{diff.baseBranch}</code>

        <div className="ml-auto flex items-center gap-3 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {diff.files.length} file{diff.files.length !== 1 ? "s" : ""} changed
          </span>
          {diff.prUrl && (
            <a
              href={diff.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
            >
              <GitPullRequest className="h-3.5 w-3.5" />
              View PR
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {/* Review status + button */}
          {isReviewActive && latestReviewTask && (
            <ReviewStatusBadge status={latestReviewTask.status} />
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs gap-1"
            onClick={handleRequestReview}
            disabled={requestingReview || (latestReviewTask != null && ["queued", "dispatched", "running", "waiting_local_directory"].includes(latestReviewTask.status))}
          >
            {requestingReview ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ScanLine className="h-3.5 w-3.5" />
            )}
            {isReviewDone ? "Re-review" : "Request Review"}
          </Button>
        </div>
      </div>
      {reviewError && (
        <p className="text-xs text-destructive text-right -mt-2">{reviewError}</p>
      )}

      {/* ── Review summary banner ── */}
      {summaryComment && (
        <div className="border rounded-lg bg-blue-50/30 dark:bg-blue-950/20 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 font-medium mb-1 text-blue-700 dark:text-blue-400">
            <Bot className="h-4 w-4" />
            Review Summary
          </div>
          <p className="text-muted-foreground leading-relaxed text-xs whitespace-pre-wrap">{summaryComment.body}</p>
        </div>
      )}

      {diff.files.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No file changes found in this branch.
        </div>
      ) : (
        <div
          className="flex border rounded-lg overflow-hidden"
          style={{ height: "calc(100vh - 360px)", minHeight: "400px" }}
        >
          <FileSidebar files={diff.files} selected={selectedFile} onSelect={setSelectedFile} />

          <div className="flex-1 overflow-y-auto bg-background">
            {selectedFile ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/10 text-xs text-muted-foreground font-mono sticky top-0 z-10 backdrop-blur-sm">
                  <FileCode className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 truncate">{selectedFile.filename}</span>
                  <span className="text-green-600 shrink-0">+{selectedFile.additions}</span>
                  <span className="text-red-500 shrink-0 ml-1">-{selectedFile.deletions}</span>
                  {reviewLoading && <Loader2 className="h-3 w-3 animate-spin ml-1 shrink-0" />}
                </div>
                <DiffViewer
                  file={selectedFile}
                  reviewComments={reviewComments}
                  reviewTaskId={isReviewDone ? latestReviewTask!.id : null}
                  onAddComment={handleAddComment}
                  onReplyToComment={handleReplyToComment}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Select a file to view the diff
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
