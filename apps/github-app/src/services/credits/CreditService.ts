import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import type { BotAccumulatedUsage } from "@/services/ai/types";
import { platformFetch } from "@/utils/platformFetch";

export interface DeductResult {
  success: boolean;
  creditsDeducted?: number;
  newBalance?: number;
  reason?: string;
}

/**
 * Calls the platform's internal credits API to check balance and deduct usage.
 */
export class CreditService {
  private readonly baseUrl: string;

  constructor() {
    if (!env.PLATFORM_API_URL) {
      throw new Error("PLATFORM_API_URL environment variable is not set");
    }
    this.baseUrl = env.PLATFORM_API_URL;
  }

  /**
   * Fetch the current credit balance for the organisation linked to the given installation.
   * Returns null if the installation is not found on the platform.
   */
  async getBalance(installationId: string): Promise<number | null> {
    const url = `${this.baseUrl}/api/credits/balance?installationId=${encodeURIComponent(installationId)}`;

    const response = await platformFetch(url, {
      method: "GET",
      headers: {},
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
    usage: BotAccumulatedUsage[]
  ): Promise<DeductResult> {
    const nonEmptyUsage = usage.filter(
      (u) => u.inputTokens > 0 || u.outputTokens > 0
    );

    if (nonEmptyUsage.length === 0) {
      logger.info("No token usage to deduct", { installationId, prNumber });
      return { success: true, creditsDeducted: 0 };
    }

    const url = `${this.baseUrl}/api/credits/deduct`;

    const response = await platformFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        installationId,
        repositoryFullName,
        prNumber,
        usage: nonEmptyUsage,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Credits deduction failed [${response.status}]: ${text}`);
    }

    return (await response.json()) as DeductResult;
  }
}
