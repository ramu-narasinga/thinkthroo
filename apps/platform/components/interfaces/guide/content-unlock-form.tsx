"use client";

import { Button } from "@thinkthroo/ui/components/button";
import Link from "next/link";

export default function ContentUnlockForm() {
  return (
    <div className="bg-gray-100 p-6 rounded-lg flex flex-col gap-6">
      <div className="">
        <h2 className="text-xl font-semibold mb-4">Unlock Full Tutorial</h2>
        <Link href="/signin/email_signin" passHref>
          <Button className="w-1/2">Sign In to Access</Button>
        </Link>
      </div>
      <div className="space-y-4">
        <h3 className="font-semibold">This is a free tutorial</h3>
        <p>
          By signing in, you&apos;ll get full access to this and other free Total
          TypeScript tutorials.
        </p>
        <p>
          Why sign in? You&apos;ll get updates about the latest Total TypeScript
          material. This includes free tutorials, TypeScript Tips, and periodic
          updates about trends, tools, and TS happenings that I&apos;m excited about.
        </p>
        <p>
          In addition to the piles of free Total TypeScript content, you&apos;ll get
          the earliest access and best discounts to the paid courses when they
          launch.
        </p>
        <p>
          There won&apos;t be any spam, and every email you get will have an
          unsubscribe link.
        </p>
        <p className="font-semibold">
          If this sounds like a fair trade, let&apos;s go!
        </p>
      </div>
    </div>
  );
}
