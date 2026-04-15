import pino from "pino";
import { SeverityNumber, type AnyValueMap } from "@opentelemetry/api-logs";
import { getPostHogLogger } from "./posthog-logs";
import { env } from "./env";

export interface Logger {
  info(msg: string, obj?: Record<string, unknown>): void;
  warn(msg: string, obj?: Record<string, unknown>): void;
  error(msg: string, obj?: Record<string, unknown>): void;
  debug(msg: string, obj?: Record<string, unknown>): void;
  trace(msg: string, obj?: Record<string, unknown>): void;
  fatal(msg: string, obj?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

// Console stream for terminal output
const consoleStream = pino.destination();

const rootPino = pino(
  {
    nestedKey: "payload",
    level: env.LOG_LEVEL || "info",
  },
  consoleStream
);

function createLogger(pinoInst: pino.Logger, bindings: Record<string, unknown> = {}): Logger {
  return {
    info: (msg, obj) => {
      pinoInst.info(obj || {}, msg);
      getPostHogLogger().emit({ severityText: "info", severityNumber: SeverityNumber.INFO, body: msg, attributes: { ...bindings, ...(obj || {}) } as AnyValueMap });
    },
    warn: (msg, obj) => {
      pinoInst.warn(obj || {}, msg);
      getPostHogLogger().emit({ severityText: "warn", severityNumber: SeverityNumber.WARN, body: msg, attributes: { ...bindings, ...(obj || {}) } as AnyValueMap });
    },
    error: (msg, obj) => {
      pinoInst.error(obj || {}, msg);
      getPostHogLogger().emit({ severityText: "error", severityNumber: SeverityNumber.ERROR, body: msg, attributes: { ...bindings, ...(obj || {}) } as AnyValueMap });
    },
    debug: (msg, obj) => {
      pinoInst.debug(obj || {}, msg);
      getPostHogLogger().emit({ severityText: "debug", severityNumber: SeverityNumber.DEBUG, body: msg, attributes: { ...bindings, ...(obj || {}) } as AnyValueMap });
    },
    trace: (msg, obj) => {
      pinoInst.trace(obj || {}, msg);
      getPostHogLogger().emit({ severityText: "trace", severityNumber: SeverityNumber.TRACE, body: msg, attributes: { ...bindings, ...(obj || {}) } as AnyValueMap });
    },
    fatal: (msg, obj) => {
      pinoInst.fatal(obj || {}, msg);
      getPostHogLogger().emit({ severityText: "fatal", severityNumber: SeverityNumber.FATAL, body: msg, attributes: { ...bindings, ...(obj || {}) } as AnyValueMap });
    },
    child: (newBindings) => createLogger(pinoInst.child(newBindings), { ...bindings, ...newBindings }),
  };
}

export const logger: Logger = createLogger(rootPino);
