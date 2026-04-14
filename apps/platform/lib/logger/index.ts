import Pino from 'pino';
import { SeverityNumber, logs } from '@opentelemetry/api-logs';

const pinoLogger = Pino({
  level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info',
});

function emit(severityText: string, severityNumber: SeverityNumber, msg: string, obj?: Record<string, unknown>) {
  logs.getLogger('thinkthroo-platform').emit({ severityText, severityNumber, body: msg, attributes: obj });
}

export const pino = {
  info: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.info(obj || {}, msg);
    emit('info', SeverityNumber.INFO, msg, obj);
  },
  warn: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.warn(obj || {}, msg);
    emit('warn', SeverityNumber.WARN, msg, obj);
  },
  error: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.error(obj || {}, msg);
    emit('error', SeverityNumber.ERROR, msg, obj);
  },
  debug: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.debug(obj || {}, msg);
    emit('debug', SeverityNumber.DEBUG, msg, obj);
  },
  trace: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.trace(obj || {}, msg);
    emit('trace', SeverityNumber.TRACE, msg, obj);
  },
  fatal: (msg: string, obj?: Record<string, unknown>) => {
    pinoLogger.fatal(obj || {}, msg);
    emit('fatal', SeverityNumber.FATAL, msg, obj);
  },
};