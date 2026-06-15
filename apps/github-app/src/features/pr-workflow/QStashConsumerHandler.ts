import { Receiver } from "@upstash/qstash";
import { ProbotOctokit } from "probot";
import { PRWorkflowOrchestrator } from "./PRWorkflowOrchestrator";
import type { PRJobPayload } from "@/services/qstash/QStashPublisher";
import { logger } from "@/utils/logger";
import type { Request, Response } from "express";

export async function qstashConsumerHandler(req: Request, res: Response): Promise<void> {
  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  });

  // QStash sends the body as JSON; re-stringify for signature verification
  const rawBody = JSON.stringify(req.body);
  let isValid = false;
  try {
    isValid = await receiver.verify({
      signature: (req.headers["upstash-signature"] as string) ?? "",
      body: rawBody,
    });
  } catch (err: any) {
    logger.warn("QStash signature verification error", { error: err.message });
  }

  if (!isValid) {
    res.status(401).json({ error: "Invalid QStash signature" });
    return;
  }

  const payload: PRJobPayload = req.body;
  logger.info("QStash consumer: starting PR review", {
    owner: payload.owner,
    repo: payload.repoName,
    prNumber: payload.prNumber,
    installationId: payload.installationId,
  });

  // Create an installation-scoped Octokit using the same ProbotOctokit class
  // that Probot uses, so the context shim is fully compatible.
  const octokit = new ProbotOctokit({
    auth: {
      appId: process.env.APP_ID!,
      privateKey: process.env.PRIVATE_KEY!.replace(/\\n/g, '\n'),
      installationId: Number(payload.installationId),
    },
  });

  // Build a context shim that satisfies PRWorkflowOrchestrator's expectations
  const contextShim = {
    octokit,
    payload: {
      pull_request: {
        number: payload.prNumber,
        title: payload.prTitle,
        base: { sha: payload.baseSHA, ref: payload.baseRef },
        head: { sha: payload.headSHA, ref: payload.headRef },
        user: { login: payload.prAuthor },
      },
      repository: {
        full_name: `${payload.owner}/${payload.repoName}`,
        name: payload.repoName,
        owner: { login: payload.owner },
      },
      installation: { id: Number(payload.installationId) },
      action: payload.action,
    },
    repo: () => ({ owner: payload.owner, repo: payload.repoName }),
    issue: () => ({
      owner: payload.owner,
      repo: payload.repoName,
      issue_number: payload.prNumber,
    }),
  };

  try {
    const orchestrator = new PRWorkflowOrchestrator(contextShim as any);
    await orchestrator.execute({
      generateSummaries: true,
      useSummaryFiltering: true,
      reviewOptions: { maxFiles: 50, maxConcurrency: 5, debug: false },
    });
    logger.info("QStash consumer: PR review complete", { prNumber: payload.prNumber });
    res.status(200).json({ ok: true });
  } catch (err: any) {
    logger.error("QStash consumer: PR review failed", {
      prNumber: payload.prNumber,
      error: err.message,
      stack: err.stack,
    });
    // Return 500 so QStash retries
    res.status(500).json({ error: err.message });
  }
}
