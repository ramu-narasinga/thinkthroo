import { env } from "@/utils/env";
import { logger } from "@/utils/logger";

export function platformFetch(url: string, init?: RequestInit): Promise<Response> {
  if (!env.PLATFORM_API_SECRET) {
    throw new Error("PLATFORM_API_SECRET environment variable is not set");
  }
  if (!env.PLATFORM_PROTECTION_BYPASS_SECRET) {
    logger.warn("PLATFORM_PROTECTION_BYPASS_SECRET is not set — requests to the platform may be blocked by Vercel protection");
  }
  return fetch(url, {
    ...init,
    headers: {
      "x-internal-secret": env.PLATFORM_API_SECRET,
      ...(env.PLATFORM_PROTECTION_BYPASS_SECRET && {
        "x-vercel-protection-bypass": env.PLATFORM_PROTECTION_BYPASS_SECRET,
      }),
      ...init?.headers,
    },
  });
}
