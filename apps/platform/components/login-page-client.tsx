"use client";

import { useEffect } from "react";
import { LoginForm } from "@/components/login-form";
import { useUmamiTracking } from "@/hooks/useUmamiTracking";

export function LoginPageClient({ error }: { error?: string }) {
  const { trackEvent } = useUmamiTracking();

  useEffect(() => {
    trackEvent("page_visit", {
      page: "login",
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm error={error} />
      </div>
    </div>
  );
}
