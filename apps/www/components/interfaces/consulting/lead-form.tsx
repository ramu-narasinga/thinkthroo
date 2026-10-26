"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@thinkthroo/ui/components/button";
import { Input } from "@thinkthroo/ui/components/input";
import { Label } from "@thinkthroo/ui/components/label";
import { Textarea } from "@thinkthroo/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@thinkthroo/ui/components/select";
import { getAttribution } from "@/lib/attribution";
import { useUmami } from "@/hooks/use-umami";

const PENDING_LEAD_KEY = "tt_pending_lead";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LeadForm({ pageSlug }: { pageSlug: string }) {
  const router = useRouter();
  const { track } = useUmami();
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [projectType, setProjectType] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState(""); // honeypot - real users never see or fill this

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!EMAIL_RE.test(workEmail)) {
      setServerError("Enter a valid work email.");
      return;
    }

    setFormState("submitting");
    setServerError(null);

    const attribution = getAttribution();
    const submissionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      const res = await fetch("/api/consulting-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          page_slug: pageSlug,
          name,
          work_email: workEmail,
          project_type: projectType,
          budget_range: budgetRange,
          description,
          company, // honeypot
          ...attribution,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        setFormState("error");
        return;
      }

      track("consulting_lead_submitted", { page_slug: pageSlug });

      if (data.spam) {
        // Honeypot tripped - show success without firing any conversion or redirecting to the tracked thank-you page.
        setFormState("success");
        return;
      }

      try {
        sessionStorage.setItem(
          PENDING_LEAD_KEY,
          JSON.stringify({ submissionId, email: workEmail })
        );
      } catch {
        // sessionStorage unavailable - the thank-you page will just skip firing the conversion.
      }

      router.push("/thank-you");
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <p className="text-center text-muted-foreground">
        Thanks — got your message. I'll get back to you shortly.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="lead-form">
      {serverError && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
          {serverError}
        </div>
      )}

      {/* Honeypot - hidden from real users via CSS, bots that auto-fill forms will trip it */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="work-email">Work email</Label>
        <Input
          id="work-email"
          type="email"
          required
          value={workEmail}
          onChange={(e) => setWorkEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-type">Project type</Label>
        <Select value={projectType} onValueChange={setProjectType} required>
          <SelectTrigger id="project-type" className="w-full">
            <SelectValue placeholder="Select a project type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ai-chatbot-agent">AI chatbot / agent</SelectItem>
            <SelectItem value="ai-app">AI app development</SelectItem>
            <SelectItem value="rag-document-ai">RAG / document AI</SelectItem>
            <SelectItem value="white-label">White-label / offshore capacity</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget-range">Budget range</Label>
        <Select value={budgetRange} onValueChange={setBudgetRange} required>
          <SelectTrigger id="budget-range" className="w-full">
            <SelectValue placeholder="Select a budget range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="under-2k">Under $2,000</SelectItem>
            <SelectItem value="2k-5k">$2,000 - $5,000</SelectItem>
            <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
            <SelectItem value="15k-plus">$15,000+</SelectItem>
            <SelectItem value="not-sure">Not sure yet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">What do you need built?</Label>
        <Textarea
          id="description"
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={formState === "submitting"}>
        {formState === "submitting" ? "Sending…" : "Send"}
      </Button>
    </form>
  );
}
