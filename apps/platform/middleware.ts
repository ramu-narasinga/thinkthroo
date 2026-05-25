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
     */
    "/((?!_next/static|_next/image|favicon.ico|api/credits|api/rate-limits|api/review-settings|api/dodo/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};