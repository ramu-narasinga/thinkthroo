import { ClaudeModel } from "./types";
import { env } from "@/utils/env";

/**
 * Anthropic pricing in USD per 1 million tokens.
 */
export const MODEL_PRICING_USD_PER_MILLION: Record<
  string,
  { input: number; output: number }
> = {
  [ClaudeModel.HAIKU_4_5]: { input: 0.8, output: 4.0 },
  [ClaudeModel.SONNET_4_5]: { input: 3.0, output: 15.0 },
};

/**
 * Base exchange rate: 1 USD = 10 credits (set at account creation).
 * The effective charge to the customer is BASE_CREDITS_PER_DOLLAR × AI_MARKUP_MULTIPLIER.
 */
const BASE_CREDITS_PER_DOLLAR = 10;

/** Effective credits charged per USD of Anthropic cost. Reads AI_MARKUP_MULTIPLIER from env. */
export const CREDITS_PER_DOLLAR = BASE_CREDITS_PER_DOLLAR * env.AI_MARKUP_MULTIPLIER;

/**
 * Calculate the USD cost for a given model and token counts.
 * Falls back to Sonnet pricing for unknown models.
 */
export function calculateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing =
    MODEL_PRICING_USD_PER_MILLION[model] ??
    MODEL_PRICING_USD_PER_MILLION[ClaudeModel.SONNET_4_5];
  return (
    (inputTokens * pricing.input) / 1_000_000 +
    (outputTokens * pricing.output) / 1_000_000
  );
}

/**
 * Convert a USD cost to credits. Applies the configured markup multiplier.
 */
export function calculateCredits(costUsd: number): number {
  return costUsd * CREDITS_PER_DOLLAR;
}
