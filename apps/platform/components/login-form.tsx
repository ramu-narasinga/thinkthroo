"use client";

import { cn } from "@/lib/utils";
import { Button } from "@thinkthroo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@thinkthroo/ui/components/card";
import { login } from "@/app/(auth)/login/actions";
import { useUmamiTracking } from "@/hooks/useUmamiTracking";
import posthog from "posthog-js";

export function LoginForm({
  className,
  error,
  ...props
}: React.ComponentProps<"div"> & { error?: string }) {
  const { trackEvent } = useUmamiTracking();

  const handleLoginClick = () => {
    trackEvent("login_submit", {
      provider: "github",
      action: "initiated",
    });

    // PostHog: Track login with GitHub clicked
    posthog.capture('login_with_github_clicked', {
      provider: 'github',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            You&apos;ll be taken to GitHub to authenticate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  formAction={login}
                  onClick={handleLoginClick}
                >
                  Login with Github
                </Button>
              </div>

              {error && (
                <p className="text-sm text-red-600">
                  {decodeURIComponent(error)}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
