"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { SilentErrorBoundary } from "@/components/silent-error-boundary";
import { Button } from "@thinkthroo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@thinkthroo/ui/components/card";
import { login } from "@/app/(auth)/login/actions";

interface PrivatePageGuardProps {
  children: React.ReactNode;
}

export default function PrivatePageGuard({ children }: PrivatePageGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (isMounted) {
          setIsAuthenticated(!!user);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
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
        <Card className="w-full max-w-sm mx-4">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              You&apos;ll be taken to GitHub to authenticate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <Button type="submit" className="w-full" formAction={login}>
                Login with GitHub
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
