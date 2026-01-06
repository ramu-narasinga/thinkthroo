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
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Mobile view image */}
      <div className="md:hidden w-full">
        <Image
          src="/examples/authentication-light.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="block w-full dark:hidden"
          priority
        />
        <Image
          src="/examples/authentication-dark.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="hidden w-full dark:block"
          priority
        />
      </div>

      {/* Desktop layout */}
      <div className="container relative hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 h-screen items-center overflow-hidden">
        {/* Left hero section */}
        <div className="relative hidden h-full flex-col bg-muted p-8 border-r border-gray-300 lg:flex overflow-hidden">
          <div className="absolute inset-0 bg-white" />

          <div className="relative z-20 flex items-center text-lg font-medium text-black">
            <Image
              src="/logo1/logo.svg"
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
                Cut Code Review Time & Bugs in Half Instantly.
              </p>
              <p className="mt-4 text-base text-gray-500">
                Supercharge your team to ship faster with the most advanced AI
                code reviews.
              </p>
            </div>
          </div>
        </div>

        {/* Right login form */}
        <div className="flex items-center justify-center h-full p-4 md:p-10 overflow-hidden">
          <div className="w-full max-w-sm">
            <LoginForm error={error} />
          </div>
        </div>
      </div>
    </div>
  );
}
