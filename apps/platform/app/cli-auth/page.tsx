import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { registerRuntime } from "@/app/(backend)/api/daemon/_register";
import { serverDB } from "@/database";
import { daemonCliAuthRequests } from "@/database/schemas";

const LOOPBACK_REDIRECT_URI = /^http:\/\/(127\.0\.0\.1|localhost):\d{1,5}\/callback$/;

function generateCode(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default async function CliAuthPage({
  searchParams,
}: {
  searchParams?: Promise<{ state?: string; redirect_uri?: string; name?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const { state, redirect_uri: redirectUri, name } = params;

  if (!state || !redirectUri || !LOOPBACK_REDIRECT_URI.test(redirectUri)) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Invalid or missing CLI auth request. Run <code>thinkthroo setup</code> again to get a fresh link.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const next = `/cli-auth?state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}&name=${encodeURIComponent(name ?? "")}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const { runtimeId, apiKey } = await registerRuntime(user.id, name?.trim() || "CLI runtime");

  const code = generateCode();
  await serverDB.insert(daemonCliAuthRequests).values({ code, runtimeId, apiKey });

  redirect(`${redirectUri}?code=${code}&state=${encodeURIComponent(state)}`);
}
