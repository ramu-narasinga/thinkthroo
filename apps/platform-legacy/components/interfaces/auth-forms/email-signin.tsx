"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@thinkthroo/ui/components/components/button";
import { Input } from "@thinkthroo/ui/components/components/input";
import { Label } from "@thinkthroo/ui/components/components/label";
import { signInWithEmail } from '@/utils/auth-helpers/server';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { handleRequest } from '@/utils/auth-helpers/client';

interface EmailSignInProps {
  allowPassword: boolean;
  redirectMethod: string;
  disableButton?: boolean;
}

export function EmailSignIn({
  allowPassword,
  redirectMethod,
  disableButton
}: EmailSignInProps) {

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = redirectMethod === 'client' ? useRouter() : null;

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const searchParams = useSearchParams()
 
  const statusDescription = searchParams.get('status_description') || searchParams.get('error_description')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { 
    setIsLoading(true);
    await handleRequest(event, signInWithEmail, router);
    setIsLoading(false);
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to sign in via magic link
        </p>
      </div>
      {statusDescription && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {statusDescription}. {statusDescription.toLowerCase().includes("signups not allowed") ? "Please sign up": ""}
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
            <Button disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign in
            </Button>
            <div className="grid gap-1">
              <p className="text-left text-sm text-muted-foreground">
                  <Link
                    href="/signin/password_signin"
                    className="hover:text-primary"
                  >
                  Sign in with email and password
                  </Link>
              </p>
              <p className="text-left text-sm text-muted-foreground">
                  <Link
                    href="/signin/signup"
                    className="hover:text-primary"
                  >
                  Don&apos;t have an account? Sign up
                  </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
