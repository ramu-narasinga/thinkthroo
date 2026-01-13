import Anthropic from "@anthropic-ai/sdk";

/**
 * Token counter for Claude models using Anthropic's API
 */
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

  /**
   * Count tokens in a text string using Anthropic's beta token counting API
   * Note: This uses the beta API which may change in the future
   * 
   * @param text - The text to count tokens for
   * @param model - The Claude model to use for counting (default: claude-3-5-sonnet-20241022)
   * @returns The number of tokens
   */
  async countTokens(
    text: string,
    model: string = "claude-3-5-sonnet-20241022"
  ): Promise<number> {
    try {
      // Use Anthropic's beta token counting endpoint
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
      // Fallback: rough estimation (4 chars ≈ 1 token for English text)
      return Math.ceil(text.length / 4);
    }
  }

  /**
   * Synchronous token estimation using a rough heuristic
   * More accurate than pure character count but not as precise as API counting
   * 
   * @param text - The text to estimate tokens for
   * @returns Estimated number of tokens
   */
  estimateTokens(text: string): number {
    // Claude uses similar tokenization to GPT models
    // Rough heuristic: 
    // - 1 token ≈ 4 characters for English
    // - Split on whitespace and punctuation for better accuracy
    
    if (!text || text.length === 0) {
      return 0;
    }

    // Count words and special characters
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const specialChars = (text.match(/[^\w\s]/g) || []).length;
    
    // Rough formula: words + half of special characters
    return words.length + Math.ceil(specialChars / 2);
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
  return counter.countTokens(text, model);
}

/**
 * Convenience function for quick token estimation (synchronous)
 * @param text - Text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  const counter = getTokenCounter();
  return counter.estimateTokens(text);
}
