import Anthropic from "@anthropic-ai/sdk";
// TODO: implement p-retry?
import { retry } from "./retry";
import type { ClaudeBotConfig } from "./types";
import { logger } from "@/utils/logger";

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
    logger.debug("Initializing ClaudeBot", {
      model: config.model,
      temperature: config.temperature ?? 0.0,
      maxRetries: config.maxRetries ?? 3,
      hasSystemMessage: !!config.systemMessage,
      requestTokens: config.tokenLimits.requestTokens,
      responseTokens: config.tokenLimits.responseTokens,
    });

    if (!apiKey && !process.env.ANTHROPIC_API_KEY) {
      logger.error("Anthropic API key not found");
      throw new Error(
        "Anthropic API key is required. Set ANTHROPIC_API_KEY environment variable or pass it to the constructor."
      );
    }

    this.config = config;
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });

    logger.info("ClaudeBot initialized successfully", {
      model: config.model,
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
      logger.debug("Empty message provided to Claude chat", {
        model: this.config.model,
      });
      return {
        text: "",
        context: context || { messages: [] },
      };
    }

    logger.debug("Sending request to Claude API", {
      model: this.config.model,
      messageLength: message.length,
      hasContext: !!context,
      contextMessagesCount: context?.messages.length || 0,
      temperature: this.config.temperature ?? 0.0,
      maxTokens: this.config.tokenLimits.responseTokens,
    });

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

          logger.debug("Prepared messages for Claude API", {
            model: this.config.model,
            totalMessages: messages.length,
          });

          // Prepare system message
          const systemMessage = this.buildSystemMessage();

          logger.debug("Making Claude API request", {
            model: this.config.model,
            systemMessageLength: systemMessage.length,
          });

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
              error: error.message,
            });
          },
        }
      );

      const end = Date.now();

      logger.info("Claude API response received successfully", {
        responseTimeMs: end - start,
        model: this.config.model,
        stopReason: response.stop_reason,
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens,
      });

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

    const systemMessage = `${baseMessage}

Knowledge cutoff: ${this.config.tokenLimits.knowledgeCutOff}
Current date: ${currentDate}`;

    logger.debug("System message built", {
      currentDate,
      knowledgeCutoff: this.config.tokenLimits.knowledgeCutOff,
      systemMessageLength: systemMessage.length,
    });

    return systemMessage;
  }

  /**
   * Extract text content from Claude's response
   */
  private extractText(response: Anthropic.Message): string {
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );

    const extractedText = textBlocks.map((block) => block.text).join("\n");

    logger.debug("Extracted text from Claude response", {
      textBlockCount: textBlocks.length,
      totalContentBlocks: response.content.length,
      extractedTextLength: extractedText.length,
    });

    return extractedText;
  }

  /**
   * Clean up response text
   */
  private cleanResponse(text: string): string {
    let cleaned = text;

    // Remove "with " prefix if present
    if (cleaned.startsWith("with ")) {
      logger.debug("Removing 'with ' prefix from response");
      cleaned = cleaned.substring(5);
    }

    const trimmed = cleaned.trim();

    logger.debug("Response cleaned", {
      originalLength: text.length,
      cleanedLength: trimmed.length,
      hadPrefix: text.startsWith("with "),
    });

    return trimmed;
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
