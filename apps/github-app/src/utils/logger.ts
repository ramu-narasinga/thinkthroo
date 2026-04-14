import pino from "pino";
import { SeverityNumber, type AnyValueMap } from "@opentelemetry/api-logs";
import { getPostHogLogger } from "./posthog-logs";
import { env } from "./env";

// Console stream for terminal output
const consoleStream = pino.destination();

const pinoLogger = pino(
  {
    nestedKey: "payload",
    level: env.LOG_LEVEL || "info",
  },
  consoleStream
);

export const logger = {
  info: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.info(obj || {}, msg);
    getPostHogLogger().emit({ severityText: "info", severityNumber: SeverityNumber.INFO, body: msg, attributes: obj as AnyValueMap });
  },

  warn: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.warn(obj || {}, msg);
    getPostHogLogger().emit({ severityText: "warn", severityNumber: SeverityNumber.WARN, body: msg, attributes: obj as AnyValueMap });
  },

  error: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.error(obj || {}, msg);
    getPostHogLogger().emit({ severityText: "error", severityNumber: SeverityNumber.ERROR, body: msg, attributes: obj as AnyValueMap });
  },

  debug: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.debug(obj || {}, msg);
    getPostHogLogger().emit({ severityText: "debug", severityNumber: SeverityNumber.DEBUG, body: msg, attributes: obj as AnyValueMap });
  },

  trace: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.trace(obj || {}, msg);
    getPostHogLogger().emit({ severityText: "trace", severityNumber: SeverityNumber.TRACE, body: msg, attributes: obj as AnyValueMap });
  },

  fatal: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.fatal(obj || {}, msg);
    getPostHogLogger().emit({ severityText: "fatal", severityNumber: SeverityNumber.FATAL, body: msg, attributes: obj as AnyValueMap });
  },
};
