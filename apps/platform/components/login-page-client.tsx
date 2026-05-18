"use client";

import { useEffect } from "react";
import Image from "next/image";
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
    <div className="flex min-h-dvh w-full bg-gray-100 dark:bg-gray-900 md:overflow-hidden">
      {/* Narrow viewports: real login UI (DevTools / split panes often go below md width) */}
      <div className="flex md:hidden min-h-dvh w-full flex-col overflow-y-auto">
        <div className="relative z-20 flex shrink-0 items-center gap-2 p-6 text-lg font-medium text-black dark:text-white">
          <Image
            src="/tt purple.svg"
            alt="Logo"
            width={32}
            height={32}
            className="shrink-0"
          />
          Think Throo
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10">
          <div className="w-full max-w-sm">
            <LoginForm
              error={error}
              className="min-h-0 w-full bg-transparent py-0 dark:bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="container relative hidden h-screen min-h-0 w-full min-w-0 md:grid md:grid-rows-[minmax(0,1fr)] lg:max-w-none lg:grid-cols-2 lg:px-0 items-stretch overflow-hidden">
        {/* Left hero section */}
        <div className="relative hidden h-full flex-col bg-muted p-8 border-r border-gray-300 lg:flex overflow-hidden">
          <div className="absolute inset-0 bg-white" />

          <div className="relative z-20 flex items-center text-lg font-medium text-black">
            <Image
              src="/tt purple.svg"
              alt="Logo"
              width={32}
              height={32}
              className="mr-2"
            />
            Think Throo
          </div>

          <div className="relative z-20 flex-1 flex items-center justify-center overflow-hidden">
            <div className="max-w-xl text-center">
              <p className="text-4xl font-bold text-black leading-tight">
                AI Code Review that Enforces Codebase Architecture
              </p>
              <p className="mt-4 text-base text-gray-500">
                Stop AI slop from reaching your main branch. Think Throo enforces
                proven architecture patterns, catching violations before they
                compound into technical debt.
              </p>
            </div>
          </div>
        </div>

        {/* Login form — logo pinned top when hero is hidden (md–lg); form centered in remaining height */}
        <div className="flex h-full min-h-0 min-w-0 flex-col gap-6 p-6">
          <div className="flex shrink-0 items-center gap-2 text-lg font-medium text-black dark:text-white lg:hidden">
            <Image
              src="/tt purple.svg"
              alt="Logo"
              width={32}
              height={32}
              className="shrink-0"
            />
            Think Throo
          </div>
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
            <div className="w-full max-w-sm">
              <LoginForm
                error={error}
                className="min-h-0 w-full bg-transparent py-0 dark:bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}