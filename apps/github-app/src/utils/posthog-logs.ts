import { LoggerProvider, BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { logs } from "@opentelemetry/api-logs";
import { env } from "./env";

let initialized = false;
let loggerProvider: LoggerProvider | null = null;

export function initPostHogLogs() {
  if (initialized || !env.POSTHOG_PROJECT_TOKEN) {
    return;
  }

  loggerProvider = new LoggerProvider({
    resource: resourceFromAttributes({
      "service.name": "think-throo-github-app",
    }),
  });

  loggerProvider.addLogRecordProcessor(
    new BatchLogRecordProcessor(
      new OTLPLogExporter({
        url: "https://us.i.posthog.com/i/v1/logs",
        headers: {
          Authorization: `Bearer ${env.POSTHOG_PROJECT_TOKEN}`,
        },
      })
    )
  );

  logs.setGlobalLoggerProvider(loggerProvider);
  initialized = true;
}

export async function forceFlushPostHogLogs(): Promise<void> {
  if (loggerProvider) {
    await loggerProvider.forceFlush();
  }
}

export function getPostHogLogger() {
  return logs.getLogger("think-throo-github-app");
}
