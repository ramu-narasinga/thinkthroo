import { qstashConsumerHandler } from "../lib/features/pr-workflow/QStashConsumerHandler";
import { logger } from "../lib/utils/logger";
import { initPostHogLogs, forceFlushPostHogLogs } from "../lib/utils/posthog-logs";
import type { IncomingMessage, ServerResponse } from "http";
import type { PRJobPayload } from "../lib/services/qstash/QStashPublisher";

initPostHogLogs();

export const config = { api: { bodyParser: false } };

function sendJson(res: ServerResponse, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  logger.info("QStash consumer endpoint hit", { method: req.method });

  const rawBody = await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });

  let payload: PRJobPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    sendJson(res, 400, { error: "Invalid JSON body" });
    return;
  }

  const result = await qstashConsumerHandler(req.headers, rawBody, payload);
  sendJson(res, result.statusCode, result.body);
  await forceFlushPostHogLogs();
}
