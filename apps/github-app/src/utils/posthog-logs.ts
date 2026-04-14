import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { logs } from "@opentelemetry/api-logs";
import { env } from "./env";

let initialized = false;

export function initPostHogLogs() {
  if (initialized || !env.POSTHOG_PROJECT_TOKEN) {
    return;
  }

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      "service.name": "think-throo-github-app",
    }),
    logRecordProcessor: new BatchLogRecordProcessor(
      new OTLPLogExporter({
        url: "https://us.i.posthog.com/i/v1/logs",
        headers: {
          Authorization: `Bearer ${env.POSTHOG_PROJECT_TOKEN}`,
        },
      })
    ),
  });

  sdk.start();
  initialized = true;
}

export function getPostHogLogger() {
  return logs.getLogger("think-throo-github-app");
}
