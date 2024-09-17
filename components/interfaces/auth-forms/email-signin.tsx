'use client';


import Link from 'next/link';
import { signInWithEmail } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define prop type with allowPassword boolean
interface EmailSignInProps {
  allowPassword: boolean;
  redirectMethod: string;
  disableButton?: boolean;
  className: string;
}

export default function EmailSignIn({
  allowPassword,
  redirectMethod,
  disableButton,
}: EmailSignInProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, signInWithEmail, router);
    setIsSubmitting(false);
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }

  return (
    // <div className="my-8">
    //   <form
    //     noValidate={true}
    //     className="mb-4"
    //     onSubmit={(e) => handleSubmit(e)}
    //   >
    //     <div className="grid gap-2">
    //       <div className="grid gap-1">
    //         <label htmlFor="email">Email</label>
    //         <input
    //           id="email"
    //           placeholder="name@example.com"
    //           type="email"
    //           name="email"
    //           autoCapitalize="none"
    //           autoComplete="email"
    //           autoCorrect="off"
    //           className="w-full p-3 rounded-md bg-zinc-800"
    //         />
    //       </div>
    //       <Button
    //         variant="slim"
    //         type="submit"
    //         className="mt-1"
    //         loading={isSubmitting}
    //         disabled={disableButton}
    //       >
    //         Sign in
    //       </Button>
    //     </div>
    //   </form>
    //   {allowPassword && (
    //     <>
    //       <p>
    //         <Link href="/signin/password_signin" className="font-light text-sm">
    //           Sign in with email and password
    //         </Link>
    //       </p>
    //       <p>
    //         <Link href="/signin/signup" className="font-light text-sm">
    //           Don't have an account? Sign up
    //         </Link>
    //       </p>
    //     </>
    //   )}
    // </div>
    <div className={cn("grid gap-6")}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
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
                href="/terms"
                className="hover:text-primary"
                >
                Forgot your password?
                </Link>
            </p>
            <p className="text-left text-sm text-muted-foreground">
                <Link
                href="/privacy"
                className="hover:text-primary"
                >
                Sign in via magic link
                </Link>
            </p>
            <p className="text-left text-sm text-muted-foreground">
                <Link
                href="/privacy"
                className="hover:text-primary"
                >
                Don't have an account? Sign up
                </Link>
            </p>
          </div>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={isLoading}>
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.gitHub className="mr-2 h-4 w-4" />
        )}{" "}
        GitHub
      </Button>
    </div>
  );
}