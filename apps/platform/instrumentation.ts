import { logs } from "@opentelemetry/api-logs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { BatchLogRecordProcessor, LoggerProvider } = await import("@opentelemetry/sdk-logs");
    const { OTLPLogExporter } = await import("@opentelemetry/exporter-logs-otlp-http");
    const { resourceFromAttributes } = await import("@opentelemetry/resources");

    const loggerProvider = new LoggerProvider({
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
  }
}
