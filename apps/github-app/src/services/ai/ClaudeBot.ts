import Anthropic from "@anthropic-ai/sdk";
// TODO: implement p-retry?
import { retry } from "./retry";
import type { BotAccumulatedUsage, ClaudeBotConfig } from "./types";
import { env } from "@/utils/env";
import { logger, type Logger } from "@/utils/logger";

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
  private accumulatedUsage: BotAccumulatedUsage;
  private readonly log: Logger;

  constructor(config: ClaudeBotConfig, apiKey?: string, log?: Logger) {
    this.log = log ?? logger;
    this.log.debug("Initializing ClaudeBot", {
      model: config.model,
      temperature: config.temperature ?? 0.0,
      maxRetries: config.maxRetries ?? 3,
      hasSystemMessage: !!config.systemMessage,
      requestTokens: config.tokenLimits.requestTokens,
      responseTokens: config.tokenLimits.responseTokens,
    });

    if (!apiKey && !env.ANTHROPIC_API_KEY) {
      this.log.error("Anthropic API key not found");
      throw new Error(
        "Anthropic API key is required. Set ANTHROPIC_API_KEY environment variable or pass it to the constructor."
      );
    }

    this.config = config;
    this.accumulatedUsage = { model: config.model, inputTokens: 0, outputTokens: 0 };
    this.client = new Anthropic({
      apiKey: apiKey || env.ANTHROPIC_API_KEY,
    });

    this.log.info("ClaudeBot initialized successfully", {
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
      this.log.debug("Empty message provided to Claude chat", {
        model: this.config.model,
      });
      return {
        text: "",
        context: context || { messages: [] },
      };
    }

    this.log.debug("Sending request to Claude API", {
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

          this.log.debug("Prepared messages for Claude API", {
            model: this.config.model,
            totalMessages: messages.length,
          });

          // Prepare system message
          const systemMessage = this.buildSystemMessage();

          this.log.debug("Making Claude API request", {
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
            this.log.warn("Claude API request failed, retrying", {
              attemptNumber: error.attemptNumber,
              retriesLeft: error.retriesLeft,
              model: this.config.model,
              error: error.message,
            });
          },
        }
      );

      const end = Date.now();

      this.accumulatedUsage.inputTokens += response.usage?.input_tokens ?? 0;
      this.accumulatedUsage.outputTokens += response.usage?.output_tokens ?? 0;

      this.log.info("Claude API response received successfully", {
        responseTimeMs: end - start,
        model: this.config.model,
        stopReason: response.stop_reason,
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens,
      });

      if (this.config.debug) {
        this.log.debug("Claude API response received", {
          responseTimeMs: end - start,
          model: this.config.model,
        });
        this.log.trace("Claude API response details", { response });
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
      this.log.error("Failed to get response from Claude", {
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

    this.log.debug("System message built", {
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

    this.log.debug("Extracted text from Claude response", {
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
      this.log.debug("Removing 'with ' prefix from response");
      cleaned = cleaned.substring(5);
    }

    const trimmed = cleaned.trim();

    this.log.debug("Response cleaned", {
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
   * Get accumulated token usage across all chat() calls on this instance
   */
  getAccumulatedUsage(): BotAccumulatedUsage {
    return { ...this.accumulatedUsage };
  }

  /**
   * Get the token limits configuration
   */
  getTokenLimits() {
    return this.config.tokenLimits;
  }
}
