import { Receiver } from "@upstash/qstash";
import { ProbotOctokit } from "probot";
import { PRWorkflowOrchestrator } from "./PRWorkflowOrchestrator";
import type { PRJobPayload } from "@/services/qstash/QStashPublisher";
import { logger } from "@/utils/logger";

type HandlerResult = { statusCode: number; body: unknown };

export async function qstashConsumerHandler(
  headers: Record<string, string | string[] | undefined>,
  rawBody: string,
  payload: PRJobPayload,
): Promise<HandlerResult> {
  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  });

  let isValid = false;
  try {
    isValid = await receiver.verify({
      signature: (headers["upstash-signature"] as string) ?? "",
      body: rawBody,
    });
  } catch (err: any) {
    logger.warn("QStash signature verification error", { error: err.message });
  }

  if (!isValid) {
    return { statusCode: 401, body: { error: "Invalid QStash signature" } };
  }

  logger.info("QStash consumer: starting PR review", {
    owner: payload.owner,
    repo: payload.repoName,
    prNumber: payload.prNumber,
    installationId: payload.installationId,
  });

  const octokit = new ProbotOctokit({
    auth: {
      appId: process.env.APP_ID!,
      privateKey: process.env.PRIVATE_KEY!.replace(/\\n/g, '\n'),
      installationId: Number(payload.installationId),
    },
  });

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
    return { statusCode: 200, body: { ok: true } };
  } catch (err: any) {
    logger.error("QStash consumer: PR review failed", {
      prNumber: payload.prNumber,
      error: err.message,
      stack: err.stack,
    });
    return { statusCode: 500, body: { error: err.message } };
  }
}
