/**
 * Claude model identifiers
 */
export enum ClaudeModel {
  HAIKU_3_5 = "claude-3-5-haiku-20241022",
  SONNET_3_5 = "claude-3-5-sonnet-20241022",
}

/**
 * Token limits configuration for Claude models
 */
export interface TokenLimits {
  /** Maximum tokens the model can handle */
  maxTokens: number;
  /** Maximum tokens for the response */
  responseTokens: number;
  /** Maximum tokens for the request */
  requestTokens: number;
  /** Knowledge cutoff date */
  knowledgeCutOff: string;
}

/**
 * Configuration for Claude bot instances
 */
export interface ClaudeBotConfig {
  model: ClaudeModel;
  tokenLimits: TokenLimits;
  temperature?: number;
  maxRetries?: number;
  timeoutMs?: number;
  systemMessage?: string;
  debug?: boolean;
}

/**
 * AI bot options for PR review
 */
export interface AIOptions {
  /** Configuration for the summary bot (Haiku) */
  summaryBot: ClaudeBotConfig;
  /** Configuration for the review bot (Sonnet) */
  reviewBot: ClaudeBotConfig;
  /** Whether to review simple changes */
  reviewSimpleChanges: boolean;
  /** Maximum number of files to summarize (0 = unlimited) */
  maxFiles: number;
  /** Maximum concurrent API calls */
  maxConcurrency: number;
  /** Batch size for grouping summaries */
  summaryBatchSize: number;
  /** Whether to disable release notes generation */
  disableReleaseNotes: boolean;
  /** API base URL (optional) */
  apiBaseUrl?: string;
  /** Debug mode */
  debug?: boolean;
}

/**
 * Default token limits for Claude Haiku (summary bot)
 */
export const HAIKU_TOKEN_LIMITS: TokenLimits = {
  maxTokens: 200000, // Claude 3.5 Haiku context window
  responseTokens: 8192, // Max output tokens
  requestTokens: 4000, // Limit for request to stay within budget
  knowledgeCutOff: "2024-07",
};

/**
 * Default token limits for Claude Sonnet (review bot)
 */
export const SONNET_TOKEN_LIMITS: TokenLimits = {
  maxTokens: 200000, // Claude 3.5 Sonnet context window
  responseTokens: 8192, // Max output tokens
  requestTokens: 12000, // Higher limit for detailed reviews
  knowledgeCutOff: "2024-10",
};

/**
 * Default configuration for AI bots
 */
export function getDefaultAIOptions(): AIOptions {
  return {
    summaryBot: {
      model: ClaudeModel.HAIKU_3_5,
      tokenLimits: HAIKU_TOKEN_LIMITS,
      temperature: 0.0,
      maxRetries: 3,
      timeoutMs: 120000, // 2 minutes
      debug: false,
    },
    reviewBot: {
      model: ClaudeModel.SONNET_3_5,
      tokenLimits: SONNET_TOKEN_LIMITS,
      temperature: 0.0,
      maxRetries: 3,
      timeoutMs: 300000, // 5 minutes
      debug: false,
    },
    reviewSimpleChanges: false,
    maxFiles: 0, // 0 = unlimited
    maxConcurrency: 6, // Anthropic recommends 5-10 for Claude
    summaryBatchSize: 10,
    disableReleaseNotes: false,
    debug: false,
  };
}
