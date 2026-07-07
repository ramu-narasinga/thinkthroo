import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/credits, api/rate-limits, api/review-settings, api/dodo/webhook
     *   (internal routes authenticated via x-internal-secret — no Supabase session needed)
     * - api/daemon (daemon routes use their own bearer-token auth, not Supabase session)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/credits|api/rate-limits|api/review-settings|api/dodo/webhook|api/daemon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};