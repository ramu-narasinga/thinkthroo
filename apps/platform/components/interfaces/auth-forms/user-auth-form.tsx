"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithPassword } from '@/utils/auth-helpers/server';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { handleRequest } from '@/utils/auth-helpers/client';

interface PasswordSignInProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export function UserAuthForm({
  allowEmail,
  redirectMethod
}: PasswordSignInProps) {

  const router = redirectMethod === 'client' ? useRouter() : null;

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const searchParams = useSearchParams()
 
  const statusDescription = searchParams.get('status_description') || searchParams.get('error_description')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    await handleRequest(event, signInWithPassword, router);
    setIsLoading(false);
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password below to signin
        </p>
      </div>
      {statusDescription && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {statusDescription}
          </p>
        )}
      <div className="grid gap-6">
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                placeholder="joe@bloggs.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                placeholder="password"
                type="password"
                disabled={isLoading}
              />
            </div>
            <Button disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In with Email
            </Button>
            <div className="grid gap-1">
              <p className="text-left text-sm text-muted-foreground">
                  <Link
                    href="/signin/forgot_password"
                    className="hover:text-primary"
                  >
                  Forgot your password?
                  </Link>
              </p>
              <p className="text-left text-sm text-muted-foreground">
                  <Link
                    href="/signin/email_signin"
                    className="hover:text-primary"
                  >
                  Sign in via magic link
                  </Link>
              </p>
              <p className="text-left text-sm text-muted-foreground">
                  <Link
                    href="/signin/signup"
                    className="hover:text-primary"
                  >
                  Don't have an account? Sign up
                  </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
