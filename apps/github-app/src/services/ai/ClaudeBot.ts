import Anthropic from "@anthropic-ai/sdk";
// TODO: implement p-retry?
import { retry } from "./retry";
import type { ClaudeBotConfig } from "./types";
import { logger } from "@/lib/logger";

/**
 * Conversation context for maintaining multi-turn conversations
 */
export interface ConversationContext {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

/**
 * Response from Claude bot including conversation context
 */
export interface BotResponse {
  text: string;
  context: ConversationContext;
}

/**
 * Claude-based bot for AI operations (summarization and review)
 */
export class ClaudeBot {
  private readonly client: Anthropic;
  private readonly config: ClaudeBotConfig;

  constructor(config: ClaudeBotConfig, apiKey?: string) {
    if (!apiKey && !process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "Anthropic API key is required. Set ANTHROPIC_API_KEY environment variable or pass it to the constructor."
      );
    }

    this.config = config;
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Send a message to Claude and get a response
   * @param message - The message to send
   * @param context - Optional conversation context for multi-turn conversations
   * @returns Response text and updated conversation context
   */
  async chat(
    message: string,
    context?: ConversationContext
  ): Promise<BotResponse> {
    if (!message) {
      return {
        text: "",
        context: context || { messages: [] },
      };
    }

    const start = Date.now();

    try {
      const response = await retry(
        async () => {
          // Build messages array
          const messages: Anthropic.MessageParam[] = [
            ...(context?.messages || []),
            {
              role: "user",
              content: message,
            },
          ];

          // Prepare system message
          const systemMessage = this.buildSystemMessage();

          const result = await this.client.messages.create({
            model: this.config.model,
            max_tokens: this.config.tokenLimits.responseTokens,
            temperature: this.config.temperature ?? 0.0,
            system: systemMessage,
            messages,
          });

          return result;
        },
        {
          retries: this.config.maxRetries ?? 3,
          onFailedAttempt: (error) => {
            logger.warn("Claude API request failed, retrying", {
              attemptNumber: error.attemptNumber,
              retriesLeft: error.retriesLeft,
              model: this.config.model,
            });
          },
        }
      );

      const end = Date.now();

      if (this.config.debug) {
        logger.debug("Claude API response received", {
          responseTimeMs: end - start,
          model: this.config.model,
        });
        logger.trace("Claude API response details", { response });
      }

      // Extract text from response
      const responseText = this.extractText(response);

      // Update conversation context
      const updatedContext: ConversationContext = {
        messages: [
          ...(context?.messages || []),
          {
            role: "user",
            content: message,
          },
          {
            role: "assistant",
            content: responseText,
          },
        ],
      };

      return {
        text: this.cleanResponse(responseText),
        context: updatedContext,
      };
    } catch (error: any) {
      logger.error("Failed to get response from Claude", {
        model: this.config.model,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Build the system message with current date and knowledge cutoff
   */
  private buildSystemMessage(): string {
    const currentDate = new Date().toISOString().split("T")[0];
    const baseMessage = this.config.systemMessage || "";

    return `${baseMessage}

Knowledge cutoff: ${this.config.tokenLimits.knowledgeCutOff}
Current date: ${currentDate}`;
  }

  /**
   * Extract text content from Claude's response
   */
  private extractText(response: Anthropic.Message): string {
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );

    return textBlocks.map((block) => block.text).join("\n");
  }

  /**
   * Clean up response text
   */
  private cleanResponse(text: string): string {
    let cleaned = text;

    // Remove "with " prefix if present
    if (cleaned.startsWith("with ")) {
      cleaned = cleaned.substring(5);
    }

    return cleaned.trim();
  }

  /**
   * Get the model being used by this bot
   */
  getModel(): string {
    return this.config.model;
  }

  /**
   * Get the token limits configuration
   */
  getTokenLimits() {
    return this.config.tokenLimits;
  }
}
