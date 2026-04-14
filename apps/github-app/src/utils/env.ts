/**
 * Environment configuration for the GitHub App
 */
export const env = {
  /** Log level - "trace" | "debug" | "info" | "warn" | "error" | "fatal" */
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  
  /** Anthropic API key for Claude */
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  
  /** Node environment */
  NODE_ENV: process.env.NODE_ENV || "development",

  /** Slack Incoming Webhook URL for operational notifications */
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,

  /** Platform API base URL — used to query architecture rules from Pinecone */
  PLATFORM_API_URL: process.env.PLATFORM_API_URL,

  /** Shared secret sent as x-internal-secret header to the platform API */
  PLATFORM_API_SECRET: process.env.PLATFORM_API_SECRET,

  /**
   * Markup multiplier applied on top of raw Anthropic cost when deducting credits.
   * 1 = no markup (passthrough), 3 = 3× (67% margin). Defaults to 3.
   */
  AI_MARKUP_MULTIPLIER: Number(process.env.AI_MARKUP_MULTIPLIER ?? 3),

  /** PostHog project token (phc_...) for sending logs via OpenTelemetry */
  POSTHOG_PROJECT_TOKEN: process.env.POSTHOG_PROJECT_TOKEN,
} as const;
