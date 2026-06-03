import { env } from "@/utils/env";

export function platformFetch(url: string, init?: RequestInit): Promise<Response> {
  if (!env.PLATFORM_API_SECRET) {
    throw new Error("PLATFORM_API_SECRET environment variable is not set");
  }
  return fetch(url, {
    ...init,
    headers: {
      "x-internal-secret": env.PLATFORM_API_SECRET,
      ...init?.headers,
    },
  });
}
