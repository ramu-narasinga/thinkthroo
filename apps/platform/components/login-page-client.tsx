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
    <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-900">
      {/* Left hero section - only on lg+ */}
      <div className="relative hidden lg:flex flex-col w-1/2 bg-white p-8 border-r border-gray-300 overflow-hidden">
        <div className="flex items-center text-lg font-medium text-black">
          <Image
            src="/logo1/logo.svg"
            alt="Logo"
            width={32}
            height={32}
            className="mr-2"
          />
          Think Throo
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-xl text-center">
            <p className="text-4xl font-bold text-black leading-tight">
              AI Code Review that Enforces Codebase Architecture
            </p>
            <p className="mt-4 text-base text-gray-500">
              Stop AI slop from reaching your main branch. Think Throo enforces proven architecture patterns, catching violations before they compound into technical debt.
            </p>
          </div>
        </div>
      </div>

      {/* Login form - always visible at all viewport sizes */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <LoginForm error={error} />
        </div>
      </div>
    </div>
  );
}
