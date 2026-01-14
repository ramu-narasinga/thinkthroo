import pino from "pino";
import * as Sentry from "@sentry/node";
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

/**
 * Logger that outputs to console via Pino and sends to Sentry Logs
 * - Console: via Pino (formatted terminal output)
 * - Sentry Logs: via Sentry.logger API (appears in Sentry Logs view, not Issues)
 */
export const logger = {
  info: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.info(obj || {}, msg);
    Sentry.logger.info(msg, obj);
  },

  warn: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.warn(obj || {}, msg);
    Sentry.logger.warn(msg, obj);
  },

  error: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.error(obj || {}, msg);
    Sentry.logger.error(msg, obj);
  },

  debug: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.debug(obj || {}, msg);
    Sentry.logger.debug(msg, obj);
  },

  trace: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.trace(obj || {}, msg);
    Sentry.logger.trace(msg, obj);
  },

  fatal: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.fatal(obj || {}, msg);
    Sentry.logger.fatal(msg, obj);
  },
};
