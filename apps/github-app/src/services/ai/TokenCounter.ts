import Anthropic from "@anthropic-ai/sdk";

export class TokenCounter {
  private readonly client: Anthropic;

  constructor(apiKey?: string) {
    if (!apiKey && !process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "Anthropic API key is required for token counting. Set ANTHROPIC_API_KEY environment variable or pass it to the constructor."
      );
    }

    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  async countTokens(
    text: string,
    model: string
  ): Promise<number> {
    try {
      const result = await this.client.beta.messages.countTokens({
        model,
        system: "",
        messages: [
          {
            role: "user",
            content: text,
          },
        ],
      });

      return result.input_tokens;
    } catch (error) {
      console.error("Error counting tokens:", error);
      // Fallback: Anthropic's rough estimation (3.5 chars ≈ 1 token for Claude)
      return Math.ceil(text.length / 3.5);
    }
  }

  /**
   * Synchronous token estimation using Anthropic's heuristic
   * For accurate counting, use the async countTokens() method
   * 
   * @param text - The text to estimate tokens for
   * @returns Estimated token count
   */
  estimateTokens(text: string): number {
    // Anthropic's heuristic: ~3.5 characters per token for Claude
    // This is a rough estimate - use async countTokens() for accuracy
    if (!text || text.length === 0) {
      return 0;
    }
    return Math.ceil(text.length / 3.5);
  }
}

/**
 * Singleton instance for token counting
 */
let tokenCounterInstance: TokenCounter | null = null;

/**
 * Get or create a singleton TokenCounter instance
 * @param apiKey - Optional API key (uses env var if not provided)
 * @returns TokenCounter instance
 */
export function getTokenCounter(apiKey?: string): TokenCounter {
  if (!tokenCounterInstance) {
    tokenCounterInstance = new TokenCounter(apiKey);
  }
  return tokenCounterInstance;
}

/**
 * Convenience function for quick token counting
 * @param text - Text to count tokens for
 * @param model - Optional model to use for counting
 * @returns Promise resolving to token count
 */
export async function countTokens(
  text: string,
  model?: string
): Promise<number> {
  const counter = getTokenCounter();
  return counter.countTokens(text, model!);
}

/**
 * Convenience function for quick token estimation (synchronous)
 * Uses Anthropic's heuristic (~3.5 chars per token)
 * For accurate counts, use async countTokens()
 * @param text - Text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  const counter = getTokenCounter();
  return counter.estimateTokens(text);
}
