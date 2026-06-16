import { qstashConsumerHandler } from "../lib/features/pr-workflow/QStashConsumerHandler";
import { logger } from "../lib/utils/logger";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  logger.info("QStash consumer endpoint hit", { method: req.method });
  await qstashConsumerHandler(req as any, res as any);
}
