import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import type { BotAccumulatedUsage } from "@/services/ai/types";
import { createHash } from "node:crypto";

export interface DeductResult {
  success: boolean;
  creditsDeducted?: number;
  newBalance?: number;
  reason?: string;
  idempotent?: boolean;
}

/**
 * Calls the platform's internal credits API to check balance and deduct usage.
 */
export class CreditService {
  private readonly baseUrl: string;
  private readonly secret: string;

  constructor() {
    if (!env.PLATFORM_API_URL) {
      throw new Error("PLATFORM_API_URL environment variable is not set");
    }
    if (!env.PLATFORM_API_SECRET) {
      throw new Error("PLATFORM_API_SECRET environment variable is not set");
    }
    this.baseUrl = env.PLATFORM_API_URL;
    this.secret = env.PLATFORM_API_SECRET;
  }

  private buildIdempotencyKey(
    installationId: string,
    repositoryFullName: string,
    prNumber: number,
    usage: BotAccumulatedUsage[],
    phase: string
  ): string {
    const usageByModel = usage.reduce<Record<string, { inputTokens: number; outputTokens: number }>>(
      (acc, item) => {
        if (!acc[item.model]) {
          acc[item.model] = { inputTokens: 0, outputTokens: 0 };
        }
        acc[item.model].inputTokens += item.inputTokens;
        acc[item.model].outputTokens += item.outputTokens;
        return acc;
      },
      {}
    );

    const canonicalUsage = Object.entries(usageByModel)
      .map(([model, tokens]) => ({
        model,
        inputTokens: tokens.inputTokens,
        outputTokens: tokens.outputTokens,
      }))
      .sort((a, b) => a.model.localeCompare(b.model));

    const payload = JSON.stringify({
      installationId,
      repositoryFullName,
      prNumber,
      phase,
      usage: canonicalUsage,
    });

    const digest = createHash("sha256").update(payload).digest("hex");
    return `credit:${installationId}:${repositoryFullName}:${prNumber}:${phase}:${digest}`;
  }

  /**
   * Fetch the current credit balance for the organisation linked to the given installation.
   * Returns null if the installation is not found on the platform.
   */
  async getBalance(installationId: string): Promise<number | null> {
    const url = `${this.baseUrl}/api/credits/balance?installationId=${encodeURIComponent(installationId)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "x-internal-secret": this.secret },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Credits balance fetch failed [${response.status}]: ${text}`);
    }

    const data = (await response.json()) as { creditBalance: number };
    return data.creditBalance;
  }

  /**
   * Deduct credits for AI usage from the organisation linked to the given installation.
   */
  async deductCredits(
    installationId: string,
    repositoryFullName: string,
    prNumber: number,
    usage: BotAccumulatedUsage[],
    phase: string = "unspecified"
  ): Promise<DeductResult> {
    const nonEmptyUsage = usage.filter(
      (u) => u.inputTokens > 0 || u.outputTokens > 0
    );

    if (nonEmptyUsage.length === 0) {
      logger.info("No token usage to deduct", { installationId, prNumber });
      return { success: true, creditsDeducted: 0 };
    }

    const url = `${this.baseUrl}/api/credits/deduct`;
    const idempotencyKey = this.buildIdempotencyKey(
      installationId,
      repositoryFullName,
      prNumber,
      nonEmptyUsage,
      phase
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": this.secret,
      },
      body: JSON.stringify({
        installationId,
        repositoryFullName,
        prNumber,
        usage: nonEmptyUsage,
        idempotencyKey,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Credits deduction failed [${response.status}]: ${text}`);
    }

    return (await response.json()) as DeductResult;
  }
}
