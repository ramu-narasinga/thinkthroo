import * as Sentry from "@sentry/node";
import { env } from "./env";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    _experiments: {
      enableLogs: true,
    },
  });
  
  console.log("✓ Sentry initialized", { 
    environment: env.NODE_ENV,
    dsn: env.SENTRY_DSN?.substring(0, 30) + "..." 
  });
} else {
  console.warn("⚠ Sentry DSN not configured - error tracking disabled");
}

export { Sentry };
