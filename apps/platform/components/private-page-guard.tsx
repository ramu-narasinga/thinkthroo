"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { SilentErrorBoundary } from "@/components/silent-error-boundary";

interface PrivatePageGuardProps {
  children: React.ReactNode;
}

export default function PrivatePageGuard({ children }: PrivatePageGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden">
      {/* Real page content blurred — wrapped in error boundary to silently
          catch any tRPC/auth errors that fire when user is unauthenticated */}
      <div className="pointer-events-none select-none blur-md">
        <SilentErrorBoundary>
          {children}
        </SilentErrorBoundary>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-background border border-border rounded-2xl shadow-lg px-8 py-8 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold">Login required</h3>
            <p className="text-sm text-muted-foreground">
              Please log in to view this page.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-foreground text-background text-sm font-medium px-5 py-2.5 hover:opacity-90 transition-opacity"
          >
            Log in to continue
          </Link>
        </div>
      </div>
    </div>
  );
}
