"use client";

import { useState } from "react";
import { Shield, CheckCircle, Github } from "lucide-react";

export default function RequestAccessPage() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">(
    "idle"
  );
  const [githubUsername, setGithubUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("submitting");

    // TODO: Wire up to an API endpoint or email service
    // For now, simulate a successful submission
    setTimeout(() => {
      setFormState("success");
    }, 1000);
  }

  if (formState === "success") {
    return (
      <div className="container relative">
        <section className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 md:py-24 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          <h1 className="text-2xl font-bold tracking-tight">
            Request Submitted!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your interest in the Think Throo GitHub App. We&apos;ll
            review your request and get back to you at{" "}
            <strong>{email}</strong>.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="container relative">
      <section className="mx-auto flex max-w-lg flex-col items-start gap-6 px-4 py-16 md:py-24">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          <h1 className="text-2xl font-bold tracking-tight">
            Request Early Access
          </h1>
        </div>

        <p className="text-muted-foreground">
          Think Throo GitHub App AI features — PR reviews, architecture checks —
          are currently in <strong>invite-only</strong> mode. Fill out the form
          below and we&apos;ll get back to you.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* GitHub Username */}
          <div className="space-y-2">
            <label
              htmlFor="github-username"
              className="text-sm font-medium leading-none"
            >
              GitHub Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="github-username"
                type="text"
                required
                placeholder="your-github-handle"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label
              htmlFor="message"
              className="text-sm font-medium leading-none"
            >
              Message{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <textarea
              id="message"
              rows={4}
              placeholder="Tell us about your project or why you'd like access…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <button
            type="submit"
            disabled={formState === "submitting"}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {formState === "submitting" ? "Submitting…" : "Request Access"}
          </button>
        </form>
      </section>
    </div>
  );
}
