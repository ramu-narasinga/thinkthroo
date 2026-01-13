/**
 * AI Services for PR review and summarization
 * 
 * This module provides Claude-based AI services including:
 * - ClaudeBot: Main bot class for interacting with Claude API
 * - Prompts: Template rendering for various review scenarios
 * - TokenCounter: Token counting and estimation utilities
 * - Type definitions and configurations
 */

export { ClaudeBot } from "./ClaudeBot";
export type { ConversationContext, BotResponse } from "./ClaudeBot";

export { Prompts } from "./Prompts";
export type { TemplateData } from "./Prompts";

export { TokenCounter, getTokenCounter, countTokens, estimateTokens } from "./TokenCounter";

export {
  ClaudeModel,
  HAIKU_TOKEN_LIMITS,
  SONNET_TOKEN_LIMITS,
  getDefaultAIOptions,
} from "./types";

export type {
  TokenLimits,
  ClaudeBotConfig,
  AIOptions,
} from "./types";
