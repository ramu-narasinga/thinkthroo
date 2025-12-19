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
import { Input } from "@thinkthroo/ui/components/input";
import { Label } from "@thinkthroo/ui/components/label";
import { signup } from "@/app/(auth)/signup/actions";
import posthog from "posthog-js";

export function SignupForm({
  className,
  error,
  ...props
}: React.ComponentProps<"div"> & { error?: string }) {
  const handleSignupClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.closest('form');
    const emailInput = form?.querySelector<HTMLInputElement>('input[name="email"]');
    const email = emailInput?.value;

    if (email) {
      // Identify user with email before signup
      posthog.identify(email, {
        email: email,
      });
    }

    posthog.capture('user_signed_up', {
      method: 'email',
      email: email || undefined,
    });
  };

  const handleGoogleSignupClick = () => {
    posthog.capture('user_signed_up', {
      method: 'google',
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Register your account</CardTitle>
          <CardDescription>Enter your email below to signup</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" required name="password" />
              </div>

              {error && (
                <p className="text-sm text-red-600">
                  {decodeURIComponent(error)}
                </p>
              )}

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" formAction={signup} onClick={handleSignupClick}>
                  Sign up
                </Button>
                <Button variant="outline" className="w-full" onClick={handleGoogleSignupClick}>
                  Sign up with Google
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
