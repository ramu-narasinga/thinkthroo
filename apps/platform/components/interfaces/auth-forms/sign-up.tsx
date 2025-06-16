"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@thinkthroo/ui/components/button";
import { Input } from "@thinkthroo/ui/components/input";
import { Label } from "@thinkthroo/ui/components/label";
import { signUp } from '@/utils/auth-helpers/server';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { handleRequest } from '@/utils/auth-helpers/client';

interface SignUpProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export function SignUp({
  allowEmail,
  redirectMethod
}: SignUpProps) {

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = redirectMethod === 'client' ? useRouter() : null;

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const searchParams = useSearchParams()
 
  const statusDescription = searchParams.get('status_description') || searchParams.get('error_description')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setIsLoading(true);
    await handleRequest(event, signUp, router);
    setIsLoading(false);
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign up
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password below to create your account
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
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="Joe Bloggs"
                type="text"
                autoCorrect="off"
                name="fullName"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                placeholder="joe@bloggs.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                name="email"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                placeholder="password"
                type="password"
                name="password"
                disabled={isLoading}
              />
            </div>
            <Button disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign up
            </Button>
            <div className="grid gap-1">
              <p className="text-left text-sm text-muted-foreground">
                  Already have an account?
              </p>
              <p className="text-left text-sm text-muted-foreground">
                  <Link
                    href="/signin/password_signin"
                    className="hover:text-primary"
                  >
                  Sign in with email and password
                  </Link>
              </p>
              {
                allowEmail && 
                <p className="text-left text-sm text-muted-foreground">
                  <Link
                    href="/signin/email_signin"
                    className="hover:text-primary"
                  >
                  Sign in via magic link
                  </Link>
                </p>
              }
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
