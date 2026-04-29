import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { logs } from "@opentelemetry/api-logs";
import { resourceFromAttributes } from "@opentelemetry/resources";

export const loggerProvider = new LoggerProvider({
  resource: resourceFromAttributes({ "service.name": "thinkthroo-platform" }),
  processors: [
    new BatchLogRecordProcessor(
      new OTLPLogExporter({
        url: "https://us.i.posthog.com/i/v1/logs",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_KEY}`,
          "Content-Type": "application/json",
        },
      })
    ),
  ],
});

logs.setGlobalLoggerProvider(loggerProvider);
