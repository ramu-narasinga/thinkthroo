/**
 * Environment configuration for the GitHub App
 */
export const env = {
  /** Log level - "trace" | "debug" | "info" | "warn" | "error" | "fatal" */
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  
  /** Sentry DSN for error tracking and log transport */
  SENTRY_DSN: process.env.SENTRY_DSN,
  
  /** Anthropic API key for Claude */
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  
  /** Node environment */
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;
