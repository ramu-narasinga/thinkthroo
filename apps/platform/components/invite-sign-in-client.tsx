"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@thinkthroo/ui/components/button";
import { Input } from "@thinkthroo/ui/components/input";

export function InviteSignInClient({ email: initialEmail }: { email: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSendLink() {
    window.location.href = `https://app.thinkthroo.com/login`;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Think Throo"
            width={32}
            height={32}
            className="rounded"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
            Think Throo
          </span>
        </div>

        {sent ? (
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Check your email
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We sent a sign-in link to <strong>{email}</strong>. Click it to access your account.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Welcome to Think Throo
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sign in with your email to accept the invitation
              </p>
            </div>

            <div className="w-full space-y-3">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                onKeyDown={(e) => e.key === "Enter" && handleSendLink()}
              />
              <Button
                className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                onClick={handleSendLink}
                disabled={loading}
              >
                {loading ? "Sending…" : "Sign in with email link"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
