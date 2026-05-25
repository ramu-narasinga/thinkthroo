import { env } from "@/utils/env";

export function platformFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      ...(env.VERCEL_BYPASS_TOKEN
        ? { "x-vercel-protection-bypass": env.VERCEL_BYPASS_TOKEN }
        : {}),
      ...init?.headers,
    },
  });
}
