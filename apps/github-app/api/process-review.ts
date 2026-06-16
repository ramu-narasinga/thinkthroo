import { qstashConsumerHandler } from "../lib/features/pr-workflow/QStashConsumerHandler";
import { logger } from "../lib/utils/logger";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { PRJobPayload } from "../lib/services/qstash/QStashPublisher";

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  logger.info("QStash consumer endpoint hit", { method: req.method });

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const rawBody = Buffer.concat(chunks).toString("utf-8");

  let payload: PRJobPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const result = await qstashConsumerHandler(req.headers, rawBody, payload);
  res.status(result.statusCode).json(result.body);
}
